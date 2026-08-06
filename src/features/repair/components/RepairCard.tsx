"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import type { Repair } from "@/features/repair/types";
import {
  REPAIR_STATUS_LABEL,
  REPAIR_STATUS_TONE,
  REPAIR_TIMELINE_STEPS,
  repairNextAction,
  timelineReachedCount,
} from "@/features/repair/lib/status";

function fmtMoney(amount: number, currency: string) {
  // Pinned locale — an undefined locale resolves to the server's during SSR and the browser's on
  // the client, so the two renders disagree on separators and React fails hydration (#418).
  return `${currency.toUpperCase()} ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * One repair request in a list. Shared by the "My Repairs" page and the profile's Repairs
 * section so both read identically.
 *
 * The old card showed a name, a status pill and a date, which left the two questions people
 * actually open this list with unanswered: how far along is it, and does it need me? So the card
 * now carries the device photo, a progress rail, the price (the team's quote, or the AI's
 * preliminary range until then), and — when the ball is in the customer's court — a callout.
 */
export default function RepairCard({ repair, href }: { repair: Repair; href: string }) {
  const { t } = useTranslation("repair");

  const reached = timelineReachedCount(repair.status);
  const total = REPAIR_TIMELINE_STEPS.length;
  const action = repairNextAction(repair);
  const thumbnail = repair.imageUrls?.[0] ?? null;
  const isClosed = repair.status === "COMPLETED" || repair.status === "CANCELLED";

  // The team's binding quote once it exists, otherwise the AI's preliminary range (converted into
  // the customer's currency when the backend could).
  const price = repair.estimatedPrice != null
    ? { label: t("card.quoted", { defaultValue: "Quoted" }),
        value: fmtMoney(repair.estimatedPrice, repair.estimatedPriceCurrency ?? "AED"), firm: true }
    : repair.aiEstimateMinPrice != null && repair.aiEstimateMaxPrice != null
      ? { label: t("card.estimate", { defaultValue: "Estimated" }),
          value: repair.aiEstimateConvertedMinPrice != null &&
                 repair.aiEstimateConvertedMaxPrice != null &&
                 repair.aiEstimateConvertedCurrency
            ? `${fmtMoney(repair.aiEstimateConvertedMinPrice, repair.aiEstimateConvertedCurrency)} – ${fmtMoney(repair.aiEstimateConvertedMaxPrice, repair.aiEstimateConvertedCurrency)}`
            : `${fmtMoney(repair.aiEstimateMinPrice, repair.aiEstimateCurrency ?? "AED")} – ${fmtMoney(repair.aiEstimateMaxPrice, repair.aiEstimateCurrency ?? "AED")}`,
          firm: false }
      : null;

  return (
    <Link
      href={href}
      className="buyo-card buyo-card-hover group flex h-full flex-col overflow-hidden rounded-[18px] border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex gap-4 p-4 sm:p-5">
        {/* Problem photo — the fastest way to recognise your own request in a list. */}
        <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[14px] border border-gray-100 bg-gradient-to-br from-[#F8F6FF] to-[#EFEAFF]">
          {thumbnail ? (
            // unoptimized: these are presigned URLs that change on every read, so routing them
            // through /_next/image would miss the cache every time and re-optimize needlessly.
            <Image src={thumbnail} alt="" fill unoptimized className="object-cover" sizes="72px" />
          ) : (
            <span className="flex h-full w-full items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#A99BD8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2-2 2.6-2.6Z" />
              </svg>
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-[15px] font-bold text-gray-900">{repair.productName}</p>
                {repair.customerUnread && (
                  <span
                    className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-[#FBBB14]"
                    title={t("list.updated", { defaultValue: "New update" })}
                  />
                )}
              </div>
              <p className="mt-0.5 truncate text-[12.5px] text-gray-500">
                {repair.brand} · {repair.model}
              </p>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${REPAIR_STATUS_TONE[repair.status]}`}>
              {t(`status.${repair.status}`, { defaultValue: REPAIR_STATUS_LABEL[repair.status] })}
            </span>
          </div>

          {price && (
            <div className="mt-2.5 flex flex-wrap items-baseline gap-x-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                {price.label}
              </span>
              <span className={`text-[15px] font-extrabold ${price.firm ? "text-[#402F75]" : "text-gray-600"}`}>
                {price.value}
              </span>
              {!price.firm && (
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
                repair.status === "CANCELLED" || repair.status === "DECLINED"
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
            {repair.reference ?? repair.id.slice(0, 8)}
          </span>
          <span className="shrink-0 text-[11px] text-gray-400">
            {new Date(repair.createdAt).toLocaleDateString("en-GB", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </span>
        </div>
      )}
    </Link>
  );
}
