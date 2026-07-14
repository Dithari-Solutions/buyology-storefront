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
  chooseDelivery,
  chooseReturn,
  getRepair,
  listRepairStores,
  respondToPrice,
} from "@/features/repair/services/repair.api";
import type { Repair, RepairStoreOption } from "@/features/repair/types";
import { REPAIR_COURIER_FEE_AED } from "@/features/repair/types";
import {
  REPAIR_STATUS_LABEL,
  REPAIR_STATUS_TONE,
  REPAIR_TIMELINE_STEPS,
  timelineReachedCount,
} from "@/features/repair/lib/status";

const TIMELINE_LABELS: Record<(typeof REPAIR_TIMELINE_STEPS)[number], string> = {
  SUBMITTED: "Request Submitted",
  UNDER_REVIEW: "Under Review",
  PRICE_ESTIMATED: "Price Estimate Sent",
  IN_REPAIR: "Fix Started",
  COMPLETED: "Completed",
};

function fmtMoney(amount: number, currency: string) {
  return `${currency.toUpperCase()} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function RepairDetailPage() {
  const params = useParams();
  const lang = (params?.lang as Lang) ?? "en";
  const repairId = params?.repairId as string;
  const repairSlug = PATH_SLUGS.repair[lang] ?? "repair";
  const authSlug = PATH_SLUGS.auth[lang] ?? "auth";
  const { t } = useTranslation("repair");
  const router = useRouter();

  const userId = useSelector((s: RootState) => s.auth.userId);
  const authRestored = useSelector((s: RootState) => s.auth.isRestored);
  const preferredCurrency = useSelector(selectPreferredCurrency);
  const countryCode = useSelector(selectSelectedCountryCode);
  const ccy = (preferredCurrency ?? "AED").toUpperCase();

  const [repair, setRepair] = useState<Repair | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inbound delivery choice UI
  const [deliveryChoice, setDeliveryChoice] = useState<"STORE_DROPOFF" | "COURIER_PICKUP" | null>(null);
  const [stores, setStores] = useState<RepairStoreOption[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");

  // Return choice UI (after a decline)
  const [returnChoice, setReturnChoice] = useState<"STORE_PICKUP" | "COURIER_RETURN" | null>(null);

  // Converted 20 AED courier fee (null while AED or loading)
  const [convertedFee, setConvertedFee] = useState<number | null>(null);

  useEffect(() => {
    if (!authRestored) return;
    if (!userId) router.replace(`/${lang}/${authSlug}`);
  }, [authRestored, userId, lang, authSlug, router]);

  const load = useCallback(() => {
    if (!userId || !repairId) return;
    setLoading(true);
    getRepair(repairId)
      .then((r) => setRepair(r))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [userId, repairId]);

  useEffect(() => { load(); }, [load]);

  // Fetch store branches once (for the drop-off picker).
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

  if (!authRestored || !userId) return null;

  if (loading) {
    return (
      <main className="w-[92%] max-w-[960px] mx-auto py-10">
        <div className="h-64 animate-pulse rounded-[20px] bg-gray-100" />
      </main>
    );
  }

  if (notFound || !repair) {
    return (
      <main className="w-[92%] max-w-[560px] mx-auto py-16 text-center">
        <p className="text-[15px] text-gray-600">{t("detail.notFound", { defaultValue: "Repair request not found." })}</p>
        <Link href={`/${lang}/${repairSlug}/my`} className="mt-4 inline-block text-[13px] font-bold text-[#402F75] hover:underline">
          {t("detail.backToList", { defaultValue: "Back to my repairs" })}
        </Link>
      </main>
    );
  }

  const reached = timelineReachedCount(repair.status);
  const courierFeeLabel =
    ccy === "AED" || convertedFee == null
      ? fmtMoney(REPAIR_COURIER_FEE_AED, "AED")
      : `${fmtMoney(REPAIR_COURIER_FEE_AED, "AED")} (≈ ${fmtMoney(convertedFee, ccy)})`;

  const run = async (fn: () => Promise<Repair>, failMsg: string) => {
    setError(null);
    setBusy(true);
    try {
      const updated = await fn();
      setRepair(updated);
    } catch {
      setError(failMsg);
    } finally {
      setBusy(false);
    }
  };

  const handleChooseDelivery = () => {
    if (!deliveryChoice) return;
    if (deliveryChoice === "STORE_DROPOFF" && !selectedStoreId) {
      setError(t("detail.pickStore", { defaultValue: "Please choose a store branch." }));
      return;
    }
    run(
      () =>
        chooseDelivery(repair.id, {
          method: deliveryChoice,
          storeLocationId: deliveryChoice === "STORE_DROPOFF" ? selectedStoreId : undefined,
          currency: ccy,
        }),
      t("detail.saveFailed", { defaultValue: "Couldn't save your choice. Please try again." }),
    );
  };

  const handleChooseReturn = () => {
    if (!returnChoice) return;
    run(
      () => chooseReturn(repair.id, { method: returnChoice, currency: ccy }),
      t("detail.saveFailed", { defaultValue: "Couldn't save your choice. Please try again." }),
    );
  };

  const statusLabel = t(`status.${repair.status}`, { defaultValue: REPAIR_STATUS_LABEL[repair.status] });

  return (
    <main className="w-[92%] max-w-[960px] mx-auto py-8 sm:py-10">
      <Link href={`/${lang}/${repairSlug}/my`} className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#402F75] hover:underline">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        {t("detail.backToList", { defaultValue: "Back to my repairs" })}
      </Link>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
        {/* Left column */}
        <div className="space-y-5">
          {/* Summary card */}
          <div className="rounded-[18px] border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h1 className="text-[22px] font-extrabold text-gray-900">{repair.productName}</h1>
              <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${REPAIR_STATUS_TONE[repair.status]}`}>
                {statusLabel}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-2">
              {[
                ["detail.requestId", "Request ID", repair.reference ?? repair.id.slice(0, 8)],
                ["detail.dateSubmitted", "Date Submitted", repair.submittedAt ? new Date(repair.submittedAt).toLocaleDateString() : "—"],
                ["detail.brand", "Brand", repair.brand],
                ["detail.model", "Model", repair.model],
                ...(repair.purchaseDate
                  ? [["detail.purchaseDate", "Purchase Date", new Date(repair.purchaseDate).toLocaleDateString()] as const]
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
                {t("detail.problem", { defaultValue: "Problem Description" })}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-[13.5px] leading-relaxed text-gray-700">{repair.description}</p>
            </div>

            {repair.imageUrls && repair.imageUrls.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  {t("detail.images", { defaultValue: "Images" })}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {repair.imageUrls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer" className="relative h-20 w-24 overflow-hidden rounded-[12px] border border-gray-200">
                      <Image src={url} alt={`Problem ${i + 1}`} fill className="object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contextual info + actions */}
          {error && (
            <div className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</div>
          )}

          {/* SUBMITTED — team reviewing + choose how to get the device to the store */}
          {repair.status === "SUBMITTED" && (
            <>
              <div className="flex items-start gap-2.5 rounded-[14px] border border-[#E4DCFB] bg-[#F8F6FF] px-4 py-3">
                <span className="mt-1 h-2 w-2 shrink-0 animate-pulse rounded-full bg-[#402F75]" />
                <p className="text-[13px] leading-relaxed text-[#402F75]">
                  {t("detail.reviewing", {
                    defaultValue:
                      "Our team is currently reviewing your request — we've emailed you a confirmation. Next, choose how to get your device to us.",
                  })}
                </p>
              </div>

              <div className="rounded-[18px] border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="text-[15px] font-bold text-gray-900">
                  {t("detail.chooseDelivery", { defaultValue: "Choose Delivery Method" })}
                </h2>
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

                <button
                  type="button"
                  onClick={handleChooseDelivery}
                  disabled={busy || !deliveryChoice}
                  className="mt-5 w-full rounded-full bg-[#402F75] py-3 text-[13.5px] font-bold text-white transition-colors hover:bg-[#352566] disabled:opacity-50"
                >
                  {busy ? t("detail.saving", { defaultValue: "Saving…" }) : t("detail.confirmDelivery", { defaultValue: "Confirm delivery method" })}
                </button>
              </div>
            </>
          )}

          {/* AWAITING_DEVICE — device on its way */}
          {repair.status === "AWAITING_DEVICE" && (
            <div className="rounded-[14px] border border-indigo-100 bg-indigo-50/60 px-4 py-3.5 text-[13px] leading-relaxed text-indigo-800">
              {repair.inboundDeliveryMethod === "COURIER_PICKUP"
                ? t("detail.awaitingCourier", { defaultValue: "A courier will collect your device and deliver it to our store. We'll update this page once it arrives." })
                : t("detail.awaitingDropoff", {
                    defaultValue: "Please drop your device at {{store}}. We'll start the review as soon as we receive it.",
                    store: repair.storeBranchName ?? t("detail.theStore", { defaultValue: "the selected store" }),
                  })}
            </div>
          )}

          {/* UNDER_REVIEW */}
          {repair.status === "UNDER_REVIEW" && (
            <div className="rounded-[14px] border border-blue-100 bg-blue-50/60 px-4 py-3.5 text-[13px] leading-relaxed text-blue-800">
              {t("detail.underReview", { defaultValue: "We've received your device and our technicians are diagnosing the issue. You'll get a price estimate shortly." })}
            </div>
          )}

          {/* PRICE_ESTIMATED — cost estimate + accept/decline */}
          {repair.status === "PRICE_ESTIMATED" && repair.estimatedPrice != null && (
            <div className="overflow-hidden rounded-[18px] bg-gradient-to-br from-[#4a3a86] to-[#2f2158] p-6 text-white shadow-sm">
              <h2 className="text-[16px] font-bold">{t("detail.costEstimate", { defaultValue: "Repair Cost Estimate" })}</h2>
              <div className="mt-4 flex flex-wrap gap-8">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-white/60">{t("detail.estimatedCost", { defaultValue: "Estimated Cost" })}</p>
                  <p className="mt-1 text-[26px] font-extrabold">{fmtMoney(repair.estimatedPrice, repair.estimatedPriceCurrency ?? "AED")}</p>
                </div>
                {repair.estimatedTime && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-white/60">{t("detail.estimatedTime", { defaultValue: "Estimated Time" })}</p>
                    <p className="mt-1 text-[18px] font-bold">{repair.estimatedTime}</p>
                  </div>
                )}
              </div>
              {repair.adminNote && <p className="mt-4 text-[13px] leading-relaxed text-white/80">{repair.adminNote}</p>}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => run(() => respondToPrice(repair.id, true), t("detail.actionFailed", { defaultValue: "Something went wrong. Please try again." }))}
                  disabled={busy}
                  className="flex-1 rounded-full bg-[#FBBB14] py-3 text-[13.5px] font-bold text-[#2f2158] transition-colors hover:bg-[#eab00d] disabled:opacity-50"
                >
                  {t("detail.acceptRepair", { defaultValue: "Accept Repair" })}
                </button>
                <button
                  type="button"
                  onClick={() => run(() => respondToPrice(repair.id, false), t("detail.actionFailed", { defaultValue: "Something went wrong. Please try again." }))}
                  disabled={busy}
                  className="flex-1 rounded-full bg-white/15 py-3 text-[13.5px] font-bold text-white transition-colors hover:bg-white/25 disabled:opacity-50"
                >
                  {t("detail.declineRepair", { defaultValue: "Decline Repair" })}
                </button>
              </div>
            </div>
          )}

          {/* IN_REPAIR */}
          {repair.status === "IN_REPAIR" && (
            <div className="rounded-[14px] border border-yellow-100 bg-yellow-50/70 px-4 py-3.5 text-[13px] leading-relaxed text-yellow-800">
              {t("detail.inRepair", { defaultValue: "You've accepted the estimate and our team has started the repair. We'll let you know as soon as it's ready." })}
            </div>
          )}

          {/* COMPLETED */}
          {repair.status === "COMPLETED" && (
            <div className="flex items-start gap-2.5 rounded-[14px] border border-green-200 bg-green-50 px-4 py-3.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-4 w-4 shrink-0">
                <path d="M9 12l2 2 4-4M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z" />
              </svg>
              <p className="text-[13px] leading-relaxed text-green-800">
                {t("detail.completed", { defaultValue: "Your repair is complete! Thanks for choosing Buyology." })}
              </p>
            </div>
          )}

          {/* DECLINED — arrange the device's return */}
          {repair.status === "DECLINED" && (
            <div className="rounded-[18px] border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-[15px] font-bold text-gray-900">{t("detail.returnTitle", { defaultValue: "Get your device back" })}</h2>
              <p className="mt-1 text-[13px] text-gray-500">
                {t("detail.returnBody", { defaultValue: "You've declined the estimate. Choose how you'd like to receive your device back." })}
              </p>
              {repair.returnDeliveryMethod ? (
                <div className="mt-4 rounded-[14px] border border-indigo-100 bg-indigo-50/60 px-4 py-3.5 text-[13px] text-indigo-800">
                  {repair.returnDeliveryMethod === "COURIER_RETURN"
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
        <aside className="rounded-[18px] border border-gray-100 bg-white p-6 shadow-sm lg:sticky lg:top-6 lg:self-start">
          <h2 className="text-[15px] font-bold text-gray-900">{t("detail.timeline", { defaultValue: "Repair Timeline" })}</h2>
          <ol className="mt-5 space-y-0">
            {REPAIR_TIMELINE_STEPS.map((step, i) => {
              const done = i < reached;
              const current = i === reached - 1;
              const isLast = i === REPAIR_TIMELINE_STEPS.length - 1;
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

          {repair.status === "DECLINED" && (
            <div className="mt-2 rounded-[10px] bg-red-50 px-3 py-2 text-[11.5px] font-semibold text-red-600">
              {t("status.DECLINED", { defaultValue: REPAIR_STATUS_LABEL.DECLINED })}
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
