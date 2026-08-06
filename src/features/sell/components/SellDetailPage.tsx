"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import type { RootState } from "@/store";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";
import { selectPreferredCurrency, selectSelectedCountryCode } from "@/features/country/store/countrySlice";
import { convertAmount } from "@/features/currency/services/currency.api";
import {
  chooseSellDelivery,
  chooseSellReturn,
  getSellRequest,
  listSellStores,
  respondToOffer,
} from "@/features/sell/services/sell.api";
import type { SellDeliveryResult } from "@/features/sell/services/sell.api";
import type { SellPayoutMethod, SellRequest, SellStoreOption } from "@/features/sell/types";
import { SELL_COURIER_FEE_AED } from "@/features/sell/types";
import {
  CONDITION_LABEL,
  SELL_STATUS_LABEL,
  SELL_STATUS_TONE,
  SELL_TIMELINE_STEPS,
  timelineReachedCount,
} from "@/features/sell/lib/status";

/** Shared with the payment-callback page: stashes our tx UUID across the Paymob redirect. */
const PENDING_TX_KEY = "buyology_pending_tx_id";

const TIMELINE_LABELS: Record<(typeof SELL_TIMELINE_STEPS)[number], string> = {
  SUBMITTED: "Request Submitted",
  UNDER_REVIEW: "Under Inspection",
  OFFER_MADE: "Offer Sent",
  ACCEPTED: "Offer Accepted",
  COMPLETED: "Paid",
};

function fmtMoney(amount: number, currency: string) {
  // Pinned locale: an undefined locale resolves to the server's during SSR and the browser's on
  // the client, so the two renders disagree on separators and React fails hydration (#418).
  return `${currency.toUpperCase()} ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function SellDetailPage() {
  const params = useParams();
  const lang = (params?.lang as Lang) ?? "en";
  const sellId = params?.sellId as string;
  const sellSlug = PATH_SLUGS.sell[lang] ?? "sell";
  const authSlug = PATH_SLUGS.auth[lang] ?? "auth";
  const { t } = useTranslation("sell");
  const router = useRouter();

  const userId = useSelector((s: RootState) => s.auth.userId);
  const authRestored = useSelector((s: RootState) => s.auth.isRestored);
  const preferredCurrency = useSelector(selectPreferredCurrency);
  const countryCode = useSelector(selectSelectedCountryCode);
  const ccy = (preferredCurrency ?? "AED").toUpperCase();

  const [request, setRequest] = useState<SellRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inbound delivery choice UI. The picker only appears when the customer asks to change (or when
  // nothing has been chosen yet) — otherwise the page shows their current choice back to them.
  const [deliveryChoice, setDeliveryChoice] = useState<"STORE_DROPOFF" | "COURIER_PICKUP" | null>(null);
  const [editingDelivery, setEditingDelivery] = useState(false);
  const [stores, setStores] = useState<SellStoreOption[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");

  // Payout choice shown alongside the offer. Wallet credit is deliberately not selectable yet —
  // there's no wallet ledger to credit, and the backend rejects it.
  const [payoutChoice, setPayoutChoice] = useState<SellPayoutMethod>("STORE_CASH");

  // Return choice UI (after a decline)
  const [returnChoice, setReturnChoice] = useState<"STORE_PICKUP" | "COURIER_RETURN" | null>(null);

  // Converted 20 AED courier fee (null while AED or loading)
  const [convertedFee, setConvertedFee] = useState<number | null>(null);

  useEffect(() => {
    if (!authRestored) return;
    if (!userId) router.replace(`/${lang}/${authSlug}`);
  }, [authRestored, userId, lang, authSlug, router]);

  const load = useCallback(() => {
    if (!userId || !sellId) return;
    setLoading(true);
    // Pass the display currency so the backend converts the AED AI valuation for us.
    getSellRequest(sellId, ccy)
      .then((r) => setRequest(r))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [userId, sellId, ccy]);

  useEffect(() => { load(); }, [load]);

  // Fetch store branches once (for the drop-off picker).
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

  if (!authRestored || !userId) return null;

  if (loading) {
    return (
      <main className="w-full px-4 py-10 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="buyo-shimmer h-64 rounded-[20px]" />
          <div className="buyo-shimmer h-64 rounded-[20px]" style={{ animationDelay: "150ms" }} />
        </div>
      </main>
    );
  }

  if (notFound || !request) {
    return (
      <main className="buyo-fade w-full px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-[15px] text-gray-600">{t("detail.notFound", { defaultValue: "Sell request not found." })}</p>
        <Link href={`/${lang}/${sellSlug}/my`} className="mt-4 inline-block text-[13px] font-bold text-[#402F75] hover:underline">
          {t("detail.backToList", { defaultValue: "Back to my sell requests" })}
        </Link>
      </main>
    );
  }

  const reached = timelineReachedCount(request.status);
  const courierFeeLabel =
    ccy === "AED" || convertedFee == null
      ? fmtMoney(SELL_COURIER_FEE_AED, "AED")
      : `${fmtMoney(SELL_COURIER_FEE_AED, "AED")} (≈ ${fmtMoney(convertedFee, ccy)})`;

  const run = async (fn: () => Promise<SellRequest>, failMsg: string) => {
    setError(null);
    setBusy(true);
    try {
      const updated = await fn();
      setRequest(updated);
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : failMsg);
    } finally {
      setBusy(false);
    }
  };

  // Where Paymob returns the browser after the courier-fee checkout.
  const callbackUrl = () =>
    typeof window !== "undefined"
      ? `${window.location.origin}/${lang}/payment/callback?kind=sell-courier-fee&sellRequestId=${request.id}`
      : undefined;

  // Runs a delivery/return choice. Free options advance immediately; courier options return a
  // Paymob checkout session we redirect the browser to (the webhook advances the request on success).
  // Returns true when the choice was saved (or the browser is being handed to Paymob), so callers
  // can close the editor — and leave it open, with the error showing, when it wasn't.
  const runDelivery = async (fn: () => Promise<SellDeliveryResult>, failMsg: string): Promise<boolean> => {
    setError(null);
    setBusy(true);
    try {
      const result = await fn();
      if (result.payment?.checkoutUrl) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem(PENDING_TX_KEY, result.payment.transactionId);
          window.location.href = result.payment.checkoutUrl;
        }
        return true;
      }
      setRequest(result.sellRequest);
      return true;
    } catch (e) {
      // Surface the backend message (e.g. a payment-readiness prompt) when present.
      setError(e instanceof Error && e.message ? e.message : failMsg);
      return false;
    } finally {
      setBusy(false);
    }
  };

  // Open the picker pre-filled with what they already chose, so "change" starts from the current
  // state rather than a blank form.
  const openDeliveryEditor = () => {
    setError(null);
    if (request.inboundDeliveryMethod === "COURIER_PICKUP" || request.inboundDeliveryMethod === "STORE_DROPOFF") {
      setDeliveryChoice(request.inboundDeliveryMethod);
    }
    if (request.storeLocationId) setSelectedStoreId(request.storeLocationId);
    setEditingDelivery(true);
  };

  const handleChooseDelivery = () => {
    if (!deliveryChoice) return;
    if (deliveryChoice === "STORE_DROPOFF" && !selectedStoreId) {
      setError(t("detail.pickStore", { defaultValue: "Please choose a store branch." }));
      return;
    }
    runDelivery(
      () =>
        chooseSellDelivery(request.id, {
          method: deliveryChoice,
          storeLocationId: deliveryChoice === "STORE_DROPOFF" ? selectedStoreId : undefined,
          currency: ccy,
          redirectionUrl: deliveryChoice === "COURIER_PICKUP" ? callbackUrl() : undefined,
        }),
      t("detail.saveFailed", { defaultValue: "Couldn't save your choice. Please try again." }),
    ).then((saved) => { if (saved) setEditingDelivery(false); });
  };

  const handleChooseReturn = () => {
    if (!returnChoice) return;
    runDelivery(
      () =>
        chooseSellReturn(request.id, {
          method: returnChoice,
          currency: ccy,
          redirectionUrl: returnChoice === "COURIER_RETURN" ? callbackUrl() : undefined,
        }),
      t("detail.saveFailed", { defaultValue: "Couldn't save your choice. Please try again." }),
    );
  };

  // Resume/retry a pending courier-fee payment (redirects to Paymob).
  const payInboundCourier = () =>
    runDelivery(
      () => chooseSellDelivery(request.id, { method: "COURIER_PICKUP", currency: ccy, redirectionUrl: callbackUrl() }),
      t("detail.saveFailed", { defaultValue: "Couldn't save your choice. Please try again." }),
    );
  const payReturnCourier = () =>
    runDelivery(
      () => chooseSellReturn(request.id, { method: "COURIER_RETURN", currency: ccy, redirectionUrl: callbackUrl() }),
      t("detail.saveFailed", { defaultValue: "Couldn't save your choice. Please try again." }),
    );

  const inboundCourierPending =
    request.status === "SUBMITTED" && request.inboundDeliveryMethod === "COURIER_PICKUP" && !request.courierFeePaid;
  const returnCourierPending =
    request.status === "DECLINED" && request.returnDeliveryMethod === "COURIER_RETURN" && !request.courierFeePaid;

  const statusLabel = t(`status.${request.status}`, { defaultValue: SELL_STATUS_LABEL[request.status] });

  return (
    <main className="w-full px-4 py-8 sm:px-6 sm:py-10 lg:px-8 xl:px-12">
      <Link href={`/${lang}/${sellSlug}/my`} className="buyo-fade mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#402F75] transition-transform hover:-translate-x-0.5 hover:underline">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        {t("detail.backToList", { defaultValue: "Back to my sell requests" })}
      </Link>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-7">
        {/* Left column */}
        <div className="space-y-5">
          {/* Summary card */}
          <div className="buyo-rise buyo-card rounded-[18px] border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h1 className="text-[22px] font-extrabold text-gray-900">{request.productName}</h1>
              <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${SELL_STATUS_TONE[request.status]}`}>
                {statusLabel}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-2">
              {[
                ["detail.requestId", "Request ID", request.reference ?? request.id.slice(0, 8)],
                ["detail.dateSubmitted", "Date Submitted", request.submittedAt ? new Date(request.submittedAt).toLocaleDateString() : "—"],
                ["detail.brand", "Brand", request.brand],
                ["detail.model", "Model", request.model],
                [
                  "detail.condition",
                  "Condition",
                  t(`condition.${request.deviceCondition}`, { defaultValue: CONDITION_LABEL[request.deviceCondition] }),
                ],
                ...(request.purchaseDate
                  ? [["detail.purchaseDate", "Purchase Date", new Date(request.purchaseDate).toLocaleDateString()] as const]
                  : []),
              ].map(([key, def, val]) => (
                <div key={key as string}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    {t(key as string, { defaultValue: def as string })}
                  </p>
                  <p className="mt-0.5 text-[14px] font-semibold text-[#402F75]">{val as string}</p>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                {t("detail.details", { defaultValue: "Device Details" })}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-[13.5px] leading-relaxed text-gray-700">{request.description}</p>
            </div>

            {request.imageUrls && request.imageUrls.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  {t("detail.images", { defaultValue: "Photos" })}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {request.imageUrls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer" className="relative h-20 w-24 overflow-hidden rounded-[12px] border border-gray-200">
                      <Image src={url} alt={`Device ${i + 1}`} fill className="object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Preliminary AI valuation — advisory, shown until our team sends the real offer. */}
          {request.aiEstimateMinPrice != null &&
            request.aiEstimateMaxPrice != null &&
            request.status !== "OFFER_MADE" &&
            request.status !== "ACCEPTED" &&
            request.status !== "COMPLETED" &&
            request.status !== "DECLINED" && (
              <div className="buyo-rise buyo-d1 buyo-card rounded-[18px] border border-[#E4DCFB] bg-[#F8F6FF] p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-[14px] font-bold text-[#402F75]">
                    {t("detail.aiEstimateTitle", { defaultValue: "Preliminary valuation" })}
                  </h2>
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-[#402F75]">
                    {t("detail.aiEstimateBadge", { defaultValue: "AI · not final" })}
                  </span>
                </div>

                <p className="mt-2 text-[20px] font-extrabold text-gray-900">
                  {fmtMoney(request.aiEstimateMinPrice, request.aiEstimateCurrency ?? "AED")} –{" "}
                  {fmtMoney(request.aiEstimateMaxPrice, request.aiEstimateCurrency ?? "AED")}
                </p>
                {request.aiEstimateConvertedMinPrice != null &&
                  request.aiEstimateConvertedMaxPrice != null &&
                  request.aiEstimateConvertedCurrency && (
                    <p className="mt-0.5 text-[13px] font-semibold text-gray-500">
                      ≈ {fmtMoney(request.aiEstimateConvertedMinPrice, request.aiEstimateConvertedCurrency)} –{" "}
                      {fmtMoney(request.aiEstimateConvertedMaxPrice, request.aiEstimateConvertedCurrency)}
                    </p>
                  )}

                {request.aiEstimateSummary && (
                  <p className="mt-3 text-[13px] leading-relaxed text-gray-700">{request.aiEstimateSummary}</p>
                )}

                <p className="mt-3 text-[11.5px] leading-relaxed text-gray-500">
                  {t("detail.aiEstimateDisclaimer", {
                    defaultValue:
                      "Generated automatically from your photos and description as a rough guide. Our team will inspect your device and send you the final offer before you commit to anything.",
                  })}
                </p>
              </div>
            )}

          {/* Contextual info + actions */}
          {error && (
            <div className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</div>
          )}

          {/* ── Delivery: what they chose, and a way to change it ──────────────
                 Previously this rendered the raw picker whenever the request was still
                 SUBMITTED — which is exactly the state you're in after choosing courier
                 pickup but before paying, so the page asked the same question again as if
                 nothing had been chosen. Now the choice is always shown back as a summary,
                 and changing it is a deliberate action that stays open until the device is
                 actually with our team. */}
          {(request.status === "SUBMITTED" || request.status === "AWAITING_DEVICE") && (
            <>
              {inboundCourierPending && (
                <div className="rounded-[14px] border border-amber-200 bg-amber-50 px-4 py-4">
                  <p className="text-[13px] font-bold text-amber-900">
                    {t("detail.courierPaymentPending", { defaultValue: "Complete your courier payment" })}
                  </p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-amber-800">
                    {t("detail.courierPaymentPendingBody", {
                      defaultValue:
                        "Pay the courier pickup fee to schedule the collection of your device — or choose to bring it to a store below instead.",
                    })}
                  </p>
                  <button
                    type="button"
                    onClick={payInboundCourier}
                    disabled={busy}
                    className="mt-3 w-full rounded-full bg-amber-500 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
                  >
                    {busy
                      ? t("detail.redirecting", { defaultValue: "Redirecting…" })
                      : `${t("detail.payCourierFee", { defaultValue: "Pay courier fee" })} (${courierFeeLabel})`}
                  </button>
                </div>
              )}

              <div className="buyo-rise buyo-d2 buyo-card rounded-[18px] border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-[15px] font-bold text-gray-900">
                      {t("detail.deliveryTitle", { defaultValue: "Getting your device to us" })}
                    </h2>
                    <p className="mt-0.5 text-[12.5px] text-gray-500">
                      {t("detail.deliveryChangeHint", {
                        defaultValue: "You can change this until your device reaches our team.",
                      })}
                    </p>
                  </div>
                  {!editingDelivery && request.inboundDeliveryMethod && (
                    <button
                      type="button"
                      onClick={openDeliveryEditor}
                      className="shrink-0 rounded-full border border-[#402F75] px-4 py-2 text-[12.5px] font-bold text-[#402F75] transition-colors hover:bg-[#F8F6FF]"
                    >
                      {t("detail.changeDelivery", { defaultValue: "Change" })}
                    </button>
                  )}
                </div>

                {!editingDelivery && request.inboundDeliveryMethod ? (
                  <>
                    <div className="mt-4 flex items-start gap-3 rounded-[14px] border border-[#E4DCFB] bg-[#F8F6FF] px-4 py-3.5">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white">
                        {request.inboundDeliveryMethod === "COURIER_PICKUP" ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                            <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7M6.5 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM17.5 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                            <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5Z" />
                            <path d="M9 21v-6h6v6" />
                          </svg>
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-[14px] font-bold text-gray-900">
                            {request.inboundDeliveryMethod === "COURIER_PICKUP"
                              ? t("detail.courierPickup", { defaultValue: "Request Courier Pickup" })
                              : t("detail.bringToStore", { defaultValue: "Bring to Store" })}
                          </p>
                          {request.inboundDeliveryMethod === "COURIER_PICKUP" ? (
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-bold ${
                                request.courierFeePaid
                                  ? "bg-green-100 text-green-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {request.courierFeePaid
                                ? t("detail.feePaid", { defaultValue: "Fee paid" })
                                : t("detail.feeUnpaid", { defaultValue: "Fee unpaid" })}
                            </span>
                          ) : (
                            <span className="text-[12px] font-bold text-green-600">
                              {t("detail.free", { defaultValue: "Free" })}
                            </span>
                          )}
                        </div>
                        {request.inboundDeliveryMethod === "STORE_DROPOFF" && request.storeBranchName && (
                          <p className="mt-1 text-[12.5px] text-gray-600">
                            {request.storeBranchName}
                            {request.storeAddress ? ` — ${request.storeAddress}` : ""}
                          </p>
                        )}
                        {request.inboundDeliveryMethod === "COURIER_PICKUP" && (
                          <p className="mt-1 text-[12.5px] text-gray-600">{courierFeeLabel}</p>
                        )}
                      </div>
                    </div>

                    {request.inboundDeliveryChangedAt && request.previousInboundDeliveryMethod && (
                      <p className="mt-2.5 text-[12px] text-gray-400">
                        {t("detail.deliveryChangedNote", {
                          defaultValue: "Changed from {{previous}} — our team has been notified.",
                          previous:
                            request.previousInboundDeliveryMethod === "COURIER_PICKUP"
                              ? t("detail.courierPickup", { defaultValue: "Request Courier Pickup" })
                              : t("detail.bringToStore", { defaultValue: "Bring to Store" }),
                        })}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <div className="mt-4 space-y-3">
                      {/* Store drop-off */}
                      <button
                        type="button"
                        onClick={() => setDeliveryChoice("STORE_DROPOFF")}
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
                              onChange={(e) => setSelectedStoreId(e.target.value)}
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
                        onClick={() => setDeliveryChoice("COURIER_PICKUP")}
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

                    {/* Switching away from a pickup they already paid for costs them nothing extra,
                        but the fee has to be refunded by a human — so say so before they commit. */}
                    {request.courierFeePaid &&
                      request.inboundDeliveryMethod === "COURIER_PICKUP" &&
                      deliveryChoice === "STORE_DROPOFF" && (
                        <p className="mt-3 rounded-[12px] bg-amber-50 px-3.5 py-2.5 text-[12px] leading-relaxed text-amber-800">
                          {t("detail.switchRefundNote", {
                            defaultValue:
                              "You've already paid the courier fee. Switch to a store drop-off and our team will refund it — it isn't returned automatically.",
                          })}
                        </p>
                      )}

                    <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
                      <button
                        type="button"
                        onClick={handleChooseDelivery}
                        disabled={busy || !deliveryChoice}
                        className="flex-1 rounded-full bg-[#402F75] py-3 text-[13.5px] font-bold text-white transition-colors hover:bg-[#352566] disabled:opacity-50"
                      >
                        {busy ? t("detail.saving", { defaultValue: "Saving…" }) : t("detail.confirmDelivery", { defaultValue: "Confirm delivery method" })}
                      </button>
                      {request.inboundDeliveryMethod && (
                        <button
                          type="button"
                          onClick={() => { setEditingDelivery(false); setError(null); }}
                          disabled={busy}
                          className="rounded-full border border-gray-200 px-6 py-3 text-[13.5px] font-bold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
                        >
                          {t("detail.cancelChange", { defaultValue: "Cancel" })}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Where things stand right now. */}
              <div className="rounded-[14px] border border-indigo-100 bg-indigo-50/60 px-4 py-3.5 text-[13px] leading-relaxed text-indigo-800">
                {request.status === "AWAITING_DEVICE"
                  ? request.inboundDeliveryMethod === "COURIER_PICKUP"
                    ? t("detail.awaitingCourier", { defaultValue: "A courier will collect your device and deliver it to our store. We'll update this page once it arrives." })
                    : t("detail.awaitingDropoff", {
                        defaultValue: "Please drop your device at {{store}}. We'll start the inspection as soon as we receive it.",
                        store: request.storeBranchName ?? t("detail.theStore", { defaultValue: "the selected store" }),
                      })
                  : t("detail.reviewing", {
                      defaultValue:
                        "Our team is currently reviewing your request — we've emailed you a confirmation. Next, choose how to get your device to us.",
                    })}
              </div>
            </>
          )}

          {/* UNDER_REVIEW */}
          {request.status === "UNDER_REVIEW" && (
            <div className="rounded-[14px] border border-blue-100 bg-blue-50/60 px-4 py-3.5 text-[13px] leading-relaxed text-blue-800">
              {t("detail.underReview", { defaultValue: "We've received your device and our team is inspecting it. You'll get our offer shortly." })}
            </div>
          )}

          {/* OFFER_MADE — the offer + payout choice + accept/decline */}
          {request.status === "OFFER_MADE" && request.offerPrice != null && (
            <div className="buyo-rise buyo-card overflow-hidden rounded-[18px] bg-gradient-to-br from-[#4a3a86] to-[#2f2158] p-6 text-white shadow-sm">
              <h2 className="text-[16px] font-bold">{t("detail.offerTitle", { defaultValue: "Our Offer" })}</h2>
              <div className="mt-4 flex flex-wrap gap-8">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-white/60">{t("detail.weWillPay", { defaultValue: "We'll pay you" })}</p>
                  <p className="mt-1 text-[26px] font-extrabold">{fmtMoney(request.offerPrice, request.offerPriceCurrency ?? "AED")}</p>
                </div>
                {request.offerValidFor && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-white/60">{t("detail.offerValidity", { defaultValue: "Offer validity" })}</p>
                    <p className="mt-1 text-[18px] font-bold">{request.offerValidFor}</p>
                  </div>
                )}
                {request.inspectedCondition && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-white/60">{t("detail.inspectedCondition", { defaultValue: "Graded as" })}</p>
                    <p className="mt-1 text-[18px] font-bold">
                      {t(`condition.${request.inspectedCondition}`, { defaultValue: CONDITION_LABEL[request.inspectedCondition] })}
                    </p>
                  </div>
                )}
              </div>
              {request.adminNote && <p className="mt-4 text-[13px] leading-relaxed text-white/80">{request.adminNote}</p>}

              {/* Payout method — wallet credit is visible but not yet selectable. */}
              <div className="mt-6">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-white/60">
                  {t("detail.payoutTitle", { defaultValue: "How would you like to be paid?" })}
                </p>
                <div className="mt-3 space-y-2.5">
                  <button
                    type="button"
                    onClick={() => setPayoutChoice("STORE_CASH")}
                    className={`flex w-full items-start gap-3 rounded-[14px] border px-4 py-3 text-start transition-colors ${
                      payoutChoice === "STORE_CASH" ? "border-[#FBBB14] bg-white/10" : "border-white/20 hover:bg-white/5"
                    }`}
                  >
                    <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${payoutChoice === "STORE_CASH" ? "border-[#FBBB14]" : "border-white/40"}`}>
                      {payoutChoice === "STORE_CASH" && <span className="h-2 w-2 rounded-full bg-[#FBBB14]" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13.5px] font-bold text-white">
                        {t("detail.payoutStore", { defaultValue: "Collect at our store" })}
                      </span>
                      <span className="mt-0.5 block text-[12px] leading-relaxed text-white/60">
                        {t("detail.payoutStoreBody", {
                          defaultValue: "Pick up your money in person at the branch handling your device.",
                        })}
                      </span>
                    </span>
                  </button>

                  <div
                    aria-disabled
                    className="flex w-full cursor-not-allowed items-start gap-3 rounded-[14px] border border-white/10 px-4 py-3 text-start opacity-60"
                  >
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-white/25" />
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-[13.5px] font-bold text-white">
                          {t("detail.payoutWallet", { defaultValue: "Keep it in my Buyology wallet" })}
                        </span>
                        <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-white/80">
                          {t("detail.comingSoon", { defaultValue: "Coming soon" })}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-[12px] leading-relaxed text-white/60">
                        {t("detail.payoutWalletBody", {
                          defaultValue: "Spend the balance on your next Buyology order. Not available just yet.",
                        })}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    run(
                      () => respondToOffer(request.id, true, payoutChoice),
                      t("detail.actionFailed", { defaultValue: "Something went wrong. Please try again." }),
                    )
                  }
                  disabled={busy}
                  className="flex-1 rounded-full bg-[#FBBB14] py-3 text-[13.5px] font-bold text-[#2f2158] transition-colors hover:bg-[#eab00d] disabled:opacity-50"
                >
                  {t("detail.acceptOffer", { defaultValue: "Accept Offer" })}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    run(
                      () => respondToOffer(request.id, false),
                      t("detail.actionFailed", { defaultValue: "Something went wrong. Please try again." }),
                    )
                  }
                  disabled={busy}
                  className="flex-1 rounded-full bg-white/15 py-3 text-[13.5px] font-bold text-white transition-colors hover:bg-white/25 disabled:opacity-50"
                >
                  {t("detail.declineOffer", { defaultValue: "Decline Offer" })}
                </button>
              </div>
            </div>
          )}

          {/* ACCEPTED — collect the money */}
          {request.status === "ACCEPTED" && (
            <div className="buyo-rise buyo-card rounded-[18px] border border-teal-200 bg-teal-50/70 p-6">
              <h2 className="text-[15px] font-bold text-teal-900">
                {t("detail.collectTitle", { defaultValue: "Collect your payment" })}
              </h2>
              {/* A courier-pickup seller never chose a branch, so there is no store to name —
                  we point them at any branch and let the team confirm which one holds the device. */}
              <p className="mt-1.5 text-[13px] leading-relaxed text-teal-800">
                {request.storeBranchName
                  ? t("detail.collectBody", {
                      defaultValue:
                        "You've accepted our offer. Visit {{store}} with your ID to collect your payment — we'll mark this request as paid once the money is in your hands.",
                      store: request.storeBranchName,
                    })
                  : t("detail.collectBodyNoStore", {
                      defaultValue:
                        "You've accepted our offer. Bring your ID to any Buyology store to collect your payment — we'll be in touch to confirm the branch holding your device, and we'll mark this request as paid once the money is in your hands.",
                    })}
              </p>
              {request.offerPrice != null && (
                <p className="mt-4 text-[24px] font-extrabold text-teal-900">
                  {fmtMoney(request.offerPrice, request.offerPriceCurrency ?? "AED")}
                </p>
              )}
              {request.storeAddress && (
                <p className="mt-1 text-[12.5px] text-teal-700">{request.storeAddress}</p>
              )}
            </div>
          )}

          {/* COMPLETED */}
          {request.status === "COMPLETED" && (
            <div className="flex items-start gap-2.5 rounded-[14px] border border-green-200 bg-green-50 px-4 py-3.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-4 w-4 shrink-0">
                <path d="M9 12l2 2 4-4M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z" />
              </svg>
              <p className="text-[13px] leading-relaxed text-green-800">
                {t("detail.completed", {
                  defaultValue: "All done — you've been paid. Thanks for selling to Buyology!",
                })}
              </p>
            </div>
          )}

          {/* DECLINED — arrange the device's return */}
          {request.status === "DECLINED" && (
            <div className="buyo-rise buyo-card rounded-[18px] border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-[15px] font-bold text-gray-900">{t("detail.returnTitle", { defaultValue: "Get your device back" })}</h2>
              <p className="mt-1 text-[13px] text-gray-500">
                {t("detail.returnBody", { defaultValue: "You've declined our offer. Choose how you'd like to receive your device back." })}
              </p>
              {returnCourierPending ? (
                <div className="mt-4 rounded-[14px] border border-amber-200 bg-amber-50 px-4 py-4">
                  <p className="text-[13px] font-bold text-amber-900">
                    {t("detail.courierPaymentPending", { defaultValue: "Complete your courier payment" })}
                  </p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-amber-800">
                    {t("detail.returnPaymentPendingBody", {
                      defaultValue:
                        "Pay the courier fee to have your device delivered back to you — or collect it from the store for free instead.",
                    })}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={payReturnCourier}
                      disabled={busy}
                      className="flex-1 rounded-full bg-amber-500 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
                    >
                      {busy
                        ? t("detail.redirecting", { defaultValue: "Redirecting…" })
                        : `${t("detail.payCourierFee", { defaultValue: "Pay courier fee" })} (${courierFeeLabel})`}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        runDelivery(
                          () => chooseSellReturn(request.id, { method: "STORE_PICKUP", currency: ccy }),
                          t("detail.saveFailed", { defaultValue: "Couldn't save your choice. Please try again." }),
                        )
                      }
                      disabled={busy}
                      className="flex-1 rounded-full border border-gray-300 py-2.5 text-[13px] font-bold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                    >
                      {t("detail.switchToStorePickup", { defaultValue: "Collect from store instead" })}
                    </button>
                  </div>
                </div>
              ) : request.returnDeliveryMethod ? (
                <div className="mt-4 rounded-[14px] border border-indigo-100 bg-indigo-50/60 px-4 py-3.5 text-[13px] text-indigo-800">
                  {request.returnDeliveryMethod === "COURIER_RETURN"
                    ? t("detail.returnCourierChosen", { defaultValue: "A courier will deliver your device back to you." })
                    : t("detail.returnPickupChosen", { defaultValue: "You can collect your device from the store." })}
                </div>
              ) : (
                <>
                  <div className="mt-4 space-y-3">
                    <button
                      type="button"
                      onClick={() => setReturnChoice("STORE_PICKUP")}
                      className={`flex w-full items-center justify-between gap-3 rounded-[14px] border px-4 py-3.5 text-start transition-colors ${
                        returnChoice === "STORE_PICKUP" ? "border-[#402F75] bg-[#F8F6FF]" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-[14px] font-bold text-gray-900">{t("detail.pickupFromStore", { defaultValue: "Pick up from store" })}</span>
                      <span className="text-[12px] font-bold text-green-600">{t("detail.free", { defaultValue: "Free" })}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setReturnChoice("COURIER_RETURN")}
                      className={`flex w-full items-center justify-between gap-3 rounded-[14px] border px-4 py-3.5 text-start transition-colors ${
                        returnChoice === "COURIER_RETURN" ? "border-[#402F75] bg-[#F8F6FF]" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-[14px] font-bold text-gray-900">{t("detail.courierReturn", { defaultValue: "Request courier delivery" })}</span>
                      <span className="text-[12px] font-bold text-[#402F75]">{courierFeeLabel}</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleChooseReturn}
                    disabled={busy || !returnChoice}
                    className="mt-5 w-full rounded-full bg-[#402F75] py-3 text-[13.5px] font-bold text-white transition-colors hover:bg-[#352566] disabled:opacity-50"
                  >
                    {busy ? t("detail.saving", { defaultValue: "Saving…" }) : t("detail.confirmReturn", { defaultValue: "Confirm return method" })}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right column — timeline */}
        <aside className="buyo-rise buyo-d3 rounded-[18px] border border-gray-100 bg-white p-6 shadow-sm lg:sticky lg:top-6 lg:self-start">
          <h2 className="text-[15px] font-bold text-gray-900">{t("detail.timeline", { defaultValue: "Sell Timeline" })}</h2>
          <ol className="mt-5 space-y-0">
            {SELL_TIMELINE_STEPS.map((step, i) => {
              const done = i < reached;
              const current = i === reached - 1;
              const isLast = i === SELL_TIMELINE_STEPS.length - 1;
              return (
                <li key={step} className="relative flex gap-3 pb-6 last:pb-0">
                  {!isLast && (
                    <span
                      aria-hidden
                      className={`absolute left-[11px] top-6 h-full w-0.5 ${i < reached - 1 ? "bg-green-400" : "bg-gray-200"}`}
                    />
                  )}
                  <span
                    className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                      done ? "bg-green-100" : "bg-gray-100"
                    }`}
                  >
                    {done ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 2" />
                      </svg>
                    )}
                  </span>
                  <div className="pt-0.5">
                    <p className={`text-[13px] font-semibold ${done ? "text-gray-900" : current ? "text-[#402F75]" : "text-gray-400"}`}>
                      {t(`detail.timelineSteps.${step}`, { defaultValue: TIMELINE_LABELS[step] })}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          {request.status === "DECLINED" && (
            <div className="mt-2 rounded-[10px] bg-red-50 px-3 py-2 text-[11.5px] font-semibold text-red-600">
              {t("status.DECLINED", { defaultValue: SELL_STATUS_LABEL.DECLINED })}
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
