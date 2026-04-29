"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supplierApi } from "../../services/supplier.api";
import { COLORS } from "@/shared/styles/variables";

export default function Step4Final() {
  const router = useRouter();
  const { lang } = useParams<{ lang: string }>();

  const [whyBuyology, setWhyBuyology] = useState("");
  const [decl1, setDecl1] = useState(false);
  const [decl2, setDecl2] = useState(false);
  const [decl3, setDecl3] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const allAccepted = decl1 && decl2 && decl3;

  async function handleSubmit() {
    if (!allAccepted) { setError("You must accept all declaration points to proceed."); return; }
    const applicationId = sessionStorage.getItem("supplier_applicationId");
    if (!applicationId) { router.push(`/${lang}/become-a-supplier`); return; }

    setLoading(true);
    setError("");
    try {
      await supplierApi.submit({ applicationId, whyBuyology: whyBuyology || undefined, declarationAccepted: true });
      ["supplier_applicationId", "supplier_step1", "supplier_step2"].forEach((k) =>
        sessionStorage.removeItem(k)
      );
      router.push(`/${lang}/become-a-supplier/submitted`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const labelClass = "block text-[13px] font-semibold text-gray-700 mb-2 ms-1";

  return (
    <div className="space-y-8">
      <div>
        <label className={labelClass}>
          Why do you want to sell on Buyology?
        </label>
        <textarea
          value={whyBuyology}
          onChange={(e) => setWhyBuyology(e.target.value)}
          rows={4}
          className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#FBBB14] focus:bg-white focus:ring-4 focus:ring-[#FBBB14]/10 transition-all duration-200 resize-none"
          placeholder="Tell us a bit about your goals and why Buyology is the right platform for you…"
        />
      </div>

      <div className="bg-gray-50 border border-gray-100 rounded-[24px] p-6 space-y-4">
        <h3 className="text-[14px] font-bold text-gray-800 mb-2">Declaration</h3>
        {[
          { state: decl1, set: setDecl1, text: "I confirm that all information provided in this application is accurate and truthful." },
          { state: decl2, set: setDecl2, text: "I agree to comply with Buyology's seller policies, quality standards, and terms of service." },
          { state: decl3, set: setDecl3, text: "I understand that submitting false information may result in rejection or account suspension." },
        ].map(({ state, set, text }, i) => (
          <label key={i} className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center mt-0.5">
              <input
                type="checkbox"
                checked={state}
                onChange={(e) => set(e.target.checked)}
                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-gray-200 transition-all checked:border-[#402F75] checked:bg-[#402F75] hover:border-[#402F75]/30"
                style={state ? { backgroundColor: COLORS.primary, borderColor: COLORS.primary } : {}}
              />
              <svg className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className={`text-sm transition-colors duration-200 ${state ? "text-gray-900 font-medium" : "text-gray-500 group-hover:text-gray-700"}`}>{text}</span>
          </label>
        ))}
      </div>

      {error && <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg font-medium">{error}</p>}

      <div className="flex gap-4 pt-2">
        <button
          onClick={() => router.push(`/${lang}/become-a-supplier/step-3`)}
          className="flex-1 border-2 border-gray-100 text-gray-400 py-3.5 rounded-xl font-bold text-[15px] hover:bg-gray-50 hover:text-gray-600 transition-all duration-200"
        >
          ← Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || !allAccepted}
          className="flex-1 py-3.5 rounded-xl text-white font-bold text-[15px] transition-all duration-200 shadow-lg shadow-yellow-100 disabled:opacity-50 active:scale-[0.98]"
          style={{ backgroundColor: COLORS.secondary }}
        >
          {loading ? "Submitting…" : "Submit Application"}
        </button>
      </div>
    </div>
  );
}
