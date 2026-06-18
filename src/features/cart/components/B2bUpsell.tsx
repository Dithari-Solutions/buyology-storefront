"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import type { Lang } from "@/config/pathSlugs";

/**
 * Shown on the cart page when the shopper has a high quantity of a single product —
 * a strong signal they're buying for a business. Promotes B2B membership (bulk pricing,
 * a credit line / pay-later, priority support) and links to the application page.
 */
export default function B2bUpsell({ lang, qty }: { lang: Lang; qty: number }) {
  const { t } = useTranslation("cart");

  const benefits = [
    t("b2bUpsell.benefitBulk", { defaultValue: "Wholesale bulk pricing" }),
    t("b2bUpsell.benefitCredit", { defaultValue: "Buy now, pay later with a credit line" }),
    t("b2bUpsell.benefitSupport", { defaultValue: "A dedicated account & priority support" }),
  ];

  return (
    <div className="relative mb-5 overflow-hidden rounded-[20px] border border-[#FBBB14]/40 bg-gradient-to-r from-[#402F75] to-[#5d44a8] p-5 sm:p-6 text-white shadow-lg shadow-[#402F75]/20">
      <div className="pointer-events-none absolute -top-16 -end-10 h-48 w-48 rounded-full bg-[#FBBB14]/20 blur-3xl" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="hidden h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#FBBB14] sm:flex">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4" />
              <path d="M9 9v.01M9 13v.01M9 17v.01" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="mb-0.5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#FBBB14]">
              {t("b2bUpsell.badge", { defaultValue: "Buying in bulk?" })}
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold text-white">
                {qty}× {t("b2bUpsell.ofOne", { defaultValue: "of one item" })}
              </span>
            </p>
            <h3 className="text-[16px] font-bold leading-snug sm:text-[18px]">
              {t("b2bUpsell.heading", { defaultValue: "Order more for less with Buyology B2B" })}
            </h3>
            <ul className="mt-2 flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-x-4">
              {benefits.map((b) => (
                <li key={b} className="flex items-center gap-1.5 text-[12.5px] text-white/85">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FBBB14" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Link
          href={`/${lang}/b2b/apply`}
          className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-full bg-[#FBBB14] px-6 py-3 text-[14px] font-bold text-[#402F75] transition-all hover:bg-[#f0b000] active:scale-[0.98]"
        >
          {t("b2bUpsell.cta", { defaultValue: "Become a B2B member" })}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rtl:rotate-180">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
