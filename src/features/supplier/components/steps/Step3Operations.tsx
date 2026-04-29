"use client";

import { useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { supplierApi } from "../../services/supplier.api";

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

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Do you sell elsewhere?</label>
        <div className="flex flex-wrap gap-2">
          {SELLS_ELSEWHERE_OPTIONS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => togglePlatform(p)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                sellsElsewhere.includes(p)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Can you provide product images?</label>
          <select
            value={canProvideImages}
            onChange={(e) => setCanProvideImages(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select</option>
            {YES_NEED_HELP.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Average dispatch time</label>
          <select
            value={avgDispatchTime}
            onChange={(e) => setAvgDispatchTime(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select</option>
            {DISPATCH_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Can you handle returns?</label>
          <select
            value={handlesReturns}
            onChange={(e) => setHandlesReturns(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select</option>
            {RETURNS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Do you have a trade license?</label>
          <select
            value={hasTradeLicense}
            onChange={(e) => setHasTradeLicense(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select</option>
            {TRADE_LICENSE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Website or Social Link</label>
        <input
          value={websiteOrSocialLink}
          onChange={(e) => setWebsiteOrSocialLink(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://instagram.com/yourshop"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Upload Trade License</label>
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
        >
          {tradeLicense ? (
            <p className="text-sm text-green-600 font-medium">{tradeLicense.name}</p>
          ) : (
            <p className="text-sm text-gray-400">Click to upload (PDF or image, max 20MB)</p>
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

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={() => router.push(`/${lang}/become-a-supplier/step-2`)}
          className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Saving…" : "Next: Final Step →"}
        </button>
      </div>
    </div>
  );
}
