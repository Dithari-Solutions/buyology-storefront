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
import { selectPreferredCurrency, selectSelectedCountryCode } from "@/features/country/store/countrySlice";
import { convertAmount } from "@/features/currency/services/currency.api";
import { chooseDelivery, getRepair, listRepairStores, submitRepairRequest } from "@/features/repair/services/repair.api";
import type { Repair, RepairStoreOption } from "@/features/repair/types";
import { REPAIR_COURIER_FEE_AED, REPAIR_MAX_IMAGES } from "@/features/repair/types";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

/** Shared with the payment-callback page: stashes our tx UUID across the Paymob redirect. */
const PENDING_TX_KEY = "buyology_pending_tx_id";

type DeliveryChoice = "STORE_DROPOFF" | "COURIER_PICKUP";

function fmtMoney(amount: number, currency: string) {
  return `${currency.toUpperCase()} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

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
  const preferredCurrency = useSelector(selectPreferredCurrency);
  const countryCode = useSelector(selectSelectedCountryCode);
  const ccy = (preferredCurrency ?? "AED").toUpperCase();

  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Wizard: 1 = device details, 2 = delivery method (required before submitting).
  const [step, setStep] = useState<1 | 2>(1);

  const [productName, setProductName] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Step 2 — delivery choice.
  const [deliveryChoice, setDeliveryChoice] = useState<DeliveryChoice | null>(null);
  const [stores, setStores] = useState<RepairStoreOption[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [convertedFee, setConvertedFee] = useState<number | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  // The AI estimate is produced server-side after the request is committed, so it isn't in the
  // submit response — the success screen polls for it and shows it as soon as it lands. The
  // status drives a permanent slot on that screen so there is always something to look at:
  // estimating → ready, or a plain explanation if it never arrives.
  const [estimate, setEstimate] = useState<Repair | null>(null);
  const [estimateStatus, setEstimateStatus] = useState<"idle" | "pending" | "ready" | "unavailable">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  // Once the request is created we cache its id so a retry of the delivery step
  // (e.g. after a payment hiccup) reuses the same request instead of duplicating it.
  const createdRepairIdRef = useRef<string | null>(null);

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

  // Fetch store branches (for the drop-off picker on step 2).
  useEffect(() => {
    if (!countryCode) return;
    listRepairStores(countryCode).then(setStores).catch(() => setStores([]));
  }, [countryCode]);

  // Convert the 20 AED courier fee to the customer's currency for display.
  useEffect(() => {
    if (ccy === "AED") { setConvertedFee(null); return; }
    let alive = true;
    convertAmount(REPAIR_COURIER_FEE_AED, "AED", ccy).then((v) => { if (alive) setConvertedFee(v); });
    return () => { alive = false; };
  }, [ccy]);

  // Poll for the preliminary AI estimate once the request is in. It's generated off the request
  // thread (a few seconds), so rather than making the customer wait on submit or come back to the
  // request later, the success screen fills it in as soon as it's ready. Gives up quietly after
  // ~60s — the estimate is advisory, and the team's real quote follows by email either way.
  useEffect(() => {
    if (!success) return;
    const repairId = createdRepairIdRef.current;
    if (!repairId) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    setEstimateStatus("pending");

    const poll = async () => {
      if (cancelled) return;
      attempts += 1;
      try {
        const fresh = await getRepair(repairId, ccy);
        if (cancelled) return;
        if (fresh.aiEstimateMinPrice != null && fresh.aiEstimateMaxPrice != null) {
          setEstimate(fresh);
          setEstimateStatus("ready");
          return;
        }
      } catch {
        // Transient read failure — keep trying until the attempt budget runs out.
      }
      if (cancelled) return;
      if (attempts >= 30) {
        setEstimateStatus("unavailable");
        return;
      }
      timer = setTimeout(poll, 3000);
    };

    timer = setTimeout(poll, 2000);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [success, ccy]);

  const email = profile?.email ?? null;
  const phone = profile?.phoneNumber ?? null;
  const profileComplete = Boolean(email && phone);

  const courierFeeLabel =
    ccy === "AED" || convertedFee == null
      ? fmtMoney(REPAIR_COURIER_FEE_AED, "AED")
      : `${fmtMoney(REPAIR_COURIER_FEE_AED, "AED")} (≈ ${fmtMoney(convertedFee, ccy)})`;

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

  function validateStep1(): boolean {
    const errors: Record<string, string> = {};
    if (!productName.trim()) errors.productName = t("form.required", { defaultValue: "Required" });
    if (!brand.trim()) errors.brand = t("form.required", { defaultValue: "Required" });
    if (!model.trim()) errors.model = t("form.required", { defaultValue: "Required" });
    if (!description.trim()) errors.description = t("form.required", { defaultValue: "Required" });
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleContinue() {
    if (!profileComplete) return;
    if (!validateStep1()) return;
    setSubmitError(null);
    setStep(2);
  }

  // Where Paymob returns the browser after the courier-fee checkout.
  const callbackUrl = (repairId: string) =>
    typeof window !== "undefined"
      ? `${window.location.origin}/${lang}/payment/callback?kind=repair-courier-fee&repairId=${repairId}`
      : undefined;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step !== 2 || submitting) return;
    if (!profileComplete) return;

    // Delivery method is required before the request can be submitted.
    if (!deliveryChoice) {
      setSubmitError(t("form.pickDelivery", { defaultValue: "Please choose how to get your device to us." }));
      return;
    }
    if (deliveryChoice === "STORE_DROPOFF" && !selectedStoreId) {
      setSubmitError(t("detail.pickStore", { defaultValue: "Please choose a store branch." }));
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      // Create the request once, then reuse its id on any retry of the delivery leg.
      let repairId = createdRepairIdRef.current;
      if (!repairId) {
        const created = await submitRepairRequest({
          productName: productName.trim(),
          brand: brand.trim(),
          model: model.trim(),
          purchaseDate: purchaseDate || undefined,
          description: description.trim(),
          images: files,
        });
        repairId = created.id;
        createdRepairIdRef.current = repairId;
      }

      const result = await chooseDelivery(repairId, {
        method: deliveryChoice,
        storeLocationId: deliveryChoice === "STORE_DROPOFF" ? selectedStoreId : undefined,
        currency: ccy,
        redirectionUrl: deliveryChoice === "COURIER_PICKUP" ? callbackUrl(repairId) : undefined,
      });

      // Courier pickup → pay the fee at Paymob; the webhook advances the request on success.
      if (result.payment?.checkoutUrl) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem(PENDING_TX_KEY, result.payment.transactionId);
          window.location.href = result.payment.checkoutUrl;
        }
        return;
      }
      // Store drop-off → free, already advanced.
      setSuccess(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error && err.message
          ? err.message
          : t("form.error", { defaultValue: "Something went wrong. Please try again." }),
      );
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

          {/* Preliminary AI estimate — a permanent slot on this screen: it animates while the
              estimate is being generated, then swaps to the price (or a plain note if it can't). */}
          {estimateStatus === "pending" && (
            <div className="mt-6 w-full overflow-hidden rounded-[16px] border border-[#E4DCFB] bg-gradient-to-br from-[#F8F6FF] to-[#EFEAFF] px-5 py-5 text-start">
              <div className="flex items-center gap-3">
                {/* Pulsing halo behind a spinning ring — reads as "working" at a glance. */}
                <span className="relative flex h-9 w-9 shrink-0 items-center justify-center">
                  <span className="absolute inset-0 animate-ping rounded-full bg-[#402F75]/20" />
                  <span className="absolute inset-0 animate-spin rounded-full border-2 border-[#402F75]/30 border-t-[#402F75]" />
                  <svg viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="relative h-4 w-4">
                    <path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3Z" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-[#402F75]">
                    {t("success.estimatePending", { defaultValue: "AI is estimating your repair…" })}
                    <span className="ml-0.5 inline-flex">
                      <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
                      <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
                      <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
                    </span>
                  </p>
                  <p className="mt-0.5 text-[12px] text-gray-500">
                    {t("success.estimatePendingBody", {
                      defaultValue: "Analysing your photos and description. This usually takes a few seconds.",
                    })}
                  </p>
                </div>
              </div>

              {/* Shimmer placeholders standing in for the price + description lines. */}
              <div className="mt-4 space-y-2">
                <div className="h-6 w-1/2 animate-pulse rounded-md bg-[#402F75]/15" />
                <div className="h-3 w-full animate-pulse rounded bg-[#402F75]/10" style={{ animationDelay: "120ms" }} />
                <div className="h-3 w-4/5 animate-pulse rounded bg-[#402F75]/10" style={{ animationDelay: "240ms" }} />
              </div>
            </div>
          )}

          {estimateStatus === "unavailable" && (
            <div className="mt-6 w-full rounded-[16px] border border-gray-200 bg-gray-50 px-5 py-4 text-start">
              <p className="text-[13px] font-semibold text-gray-700">
                {t("success.estimateUnavailable", { defaultValue: "No instant estimate this time" })}
              </p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-gray-500">
                {t("success.estimateUnavailableBody", {
                  defaultValue:
                    "We couldn't prepare a preliminary price for this one. Our technicians will review your device and send you a full quote — nothing is delayed.",
                })}
              </p>
            </div>
          )}

          {estimateStatus === "ready" && estimate?.aiEstimateMinPrice != null && estimate.aiEstimateMaxPrice != null && (
            <div className="mt-6 w-full rounded-[16px] border border-[#E4DCFB] bg-[#F8F6FF] px-5 py-4 text-start">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-[13.5px] font-bold text-[#402F75]">
                  {t("success.estimateTitle", { defaultValue: "Preliminary estimate" })}
                </h2>
                <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-[#402F75]">
                  {t("success.estimateBadge", { defaultValue: "AI · not final" })}
                </span>
              </div>

              <p className="mt-2 text-[20px] font-extrabold text-gray-900">
                {fmtMoney(estimate.aiEstimateMinPrice, estimate.aiEstimateCurrency ?? "AED")} –{" "}
                {fmtMoney(estimate.aiEstimateMaxPrice, estimate.aiEstimateCurrency ?? "AED")}
              </p>
              {estimate.aiEstimateConvertedMinPrice != null &&
                estimate.aiEstimateConvertedMaxPrice != null &&
                estimate.aiEstimateConvertedCurrency && (
                  <p className="mt-0.5 text-[13px] font-semibold text-gray-500">
                    ≈ {fmtMoney(estimate.aiEstimateConvertedMinPrice, estimate.aiEstimateConvertedCurrency)} –{" "}
                    {fmtMoney(estimate.aiEstimateConvertedMaxPrice, estimate.aiEstimateConvertedCurrency)}
                  </p>
                )}

              {estimate.aiEstimateSummary && (
                <p className="mt-3 text-[13px] leading-relaxed text-gray-700">{estimate.aiEstimateSummary}</p>
              )}
              {estimate.aiEstimateTime && (
                <p className="mt-1 text-[12.5px] text-gray-500">
                  {t("success.estimateTime", { defaultValue: "Typical turnaround" })}: {estimate.aiEstimateTime}
                </p>
              )}

              <p className="mt-3 text-[11.5px] leading-relaxed text-gray-500">
                {t("success.estimateDisclaimer", {
                  defaultValue:
                    "Generated automatically from your photos and description as a rough guide. Our technicians will inspect your device and send you the final price before any repair starts.",
                })}
              </p>
            </div>
          )}

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

  const stepPill = (n: 1 | 2, label: string) => {
    const active = step === n;
    const done = step > n;
    return (
      <div className="flex items-center gap-2">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-bold ${
            active ? "bg-[#402F75] text-white" : done ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
          }`}
        >
          {done ? "✓" : n}
        </span>
        <span className={`text-[12.5px] font-semibold ${active ? "text-[#402F75]" : "text-gray-400"}`}>{label}</span>
      </div>
    );
  };

  return (
    <main className="w-[92%] max-w-[720px] mx-auto py-8 sm:py-10">
      <div className="rounded-[22px] border border-gray-100 bg-white px-6 py-6 sm:px-8 shadow-sm">
        {/* Heading */}
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#EDE9FF]">
            <svg viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2-2 2.6-2.6Z" />
            </svg>
          </span>
          <h1 className="text-[19px] font-extrabold text-gray-900">
            {t("form.title", { defaultValue: "Submit Repair Request" })}
          </h1>
        </div>

        {/* Stepper */}
        <div className="mb-6 flex items-center gap-3">
          {stepPill(1, t("form.stepDevice", { defaultValue: "Device details" }))}
          <span className="h-px flex-1 bg-gray-200" />
          {stepPill(2, t("form.stepDelivery", { defaultValue: "Delivery method" }))}
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
          {/* ── STEP 1 — Device details ─────────────────────────────────────── */}
          {step === 1 && (
            <>
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

              <button
                type="button"
                onClick={handleContinue}
                disabled={!profileComplete}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#402F75] py-[14px] text-[14px] font-bold text-white shadow-md transition-colors hover:bg-[#352566] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t("form.continue", { defaultValue: "Continue to delivery" })}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </>
          )}

          {/* ── STEP 2 — Delivery method (required) ──────────────────────────── */}
          {step === 2 && (
            <>
              <section>
                <h2 className="text-[15px] font-bold text-gray-900">
                  {t("detail.chooseDelivery", { defaultValue: "Choose Delivery Method" })}
                </h2>
                <p className="mt-1 text-[12.5px] text-gray-500">
                  {t("form.deliveryHint", {
                    defaultValue: "Choose how to get your device to us — this is required to submit your request.",
                  })}
                </p>

                <div className="mt-4 space-y-3">
                  {/* Store drop-off */}
                  <button
                    type="button"
                    onClick={() => { setDeliveryChoice("STORE_DROPOFF"); setSubmitError(null); }}
                    className={`flex w-full items-start gap-3 rounded-[14px] border px-4 py-3.5 text-start transition-colors ${
                      deliveryChoice === "STORE_DROPOFF" ? "border-[#402F75] bg-[#F8F6FF]" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${deliveryChoice === "STORE_DROPOFF" ? "border-[#402F75]" : "border-gray-300"}`}>
                      {deliveryChoice === "STORE_DROPOFF" && <span className="h-2 w-2 rounded-full bg-[#402F75]" />}
                    </span>
                    <span className="flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-[14px] font-bold text-gray-900">{t("detail.bringToStore", { defaultValue: "Bring to Store" })}</span>
                        <span className="text-[12px] font-bold text-green-600">{t("detail.free", { defaultValue: "Free" })}</span>
                      </span>
                      <span className="mt-0.5 block text-[12.5px] text-gray-500">{t("detail.bringToStoreBody", { defaultValue: "Bring your device to one of our store locations." })}</span>
                    </span>
                  </button>

                  {deliveryChoice === "STORE_DROPOFF" && (
                    <div className="ml-7">
                      {stores.length === 0 ? (
                        <p className="text-[12.5px] text-gray-400">{t("detail.noStores", { defaultValue: "No stores available in your region yet." })}</p>
                      ) : (
                        <select
                          value={selectedStoreId}
                          onChange={(e) => { setSelectedStoreId(e.target.value); setSubmitError(null); }}
                          className="w-full rounded-[12px] border border-gray-200 px-4 py-3 text-[13.5px] text-gray-800 outline-none focus:border-[#402F75]"
                        >
                          <option value="">{t("detail.selectStore", { defaultValue: "Select a store branch…" })}</option>
                          {stores.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.branchName} — {s.city}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}

                  {/* Courier pickup */}
                  <button
                    type="button"
                    onClick={() => { setDeliveryChoice("COURIER_PICKUP"); setSubmitError(null); }}
                    className={`flex w-full items-start gap-3 rounded-[14px] border px-4 py-3.5 text-start transition-colors ${
                      deliveryChoice === "COURIER_PICKUP" ? "border-[#402F75] bg-[#F8F6FF]" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${deliveryChoice === "COURIER_PICKUP" ? "border-[#402F75]" : "border-gray-300"}`}>
                      {deliveryChoice === "COURIER_PICKUP" && <span className="h-2 w-2 rounded-full bg-[#402F75]" />}
                    </span>
                    <span className="flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-[14px] font-bold text-gray-900">{t("detail.courierPickup", { defaultValue: "Request Courier Pickup" })}</span>
                        <span className="text-[12px] font-bold text-[#402F75]">{courierFeeLabel}</span>
                      </span>
                      <span className="mt-0.5 block text-[12.5px] text-gray-500">{t("detail.courierPickupBody", { defaultValue: "We'll send a courier to collect your device (fee applies)." })}</span>
                    </span>
                  </button>
                </div>
              </section>

              {submitError && <p className="text-[13px] text-red-500">{submitError}</p>}

              <div className="flex flex-col gap-3 sm:flex-row-reverse">
                <button
                  type="submit"
                  disabled={submitting || !profileComplete || !deliveryChoice}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#FBBB14] py-[14px] text-[14px] font-bold text-[#2f2158] shadow-md transition-colors hover:bg-[#eab00d] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? t("form.submitting", { defaultValue: "Submitting…" })
                    : deliveryChoice === "COURIER_PICKUP"
                      ? `${t("form.submitAndPay", { defaultValue: "Submit & pay courier fee" })} (${courierFeeLabel})`
                      : t("form.submit", { defaultValue: "Submit Repair Request" })}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep(1); setSubmitError(null); }}
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 rounded-full border border-gray-200 py-[14px] px-6 text-[14px] font-bold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-60"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 6l-6 6 6 6" />
                  </svg>
                  {t("form.back", { defaultValue: "Back" })}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </main>
  );
}
