"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { isSuspicious, validateEmail } from "@/features/auth/validation";
import { supplierApi } from "../../services/supplier.api";
import { COLORS } from "@/shared/styles/variables";

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
    preferredContact: "" as "EMAIL" | "WHATSAPP" | "PHONE_CALL" | "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Application state
  const [verified, setVerified] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Required";
    else if (isSuspicious(form.fullName)) e.fullName = "Invalid input";
    if (!form.sellerType) e.sellerType = "Required";
    const emailErr = validateEmail(form.email);
    if (emailErr) e.email = "Valid email required";
    
    // preferredContact is now optional
    
    if (form.businessName && isSuspicious(form.businessName)) e.businessName = "Invalid input";
    if (form.city && isSuspicious(form.city)) e.city = "Invalid input";
    return e;
  }

  async function handleSubmit() {
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
        preferredContact: form.preferredContact || null,
      });
      
      const appId = res.data?.data;
      sessionStorage.setItem("supplier_applicationId", appId);
      sessionStorage.setItem("supplier_step1", JSON.stringify(form));
      
      // Bypassing OTP as per new requirements
      setVerified(true);
      
      // Transition directly to Step 2
      router.push(`/${lang}/become-a-supplier/step-2`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setErrors({ general: msg || "Failed to initiate application. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  const field = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const inputClass = (hasError: boolean) =>
    `w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm transition-all duration-200 focus:outline-none ${
      hasError
        ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-100"
        : "border-gray-200 focus:border-[#FBBB14] focus:bg-white focus:ring-4 focus:ring-[#FBBB14]/10"
    }`;

  const labelClass = "block text-[13px] font-semibold text-gray-700 mb-1.5 ms-1";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
        <div>
          <label className={labelClass}>Full Name *</label>
          <input
            value={form.fullName}
            onChange={field("fullName")}
            className={inputClass(!!errors.fullName)}
            placeholder="Your full name"
          />
          {errors.fullName && <p className="text-red-500 text-[11px] mt-1 ms-1 font-medium">{errors.fullName}</p>}
        </div>
        <div>
          <label className={labelClass}>Business Name</label>
          <input
            value={form.businessName}
            onChange={field("businessName")}
            className={inputClass(!!errors.businessName)}
            placeholder="Legal entity or shop name"
          />
          {errors.businessName && <p className="text-red-500 text-[11px] mt-1 ms-1 font-medium">{errors.businessName}</p>}
        </div>
        <div>
          <label className={labelClass}>Seller Type *</label>
          <select
            value={form.sellerType}
            onChange={field("sellerType")}
            className={inputClass(!!errors.sellerType)}
          >
            <option value="">Select type</option>
            {SELLER_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          {errors.sellerType && <p className="text-red-500 text-[11px] mt-1 ms-1 font-medium">{errors.sellerType}</p>}
        </div>
        <div>
          <label className={labelClass}>Country</label>
          <input
            value={form.country}
            onChange={field("country")}
            className={inputClass(false)}
            placeholder="e.g. UAE"
          />
        </div>
        <div>
          <label className={labelClass}>City</label>
          <input
            value={form.city}
            onChange={field("city")}
            className={inputClass(!!errors.city)}
            placeholder="e.g. Dubai"
          />
          {errors.city && <p className="text-red-500 text-[11px] mt-1 ms-1 font-medium">{errors.city}</p>}
        </div>
        <div>
          <label className={labelClass}>Email Address *</label>
          <input
            type="email"
            value={form.email}
            onChange={field("email")}
            className={inputClass(!!errors.email)}
            placeholder="you@example.com"
          />
          {errors.email && <p className="text-red-500 text-[11px] mt-1 ms-1 font-medium">{errors.email}</p>}
        </div>
        <div>
          <label className={labelClass}>Phone Number</label>
          <input
            value={form.phoneNumber}
            onChange={field("phoneNumber")}
            className={inputClass(false)}
            placeholder="+971 50 000 0000"
          />
        </div>
        <div>
          <label className={labelClass}>Preferred Contact</label>
          <select
            value={form.preferredContact}
            onChange={field("preferredContact")}
            className={inputClass(!!errors.preferredContact)}
          >
            <option value="">Select method (optional)</option>
            {CONTACT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          {errors.preferredContact && <p className="text-red-500 text-[11px] mt-1 ms-1 font-medium">{errors.preferredContact}</p>}
        </div>
      </div>

      {errors.general && (
        <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">{errors.general}</p>
      )}

      {!verified && (
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3.5 rounded-xl text-white font-bold text-[15px] transition-all duration-200 shadow-lg shadow-yellow-100 disabled:opacity-50 active:scale-[0.98]"
          style={{ backgroundColor: COLORS.secondary }}
        >
          {loading ? "Processing…" : "Save & Continue"}
        </button>
      )}

      {verified && (
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-2xl border border-green-100">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-700 text-sm font-bold">Application initiated! Redirecting...</p>
          </div>
        </div>
      )}
    </div>
  );
}
