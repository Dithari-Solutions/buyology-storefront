"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import type { RootState } from "@/store";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";
import { listMySellRequests } from "@/features/sell/services/sell.api";
import type { SellRequest } from "@/features/sell/types";
import SellCard from "@/features/sell/components/SellCard";

/**
 * Sell section of the profile: the customer's trade-in requests plus a shortcut to open a new one.
 * Deliberately a compact summary — the full timeline, offer decision and delivery actions live on
 * the sell detail page, which each card links to. Mirrors ProfileRepairs.
 */
export default function ProfileSellRequests() {
  const { t } = useTranslation("sell");
  const lang = useSelector((state: RootState) => state.language.lang) as Lang;
  const sellSlug = PATH_SLUGS.sell[lang] ?? "sell";

  const [requests, setRequests] = useState<SellRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    listMySellRequests()
      .then((r) => { if (alive) setRequests(r); })
      .catch(() => { if (alive) setRequests([]); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const newHref = `/${lang}/${sellSlug}/new`;

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="buyo-shimmer h-28 rounded-[16px]" style={{ animationDelay: `${i * 90}ms` }} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header + primary action */}
      <div className="buyo-rise flex flex-wrap items-center justify-between gap-3 rounded-[20px] bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">
            {t("list.title", { defaultValue: "My Sell Requests" })}
          </h2>
          <p className="mt-0.5 text-[13px] text-gray-400">
            {requests.length > 0
              // Interpolated as `total`, not `count` — passing `count` makes i18next resolve
              // plural sub-keys (_one/_other) that these namespaces don't define.
              ? t("profile.count", {
                  defaultValue: "{{total}} sell request(s)",
                  total: requests.length,
                })
              : t("list.emptyBody", {
                  defaultValue: "When you offer us a device it'll appear here so you can track its progress.",
                })}
          </p>
        </div>
        <Link
          href={newHref}
          className="inline-flex items-center gap-2 rounded-full bg-[#402F75] px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#352566]"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          {t("list.newRequest", { defaultValue: "New request" })}
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="buyo-rise buyo-d1 flex flex-col items-center rounded-[20px] border border-dashed border-gray-200 bg-gradient-to-b from-[#F8F6FF] to-white px-6 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EDE9FF]">
            <svg viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
              <path d="M20.6 13.4 12 22l-9-9V3h10l7.6 7.6a2 2 0 0 1 0 2.8ZM7.5 7.5h.01" />
            </svg>
          </div>
          <h3 className="mt-5 text-[17px] font-bold text-gray-900">
            {t("list.emptyTitle", { defaultValue: "No sell requests yet" })}
          </h3>
          <p className="mt-1.5 max-w-[360px] text-[13px] text-gray-500">
            {t("list.emptyBody", {
              defaultValue: "When you offer us a device it'll appear here so you can track its progress.",
            })}
          </p>
          <Link
            href={newHref}
            className="mt-6 rounded-full bg-[#FBBB14] px-7 py-3 text-[13.5px] font-bold text-[#2f2158] shadow-md transition-colors hover:bg-[#eab00d]"
          >
            {t("list.createFirst", { defaultValue: "Sell your first device" })}
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {requests.map((r, i) => (
            // Stagger capped so a long list doesn't leave the last cards hidden for seconds.
            <li key={r.id} className="buyo-rise" style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}>
              <SellCard request={r} href={`/${lang}/${sellSlug}/${r.id}`} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
