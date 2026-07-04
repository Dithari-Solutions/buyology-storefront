"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import type { AppDispatch, RootState } from "@/store";
import { selectCountries, setCountryThunk } from "@/features/country/store/countrySlice";

/**
 * Shown in place of products when the visitor's detected region isn't served.
 * Offers a picker of the active (served) countries so a traveller — or anyone
 * behind a mis-resolving IP — can self-select a country and keep shopping.
 *
 *  - "page"   — full-width panel for whole-page surfaces (shop, product detail).
 *  - "inline" — narrower card that slots into a home section.
 */
export default function RegionUnavailable({ variant = "page" }: { variant?: "inline" | "page" }) {
  const { t } = useTranslation("location");
  const dispatch = useDispatch<AppDispatch>();
  const countries = useSelector(selectCountries);
  const userId = useSelector((s: RootState) => s.auth.userId);
  const [choice, setChoice] = useState("");

  const apply = () => {
    if (!choice) return;
    dispatch(setCountryThunk({ countryCode: choice, userId, manual: true }));
  };

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
              "We don't have a store serving your location, so products aren't available here yet. If you're shopping from one of the countries below, pick it to continue.",
          })}
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-stretch gap-2.5">
          <label className="sr-only" htmlFor="region-country-picker">
            {t("regionUnavailable.pickLabel", { defaultValue: "Choose your country" })}
          </label>
          <div className="relative flex-1">
            <select
              id="region-country-picker"
              value={choice}
              onChange={(e) => setChoice(e.target.value)}
              className="w-full appearance-none rounded-full border border-gray-300 bg-white px-4 py-3 pr-10 text-[14px] font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#402F75] cursor-pointer"
            >
              <option value="" disabled>
                {t("regionUnavailable.pickPlaceholder", { defaultValue: "Choose your country" })}
              </option>
              {countries.map((c) => (
                <option key={c.id} value={c.code}>
                  {c.name} · {c.currency}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
          <button
            type="button"
            onClick={apply}
            disabled={!choice}
            className="flex-shrink-0 rounded-full bg-[#402F75] px-6 py-3 text-[14px] font-bold text-white transition-colors hover:bg-[#33245f] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {t("regionUnavailable.continue", { defaultValue: "Continue" })}
          </button>
        </div>
      </div>
    </div>
  );
}
