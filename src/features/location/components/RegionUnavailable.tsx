"use client";

import { useTranslation } from "react-i18next";

/**
 * Shown in place of products when the visitor's detected region isn't served.
 * Purely informational — the visitor cannot pick a country to bypass the block;
 * products stay hidden for unserved regions.
 *
 *  - "page"   — full-width panel for whole-page surfaces (shop, product detail).
 *  - "inline" — narrower card that slots into a home section.
 */
export default function RegionUnavailable({ variant = "page" }: { variant?: "inline" | "page" }) {
  const { t } = useTranslation("location");

  return (
    <div
      className={`w-full flex items-center justify-center ${
        variant === "page" ? "min-h-[60vh] py-16" : "py-10"
      }`}
    >
      <div className="w-full max-w-[460px] mx-auto rounded-3xl bg-white border border-gray-200 shadow-xl px-6 py-8 md:px-8 md:py-10 text-center">
        <div
          className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-5"
          style={{ background: "rgba(64,47,117,0.10)" }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </div>

        <h2 className="text-[19px] md:text-[22px] font-extrabold text-[#1a0f40] leading-tight">
          {t("regionUnavailable.title", {
            defaultValue: "We're not in your region yet",
          })}
        </h2>
        <p className="mt-2.5 text-[13px] md:text-[14px] text-gray-600 leading-relaxed">
          {t("regionUnavailable.body", {
            defaultValue:
              "We don't have a store serving your location yet, so products aren't available here. We're expanding — please check back soon.",
          })}
        </p>
      </div>
    </div>
  );
}
