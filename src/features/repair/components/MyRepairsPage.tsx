"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import type { RootState } from "@/store";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";
import { listMyRepairs } from "@/features/repair/services/repair.api";
import type { Repair } from "@/features/repair/types";
import { REPAIR_STATUS_LABEL, REPAIR_STATUS_TONE } from "@/features/repair/lib/status";

export default function MyRepairsPage() {
  const params = useParams();
  const lang = (params?.lang as Lang) ?? "en";
  const repairSlug = PATH_SLUGS.repair[lang] ?? "repair";
  const authSlug = PATH_SLUGS.auth[lang] ?? "auth";
  const { t } = useTranslation("repair");
  const router = useRouter();

  const userId = useSelector((s: RootState) => s.auth.userId);
  const authRestored = useSelector((s: RootState) => s.auth.isRestored);

  const [repairs, setRepairs] = useState<Repair[]>([]);
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
    listMyRepairs()
      .then((r) => { if (alive) setRepairs(r); })
      .catch(() => { if (alive) setRepairs([]); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [userId]);

  useEffect(() => load(), [load]);

  if (!authRestored || !userId) return null;

  return (
    <main className="w-[92%] max-w-[820px] mx-auto py-8 sm:py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-[22px] font-extrabold text-gray-900">
          {t("list.title", { defaultValue: "My Repairs" })}
        </h1>
        {repairs.length > 0 && (
          <Link
            href={`/${lang}/${repairSlug}/new`}
            className="rounded-full bg-[#402F75] px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#352566]"
          >
            {t("list.newRequest", { defaultValue: "New request" })}
          </Link>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-[16px] bg-gray-100" />
          ))}
        </div>
      ) : repairs.length === 0 ? (
        <div className="flex flex-col items-center rounded-[22px] border border-dashed border-gray-200 bg-gradient-to-b from-[#F8F6FF] to-white px-6 py-14 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EDE9FF]">
            <svg viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
              <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2-2 2.6-2.6Z" />
            </svg>
          </div>
          <h2 className="mt-5 text-[17px] font-bold text-gray-900">
            {t("list.emptyTitle", { defaultValue: "No repair requests yet" })}
          </h2>
          <p className="mt-1.5 max-w-[360px] text-[13px] text-gray-500">
            {t("list.emptyBody", { defaultValue: "When you request a repair it'll appear here so you can track its progress." })}
          </p>
          <Link
            href={`/${lang}/${repairSlug}/new`}
            className="mt-6 rounded-full bg-[#FBBB14] px-7 py-3 text-[13.5px] font-bold text-[#2f2158] shadow-md transition-colors hover:bg-[#eab00d]"
          >
            {t("list.createFirst", { defaultValue: "Create your first repair request" })}
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {repairs.map((r) => (
            <li key={r.id}>
              <Link
                href={`/${lang}/${repairSlug}/${r.id}`}
                className="flex items-center justify-between gap-4 rounded-[16px] border border-gray-100 bg-white px-5 py-4 shadow-sm transition-shadow hover:shadow-md"
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
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${REPAIR_STATUS_TONE[r.status]}`}>
                    {t(`status.${r.status}`, { defaultValue: REPAIR_STATUS_LABEL[r.status] })}
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
