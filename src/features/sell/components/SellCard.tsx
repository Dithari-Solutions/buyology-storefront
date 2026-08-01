"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import type { SellRequest } from "@/features/sell/types";
import {
  SELL_STATUS_LABEL,
  SELL_STATUS_TONE,
  SELL_TIMELINE_STEPS,
  sellNextAction,
  timelineReachedCount,
} from "@/features/sell/lib/status";

function fmtMoney(amount: number, currency: string) {
  // Pinned locale — an undefined locale resolves to the server's during SSR and the browser's on
  // the client, so the two renders disagree on separators and React fails hydration (#418).
  return `${currency.toUpperCase()} ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * One sell request in a list. Shared by the "My Sell Requests" page and the profile's Sell
 * section so both read identically.
 *
 * The old card showed a name, a status pill and a date, which left the two questions people
 * actually open this list with unanswered: how far along is it, and does it need me? So the card
 * now carries the device photo, a progress rail, the money (our offer, or the AI's preliminary
 * range until then), and — when the ball is in the customer's court — a callout saying so.
 */
export default function SellCard({ request, href }: { request: SellRequest; href: string }) {
  const { t } = useTranslation("sell");

  const reached = timelineReachedCount(request.status);
  const total = SELL_TIMELINE_STEPS.length;
  const action = sellNextAction(request);
  const thumbnail = request.imageUrls?.[0] ?? null;
  const isClosed = request.status === "COMPLETED" || request.status === "CANCELLED";

  // The binding offer once it exists, otherwise the AI's preliminary range (converted into the
  // customer's currency when the backend could).
  const offer = request.offerPrice != null
    ? { label: t("card.ourOffer", { defaultValue: "Our offer" }),
        value: fmtMoney(request.offerPrice, request.offerPriceCurrency ?? "AED"), firm: true }
    : request.aiEstimateMinPrice != null && request.aiEstimateMaxPrice != null
      ? { label: t("card.estimate", { defaultValue: "Estimated" }),
          value: request.aiEstimateConvertedMinPrice != null &&
                 request.aiEstimateConvertedMaxPrice != null &&
                 request.aiEstimateConvertedCurrency
            ? `${fmtMoney(request.aiEstimateConvertedMinPrice, request.aiEstimateConvertedCurrency)} – ${fmtMoney(request.aiEstimateConvertedMaxPrice, request.aiEstimateConvertedCurrency)}`
            : `${fmtMoney(request.aiEstimateMinPrice, request.aiEstimateCurrency ?? "AED")} – ${fmtMoney(request.aiEstimateMaxPrice, request.aiEstimateCurrency ?? "AED")}`,
          firm: false }
      : null;

  return (
    <Link
      href={href}
      className="buyo-card buyo-card-hover group flex h-full flex-col overflow-hidden rounded-[18px] border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex gap-4 p-4 sm:p-5">
        {/* Device photo — the fastest way to recognise your own request in a list. */}
        <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[14px] border border-gray-100 bg-gradient-to-br from-[#F8F6FF] to-[#EFEAFF]">
          {thumbnail ? (
            // unoptimized: these are presigned URLs that change on every read, so routing them
            // through /_next/image would miss the cache every time and re-optimize needlessly.
            <Image src={thumbnail} alt="" fill unoptimized className="object-cover" sizes="72px" />
          ) : (
            <span className="flex h-full w-full items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#A99BD8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <path d="M20.6 13.4 12 22l-9-9V3h10l7.6 7.6a2 2 0 0 1 0 2.8ZM7.5 7.5h.01" />
              </svg>
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-[15px] font-bold text-gray-900">{request.productName}</p>
                {request.customerUnread && (
                  <span
                    className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-[#FBBB14]"
                    title={t("list.updated", { defaultValue: "New update" })}
                  />
                )}
              </div>
              <p className="mt-0.5 truncate text-[12.5px] text-gray-500">
                {request.brand} · {request.model}
              </p>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${SELL_STATUS_TONE[request.status]}`}>
              {t(`status.${request.status}`, { defaultValue: SELL_STATUS_LABEL[request.status] })}
            </span>
          </div>

          {offer && (
            <div className="mt-2.5 flex flex-wrap items-baseline gap-x-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                {offer.label}
              </span>
              <span className={`text-[15px] font-extrabold ${offer.firm ? "text-[#402F75]" : "text-gray-600"}`}>
                {offer.value}
              </span>
              {!offer.firm && (
                <span className="rounded-full bg-[#F1ECFF] px-1.5 py-0.5 text-[10px] font-semibold text-[#402F75]">
                  {t("card.aiBadge", { defaultValue: "AI" })}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Progress rail — closed requests get a full, muted bar rather than a misleading part-bar. */}
      <div className="px-4 sm:px-5">
        <div className="flex items-center gap-2.5">
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
            <span
              className={`block h-full rounded-full transition-all duration-500 ${
                request.status === "CANCELLED" || request.status === "DECLINED"
                  ? "bg-gray-300"
                  : "bg-gradient-to-r from-[#402F75] to-[#7A63C9]"
              }`}
              style={{ width: `${(reached / total) * 100}%` }}
            />
          </span>
          <span className="shrink-0 text-[11px] font-semibold text-gray-400">
            {isClosed
              ? t("card.done", { defaultValue: "Done" })
              : t("card.step", { defaultValue: "Step {{n}} of {{total}}", n: reached, total })}
          </span>
        </div>
      </div>

      {/* Action strip — only when the customer is the one holding things up. */}
      {action ? (
        <div className="mt-3 flex items-center gap-2 border-t border-[#F1ECFF] bg-[#FBFAFF] px-4 py-2.5 sm:px-5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FBBB14]">
            <svg viewBox="0 0 24 24" fill="none" stroke="#2f2158" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
              <path d="M12 8v5M12 17h.01" />
            </svg>
          </span>
          <p className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-[#402F75]">
            {t(action.key, { defaultValue: action.defaultValue, ...(action.values ?? {}) })}
          </p>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 transition-transform group-hover:translate-x-0.5 rtl:rotate-180">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </div>
      ) : (
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-gray-100 px-4 py-2.5 sm:px-5">
          <span className="truncate font-mono text-[11px] text-gray-400">
            {request.reference ?? request.id.slice(0, 8)}
          </span>
          <span className="shrink-0 text-[11px] text-gray-400">
            {new Date(request.createdAt).toLocaleDateString("en-GB", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </span>
        </div>
      )}
    </Link>
  );
}
