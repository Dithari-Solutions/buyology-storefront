"use client";

import { useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { supplierApi } from "../../services/supplier.api";
import { COLORS } from "@/shared/styles/variables";

const SELLS_ELSEWHERE_OPTIONS = [
  "Amazon", "Noon", "Instagram", "Website", "Carrefour", "Jumbo", "Other",
];

const DISPATCH_OPTIONS = [
  { value: "SAME_DAY", label: "Same day" },
  { value: "ONE_TWO_DAYS", label: "1–2 days" },
  { value: "THREE_FIVE_DAYS", label: "3–5 days" },
  { value: "MORE_THAN_FIVE", label: "More than 5 days" },
];

const YES_NEED_HELP = [
  { value: "YES", label: "Yes" },
  { value: "NEED_HELP", label: "Need help" },
];

const RETURNS_OPTIONS = [
  { value: "YES", label: "Yes" },
  { value: "NO", label: "No" },
  { value: "NEED_GUIDANCE", label: "Need guidance" },
];

const TRADE_LICENSE_OPTIONS = [
  { value: "YES", label: "Yes" },
  { value: "NO", label: "No" },
  { value: "IN_PROCESS", label: "In process" },
];

export default function Step3Operations() {
  const router = useRouter();
  const { lang } = useParams<{ lang: string }>();

  const [sellsElsewhere, setSellsElsewhere] = useState<string[]>([]);
  const [canProvideImages, setCanProvideImages] = useState("");
  const [avgDispatchTime, setAvgDispatchTime] = useState("");
  const [handlesReturns, setHandlesReturns] = useState("");
  const [hasTradeLicense, setHasTradeLicense] = useState("");
  const [websiteOrSocialLink, setWebsiteOrSocialLink] = useState("");
  const [tradeLicense, setTradeLicense] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function togglePlatform(p: string) {
    setSellsElsewhere((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) { setError("File must be under 20MB"); return; }
    setTradeLicense(file);
    setError("");
  }

  async function handleNext() {
    const applicationId = sessionStorage.getItem("supplier_applicationId");
    if (!applicationId) { router.push(`/${lang}/become-a-supplier`); return; }
    setLoading(true);
    setError("");
    try {
      await supplierApi.saveStep3({
        applicationId,
        sellsElsewhere,
        canProvideImages: canProvideImages || undefined,
        avgDispatchTime: avgDispatchTime || undefined,
        handlesReturns: handlesReturns || undefined,
        hasTradeLicense: hasTradeLicense || undefined,
        websiteOrSocialLink: websiteOrSocialLink || undefined,
        tradeLicense,
      });
      router.push(`/${lang}/become-a-supplier/step-4`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = `w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FBBB14] focus:bg-white focus:ring-4 focus:ring-[#FBBB14]/10 transition-all duration-200`;
  const labelClass = "block text-[13px] font-semibold text-gray-700 mb-2 ms-1";

  return (
    <div className="space-y-8">
      <div>
        <label className={labelClass}>Do you sell elsewhere?</label>
        <div className="flex flex-wrap gap-2.5">
          {SELLS_ELSEWHERE_OPTIONS.map((p) => {
            const isSelected = sellsElsewhere.includes(p);
            return (
              <button
                key={p}
                type="button"
                onClick={() => togglePlatform(p)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-200 ${
                  isSelected
                    ? "bg-[#402F75] text-white border-[#402F75] shadow-lg shadow-purple-100 scale-[1.02]"
                    : "bg-white text-gray-500 border-gray-200 hover:border-[#402F75]/30 hover:bg-purple-50/30"
                }`}
                style={isSelected ? { backgroundColor: COLORS.primary, borderColor: COLORS.primary } : {}}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Can you provide product images?</label>
          <select
            value={canProvideImages}
            onChange={(e) => setCanProvideImages(e.target.value)}
            className={inputClass}
          >
            <option value="">Select</option>
            {YES_NEED_HELP.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Average dispatch time</label>
          <select
            value={avgDispatchTime}
            onChange={(e) => setAvgDispatchTime(e.target.value)}
            className={inputClass}
          >
            <option value="">Select</option>
            {DISPATCH_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Can you handle returns?</label>
          <select
            value={handlesReturns}
            onChange={(e) => setHandlesReturns(e.target.value)}
            className={inputClass}
          >
            <option value="">Select</option>
            {RETURNS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Do you have a trade license?</label>
          <select
            value={hasTradeLicense}
            onChange={(e) => setHasTradeLicense(e.target.value)}
            className={inputClass}
          >
            <option value="">Select</option>
            {TRADE_LICENSE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Website or Social Link</label>
          <input
            value={websiteOrSocialLink}
            onChange={(e) => setWebsiteOrSocialLink(e.target.value)}
            className={inputClass}
            placeholder="https://instagram.com/yourshop"
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Upload Trade License</label>
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-[#FBBB14] hover:bg-yellow-50/30 transition-all duration-200 group"
          >
            {tradeLicense ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-green-700 font-bold">{tradeLicense.name}</p>
                <p className="text-xs text-gray-400 mt-1">Click to change file</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-2 group-hover:bg-yellow-100 transition-colors">
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-[#FBBB14]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 font-semibold">Click to upload Trade License</p>
                <p className="text-xs text-gray-400 mt-1">PDF or image, max 20MB</p>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg font-medium">{error}</p>}

      <div className="flex gap-4 pt-2">
        <button
          onClick={() => router.push(`/${lang}/become-a-supplier/step-2`)}
          className="flex-1 border-2 border-gray-100 text-gray-400 py-3.5 rounded-xl font-bold text-[15px] hover:bg-gray-50 hover:text-gray-600 transition-all duration-200"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          disabled={loading}
          className="flex-1 py-3.5 rounded-xl text-white font-bold text-[15px] transition-all duration-200 shadow-lg shadow-yellow-100 disabled:opacity-50 active:scale-[0.98]"
          style={{ backgroundColor: COLORS.secondary }}
        >
          {loading ? "Saving…" : "Next: Final Step →"}
        </button>
      </div>
    </div>
  );
}
