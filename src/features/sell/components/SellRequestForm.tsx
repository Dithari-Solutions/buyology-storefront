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
import {
  chooseSellDelivery,
  getSellRequest,
  listSellStores,
  submitSellRequest,
} from "@/features/sell/services/sell.api";
import type { DeviceCondition, SellRequest, SellStoreOption } from "@/features/sell/types";
import { DEVICE_CONDITIONS, SELL_COURIER_FEE_AED, SELL_MAX_IMAGES } from "@/features/sell/types";
import { CONDITION_HINT, CONDITION_LABEL } from "@/features/sell/lib/status";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

/** Shared with the payment-callback page: stashes our tx UUID across the Paymob redirect. */
const PENDING_TX_KEY = "buyology_pending_tx_id";

type DeliveryChoice = "STORE_DROPOFF" | "COURIER_PICKUP";

function fmtMoney(amount: number, currency: string) {
  // Pinned locale: an undefined locale resolves to the server's during SSR and the browser's on
  // the client, so the two renders disagree on separators and React fails hydration (#418).
  return `${currency.toUpperCase()} ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function SellRequestForm() {
  const params = useParams();
  const lang = (params?.lang as Lang) ?? "en";
  const sellSlug = PATH_SLUGS.sell[lang] ?? "sell";
  const authSlug = PATH_SLUGS.auth[lang] ?? "auth";
  const profileSlug = PATH_SLUGS.profile[lang] ?? "profile";
  const { t } = useTranslation("sell");
  const router = useRouter();

  const userId = useSelector((s: RootState) => s.auth.userId);
  const authRestored = useSelector((s: RootState) => s.auth.isRestored);
  const preferredCurrency = useSelector(selectPreferredCurrency);
  const countryCode = useSelector(selectSelectedCountryCode);
  const ccy = (preferredCurrency ?? "AED").toUpperCase();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Wizard: 1 = device details, 2 = delivery method (required before submitting).
  const [step, setStep] = useState<1 | 2>(1);

  const [productName, setProductName] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [condition, setCondition] = useState<DeviceCondition>("GOOD");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Step 2 — delivery choice.
  const [deliveryChoice, setDeliveryChoice] = useState<DeliveryChoice | null>(null);
  const [stores, setStores] = useState<SellStoreOption[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [convertedFee, setConvertedFee] = useState<number | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  // The AI valuation is produced server-side after the request is committed, so it isn't in the
  // submit response — the success screen polls for it and shows it as soon as it lands.
  const [estimate, setEstimate] = useState<SellRequest | null>(null);
  const [estimateStatus, setEstimateStatus] = useState<"idle" | "pending" | "ready" | "unavailable">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  // Once the request is created we cache its id so a retry of the delivery step
  // (e.g. after a payment hiccup) reuses the same request instead of duplicating it.
  const createdSellIdRef = useRef<string | null>(null);

  // Login gate — wait for the silent refresh to settle, then redirect guests.
  useEffect(() => {
    if (!authRestored) return;
    if (!userId) router.replace(`/${lang}/${authSlug}`);
  }, [authRestored, userId, lang, authSlug, router]);

  // Load profile (email/phone drive the hard eligibility gate below).
  useEffect(() => {
    if (!userId) return;
    getProfile(userId)
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setProfileLoaded(true));
  }, [userId]);

  // Revoke preview object URLs on unmount.
  useEffect(() => {
    return () => previews.forEach((u) => URL.revokeObjectURL(u));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch store branches (for the drop-off picker on step 2).
  useEffect(() => {
    if (!countryCode) return;
    listSellStores(countryCode).then(setStores).catch(() => setStores([]));
  }, [countryCode]);

  // Convert the 20 AED courier fee to the customer's currency for display.
  useEffect(() => {
    if (ccy === "AED") { setConvertedFee(null); return; }
    let alive = true;
    convertAmount(SELL_COURIER_FEE_AED, "AED", ccy).then((v) => { if (alive) setConvertedFee(v); });
    return () => { alive = false; };
  }, [ccy]);

  // Poll for the preliminary AI valuation once the request is in. It's generated off the request
  // thread (a few seconds), so the success screen fills it in as soon as it's ready. Gives up
  // quietly after ~90s — the valuation is advisory, and our offer follows by email either way.
  useEffect(() => {
    if (!success) return;
    const sellId = createdSellIdRef.current;
    if (!sellId) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    setEstimateStatus("pending");

    const poll = async () => {
      if (cancelled) return;
      attempts += 1;
      try {
        const fresh = await getSellRequest(sellId, ccy);
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
      ? fmtMoney(SELL_COURIER_FEE_AED, "AED")
      : `${fmtMoney(SELL_COURIER_FEE_AED, "AED")} (≈ ${fmtMoney(convertedFee, ccy)})`;

  function addFiles(incoming: File[]) {
    const images = incoming.filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) return;
    const combined = [...files, ...images].slice(0, SELL_MAX_IMAGES);
    previews.forEach((u) => URL.revokeObjectURL(u));
    setFiles(combined);
    setPreviews(combined.map((f) => URL.createObjectURL(f)));
    setFieldErrors((p) => ({ ...p, images: "" }));
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
    // At least one photo is mandatory — we value the device from what the photos show.
    // The backend enforces this too (400), this is just the friendlier first line of defence.
    if (files.length === 0) {
      errors.images = t("form.imagesRequired", {
        defaultValue: "Add at least one photo of your device.",
      });
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleContinue() {
    if (!validateStep1()) return;
    setSubmitError(null);
    setStep(2);
  }

  // Where Paymob returns the browser after the courier-fee checkout.
  const callbackUrl = (sellId: string) =>
    typeof window !== "undefined"
      ? `${window.location.origin}/${lang}/payment/callback?kind=sell-courier-fee&sellRequestId=${sellId}`
      : undefined;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step !== 2 || submitting) return;

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
      let sellId = createdSellIdRef.current;
      if (!sellId) {
        const created = await submitSellRequest({
          productName: productName.trim(),
          brand: brand.trim(),
          model: model.trim(),
          purchaseDate: purchaseDate || undefined,
          deviceCondition: condition,
          description: description.trim(),
          images: files,
        });
        sellId = created.id;
        createdSellIdRef.current = sellId;
      }

      const result = await chooseSellDelivery(sellId, {
        method: deliveryChoice,
        storeLocationId: deliveryChoice === "STORE_DROPOFF" ? selectedStoreId : undefined,
        currency: ccy,
        redirectionUrl: deliveryChoice === "COURIER_PICKUP" ? callbackUrl(sellId) : undefined,
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

  // ── Profile gate ──────────────────────────────────────────────────────────
  // Unlike the repair form (which shows the form with a warning banner), a sell request is not
  // rendered at all until the seller's contact details are on file: this flow ends with a person
  // handing over money at a store, so we don't collect a device we can't call anyone about. The
  // backend refuses the same request for the same reason.
  if (!profileLoaded) {
    return (
      <main className="w-full px-4 py-10 sm:px-6 lg:px-8">
        <div className="buyo-shimmer mx-auto h-64 max-w-[680px] rounded-[22px]" />
      </main>
    );
  }

  if (!profileComplete) {
    return (
      <main className="w-full px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="buyo-rise mx-auto flex max-w-[560px] flex-col items-center rounded-[22px] border border-gray-100 bg-white px-6 py-12 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
            <svg viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
              <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
            </svg>
          </div>
          <h1 className="mt-5 text-[20px] font-extrabold text-gray-900">
            {t("gate.title", { defaultValue: "Complete your profile first" })}
          </h1>
          <p className="mt-2 max-w-[420px] text-[13.5px] leading-relaxed text-gray-500">
            {t("gate.body", {
              defaultValue:
                "Selling a device ends with us paying you in person, so we need your email address and phone number on file before you can submit a request.",
            })}
          </p>

          <ul className="mt-5 w-full max-w-[360px] space-y-2 text-start">
            <li className="flex items-center justify-between rounded-[12px] border border-gray-100 bg-gray-50 px-4 py-2.5">
              <span className="text-[13px] font-medium text-gray-600">
                {t("form.email", { defaultValue: "Email Address" })}
              </span>
              <span className={`text-[12.5px] font-bold ${email ? "text-green-600" : "text-amber-600"}`}>
                {email
                  ? t("gate.onFile", { defaultValue: "On file" })
                  : t("gate.missing", { defaultValue: "Missing" })}
              </span>
            </li>
            <li className="flex items-center justify-between rounded-[12px] border border-gray-100 bg-gray-50 px-4 py-2.5">
              <span className="text-[13px] font-medium text-gray-600">
                {t("form.phone", { defaultValue: "Phone Number" })}
              </span>
              <span className={`text-[12.5px] font-bold ${phone ? "text-green-600" : "text-amber-600"}`}>
                {phone
                  ? t("gate.onFile", { defaultValue: "On file" })
                  : t("gate.missing", { defaultValue: "Missing" })}
              </span>
            </li>
          </ul>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/${lang}/${profileSlug}?returnTo=sell`}
              className="rounded-full bg-[#402F75] px-6 py-3 text-[13.5px] font-bold text-white transition-colors hover:bg-[#352566]"
            >
              {t("gate.completeProfile", { defaultValue: "Complete profile" })}
            </Link>
            <Link
              href={`/${lang}/${sellSlug}`}
              className="rounded-full border border-gray-200 px-6 py-3 text-[13.5px] font-bold text-gray-600 transition-colors hover:bg-gray-50"
            >
              {t("gate.back", { defaultValue: "Back" })}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────
  if (success) {
    return (
      <main className="w-full px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="buyo-rise mx-auto flex max-w-[680px] flex-col items-center rounded-[22px] border border-gray-100 bg-white px-6 py-12 text-center shadow-sm">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#EDE9FF]">
            <span className="absolute inset-0 animate-ping rounded-full bg-[#402F75]/10" />
            <svg viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative h-8 w-8">
              <path d="M9 12l2 2 4-4M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z" />
            </svg>
          </div>
          <h1 className="mt-5 text-[22px] font-extrabold text-gray-900">
            {t("success.title", { defaultValue: "Sell Request Submitted" })}
          </h1>
          <p className="mt-2 max-w-[400px] text-[13.5px] text-gray-500">
            {t("success.body", {
              defaultValue: "Our team will review your device shortly. You'll receive an email confirmation at",
            })}{" "}
            <span className="font-semibold text-gray-700">{email}</span>
          </p>

          {/* Preliminary AI valuation — a permanent slot on this screen: it animates while the
              valuation is being generated, then swaps to the price (or a plain note if it can't). */}
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
                    {t("success.estimatePending", { defaultValue: "AI is valuing your device…" })}
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
                <div className="buyo-shimmer h-7 w-1/2 rounded-md" />
                <div className="buyo-shimmer h-3 w-full rounded" style={{ animationDelay: "150ms" }} />
                <div className="buyo-shimmer h-3 w-4/5 rounded" style={{ animationDelay: "300ms" }} />
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
                    "We couldn't prepare a preliminary valuation for this one. Our team will inspect your device and send you a full offer — nothing is delayed.",
                })}
              </p>
            </div>
          )}

          {estimateStatus === "ready" && estimate?.aiEstimateMinPrice != null && estimate.aiEstimateMaxPrice != null && (
            <div className="mt-6 w-full rounded-[16px] border border-[#E4DCFB] bg-[#F8F6FF] px-5 py-4 text-start">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-[13.5px] font-bold text-[#402F75]">
                  {t("success.estimateTitle", { defaultValue: "Preliminary valuation" })}
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

              <p className="mt-3 text-[11.5px] leading-relaxed text-gray-500">
                {t("success.estimateDisclaimer", {
                  defaultValue:
                    "Generated automatically from your photos and description as a rough guide. Our team will inspect your device and send you the final offer before you commit to anything.",
                })}
              </p>
            </div>
          )}

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/${lang}/${sellSlug}/my`}
              className="rounded-full bg-[#402F75] px-6 py-3 text-[13.5px] font-bold text-white transition-colors hover:bg-[#352566]"
            >
              {t("success.viewRequests", { defaultValue: "View Sell Requests" })}
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
          className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold transition-colors duration-300 ${
            active
              ? "bg-[#402F75] text-white shadow-md shadow-[#402F75]/25"
              : done
                ? "bg-green-100 text-green-700"
                : "bg-white/70 text-gray-400 ring-1 ring-gray-200"
          }`}
        >
          {done ? "✓" : n}
        </span>
        <span className={`text-[12.5px] font-semibold transition-colors ${active ? "text-[#402F75]" : "text-gray-400"}`}>
          {label}
        </span>
      </div>
    );
  };

  /** One line of the live "your request" rail — value falls back to a muted placeholder. */
  const railRow = (label: string, value: string | null | undefined, placeholder: string) => (
    <div className="flex items-start justify-between gap-3 py-2">
      <span className="text-[12px] font-medium text-gray-400">{label}</span>
      <span className={`max-w-[60%] text-end text-[12.5px] font-semibold ${value ? "text-gray-800" : "text-gray-300"}`}>
        {value || placeholder}
      </span>
    </div>
  );

  return (
    <main className="w-full px-4 py-8 sm:px-6 sm:py-10 lg:px-8 xl:px-12">
      {/* ── Header band ─────────────────────────────────────────────────── */}
      <header className="buyo-rise mb-6 overflow-hidden rounded-[22px] bg-gradient-to-br from-[#402F75] via-[#4a3a86] to-[#2f2158] px-6 py-6 shadow-lg sm:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-white/15 backdrop-blur">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M20.6 13.4 12 22l-9-9V3h10l7.6 7.6a2 2 0 0 1 0 2.8ZM7.5 7.5h.01" />
            </svg>
          </span>
          <div className="min-w-0">
            <h1 className="text-[20px] font-extrabold text-white sm:text-[22px]">
              {t("form.title", { defaultValue: "Sell Your Device" })}
            </h1>
            <p className="mt-0.5 text-[12.5px] text-white/70">
              {t("form.subtitle", {
                defaultValue: "Tell us about your device, then choose how to get it to us.",
              })}
            </p>
          </div>
        </div>

        {/* Stepper with an animated progress rail */}
        <div className="mt-6 flex items-center gap-3 rounded-[16px] bg-white/10 px-4 py-3 backdrop-blur">
          {stepPill(1, t("form.stepDevice", { defaultValue: "Device details" }))}
          <span className="relative mx-1 h-1 flex-1 overflow-hidden rounded-full bg-white/20">
            <span
              className="absolute inset-y-0 start-0 rounded-full bg-[#FBBB14] transition-all duration-500 ease-out"
              style={{ width: step === 1 ? "0%" : "100%" }}
            />
          </span>
          {stepPill(2, t("form.stepDelivery", { defaultValue: "Delivery method" }))}
        </div>
      </header>

      {/* ── Body: form + live summary rail ──────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-8">
        <div className="buyo-rise buyo-d1 buyo-card rounded-[22px] border border-gray-100 bg-white px-6 py-6 shadow-sm sm:px-8">
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

          <form onSubmit={handleSubmit}>
            {/* Keyed on `step` so switching steps remounts this subtree and replays the
                fade — a plain conditional would swap the content with no transition. */}
            <div key={step} className="buyo-fade space-y-7">
              {/* ── STEP 1 — Device details ─────────────────────────────────── */}
              {step === 1 && (
                <>
                  {/* Product information */}
                  <section>
                    <h2 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-[#402F75]">
                      {t("form.productInfo", { defaultValue: "Device Information" })}
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

                  {/* Condition — drives the valuation, so it gets its own prominent section */}
                  <section>
                    <h2 className="mb-1 text-[13px] font-bold uppercase tracking-wide text-[#402F75]">
                      {t("form.conditionTitle", { defaultValue: "Condition" })}
                    </h2>
                    <p className="mb-3 text-[12px] text-gray-500">
                      {t("form.conditionHint", {
                        defaultValue:
                          "Be honest — we re-check the device when it arrives, and an accurate grade means an accurate offer.",
                      })}
                    </p>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {DEVICE_CONDITIONS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCondition(c)}
                          className={`flex items-start gap-3 rounded-[14px] border px-4 py-3 text-start transition-colors ${
                            condition === c ? "border-[#402F75] bg-[#F8F6FF]" : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${condition === c ? "border-[#402F75]" : "border-gray-300"}`}>
                            {condition === c && <span className="h-2 w-2 rounded-full bg-[#402F75]" />}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-[13.5px] font-bold text-gray-900">
                              {t(`condition.${c}`, { defaultValue: CONDITION_LABEL[c] })}
                            </span>
                            <span className="mt-0.5 block text-[12px] leading-relaxed text-gray-500">
                              {t(`conditionHint.${c}`, { defaultValue: CONDITION_HINT[c] })}
                            </span>
                          </span>
                        </button>
                      ))}
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
                          {email}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-semibold text-gray-700">
                          {t("form.phone", { defaultValue: "Phone Number" })}
                        </label>
                        <div className="rounded-[12px] border border-gray-200 bg-gray-50 px-4 py-3 text-[14px] text-gray-700">
                          {phone}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Device details */}
                  <section>
                    <h2 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-[#402F75]">
                      {t("form.deviceDetails", { defaultValue: "Device Details" })}
                    </h2>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-semibold text-gray-700">
                        {t("form.description", { defaultValue: "Description" })}
                      </label>
                      <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => { setDescription(e.target.value); setFieldErrors((p) => ({ ...p, description: "" })); }}
                        placeholder={t("form.descriptionPlaceholder", {
                          defaultValue:
                            "Storage size, any faults or scratches, what's included (charger, box)…",
                        })}
                        className={`resize-none ${inputCls(fieldErrors.description)}`}
                      />
                      {fieldErrors.description && <p className="text-[11px] text-red-500">{fieldErrors.description}</p>}
                    </div>
                  </section>

                  {/* Upload images */}
                  <section>
                    <h2 className="mb-1 text-[13px] font-bold uppercase tracking-wide text-[#402F75]">
                      {t("form.uploadImages", { defaultValue: "Upload Photos" })}
                      <span className="ms-1 text-red-500">*</span>
                    </h2>
                    <p className="mb-3 text-[12px] text-gray-500">
                      {t("form.uploadHintRequired", {
                        defaultValue:
                          "Add at least 1 photo of your device (up to 4) — we value it from what they show.",
                      })}
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

                    {previews.length < SELL_MAX_IMAGES && (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => { e.preventDefault(); addFiles(Array.from(e.dataTransfer.files ?? [])); }}
                        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[14px] border-2 border-dashed px-4 py-8 text-center transition-colors hover:border-[#402F75] ${
                          fieldErrors.images ? "border-red-400 bg-red-50/40" : "border-gray-300"
                        }`}
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
                    {fieldErrors.images && (
                      <p className="mt-2 text-[11px] text-red-500">{fieldErrors.images}</p>
                    )}
                  </section>

                  <button
                    type="button"
                    onClick={handleContinue}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#402F75] py-[14px] text-[14px] font-bold text-white shadow-md transition-colors hover:bg-[#352566]"
                  >
                    {t("form.continue", { defaultValue: "Continue to delivery" })}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </button>
                </>
              )}

              {/* ── STEP 2 — Delivery method (required) ──────────────────────── */}
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
                      disabled={submitting || !deliveryChoice}
                      className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#FBBB14] py-[14px] text-[14px] font-bold text-[#2f2158] shadow-md transition-colors hover:bg-[#eab00d] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting
                        ? t("form.submitting", { defaultValue: "Submitting…" })
                        : deliveryChoice === "COURIER_PICKUP"
                          ? `${t("form.submitAndPay", { defaultValue: "Submit & pay courier fee" })} (${courierFeeLabel})`
                          : t("form.submit", { defaultValue: "Submit Sell Request" })}
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
            </div>
          </form>
        </div>

        {/* ── Live summary rail ───────────────────────────────────────────── */}
        <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <div className="buyo-rise buyo-d2 buyo-card rounded-[22px] border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-[13px] font-bold uppercase tracking-wide text-[#402F75]">
              {t("form.summaryTitle", { defaultValue: "Your request" })}
            </h2>

            <div className="mt-3 divide-y divide-gray-100">
              {railRow(
                t("form.productName", { defaultValue: "Product Name" }),
                productName.trim(),
                t("form.summaryEmpty", { defaultValue: "Not set" }),
              )}
              {railRow(
                t("form.brand", { defaultValue: "Brand" }),
                brand.trim(),
                t("form.summaryEmpty", { defaultValue: "Not set" }),
              )}
              {railRow(
                t("form.model", { defaultValue: "Model" }),
                model.trim(),
                t("form.summaryEmpty", { defaultValue: "Not set" }),
              )}
              {railRow(
                t("form.conditionTitle", { defaultValue: "Condition" }),
                t(`condition.${condition}`, { defaultValue: CONDITION_LABEL[condition] }),
                t("form.summaryEmpty", { defaultValue: "Not set" }),
              )}
              {railRow(
                t("form.uploadImages", { defaultValue: "Upload Photos" }),
                files.length > 0 ? `${files.length} / ${SELL_MAX_IMAGES}` : "",
                t("form.summaryNoPhotos", { defaultValue: "None yet" }),
              )}
              {railRow(
                t("detail.chooseDelivery", { defaultValue: "Choose Delivery Method" }),
                deliveryChoice === "STORE_DROPOFF"
                  ? t("detail.bringToStore", { defaultValue: "Bring to Store" })
                  : deliveryChoice === "COURIER_PICKUP"
                    ? t("detail.courierPickup", { defaultValue: "Request Courier Pickup" })
                    : "",
                t("form.summaryEmpty", { defaultValue: "Not set" }),
              )}
            </div>

            {deliveryChoice === "COURIER_PICKUP" && (
              <div className="mt-3 flex items-center justify-between rounded-[12px] bg-[#F8F6FF] px-3 py-2.5">
                <span className="text-[12px] font-semibold text-[#402F75]">
                  {t("detail.payCourierFee", { defaultValue: "Pay courier fee" })}
                </span>
                <span className="text-[12.5px] font-bold text-[#402F75]">{courierFeeLabel}</span>
              </div>
            )}
          </div>

          {/* What happens next */}
          <div className="buyo-rise buyo-d3 rounded-[22px] border border-gray-100 bg-gradient-to-br from-[#F8F6FF] to-white p-6 shadow-sm">
            <h2 className="text-[13px] font-bold uppercase tracking-wide text-[#402F75]">
              {t("form.nextTitle", { defaultValue: "What happens next" })}
            </h2>
            <ol className="mt-4 space-y-0">
              {[
                t("form.next1", { defaultValue: "You get an instant preliminary valuation." }),
                t("form.next2", { defaultValue: "Our team inspects your device." }),
                t("form.next3", { defaultValue: "We send you a firm offer to accept or decline." }),
                t("form.next4", { defaultValue: "Accept it and collect your money at our store." }),
              ].map((line, i, arr) => (
                <li key={i} className="relative flex gap-3 pb-5 last:pb-0">
                  {i < arr.length - 1 && (
                    <span aria-hidden className="absolute left-[11px] top-6 h-full w-0.5 bg-[#E4DCFB]" />
                  )}
                  <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EDE9FF] text-[11px] font-bold text-[#402F75]">
                    {i + 1}
                  </span>
                  <p className="pt-0.5 text-[12.5px] leading-relaxed text-gray-600">{line}</p>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </main>
  );
}
