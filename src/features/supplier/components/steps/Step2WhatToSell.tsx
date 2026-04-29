"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supplierApi } from "../../services/supplier.api";
import { COLORS } from "@/shared/styles/variables";

const CATEGORIES = [
  "SMARTPHONES", "LAPTOPS", "TABLETS", "AUDIO", "TV & DISPLAYS",
  "CAMERAS", "GAMING", "WEARABLES", "ACCESSORIES", "HOME APPLIANCES", "OTHER",
];

const CONDITIONS = [
  { value: "BRAND_NEW", label: "Brand New" },
  { value: "REFURBISHED", label: "Refurbished" },
  { value: "OPEN_BOX", label: "Open Box" },
  { value: "USED", label: "Used" },
  { value: "MIXED", label: "Mixed" },
];

const LISTING_RANGES = [
  { value: "ONE_TO_TEN", label: "1–10 products" },
  { value: "ELEVEN_TO_TWENTYFIVE", label: "11–25 products" },
  { value: "TWENTYSIX_TO_HUNDRED", label: "26–100 products" },
  { value: "OVER_HUNDRED", label: "Over 100 products" },
];

export default function Step2WhatToSell() {
  const router = useRouter();
  const { lang } = useParams<{ lang: string }>();

  const [categories, setCategories] = useState<string[]>([]);
  const [mainBrands, setMainBrands] = useState("");
  const [productCondition, setProductCondition] = useState("");
  const [initialListingRange, setInitialListingRange] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleCategory(cat: string) {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  async function handleNext() {
    const applicationId = sessionStorage.getItem("supplier_applicationId");
    if (!applicationId) { router.push(`/${lang}/become-a-supplier`); return; }
    setLoading(true);
    setError("");
    try {
      await supplierApi.saveStep2({
        applicationId,
        productCategories: categories,
        mainBrands: mainBrands || undefined,
        productCondition: productCondition || undefined,
        initialListingRange: initialListingRange || undefined,
      });
      sessionStorage.setItem("supplier_step2", JSON.stringify({ categories, mainBrands, productCondition, initialListingRange }));
      router.push(`/${lang}/become-a-supplier/step-3`);
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
        <label className={labelClass}>Product Categories (Select all that apply)</label>
        <div className="flex flex-wrap gap-2.5">
          {CATEGORIES.map((cat) => {
            const isSelected = categories.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-200 ${
                  isSelected
                    ? "bg-[#402F75] text-white border-[#402F75] shadow-lg shadow-purple-100 scale-[1.02]"
                    : "bg-white text-gray-500 border-gray-200 hover:border-[#402F75]/30 hover:bg-purple-50/30"
                }`}
                style={isSelected ? { backgroundColor: COLORS.primary, borderColor: COLORS.primary } : {}}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className={labelClass}>Main Brands You Sell</label>
          <input
            value={mainBrands}
            onChange={(e) => setMainBrands(e.target.value)}
            className={inputClass}
            placeholder="e.g. Apple, Samsung, Sony, HP"
          />
        </div>

        <div>
          <label className={labelClass}>Typical Product Condition</label>
          <select
            value={productCondition}
            onChange={(e) => setProductCondition(e.target.value)}
            className={inputClass}
          >
            <option value="">Select condition</option>
            {CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Initial Listing Range</label>
          <select
            value={initialListingRange}
            onChange={(e) => setInitialListingRange(e.target.value)}
            className={inputClass}
          >
            <option value="">How many products to start?</option>
            {LISTING_RANGES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg font-medium">{error}</p>}

      <div className="flex gap-4 pt-2">
        <button
          onClick={() => router.push(`/${lang}/become-a-supplier`)}
          className="flex-1 border-2 border-gray-100 text-gray-400 py-3.5 rounded-xl font-bold text-[15px] hover:bg-gray-50 hover:text-gray-600 transition-all duration-200"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          disabled={loading || categories.length === 0}
          className="flex-1 py-3.5 rounded-xl text-white font-bold text-[15px] transition-all duration-200 shadow-lg shadow-yellow-100 disabled:opacity-50 active:scale-[0.98]"
          style={{ backgroundColor: COLORS.secondary }}
        >
          {loading ? "Saving…" : "Next: Operations →"}
        </button>
      </div>
    </div>
  );
}
