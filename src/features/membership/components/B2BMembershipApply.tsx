"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { submitApplication } from "../services/membership.api";
import { BUSINESS_NEEDS_OPTIONS, type MembershipApplicationRequest } from "../types";
import ContactVerification from "@/shared/components/ContactVerification";

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

export default function B2BMembershipApply() {
    const userId = useSelector((s: RootState) => s.auth.userId);
    const [step, setStep] = useState<Step>(1);
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Contact verification (email via SendGrid, phone via Twilio Verify).
    // Both must be verified before the application can be submitted.
    const [emailVerified, setEmailVerified] = useState(false);
    const [phoneVerified, setPhoneVerified] = useState(false);

    const [form, setForm] = useState<MembershipApplicationRequest>({
        companyName: "",
        tradeLicenseNumber: "",
        industryType: "",
        numberOfEmployees: 1,
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

    const validateStep = (): string => {
        if (step === 1) {
            if (!form.companyName.trim()) return "Company name is required";
            if (!form.tradeLicenseNumber.trim()) return "Trade license number is required";
            if (!form.industryType) return "Industry type is required";
            if (form.numberOfEmployees < 1) return "Number of employees must be at least 1";
            if (!form.country.trim()) return "Country is required";
            if (!form.city.trim()) return "City is required";
        }
        if (step === 2) {
            if (!form.contactFullName.trim()) return "Full name is required";
            if (!form.contactDesignation.trim()) return "Designation is required";
            if (!form.contactEmail.trim() || !/\S+@\S+\.\S+/.test(form.contactEmail)) return "Valid email is required";
            if (!form.contactMobile.trim()) return "Mobile number is required";
            if (!isE164(form.contactMobile)) return "Use international format, e.g. +971501234567";
            if (!emailVerified) return "Please verify your email address";
            if (!phoneVerified) return "Please verify your mobile number";
        }
        if (step === 3) {
            if (!form.termsAccepted) return "You must accept the Terms & Conditions";
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
        setError("");
        setSubmitting(true);
        try {
            await submitApplication(
                { ...form, contactMobile: normalizePhone(form.contactMobile) },
                userId ?? undefined
            );
            setSubmitted(true);
        } catch (e: unknown) {
            setError((e as Error).message ?? "Submission failed. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Application Submitted!</h2>
                <p className="text-gray-500 max-w-md">
                    Thank you for applying for B2B Premium Membership. Our team will review your application and get back to you within 2-3 business days.
                </p>
            </div>
        );
    }

    const stepLabels = ["Company Details", "Contact Person", "Business Needs & Consent"];

    return (
        <div className="max-w-2xl mx-auto">
            {/* Stepper */}
            <div className="flex items-center gap-2 mb-8">
                {([1, 2, 3] as Step[]).map((s) => (
                    <div key={s} className="flex items-center gap-2 flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                            s < step ? "bg-[#402F75] text-white" : s === step ? "bg-[#402F75] text-white ring-4 ring-[#402F75]/20" : "bg-gray-200 text-gray-400"
                        }`}>
                            {s < step ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            ) : s}
                        </div>
                        <span className={`text-xs hidden sm:block ${s === step ? "font-semibold text-[#402F75]" : "text-gray-400"}`}>
                            {stepLabels[s - 1]}
                        </span>
                        {s < 3 && <div className={`h-px flex-1 ${s < step ? "bg-[#402F75]" : "bg-gray-200"}`} />}
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[24px] p-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-6">{stepLabels[step - 1]}</h2>

                {error && (
                    <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {step === 1 && (
                    <div className="space-y-4">
                        <Field label="Company Name *">
                            <input value={form.companyName} onChange={(e) => set("companyName", e.target.value)}
                                placeholder="Acme Technologies LLC" className={inputCls} />
                        </Field>
                        <Field label="Trade License Number *">
                            <input value={form.tradeLicenseNumber} onChange={(e) => set("tradeLicenseNumber", e.target.value)}
                                placeholder="TL-123456" className={inputCls} />
                        </Field>
                        <Field label="Industry Type *">
                            <select value={form.industryType} onChange={(e) => set("industryType", e.target.value)} className={inputCls}>
                                <option value="">Select industry</option>
                                {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                            </select>
                        </Field>
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Number of Employees *">
                                <input type="number" min={1} value={form.numberOfEmployees}
                                    onChange={(e) => set("numberOfEmployees", parseInt(e.target.value) || 1)} className={inputCls} />
                            </Field>
                            <Field label="Website (optional)">
                                <input value={form.website} onChange={(e) => set("website", e.target.value)}
                                    placeholder="https://acme.com" className={inputCls} />
                            </Field>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
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
                    <div className="space-y-4">
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
                            <input value={form.contactMobile}
                                onChange={(e) => { set("contactMobile", e.target.value); setPhoneVerified(false); }}
                                placeholder="+971501234567" className={inputCls} />
                            <ContactVerification
                                channel="phone"
                                value={normalizePhone(form.contactMobile)}
                                verified={phoneVerified}
                                onVerified={() => setPhoneVerified(true)}
                                disabled={!isE164(form.contactMobile)}
                            />
                        </Field>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6">
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
                                            className={`rounded-xl border px-4 py-3 text-sm text-left transition-all ${
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
                                <span className="text-sm text-gray-700">
                                    I agree to the{" "}
                                    <span className="text-[#402F75] font-semibold underline cursor-pointer">
                                        Terms & Conditions
                                    </span>{" "}
                                    and consent to Buyology processing my business information for membership purposes. *
                                </span>
                            </label>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex gap-3 mt-8">
                    {step > 1 && (
                        <button
                            onClick={() => { setStep((s) => (s - 1) as Step); setError(""); }}
                            className="flex-1 rounded-[14px] border border-gray-200 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            ← Back
                        </button>
                    )}
                    {step < 3 ? (
                        <button
                            onClick={handleNext}
                            className="flex-1 rounded-[14px] bg-[#402F75] py-3 text-sm font-semibold text-white hover:bg-[#352565] transition-colors"
                        >
                            Continue →
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex-1 rounded-[14px] bg-[#402F75] py-3 text-sm font-semibold text-white hover:bg-[#352565] disabled:opacity-50 transition-colors"
                        >
                            {submitting ? "Submitting..." : "Submit Application"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

const inputCls = "w-full rounded-[12px] border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#402F75] focus:ring-2 focus:ring-[#402F75]/10 transition-all";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
            {children}
        </div>
    );
}
