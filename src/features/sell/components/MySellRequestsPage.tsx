"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import type { RootState } from "@/store";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";
import { listMySellRequests } from "@/features/sell/services/sell.api";
import type { SellRequest } from "@/features/sell/types";
import { SELL_STATUS_LABEL, SELL_STATUS_TONE } from "@/features/sell/lib/status";

function fmtMoney(amount: number, currency: string) {
  // Pinned locale — see the note in SellRequestForm (hydration mismatch #418).
  return `${currency.toUpperCase()} ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function MySellRequestsPage() {
  const params = useParams();
  const lang = (params?.lang as Lang) ?? "en";
  const sellSlug = PATH_SLUGS.sell[lang] ?? "sell";
  const authSlug = PATH_SLUGS.auth[lang] ?? "auth";
  const { t } = useTranslation("sell");
  const router = useRouter();

  const userId = useSelector((s: RootState) => s.auth.userId);
  const authRestored = useSelector((s: RootState) => s.auth.isRestored);

  const [requests, setRequests] = useState<SellRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authRestored) return;
    if (!userId) router.replace(`/${lang}/${authSlug}`);
  }, [authRestored, userId, lang, authSlug, router]);

  // Note: loading initialises to true, so no synchronous setState is needed here
  // (that would trip react-hooks/set-state-in-effect); the async .finally clears it.
  const load = useCallback(() => {
    if (!userId) return () => {};
    let alive = true;
    listMySellRequests()
      .then((r) => { if (alive) setRequests(r); })
      .catch(() => { if (alive) setRequests([]); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [userId]);

  useEffect(() => load(), [load]);

  if (!authRestored || !userId) return null;

  return (
    <main className="w-full px-4 py-8 sm:px-6 sm:py-10 lg:px-8 xl:px-12">
      <div className="buyo-rise mb-6 flex items-center justify-between gap-4">
        <h1 className="text-[22px] font-extrabold text-gray-900">
          {t("list.title", { defaultValue: "My Sell Requests" })}
        </h1>
        {requests.length > 0 && (
          <Link
            href={`/${lang}/${sellSlug}/new`}
            className="rounded-full bg-[#402F75] px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#352566]"
          >
            {t("list.newRequest", { defaultValue: "New request" })}
          </Link>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="buyo-shimmer h-28 rounded-[16px]" style={{ animationDelay: `${i * 90}ms` }} />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="buyo-rise flex flex-col items-center rounded-[22px] border border-dashed border-gray-200 bg-gradient-to-b from-[#F8F6FF] to-white px-6 py-14 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EDE9FF]">
            <svg viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
              <path d="M20.6 13.4 12 22l-9-9V3h10l7.6 7.6a2 2 0 0 1 0 2.8ZM7.5 7.5h.01" />
            </svg>
          </div>
          <h2 className="mt-5 text-[17px] font-bold text-gray-900">
            {t("list.emptyTitle", { defaultValue: "No sell requests yet" })}
          </h2>
          <p className="mt-1.5 max-w-[360px] text-[13px] text-gray-500">
            {t("list.emptyBody", {
              defaultValue: "When you offer us a device it'll appear here so you can track its progress.",
            })}
          </p>
          <Link
            href={`/${lang}/${sellSlug}/new`}
            className="mt-6 rounded-full bg-[#FBBB14] px-7 py-3 text-[13.5px] font-bold text-[#2f2158] shadow-md transition-colors hover:bg-[#eab00d]"
          >
            {t("list.createFirst", { defaultValue: "Sell your first device" })}
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {requests.map((r, i) => (
            // Cap the stagger so a long list doesn't leave the last cards hidden for seconds.
            <li key={r.id} className="buyo-rise" style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}>
              <Link
                href={`/${lang}/${sellSlug}/${r.id}`}
                className="buyo-card buyo-card-hover flex h-full items-center justify-between gap-4 rounded-[16px] border border-gray-100 bg-white px-5 py-4 shadow-sm"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[15px] font-bold text-gray-900">{r.productName}</p>
                    {r.customerUnread && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[#FBBB14]" title={t("list.updated", { defaultValue: "New update" })} />
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-[12.5px] text-gray-500">
                    {r.brand} · {r.model}
                    {r.reference ? ` · ${r.reference}` : ""}
                  </p>
                  {r.offerPrice != null && (
                    <p className="mt-1 text-[12.5px] font-bold text-[#402F75]">
                      {fmtMoney(r.offerPrice, r.offerPriceCurrency ?? "AED")}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${SELL_STATUS_TONE[r.status]}`}>
                    {t(`status.${r.status}`, { defaultValue: SELL_STATUS_LABEL[r.status] })}
                  </span>
                  <span className="text-[11px] text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
