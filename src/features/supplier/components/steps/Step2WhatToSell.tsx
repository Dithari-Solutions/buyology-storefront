"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supplierApi } from "../../services/supplier.api";

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

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Product Categories</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => toggleCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                categories.includes(cat)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Main Brands</label>
        <input
          value={mainBrands}
          onChange={(e) => setMainBrands(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g. Apple, Samsung, Sony"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Product Condition</label>
        <select
          value={productCondition}
          onChange={(e) => setProductCondition(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select condition</option>
          {CONDITIONS.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Initial Listing Range</label>
        <select
          value={initialListingRange}
          onChange={(e) => setInitialListingRange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">How many products to start?</option>
          {LISTING_RANGES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={() => router.push(`/${lang}/become-a-supplier`)}
          className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Saving…" : "Next: Operations →"}
        </button>
      </div>
    </div>
  );
}
