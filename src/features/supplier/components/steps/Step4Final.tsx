"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supplierApi } from "../../services/supplier.api";

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

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Why do you want to sell on Buyology?
        </label>
        <textarea
          value={whyBuyology}
          onChange={(e) => setWhyBuyology(e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Tell us a bit about your goals and why Buyology is the right platform for you…"
        />
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Declaration</h3>
        {[
          { state: decl1, set: setDecl1, text: "I confirm that all information provided in this application is accurate and truthful." },
          { state: decl2, set: setDecl2, text: "I agree to comply with Buyology's seller policies, quality standards, and terms of service." },
          { state: decl3, set: setDecl3, text: "I understand that submitting false information may result in rejection or account suspension." },
        ].map(({ state, set, text }, i) => (
          <label key={i} className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={state}
              onChange={(e) => set(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">{text}</span>
          </label>
        ))}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={() => router.push(`/${lang}/become-a-supplier/step-3`)}
          className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || !allAccepted}
          className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Submitting…" : "Submit Application"}
        </button>
      </div>
    </div>
  );
}
