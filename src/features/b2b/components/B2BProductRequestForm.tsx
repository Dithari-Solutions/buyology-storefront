"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import type { RootState } from "@/store";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";
import {
  submitProductRequest,
  B2B_PRODUCT_REQUEST_MIN_QTY,
} from "@/features/b2b/services/productRequest.api";

// ── B2B Product-Sourcing Request form ───────────────────────────────────────
// Lets a visitor ask procurement to source a product not in the catalog. The
// form is ALWAYS shown; the action adapts to the visitor: a guest is prompted
// to log in, a logged-in non-member is prompted to apply for B2B membership,
// and an ACTIVE member can submit. Quantity is client-validated (>= MIN).
// Optional single reference image with preview + remove (upload UX modelled on
// ProductReviews.tsx). Success collapses the form into a confirmation.
export default function B2BProductRequestForm({
  isActiveMember,
  membershipLoading,
  lang,
}: {
  isActiveMember: boolean;
  membershipLoading: boolean;
  lang: Lang;
}) {
  const { t } = useTranslation("b2b");
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);

  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ productName?: string; quantity?: string }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Revoke the preview object URL when it changes or the form unmounts.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeImage() {
    setFile(null);
    setPreviewUrl(null);
  }

  function validate(): boolean {
    const errors: { productName?: string; quantity?: string } = {};
    if (!productName.trim()) {
      errors.productName = t("productRequest.productNameRequired", { defaultValue: "Product name is required." });
    }
    const qty = parseInt(quantity, 10);
    if (!quantity || Number.isNaN(qty) || qty < B2B_PRODUCT_REQUEST_MIN_QTY) {
      errors.quantity = t("productRequest.quantityMin", { min: B2B_PRODUCT_REQUEST_MIN_QTY, defaultValue: `Minimum quantity is ${B2B_PRODUCT_REQUEST_MIN_QTY}.` });
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    // Submission requires an active member; guests/non-members use the CTA below.
    if (!isAuthenticated || !isActiveMember) return;
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitProductRequest({
        productName: productName.trim(),
        quantity: parseInt(quantity, 10),
        message: message.trim() || undefined,
        image: file ?? undefined,
      });
      setSuccess(true);
      setProductName("");
      setQuantity("");
      setMessage("");
      removeImage();
    } catch {
      setSubmitError(t("productRequest.error", { defaultValue: "Something went wrong. Please try again." }));
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm px-6 py-8 sm:px-8 flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#EDE9FF] flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div>
          <h3 className="text-[18px] font-bold text-gray-900 mb-1">{t("productRequest.successTitle", { defaultValue: "Request received!" })}</h3>
          <p className="text-[13.5px] text-gray-500 max-w-md">{t("productRequest.success", { defaultValue: "Our procurement team will review your request and follow up by email." })}</p>
        </div>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="text-[13px] font-bold text-[#402F75] hover:underline"
        >
          {t("productRequest.newRequest", { defaultValue: "Submit another request" })}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm px-6 py-6 sm:px-8">
      <div className="mb-5">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#402F75] bg-[#EDE9FF] px-3 py-[5px] rounded-full mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FBBB14]" />
          {t("productRequest.title", { defaultValue: "Can't find it? Request a product" })}
        </span>
        <p className="text-[13.5px] text-gray-500">{t("productRequest.subtitle", { defaultValue: "Tell us what you need and our procurement team will source it for you." })}</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Product name */}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-[13px] font-semibold text-gray-700">{t("productRequest.productName", { defaultValue: "Product name" })}</label>
          <input
            value={productName}
            onChange={(e) => { setProductName(e.target.value); setFieldErrors((p) => ({ ...p, productName: undefined })); }}
            placeholder={t("productRequest.productNamePlaceholder", { defaultValue: "e.g. Dell Latitude 5540 laptop" })}
            className={`border rounded-[12px] px-4 py-3 text-[14px] text-gray-800 outline-none focus:border-[#402F75] focus:ring-2 focus:ring-[#402F75]/10 transition-all ${fieldErrors.productName ? "border-red-400" : "border-gray-200"}`}
          />
          {fieldErrors.productName && <p className="text-[11px] text-red-500">{fieldErrors.productName}</p>}
        </div>

        {/* Quantity */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-gray-700">{t("productRequest.quantity", { defaultValue: "Quantity" })}</label>
          <input
            type="number"
            min={B2B_PRODUCT_REQUEST_MIN_QTY}
            value={quantity}
            onChange={(e) => { setQuantity(e.target.value); setFieldErrors((p) => ({ ...p, quantity: undefined })); }}
            placeholder={t("productRequest.quantityPlaceholder", { defaultValue: "Min 5" })}
            className={`border rounded-[12px] px-4 py-3 text-[14px] text-gray-800 outline-none focus:border-[#402F75] focus:ring-2 focus:ring-[#402F75]/10 transition-all ${fieldErrors.quantity ? "border-red-400" : "border-gray-200"}`}
          />
          {fieldErrors.quantity && <p className="text-[11px] text-red-500">{fieldErrors.quantity}</p>}
        </div>

        {/* Image */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-gray-700">{t("productRequest.image", { defaultValue: "Reference image (optional)" })}</label>
          {previewUrl ? (
            <div className="relative w-[88px] h-[64px] rounded-[12px] overflow-hidden border border-gray-200">
              <Image src={previewUrl} alt="Preview" fill className="object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-1 end-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center text-[12px] leading-none hover:bg-black/80"
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          ) : (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 self-start text-[13px] font-medium text-gray-500 border border-dashed border-gray-300 rounded-[12px] px-4 py-3 hover:border-[#402F75] hover:text-[#402F75] transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                {t("productRequest.imageHint", { defaultValue: "Add an image" })}
              </button>
            </>
          )}
        </div>

        {/* Message */}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-[13px] font-semibold text-gray-700">{t("productRequest.message", { defaultValue: "Message to procurement (optional)" })}</label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t("productRequest.messagePlaceholder", { defaultValue: "Specs, brand, budget, timeline, or any other details…" })}
            className="border border-gray-200 rounded-[12px] px-4 py-3 text-[14px] text-gray-800 outline-none focus:border-[#402F75] focus:ring-2 focus:ring-[#402F75]/10 transition-all resize-none"
          />
        </div>

        {submitError && (
          <p className="sm:col-span-2 text-red-500 text-[13px]">{submitError}</p>
        )}

        <div className="sm:col-span-2">
          {!isAuthenticated ? (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <Link
                href={`/${lang}/${PATH_SLUGS.auth[lang] ?? "auth"}`}
                className="flex items-center gap-2 bg-[#402F75] hover:bg-[#352566] text-white font-bold text-[14px] px-7 py-[13px] rounded-full transition-colors shadow-md"
              >
                {t("productRequest.loginCta", { defaultValue: "Log in to request" })}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <span className="text-[12.5px] text-gray-500">
                {t("productRequest.loginPrompt", { defaultValue: "Please log in to send your product request." })}
              </span>
            </div>
          ) : !membershipLoading && !isActiveMember ? (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <Link
                href={`/${lang}/${PATH_SLUGS.b2b[lang] ?? "b2b"}/apply`}
                className="flex items-center gap-2 bg-[#402F75] hover:bg-[#352566] text-white font-bold text-[14px] px-7 py-[13px] rounded-full transition-colors shadow-md"
              >
                {t("productRequest.memberCta", { defaultValue: "Apply for B2B membership" })}
              </Link>
              <span className="text-[12.5px] text-gray-500">
                {t("productRequest.memberPrompt", { defaultValue: "A B2B membership is required to submit a request." })}
              </span>
            </div>
          ) : (
            <button
              type="submit"
              disabled={submitting || membershipLoading}
              className="flex items-center gap-2 bg-[#402F75] hover:bg-[#352566] disabled:opacity-60 text-white font-bold text-[14px] px-7 py-[13px] rounded-full transition-colors shadow-md"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  {t("productRequest.sending", { defaultValue: "Sending…" })}
                </>
              ) : (
                <>
                  {t("productRequest.submit", { defaultValue: "Submit request" })}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
