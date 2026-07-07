"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { subscribeToNewsletter } from "@/features/newsletter/services/newsletter.api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── "5000 Credit is coming soon" teaser banner ──────────────────────────────
// Shown on both the B2B landing page and the top of the products page. Inline
// email + Subscribe reuses the newsletter subscribe endpoint with the same
// silent-success pattern as home/components/Newsletter.tsx (show success
// regardless to avoid email-harvesting signals).
export default function B2BCreditBanner() {
  const { t } = useTranslation("b2b");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !EMAIL_RE.test(trimmed)) {
      setEmailError(t("creditBanner.emailError", { defaultValue: "Enter a valid email address." }));
      return;
    }
    setEmailError(null);
    if (loading) return;
    setLoading(true);
    try {
      await subscribeToNewsletter(trimmed);
    } catch {
      // silent — show success regardless to avoid email-harvesting signals
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#2D1F5E] via-[#402F75] to-[#6B4EAD] px-6 py-6 sm:px-8 sm:py-7 text-white shadow-lg shadow-[#402F75]/20">
      <div className="pointer-events-none absolute -top-16 -end-16 w-52 h-52 rounded-full bg-[#FBBB14]/15 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -start-10 w-40 h-40 rounded-full bg-white/5 blur-2xl" />

      <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FBBB14] text-[#3f2a02] text-[11px] font-extrabold px-3 py-[5px] mb-3 uppercase tracking-wider shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3f2a02]" />
            {t("creditBanner.comingSoon", { defaultValue: "Coming soon" })}
          </span>
          <h3 className="text-[22px] sm:text-[26px] font-bold leading-tight mb-2">
            {t("creditBanner.title", { defaultValue: "5000 Credit is coming soon" })}
          </h3>
          <p className="text-white/75 text-[14px] leading-relaxed">
            {t("creditBanner.subtitle", { defaultValue: "We're working on it — subscribe to be the first to know when it goes live." })}
          </p>
        </div>

        <div className="w-full md:w-auto md:min-w-[320px]">
          {submitted ? (
            <div className="flex items-center gap-3 rounded-full bg-white/10 backdrop-blur-sm px-5 py-3.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FBBB14] flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="#3f2a02" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="font-semibold text-[14px]">
                {t("creditBanner.subscribed", { defaultValue: "You're on the list! We'll be in touch." })}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(null); }}
                  placeholder={t("creditBanner.emailPlaceholder", { defaultValue: "Your email" })}
                  className={`flex-1 bg-white/95 border rounded-full px-5 py-3 text-[14px] text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#FBBB14]/40 transition-all ${emailError ? "border-red-400" : "border-transparent"}`}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FBBB14] to-[#f59e0b] text-[#3f2a02] font-bold text-[14px] px-6 py-3 transition-transform hover:scale-[1.03] disabled:opacity-60 disabled:hover:scale-100 whitespace-nowrap"
                >
                  {loading ? "..." : t("creditBanner.subscribe", { defaultValue: "Subscribe" })}
                  {!loading && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              </div>
              {emailError && (
                <p className="text-[12px] text-[#FFE08A] font-medium ps-1">{emailError}</p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
