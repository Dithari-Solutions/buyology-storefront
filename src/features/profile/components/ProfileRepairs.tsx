"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import type { RootState } from "@/store";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";
import { listMyRepairs } from "@/features/repair/services/repair.api";
import type { Repair } from "@/features/repair/types";
import { REPAIR_STATUS_LABEL, REPAIR_STATUS_TONE } from "@/features/repair/lib/status";

/**
 * Repair section of the profile: the customer's device-repair requests plus a shortcut to
 * open a new one. Deliberately a compact summary — the full timeline, price decision and
 * delivery actions live on the repair detail page, which each card links to.
 */
export default function ProfileRepairs() {
  const { t } = useTranslation("repair");
  const lang = useSelector((state: RootState) => state.language.lang) as Lang;
  const repairSlug = PATH_SLUGS.repair[lang] ?? "repair";

  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    listMyRepairs()
      .then((r) => { if (alive) setRepairs(r); })
      .catch(() => { if (alive) setRepairs([]); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const newHref = `/${lang}/${repairSlug}/new`;

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
            {t("list.title", { defaultValue: "My Repairs" })}
          </h2>
          <p className="mt-0.5 text-[13px] text-gray-400">
            {repairs.length > 0
              ? t("profile.count", {
                  defaultValue: "{{count}} repair request(s)",
                  count: repairs.length,
                })
              : t("list.emptyBody", {
                  defaultValue: "When you request a repair it'll appear here so you can track its progress.",
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

      {repairs.length === 0 ? (
        <div className="buyo-rise buyo-d1 flex flex-col items-center rounded-[20px] border border-dashed border-gray-200 bg-gradient-to-b from-[#F8F6FF] to-white px-6 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EDE9FF]">
            <svg viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
              <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2-2 2.6-2.6Z" />
            </svg>
          </div>
          <h3 className="mt-5 text-[17px] font-bold text-gray-900">
            {t("list.emptyTitle", { defaultValue: "No repair requests yet" })}
          </h3>
          <p className="mt-1.5 max-w-[360px] text-[13px] text-gray-500">
            {t("list.emptyBody", {
              defaultValue: "When you request a repair it'll appear here so you can track its progress.",
            })}
          </p>
          <Link
            href={newHref}
            className="mt-6 rounded-full bg-[#FBBB14] px-7 py-3 text-[13.5px] font-bold text-[#2f2158] shadow-md transition-colors hover:bg-[#eab00d]"
          >
            {t("list.createFirst", { defaultValue: "Create your first repair request" })}
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {repairs.map((r, i) => (
            // Stagger capped so a long list doesn't leave the last cards hidden for seconds.
            <li key={r.id} className="buyo-rise" style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}>
              <Link
                href={`/${lang}/${repairSlug}/${r.id}`}
                className="buyo-card buyo-card-hover flex h-full items-center justify-between gap-4 rounded-[16px] border border-gray-100 bg-white px-5 py-4 shadow-sm"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[15px] font-bold text-gray-900">{r.productName}</p>
                    {r.customerUnread && (
                      <span
                        className="h-2 w-2 shrink-0 rounded-full bg-[#FBBB14]"
                        title={t("list.updated", { defaultValue: "New update" })}
                      />
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-[12.5px] text-gray-500">
                    {r.brand} · {r.model}
                    {r.reference ? ` · ${r.reference}` : ""}
                  </p>
                  <span
                    className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${REPAIR_STATUS_TONE[r.status]}`}
                  >
                    {t(`status.${r.status}`, { defaultValue: REPAIR_STATUS_LABEL[r.status] })}
                  </span>
                </div>
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af"
                  strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                  className="shrink-0 rtl:rotate-180"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
