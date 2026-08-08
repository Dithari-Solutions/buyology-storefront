"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
    submitBusinessSignup,
    type BusinessSignupPayload,
} from "../services/membership.api";
import { BUSINESS_NEEDS_OPTIONS, COMPANY_SIZE_OPTIONS, type MembershipApplicationRequest } from "../types";
import ContactVerification from "@/shared/components/ContactVerification";
import PhoneField from "@/shared/components/PhoneField";

type Step = 1 | 2 | 3;

/** Strip spaces/dashes so the value matches the backend E.164 pattern. */
const normalizePhone = (raw: string) => raw.replace(/[\s\-()]/g, "");
const isE164 = (raw: string) => /^\+[1-9]\d{6,14}$/.test(normalizePhone(raw));

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

// Trade-license upload rules — kept in lockstep with the backend
// FileValidationUtils.validateDocument allowlist. Requiring BOTH a valid
// extension and MIME type blocks script/executable uploads on the client;
// the server additionally verifies magic bytes.
const ALLOWED_LICENSE_EXT = ["pdf", "jpg", "jpeg", "png", "webp"];
const ALLOWED_LICENSE_MIME = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_LICENSE_BYTES = 10 * 1024 * 1024; // 10 MB

function validateLicenseFile(file: File): string {
    const ext = file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "";
    if (!ALLOWED_LICENSE_EXT.includes(ext) || !ALLOWED_LICENSE_MIME.includes(file.type)) {
        return "Unsupported file type. Please upload a PDF or an image (PDF, JPG, PNG, or WebP).";
    }
    if (file.size > MAX_LICENSE_BYTES) {
        return "The file is too large. The maximum allowed size is 10 MB.";
    }
    return "";
}

function validatePassword(password: string, confirm: string): string {
    if (password.length < 8) return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(password)) return "Password must include at least one uppercase letter.";
    if (!/[a-z]/.test(password)) return "Password must include at least one lowercase letter.";
    if (!/[0-9]/.test(password)) return "Password must include at least one number.";
    if (password !== confirm) return "Passwords do not match.";
    return "";
}

function apiErrorMessage(e: unknown): string {
    const err = e as { response?: { data?: { message?: string } }; message?: string };
    return err.response?.data?.message || err.message || "Submission failed. Please try again.";
}

export default function B2BSignUpForm({
    lang,
    onSwitchToSignIn,
}: {
    lang: string;
    onSwitchToSignIn?: () => void;
}) {
    const [step, setStep] = useState<Step>(1);
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Contact verification (email via SendGrid, phone via Twilio Verify).
    // Both must be verified before the application can be submitted.
    const [emailVerified, setEmailVerified] = useState(false);
    const [phoneVerified, setPhoneVerified] = useState(false);

    // Account credentials chosen during sign-up.
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Required trade-license document.
    const [licenseFile, setLicenseFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState<MembershipApplicationRequest>({
        companyName: "",
        tradeLicenseNumber: "",
        industryType: "",
        numberOfEmployees: "",
        country: "",
        city: "",
        website: "",
        contactFullName: "",
        contactDesignation: "",
        contactEmail: "",
        contactMobile: "",
        businessNeeds: [],
        termsAccepted: false,
    });

    const set = (k: keyof MembershipApplicationRequest, v: unknown) =>
        setForm((prev) => ({ ...prev, [k]: v }));

    const toggleNeed = (need: string) => {
        setForm((prev) => ({
            ...prev,
            businessNeeds: prev.businessNeeds.includes(need)
                ? prev.businessNeeds.filter((n) => n !== need)
                : [...prev.businessNeeds, need],
        }));
    };

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

    const validateStep = (): string => {
        if (step === 1) {
            if (!form.companyName.trim()) return "Company name is required.";
            if (!form.tradeLicenseNumber.trim()) return "Trade license number is required.";
            if (!licenseFile) return "Please upload your trade license document.";
            if (!form.industryType) return "Industry type is required.";
            if (!form.numberOfEmployees) return "Please select your company size.";
            if (!form.country.trim()) return "Country is required.";
            if (!form.city.trim()) return "City is required.";
        }
        if (step === 2) {
            if (!form.contactFullName.trim()) return "Full name is required.";
            if (!form.contactDesignation.trim()) return "Designation is required.";
            if (!form.contactEmail.trim() || !/\S+@\S+\.\S+/.test(form.contactEmail))
                return "A valid email address is required.";
            if (!form.contactMobile.trim()) return "Mobile number is required.";
            if (!isE164(form.contactMobile)) return "Use international format, e.g. +971501234567";
            if (!emailVerified) return "Please verify your email address.";
            if (!phoneVerified) return "Please verify your mobile number.";
            const pwErr = validatePassword(password, confirmPassword);
            if (pwErr) return pwErr;
        }
        if (step === 3) {
            if (!form.termsAccepted) return "You must accept the Terms & Conditions.";
        }
        return "";
    };

    const handleNext = () => {
        const err = validateStep();
        if (err) { setError(err); return; }
        setError("");
        setStep((s) => (s + 1) as Step);
    };

    const handleSubmit = async () => {
        const err = validateStep();
        if (err) { setError(err); return; }
        if (!licenseFile) { setStep(1); setError("Please upload your trade license document."); return; }
        setError("");
        setSubmitting(true);
        try {
            const payload: BusinessSignupPayload = {
                ...form,
                contactMobile: normalizePhone(form.contactMobile),
                password,
                confirmedPassword: confirmPassword,
            };
            await submitBusinessSignup(payload, licenseFile);
            setSubmitted(true);
        } catch (e: unknown) {
            setError(apiErrorMessage(e));
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center text-center px-2 py-6">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-5">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-3">Application submitted successfully</h2>
                <p className="text-gray-500 text-[14px] leading-relaxed max-w-sm">
                    Thank you for applying for Buyology B2B Premium Membership. Your application
                    is now under review by our team. You will be able to sign in and access your
                    account once an administrator has approved your application. We will notify
                    you by email at <span className="font-medium text-gray-700">{form.contactEmail}</span> as
                    soon as a decision has been made.
                </p>
                <button
                    type="button"
                    onClick={onSwitchToSignIn}
                    className="mt-6 w-full py-[12px] rounded-[14px] bg-[#402F75] text-white font-bold text-[15px] hover:bg-[#352565] transition-colors"
                >
                    Back to sign in
                </button>
            </div>
        );
    }

    const stepLabels = ["Company", "Contact & Account", "Consent"];

    return (
        <div className="w-full">
            {/* Stepper */}
            <div className="flex items-center gap-2 mb-6">
                {([1, 2, 3] as Step[]).map((s) => (
                    <div key={s} className="flex items-center gap-2 flex-1">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                            s < step ? "bg-[#402F75] text-white" : s === step ? "bg-[#402F75] text-white ring-4 ring-[#402F75]/20" : "bg-gray-200 text-gray-400"
                        }`}>
                            {s < step ? (
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            ) : s}
                        </div>
                        {s < 3 && <div className={`h-px flex-1 ${s < step ? "bg-[#402F75]" : "bg-gray-200"}`} />}
                    </div>
                ))}
            </div>

            <h3 className="text-[15px] font-bold text-gray-800 mb-4">{stepLabels[step - 1]}</h3>

            {error && (
                <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-[13px] text-red-600">
                    {error}
                </div>
            )}

            {step === 1 && (
                <div className="space-y-3.5">
                    <Field label="Company Name *">
                        <input value={form.companyName} onChange={(e) => set("companyName", e.target.value)}
                            placeholder="Acme Technologies LLC" className={inputCls} />
                    </Field>
                    <Field label="Trade License Number *">
                        <input value={form.tradeLicenseNumber} onChange={(e) => set("tradeLicenseNumber", e.target.value)}
                            placeholder="TL-123456" className={inputCls} />
                    </Field>
                    <Field label="Trade License Document *">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                            onChange={onPickFile}
                            className="hidden"
                            id="b2b-license-file"
                        />
                        <label
                            htmlFor="b2b-license-file"
                            className={`flex items-center justify-between gap-3 w-full rounded-[12px] border px-4 py-3 text-sm cursor-pointer transition-all ${
                                licenseFile ? "border-[#402F75] bg-[#F7F5FF]" : "border-dashed border-gray-300 hover:border-[#402F75]"
                            }`}
                        >
                            <span className={`truncate ${licenseFile ? "text-[#402F75] font-medium" : "text-gray-400"}`}>
                                {licenseFile ? licenseFile.name : "Upload PDF or image (PDF, JPG, PNG, WebP)"}
                            </span>
                            <span className="shrink-0 text-[12px] font-semibold text-[#402F75]">
                                {licenseFile ? "Change" : "Browse"}
                            </span>
                        </label>
                        <p className="mt-1 text-[11px] text-gray-400">Required. Maximum size 10 MB.</p>
                    </Field>
                    <Field label="Industry Type *">
                        <select value={form.industryType} onChange={(e) => set("industryType", e.target.value)} className={inputCls}>
                            <option value="">Select industry</option>
                            {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                        </select>
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Number of Employees *">
                            <select value={form.numberOfEmployees} onChange={(e) => set("numberOfEmployees", e.target.value)} className={inputCls}>
                                <option value="">Select company size</option>
                                {COMPANY_SIZE_OPTIONS.map((size) => (
                                    <option key={size} value={size}>{size} employees</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Website (optional)">
                            <input value={form.website} onChange={(e) => set("website", e.target.value)}
                                placeholder="https://acme.com" className={inputCls} />
                        </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Country *">
                            <input value={form.country} onChange={(e) => set("country", e.target.value)}
                                placeholder="UAE" className={inputCls} />
                        </Field>
                        <Field label="City *">
                            <input value={form.city} onChange={(e) => set("city", e.target.value)}
                                placeholder="Dubai" className={inputCls} />
                        </Field>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-3.5">
                    <Field label="Full Name *">
                        <input value={form.contactFullName} onChange={(e) => set("contactFullName", e.target.value)}
                            placeholder="John Smith" className={inputCls} />
                    </Field>
                    <Field label="Designation *">
                        <input value={form.contactDesignation} onChange={(e) => set("contactDesignation", e.target.value)}
                            placeholder="IT Manager" className={inputCls} />
                    </Field>
                    <Field label="Email *">
                        <input type="email" value={form.contactEmail}
                            onChange={(e) => { set("contactEmail", e.target.value); setEmailVerified(false); }}
                            placeholder="john@acme.com" className={inputCls} />
                        <ContactVerification
                            channel="email"
                            value={form.contactEmail.trim()}
                            verified={emailVerified}
                            onVerified={() => setEmailVerified(true)}
                            disabled={!/\S+@\S+\.\S+/.test(form.contactEmail)}
                        />
                    </Field>
                    <Field label="Mobile Number *">
                        <PhoneField
                            value={form.contactMobile}
                            onChange={(e164) => { set("contactMobile", e164); setPhoneVerified(false); }}
                            className={inputCls.replace("w-full", "flex items-stretch w-full overflow-hidden")}
                        />
                        <ContactVerification
                            channel="phone"
                            value={normalizePhone(form.contactMobile)}
                            verified={phoneVerified}
                            onVerified={() => setPhoneVerified(true)}
                            disabled={!isE164(form.contactMobile)}
                        />
                    </Field>
                    <div className="pt-1">
                        <p className="text-[12px] text-gray-500 mb-2.5">
                            Set a password for your account. You will use your email and this password to
                            sign in once your application has been approved.
                        </p>
                        <Field label="Password *">
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                placeholder="At least 8 characters" className={inputCls} />
                        </Field>
                        <div className="mt-3.5">
                            <Field label="Confirm Password *">
                                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter your password" className={inputCls} />
                            </Field>
                        </div>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Business Needs (select all that apply)
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {BUSINESS_NEEDS_OPTIONS.map((need) => {
                                const checked = form.businessNeeds.includes(need);
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
                                checked={form.termsAccepted}
                                onChange={(e) => set("termsAccepted", e.target.checked)}
                                className="mt-0.5 w-4 h-4 accent-[#402F75]"
                            />
                            <span className="text-[13px] text-gray-700">
                                I agree to the{" "}
                                <Link href={`/${lang}/terms-conditions`} target="_blank" className="text-[#402F75] font-semibold underline">
                                    Terms &amp; Conditions
                                </Link>{" "}
                                and consent to Buyology processing my business information for membership purposes. *
                            </span>
                        </label>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-6">
                {step > 1 && (
                    <button
                        type="button"
                        onClick={() => { setStep((s) => (s - 1) as Step); setError(""); }}
                        className="flex-1 rounded-[14px] border border-gray-200 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        ← Back
                    </button>
                )}
                {step < 3 ? (
                    <button
                        type="button"
                        onClick={handleNext}
                        className="flex-1 rounded-[14px] bg-[#402F75] py-3 text-sm font-semibold text-white hover:bg-[#352565] transition-colors"
                    >
                        Continue →
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex-1 rounded-[14px] bg-[#402F75] py-3 text-sm font-semibold text-white hover:bg-[#352565] disabled:opacity-50 transition-colors"
                    >
                        {submitting ? "Submitting..." : "Submit Application"}
                    </button>
                )}
            </div>
        </div>
    );
}

const inputCls = "w-full rounded-[12px] border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#402F75] focus:ring-2 focus:ring-[#402F75]/10 transition-all";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">{label}</label>
            {children}
        </div>
    );
}
