"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { getUidFromAccessToken } from "@/shared/lib/tokenManager";
import { getProfile } from "@/features/profile/services/profile.api";
import { submitSelfB2bApplication } from "../services/membership.api";
import {
    BUSINESS_NEEDS_OPTIONS,
    COMPANY_SIZE_OPTIONS,
    type MembershipApplicationRequest,
    type MembershipApplicationResponse,
} from "../types";
import PhoneField from "@/shared/components/PhoneField";

// Industry list — kept in lockstep with the public sign-up form (B2BSignUpForm).
const INDUSTRIES = [
    "Information Technology",
    "Telecommunications",
    "Electronics Retail",
    "Healthcare",
    "Education",
    "Finance & Banking",
    "Logistics & Supply Chain",
    "Manufacturing",
    "Government",
    "Other",
];

// Trade-license upload rules — mirror the backend FileValidationUtils.validateDocument
// allowlist; the server additionally verifies magic bytes.
const ALLOWED_LICENSE_EXT = ["pdf", "jpg", "jpeg", "png", "webp"];
const ALLOWED_LICENSE_MIME = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_LICENSE_BYTES = 10 * 1024 * 1024; // 10 MB

const normalizePhone = (raw: string) => raw.replace(/[\s\-()]/g, "");

function validateLicenseFile(file: File): string {
    const ext = file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "";
    if (!ALLOWED_LICENSE_EXT.includes(ext) || !ALLOWED_LICENSE_MIME.includes(file.type)) {
        return "Unsupported file type. Upload a PDF or image (PDF, JPG, PNG, or WebP).";
    }
    if (file.size > MAX_LICENSE_BYTES) {
        return "The file is too large. The maximum allowed size is 10 MB.";
    }
    return "";
}

function apiErrorMessage(e: unknown): string {
    const err = e as { response?: { data?: { message?: string } }; message?: string };
    return err.response?.data?.message || err.message || "Submission failed. Please try again.";
}

const inputCls =
    "w-full rounded-[12px] border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#402F75] focus:ring-2 focus:ring-[#402F75]/10 transition-all";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">{label}</label>
            {children}
        </div>
    );
}

type FormState = Omit<MembershipApplicationRequest, "businessNeeds" | "termsAccepted">;

export default function SelfB2BApplicationForm({
    lang,
    initial,
    onSuccess,
    onCancel,
}: {
    lang: string;
    /** Existing application to edit and re-submit. Omit for a first-time application. */
    initial?: MembershipApplicationResponse | null;
    onSuccess: (app: MembershipApplicationResponse) => void;
    onCancel: () => void;
}) {
    const userId = useSelector((s: RootState) => s.auth.userId);
    const isEditing = !!initial;
    // On a re-submission the document already on file is reused unless replaced.
    const hasLicenseOnFile = !!initial?.tradeLicenseFileUrl;

    const [ready, setReady] = useState(isEditing);
    const [form, setForm] = useState<FormState>({
        companyName: initial?.companyName ?? "",
        tradeLicenseNumber: initial?.tradeLicenseNumber ?? "",
        industryType: initial?.industryType ?? "",
        numberOfEmployees: initial?.numberOfEmployees ?? "",
        country: initial?.country ?? "",
        city: initial?.city ?? "",
        website: initial?.website ?? "",
        contactFullName: initial?.contactFullName ?? "",
        contactDesignation: initial?.contactDesignation ?? "",
        contactEmail: initial?.contactEmail ?? "",
        contactMobile: initial?.contactMobile ?? "",
    });
    const [businessNeeds, setBusinessNeeds] = useState<string[]>(initial?.businessNeeds ?? []);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [licenseFile, setLicenseFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Prefill the contact fields from the signed-in user's profile. Skipped when
    // editing — the application's own values are the source of truth there.
    useEffect(() => {
        if (isEditing) return;
        const id = getUidFromAccessToken() ?? userId;
        if (!id) {
            setReady(true);
            return;
        }
        let active = true;
        getProfile(id)
            .then((p) => {
                if (!active) return;
                setForm((prev) => ({
                    ...prev,
                    contactFullName:
                        [p.firstName, p.lastName].filter(Boolean).join(" ") || prev.contactFullName,
                    contactEmail: p.email ?? prev.contactEmail,
                    contactMobile: p.phoneNumber ?? prev.contactMobile,
                }));
            })
            .catch(() => {})
            .finally(() => {
                if (active) setReady(true);
            });
        return () => {
            active = false;
        };
    }, [userId, isEditing]);

    const set = (k: keyof FormState, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

    const toggleNeed = (need: string) =>
        setBusinessNeeds((prev) =>
            prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need],
        );

    const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const fileErr = validateLicenseFile(file);
        if (fileErr) {
            setError(fileErr);
            setLicenseFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }
        setError("");
        setLicenseFile(file);
    };

    function validate(): string {
        if (!form.companyName.trim()) return "Company name is required.";
        if (!form.tradeLicenseNumber.trim()) return "Trade license number is required.";
        if (!licenseFile && !hasLicenseOnFile) return "Please upload your trade license document.";
        if (!form.industryType) return "Industry type is required.";
        if (!form.numberOfEmployees) return "Please select your company size.";
        if (!form.country.trim()) return "Country is required.";
        if (!form.city.trim()) return "City is required.";
        if (!form.contactFullName.trim()) return "Full name is required.";
        if (!form.contactDesignation.trim()) return "Designation is required.";
        if (!form.contactEmail.trim() || !/\S+@\S+\.\S+/.test(form.contactEmail))
            return "A valid email address is required.";
        if (!form.contactMobile.trim()) return "Mobile number is required.";
        if (!termsAccepted) return "You must accept the Terms & Conditions.";
        return "";
    }

    async function handleSubmit() {
        const err = validate();
        if (err) {
            setError(err);
            return;
        }
        setError("");
        setSubmitting(true);
        try {
            const payload: MembershipApplicationRequest = {
                ...form,
                contactMobile: normalizePhone(form.contactMobile),
                website: form.website?.trim() || undefined,
                businessNeeds,
                termsAccepted,
            };
            const app = await submitSelfB2bApplication(payload, licenseFile);
            onSuccess(app);
        } catch (e: unknown) {
            setError(apiErrorMessage(e));
        } finally {
            setSubmitting(false);
        }
    }

    if (!ready) {
        return (
            <div className="bg-white rounded-[20px] p-8 shadow-sm flex items-center justify-center min-h-[200px]">
                <div className="w-8 h-8 border-2 border-[#402F75] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[20px] p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                    <h3 className="text-[16px] font-bold text-gray-900">
                        {isEditing ? "Edit and re-submit your application" : "Apply for B2B Premium Membership"}
                    </h3>
                    <p className="text-[13px] text-gray-500 mt-0.5">
                        {isEditing
                            ? "Correct the details below and re-submit. Your application returns to review and we'll notify you by email once a decision has been made."
                            : "Add your company details and trade license. We'll review your application and activate your membership once approved."}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={submitting}
                    className="flex-shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                    aria-label="Cancel"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>

            {error && (
                <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-[13px] text-red-600">
                    {error}
                </div>
            )}

            <div className="space-y-3.5">
                <Field label="Company Name *">
                    <input
                        value={form.companyName}
                        onChange={(e) => set("companyName", e.target.value)}
                        placeholder="Acme Technologies LLC"
                        maxLength={200}
                        className={inputCls}
                    />
                </Field>
                <Field label="Trade License Number *">
                    <input
                        value={form.tradeLicenseNumber}
                        onChange={(e) => set("tradeLicenseNumber", e.target.value)}
                        placeholder="TL-123456"
                        maxLength={100}
                        className={inputCls}
                    />
                </Field>
                <Field label="Trade License Document *">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                        onChange={onPickFile}
                        className="hidden"
                        id="b2b-self-license-file"
                    />
                    <label
                        htmlFor="b2b-self-license-file"
                        className={`flex items-center justify-between gap-3 w-full rounded-[12px] border px-4 py-3 text-sm cursor-pointer transition-all ${
                            licenseFile
                                ? "border-[#402F75] bg-[#F7F5FF]"
                                : "border-dashed border-gray-300 hover:border-[#402F75]"
                        }`}
                    >
                        <span className={`truncate ${licenseFile ? "text-[#402F75] font-medium" : "text-gray-400"}`}>
                            {licenseFile
                                ? licenseFile.name
                                : hasLicenseOnFile
                                    ? "Document already on file — upload only to replace it"
                                    : "Upload PDF or image (PDF, JPG, PNG, WebP)"}
                        </span>
                        <span className="shrink-0 text-[12px] font-semibold text-[#402F75]">
                            {licenseFile || hasLicenseOnFile ? "Change" : "Browse"}
                        </span>
                    </label>
                    <p className="mt-1 text-[11px] text-gray-400">
                        {hasLicenseOnFile
                            ? "Optional — your existing document is kept unless you upload a new one. Maximum size 10 MB."
                            : "Required. Maximum size 10 MB."}
                    </p>
                </Field>
                <Field label="Industry Type *">
                    <select
                        value={form.industryType}
                        onChange={(e) => set("industryType", e.target.value)}
                        className={inputCls}
                    >
                        <option value="">Select industry</option>
                        {INDUSTRIES.map((i) => (
                            <option key={i} value={i}>
                                {i}
                            </option>
                        ))}
                    </select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Number of Employees *">
                        <select
                            value={form.numberOfEmployees}
                            onChange={(e) => set("numberOfEmployees", e.target.value)}
                            className={inputCls}
                        >
                            <option value="">Select company size</option>
                            {COMPANY_SIZE_OPTIONS.map((size) => (
                                <option key={size} value={size}>
                                    {size} employees
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Website (optional)">
                        <input
                            value={form.website}
                            onChange={(e) => set("website", e.target.value)}
                            placeholder="https://acme.com"
                            maxLength={300}
                            className={inputCls}
                        />
                    </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Country *">
                        <input
                            value={form.country}
                            onChange={(e) => set("country", e.target.value)}
                            placeholder="UAE"
                            maxLength={100}
                            className={inputCls}
                        />
                    </Field>
                    <Field label="City *">
                        <input
                            value={form.city}
                            onChange={(e) => set("city", e.target.value)}
                            placeholder="Dubai"
                            maxLength={100}
                            className={inputCls}
                        />
                    </Field>
                </div>

                <div className="pt-1 border-t border-gray-100" />

                <div className="grid grid-cols-2 gap-3">
                    <Field label="Full Name *">
                        <input
                            value={form.contactFullName}
                            onChange={(e) => set("contactFullName", e.target.value)}
                            placeholder="John Smith"
                            maxLength={200}
                            className={inputCls}
                        />
                    </Field>
                    <Field label="Designation *">
                        <input
                            value={form.contactDesignation}
                            onChange={(e) => set("contactDesignation", e.target.value)}
                            placeholder="IT Manager"
                            maxLength={100}
                            className={inputCls}
                        />
                    </Field>
                    <Field label="Email *">
                        <input
                            type="email"
                            value={form.contactEmail}
                            onChange={(e) => set("contactEmail", e.target.value)}
                            placeholder="john@acme.com"
                            maxLength={255}
                            className={inputCls}
                        />
                    </Field>
                    <Field label="Mobile Number *">
                        <PhoneField
                            value={form.contactMobile}
                            onChange={(e164) => set("contactMobile", e164)}
                            className={inputCls.replace("w-full", "flex items-stretch w-full overflow-hidden")}
                        />
                    </Field>
                </div>

                <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-2">
                        Business Needs (select all that apply)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {BUSINESS_NEEDS_OPTIONS.map((need) => {
                            const checked = businessNeeds.includes(need);
                            return (
                                <button
                                    key={need}
                                    type="button"
                                    onClick={() => toggleNeed(need)}
                                    className={`rounded-xl border px-3 py-2.5 text-[13px] text-left transition-all ${
                                        checked
                                            ? "border-[#402F75] bg-[#EDE9FF] text-[#402F75] font-medium"
                                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                                    }`}
                                >
                                    {checked && <span className="mr-1">✓ </span>}
                                    {need}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="rounded-xl bg-[#F7F5FF] border border-[#D8D0F5] p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            className="mt-0.5 w-4 h-4 accent-[#402F75]"
                        />
                        <span className="text-[13px] text-gray-700">
                            I agree to the{" "}
                            <Link
                                href={`/${lang}/terms-conditions`}
                                target="_blank"
                                className="text-[#402F75] font-semibold underline"
                            >
                                Terms &amp; Conditions
                            </Link>{" "}
                            and consent to Buyology processing my business information for membership
                            purposes. *
                        </span>
                    </label>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={submitting}
                    className="flex-1 rounded-[14px] border border-gray-200 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 rounded-[14px] bg-[#402F75] py-3 text-sm font-semibold text-white hover:bg-[#352565] disabled:opacity-50 transition-colors"
                >
                    {submitting ? "Submitting..." : isEditing ? "Re-submit Application" : "Submit Application"}
                </button>
            </div>
        </div>
    );
}
