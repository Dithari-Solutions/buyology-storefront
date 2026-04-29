"use client";

import { useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { isSuspicious, validateEmail } from "@/features/auth/validation";
import { supplierApi } from "../../services/supplier.api";

const SELLER_TYPES = [
  { value: "REGISTERED_BUSINESS", label: "Registered Business" },
  { value: "RETAIL_STORE", label: "Retail Store" },
  { value: "ONLINE_SELLER", label: "Online Seller" },
  { value: "REFURBISHER", label: "Refurbisher" },
  { value: "INDIVIDUAL_SELLER", label: "Individual Seller" },
  { value: "SMALL_BRAND", label: "Small Brand" },
  { value: "OTHER", label: "Other" },
];

const CONTACT_METHODS = [
  { value: "EMAIL", label: "Email" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "PHONE_CALL", label: "Phone Call" },
];

export default function Step1AboutContact() {
  const router = useRouter();
  const { lang } = useParams<{ lang: string }>();

  const [form, setForm] = useState({
    fullName: "",
    businessName: "",
    sellerType: "",
    country: "",
    city: "",
    email: "",
    phoneNumber: "",
    preferredContact: "EMAIL" as "EMAIL" | "WHATSAPP" | "PHONE_CALL",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // OTP state
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Required";
    else if (isSuspicious(form.fullName)) e.fullName = "Invalid input";
    if (!form.sellerType) e.sellerType = "Required";
    const emailErr = validateEmail(form.email);
    if (emailErr) e.email = "Valid email required";
    if (!form.preferredContact) e.preferredContact = "Required";
    if (form.businessName && isSuspicious(form.businessName)) e.businessName = "Invalid input";
    if (form.city && isSuspicious(form.city)) e.city = "Invalid input";
    return e;
  }

  async function handleSendOtp() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await supplierApi.initiateApplication({
        fullName: form.fullName,
        businessName: form.businessName || undefined,
        sellerType: form.sellerType,
        country: form.country || undefined,
        city: form.city || undefined,
        email: form.email,
        phoneNumber: form.phoneNumber || undefined,
        preferredContact: form.preferredContact,
      });
      const appId = res.data?.data;
      setApplicationId(appId);
      sessionStorage.setItem("supplier_applicationId", appId);
      sessionStorage.setItem("supplier_step1", JSON.stringify(form));
      setOtpSent(true);
      startCooldown();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setErrors({ general: msg || "Failed to send OTP. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (!applicationId || !otpCode.trim()) return;
    setOtpLoading(true);
    setOtpError("");
    try {
      await supplierApi.verifyOtp(applicationId, otpCode);
      setVerified(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setOtpError(msg || "Invalid OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleResendOtp() {
    if (!applicationId || resendCooldown > 0) return;
    try {
      await supplierApi.resendOtp(applicationId);
      startCooldown();
    } catch {
      // ignore
    }
  }

  function startCooldown() {
    setResendCooldown(60);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) { clearInterval(cooldownRef.current!); return 0; }
        return c - 1;
      });
    }, 1000);
  }

  function handleNext() {
    router.push(`/${lang}/become-a-supplier/step-2`);
  }

  const field = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input
            value={form.fullName}
            onChange={field("fullName")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your full name"
          />
          {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
          <input
            value={form.businessName}
            onChange={field("businessName")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional"
          />
          {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Seller Type *</label>
          <select
            value={form.sellerType}
            onChange={field("sellerType")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select type</option>
            {SELLER_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          {errors.sellerType && <p className="text-red-500 text-xs mt-1">{errors.sellerType}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
          <input
            value={form.country}
            onChange={field("country")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. UAE"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input
            value={form.city}
            onChange={field("city")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Dubai"
          />
          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            value={form.email}
            onChange={field("email")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            value={form.phoneNumber}
            onChange={field("phoneNumber")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+971 50 000 0000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Contact *</label>
          <select
            value={form.preferredContact}
            onChange={field("preferredContact")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CONTACT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          {errors.preferredContact && <p className="text-red-500 text-xs mt-1">{errors.preferredContact}</p>}
        </div>
      </div>

      {errors.general && (
        <p className="text-red-500 text-sm text-center">{errors.general}</p>
      )}

      {!otpSent && (
        <button
          onClick={handleSendOtp}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Sending OTP…" : "Send Verification Code"}
        </button>
      )}

      {otpSent && !verified && (
        <div className="border border-blue-100 bg-blue-50 rounded-xl p-4 space-y-3">
          <p className="text-sm text-blue-700 font-medium">
            A verification code was sent to your {form.preferredContact.toLowerCase().replace("_", " ")}.
          </p>
          <input
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            maxLength={6}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="000000"
          />
          {otpError && <p className="text-red-500 text-xs">{otpError}</p>}
          <div className="flex gap-3">
            <button
              onClick={handleVerifyOtp}
              disabled={otpLoading || otpCode.length < 6}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {otpLoading ? "Verifying…" : "Verify Code"}
            </button>
            <button
              onClick={handleResendOtp}
              disabled={resendCooldown > 0}
              className="text-sm text-blue-600 disabled:text-gray-400"
            >
              {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend"}
            </button>
          </div>
        </div>
      )}

      {verified && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Contact verified successfully!
          </div>
          <button
            onClick={handleNext}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Next: What Will You Sell →
          </button>
        </div>
      )}
    </div>
  );
}
