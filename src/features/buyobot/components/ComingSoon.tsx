"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import type { RootState } from "@/store";
import type { Lang } from "@/config/pathSlugs";

export default function ComingSoon() {
    const { t } = useTranslation("buyobot");
    const lang = (useSelector((s: RootState) => s.language.lang) as Lang) ?? "en";

    return (
        <section className="relative w-full min-h-[calc(100vh-120px)] flex items-center justify-center overflow-hidden px-5 py-16">
            {/* Background gradient + soft blobs */}
            <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                    background:
                        "radial-gradient(1200px 600px at 50% -10%, rgba(64,47,117,0.18), transparent 60%), radial-gradient(800px 500px at 90% 110%, rgba(251,187,20,0.18), transparent 60%), linear-gradient(180deg, #F7F7F7 0%, #ECEAF5 100%)",
                }}
            />
            <motion.div
                aria-hidden="true"
                className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full blur-3xl opacity-40"
                style={{ background: "radial-gradient(circle, #402F75 0%, transparent 70%)" }}
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                aria-hidden="true"
                className="absolute -bottom-32 -right-20 w-[460px] h-[460px] rounded-full blur-3xl opacity-40"
                style={{ background: "radial-gradient(circle, #FBBB14 0%, transparent 70%)" }}
                animate={{ y: [0, -25, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative z-10 flex flex-col items-center text-center max-w-[720px]">
                {/* Badge */}
                <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur border border-[#402F75]/15 text-[#402F75] text-[12px] font-bold tracking-widest uppercase"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-[#FBBB14] opacity-75 animate-ping" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FBBB14]" />
                    </span>
                    {t("badge", { defaultValue: "Coming Soon" })}
                </motion.span>

                {/* Robot icon */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.05 }}
                    className="relative mt-8 mb-6"
                >
                    <motion.div
                        className="w-[120px] h-[120px] md:w-[140px] md:h-[140px] rounded-3xl flex items-center justify-center shadow-2xl"
                        style={{
                            background: "linear-gradient(135deg, #402F75 0%, #5B3FA8 100%)",
                        }}
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#FBBB14" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="7" width="18" height="13" rx="3" />
                            <path d="M12 7V3" />
                            <circle cx="12" cy="3" r="1" fill="#FBBB14" />
                            <circle cx="9" cy="13" r="1.4" fill="#FBBB14" stroke="none" />
                            <circle cx="15" cy="13" r="1.4" fill="#FBBB14" stroke="none" />
                            <path d="M9 17h6" />
                        </svg>
                    </motion.div>
                </motion.div>

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.1 }}
                    className="text-[34px] sm:text-[44px] md:text-[56px] font-extrabold leading-[1.05] text-[#1a0f40]"
                >
                    {t("title", { defaultValue: "BuyoBot is" })}{" "}
                    <span style={{ color: "#FBBB14" }}>
                        {t("titleAccent", { defaultValue: "almost here" })}
                    </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.15 }}
                    className="mt-5 text-[15px] md:text-[17px] text-gray-600 max-w-[560px] leading-relaxed"
                >
                    {t(
                        "subtitle",
                        {
                            defaultValue:
                                "Your AI shopping assistant for finding the right device, comparing deals and getting instant answers. We're putting the finishing touches on it — stay tuned.",
                        }
                    )}
                </motion.p>

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.2 }}
                    className="mt-8 flex flex-col sm:flex-row items-center gap-3"
                >
                    <Link
                        href={`/${lang}`}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#402F75] text-white text-[14px] font-bold hover:bg-[#33245f] transition-colors shadow-lg shadow-[#402F75]/25"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        {t("backHome", { defaultValue: "Back to home" })}
                    </Link>
                    <Link
                        href={`/${lang}/shop`}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#FBBB14] text-[#1a0f40] text-[14px] font-bold hover:bg-[#f0b000] transition-colors shadow-lg shadow-[#FBBB14]/25"
                    >
                        {t("browseShop", { defaultValue: "Browse the shop" })}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
