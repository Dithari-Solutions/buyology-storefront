"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import type { RootState } from "@/store";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";
import { getProfile } from "@/features/profile/services/profile.api";
import type { UserProfile } from "@/features/profile/types";
import { submitRepairRequest } from "@/features/repair/services/repair.api";
import { REPAIR_MAX_IMAGES } from "@/features/repair/types";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

export default function RepairRequestForm() {
  const params = useParams();
  const lang = (params?.lang as Lang) ?? "en";
  const repairSlug = PATH_SLUGS.repair[lang] ?? "repair";
  const authSlug = PATH_SLUGS.auth[lang] ?? "auth";
  const profileSlug = PATH_SLUGS.profile[lang] ?? "profile";
  const { t } = useTranslation("repair");
  const router = useRouter();

  const userId = useSelector((s: RootState) => s.auth.userId);
  const authRestored = useSelector((s: RootState) => s.auth.isRestored);

  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [productName, setProductName] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Login gate — wait for the silent refresh to settle, then redirect guests.
  useEffect(() => {
    if (!authRestored) return;
    if (!userId) router.replace(`/${lang}/${authSlug}`);
  }, [authRestored, userId, lang, authSlug, router]);

  // Load profile (email/phone for the contact section + completeness banner).
  useEffect(() => {
    if (!userId) return;
    getProfile(userId)
      .then(setProfile)
      .catch(() => setProfile(null));
  }, [userId]);

  // Revoke preview object URLs on unmount.
  useEffect(() => {
    return () => previews.forEach((u) => URL.revokeObjectURL(u));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const email = profile?.email ?? null;
  const phone = profile?.phoneNumber ?? null;
  const profileComplete = Boolean(email && phone);

  function addFiles(incoming: File[]) {
    const images = incoming.filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) return;
    const combined = [...files, ...images].slice(0, REPAIR_MAX_IMAGES);
    previews.forEach((u) => URL.revokeObjectURL(u));
    setFiles(combined);
    setPreviews(combined.map((f) => URL.createObjectURL(f)));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(index: number) {
    URL.revokeObjectURL(previews[index]);
    setFiles((p) => p.filter((_, i) => i !== index));
    setPreviews((p) => p.filter((_, i) => i !== index));
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!productName.trim()) errors.productName = t("form.required", { defaultValue: "Required" });
    if (!brand.trim()) errors.brand = t("form.required", { defaultValue: "Required" });
    if (!model.trim()) errors.model = t("form.required", { defaultValue: "Required" });
    if (!description.trim()) errors.description = t("form.required", { defaultValue: "Required" });
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!profileComplete) return;
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitRepairRequest({
        productName: productName.trim(),
        brand: brand.trim(),
        model: model.trim(),
        purchaseDate: purchaseDate || undefined,
        description: description.trim(),
        images: files,
      });
      setSuccess(true);
    } catch {
      setSubmitError(t("form.error", { defaultValue: "Something went wrong. Please try again." }));
    } finally {
      setSubmitting(false);
    }
  }

  if (!authRestored || !userId) return null;

  // ── Success ───────────────────────────────────────────────────────────────
  if (success) {
    return (
      <main className="w-[92%] max-w-[560px] mx-auto py-14">
        <div className="flex flex-col items-center rounded-[22px] border border-gray-100 bg-white px-6 py-12 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EDE9FF]">
            <svg viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
              <path d="M9 12l2 2 4-4M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z" />
            </svg>
          </div>
          <h1 className="mt-5 text-[22px] font-extrabold text-gray-900">
            {t("success.title", { defaultValue: "Repair Request Submitted" })}
          </h1>
          <p className="mt-2 max-w-[400px] text-[13.5px] text-gray-500">
            {t("success.body", {
              defaultValue: "Our technicians will review your request shortly. You'll receive an email confirmation at",
            })}{" "}
            <span className="font-semibold text-gray-700">{email}</span>
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/${lang}/${repairSlug}/my`}
              className="rounded-full bg-[#402F75] px-6 py-3 text-[13.5px] font-bold text-white transition-colors hover:bg-[#352566]"
            >
              {t("success.viewRequests", { defaultValue: "View Repair Requests" })}
            </Link>
            <Link
              href={`/${lang}`}
              className="rounded-full bg-[#FBBB14] px-6 py-3 text-[13.5px] font-bold text-[#2f2158] transition-colors hover:bg-[#eab00d]"
            >
              {t("success.backHome", { defaultValue: "Back to Home" })}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const inputCls = (err?: string) =>
    `border rounded-[12px] px-4 py-3 text-[14px] text-gray-800 outline-none focus:border-[#402F75] focus:ring-2 focus:ring-[#402F75]/10 transition-all ${
      err ? "border-red-400" : "border-gray-200"
    }`;

  return (
    <main className="w-[92%] max-w-[720px] mx-auto py-8 sm:py-10">
      <div className="rounded-[22px] border border-gray-100 bg-white px-6 py-6 sm:px-8 shadow-sm">
        {/* Heading */}
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#EDE9FF]">
            <svg viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2-2 2.6-2.6Z" />
            </svg>
          </span>
          <h1 className="text-[19px] font-extrabold text-gray-900">
            {t("form.title", { defaultValue: "Submit Repair Request" })}
          </h1>
        </div>

        {/* Profile completeness banner */}
        {!profileComplete ? (
          <div className="mb-6 flex flex-col gap-2 rounded-[14px] border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-4 w-4 shrink-0">
                <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
              </svg>
              <p className="text-[12.5px] leading-relaxed text-amber-800">
                {t("form.profileIncomplete", {
                  defaultValue:
                    "Please complete your profile (email and phone number) before requesting a repair — we use it to contact you about your device.",
                })}
              </p>
            </div>
            <Link
              href={`/${lang}/${profileSlug}?returnTo=repair`}
              className="shrink-0 rounded-full bg-amber-500 px-4 py-2 text-center text-[12.5px] font-bold text-white transition-colors hover:bg-amber-600"
            >
              {t("form.completeProfile", { defaultValue: "Complete profile" })}
            </Link>
          </div>
        ) : (
          <div className="mb-6 flex items-center gap-2.5 rounded-[14px] border border-green-200 bg-green-50 px-4 py-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <p className="text-[12.5px] text-green-800">
              {t("form.profileReady", {
                defaultValue: "Your contact details are ready. We'll reach you at the email and phone below.",
              })}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-7">
          {/* Product information */}
          <section>
            <h2 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-[#402F75]">
              {t("form.productInfo", { defaultValue: "Product Information" })}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-gray-700">
                  {t("form.productName", { defaultValue: "Product Name" })}
                </label>
                <input
                  value={productName}
                  onChange={(e) => { setProductName(e.target.value); setFieldErrors((p) => ({ ...p, productName: "" })); }}
                  placeholder={t("form.productNamePlaceholder", { defaultValue: "e.g. MacBook Air" })}
                  className={inputCls(fieldErrors.productName)}
                />
                {fieldErrors.productName && <p className="text-[11px] text-red-500">{fieldErrors.productName}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-gray-700">
                  {t("form.brand", { defaultValue: "Brand" })}
                </label>
                <input
                  value={brand}
                  onChange={(e) => { setBrand(e.target.value); setFieldErrors((p) => ({ ...p, brand: "" })); }}
                  placeholder={t("form.brandPlaceholder", { defaultValue: "e.g. Apple" })}
                  className={inputCls(fieldErrors.brand)}
                />
                {fieldErrors.brand && <p className="text-[11px] text-red-500">{fieldErrors.brand}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-gray-700">
                  {t("form.model", { defaultValue: "Model" })}
                </label>
                <input
                  value={model}
                  onChange={(e) => { setModel(e.target.value); setFieldErrors((p) => ({ ...p, model: "" })); }}
                  placeholder={t("form.modelPlaceholder", { defaultValue: "e.g. 2021 M1" })}
                  className={inputCls(fieldErrors.model)}
                />
                {fieldErrors.model && <p className="text-[11px] text-red-500">{fieldErrors.model}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-gray-700">
                  {t("form.purchaseDate", { defaultValue: "Purchase Date (Optional)" })}
                </label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className={inputCls()}
                />
              </div>
            </div>
          </section>

          {/* Contact information (read-only, from profile) */}
          <section>
            <h2 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-[#402F75]">
              {t("form.contactInfo", { defaultValue: "Contact Information" })}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-gray-700">
                  {t("form.email", { defaultValue: "Email Address" })}
                </label>
                <div className="rounded-[12px] border border-gray-200 bg-gray-50 px-4 py-3 text-[14px] text-gray-700">
                  {email ?? <span className="text-gray-400">{t("form.emailMissing", { defaultValue: "Add an email in your profile" })}</span>}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-gray-700">
                  {t("form.phone", { defaultValue: "Phone Number" })}
                </label>
                <div className="rounded-[12px] border border-gray-200 bg-gray-50 px-4 py-3 text-[14px] text-gray-700">
                  {phone ?? <span className="text-gray-400">{t("form.phoneMissing", { defaultValue: "Add a phone number in your profile" })}</span>}
                </div>
              </div>
            </div>
          </section>

          {/* Problem details */}
          <section>
            <h2 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-[#402F75]">
              {t("form.problemDetails", { defaultValue: "Problem Details" })}
            </h2>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-gray-700">
                {t("form.description", { defaultValue: "Problem Description" })}
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => { setDescription(e.target.value); setFieldErrors((p) => ({ ...p, description: "" })); }}
                placeholder={t("form.descriptionPlaceholder", { defaultValue: "Please describe the issue you're experiencing in detail…" })}
                className={`resize-none ${inputCls(fieldErrors.description)}`}
              />
              {fieldErrors.description && <p className="text-[11px] text-red-500">{fieldErrors.description}</p>}
            </div>
          </section>

          {/* Upload images */}
          <section>
            <h2 className="mb-1 text-[13px] font-bold uppercase tracking-wide text-[#402F75]">
              {t("form.uploadImages", { defaultValue: "Upload Images" })}
            </h2>
            <p className="mb-3 text-[12px] text-gray-500">
              {t("form.uploadHint", { defaultValue: "Upload up to 4 images showing the issue (Optional)" })}
            </p>

            {previews.length > 0 && (
              <div className="mb-3 grid grid-cols-4 gap-2.5">
                {previews.map((url, i) => (
                  <div key={i} className="relative aspect-square overflow-hidden rounded-[12px] border border-gray-200">
                    <Image src={url} alt={`Upload ${i + 1}`} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute end-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[12px] leading-none text-white hover:bg-black/80"
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {previews.length < REPAIR_MAX_IMAGES && (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); addFiles(Array.from(e.dataTransfer.files ?? [])); }}
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[14px] border-2 border-dashed border-gray-300 px-4 py-8 text-center transition-colors hover:border-[#402F75]"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                  <path d="M12 16V4M12 4l-4 4M12 4l4 4M4 20h16" />
                </svg>
                <p className="text-[13px] font-medium text-gray-500">
                  {t("form.uploadCta", { defaultValue: "Click to upload or drag and drop" })}
                </p>
                <p className="text-[11px] text-gray-400">
                  {t("form.uploadFormats", { defaultValue: "PNG, JPG up to 10MB" })}
                </p>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept={ACCEPT} multiple className="hidden" onChange={(e) => addFiles(Array.from(e.target.files ?? []))} />
          </section>

          {submitError && <p className="text-[13px] text-red-500">{submitError}</p>}

          <button
            type="submit"
            disabled={submitting || !profileComplete}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#FBBB14] py-[14px] text-[14px] font-bold text-[#2f2158] shadow-md transition-colors hover:bg-[#eab00d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? t("form.submitting", { defaultValue: "Submitting…" })
              : t("form.submit", { defaultValue: "Submit Repair Request" })}
          </button>
        </form>
      </div>
    </main>
  );
}
