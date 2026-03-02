"use client";

import { useTranslation } from "react-i18next";
import BannerBg from "@/assets/banner/banner.png";

const CATEGORY_KEYS = ["laptops", "smartphones", "tablets", "gaming", "accessories"] as const;

export default function Banner() {
    const { t } = useTranslation("banner");

    const stats = [
        { value: t("stats.devicesValue"),   label: t("stats.devicesLabel") },
        { value: t("stats.customersValue"), label: t("stats.customersLabel") },
        { value: t("stats.shippingValue"),  label: t("stats.shippingLabel") },
    ];

    return (
        <section className="relative w-[95%] md:w-[90%] mt-3 md:mt-6 overflow-hidden rounded-3xl">
            {/* Background image */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `url(${BannerBg.src})`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                }}
            />

            {/* Left-to-right dark gradient for text legibility */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        "linear-gradient(100deg, rgba(25,16,60,0.95) 0%, rgba(40,28,90,0.85) 35%, rgba(40,28,90,0.50) 60%, transparent 100%)",
                }}
            />

            {/* Subtle bottom vignette */}
            <div
                className="absolute inset-0"
                style={{
                    background: "linear-gradient(to top, rgba(15,10,40,0.55) 0%, transparent 40%)",
                }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col justify-between min-h-[280px] sm:min-h-[400px] md:min-h-[530px] lg:min-h-[660px] px-6 sm:px-10 md:px-14 lg:px-20 py-7 sm:py-10 md:py-14">

                {/* ── Top row: badge + category pills ── */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-[#402F75] bg-[#FBBB14] px-3 py-1.5 rounded-full w-fit tracking-wide">
                        {t("flashSaleBadge")}
                    </span>
                    <div className="hidden sm:flex items-center gap-2 flex-wrap">
                        {CATEGORY_KEYS.map((key) => (
                            <a
                                key={key}
                                href="#"
                                className="text-white/70 hover:text-white text-[12px] font-medium transition-all px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 hover:border-white/35 backdrop-blur-sm"
                            >
                                {t(`categories.${key}`)}
                            </a>
                        ))}
                    </div>
                </div>

                {/* ── Middle: headline + subtitle + CTAs ── */}
                <div className="flex flex-col max-w-[500px] mt-6 md:mt-0 md:my-auto">
                    <p className="text-white/50 text-[10px] sm:text-[12px] font-semibold tracking-[0.2em] uppercase mb-2 sm:mb-3">
                        {t("eyebrow")}
                    </p>
                    <h1 className="text-[28px] sm:text-[38px] md:text-[50px] lg:text-[60px] font-extrabold text-white leading-[1.05] mb-3 sm:mb-5">
                        {t("headlineLine1")}
                        <br />
                        <span style={{ color: "#FBBB14" }}>{t("headlineLine2")}</span>
                    </h1>
                    <p className="text-white/60 text-[13px] sm:text-[15px] leading-relaxed mb-6 sm:mb-8 max-w-[340px]">
                        {t("subtitle")}
                    </p>

                    {/* CTA buttons */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <a
                            href="#"
                            className="flex items-center gap-2 text-[13px] sm:text-[15px] font-bold text-[#402F75] px-5 sm:px-7 py-2.5 sm:py-3 rounded-full transition-all duration-200 hover:opacity-90 hover:shadow-2xl active:scale-95"
                            style={{ backgroundColor: "#FBBB14" }}
                        >
                            {t("shopNow")}
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-4 h-4"
                            >
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                            </svg>
                        </a>
                        <a
                            href="#"
                            className="text-[13px] sm:text-[15px] font-semibold text-white px-5 sm:px-7 py-2.5 sm:py-3 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:border-white/50"
                        >
                            {t("browseDeals")}
                        </a>
                    </div>
                </div>

                {/* ── Bottom row: stats + app store badges ── */}
                <div className="flex items-end justify-between mt-6 sm:mt-8">
                    {/* Stats */}
                    <div className="flex items-center gap-5 sm:gap-8">
                        {stats.map((stat, i) => (
                            <div key={i} className="flex flex-col">
                                <span className="text-white font-extrabold text-[18px] sm:text-[22px] leading-none">
                                    {stat.value}
                                </span>
                                <span className="text-white/45 text-[11px] sm:text-[12px] mt-0.5">
                                    {stat.label}
                                </span>
                            </div>
                        ))}

                    </div>

                    {/* App store badges */}
                    <div className="flex flex-col items-end gap-1.5">
                        <a
                            href="#"
                            aria-label={t("appStore")}
                            className="transition-transform hover:scale-105"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                                alt={t("appStore")}
                                className="w-[88px] sm:w-[108px] md:w-[128px]"
                            />
                        </a>
                        <a
                            href="#"
                            aria-label={t("googlePlay")}
                            className="transition-transform hover:scale-105"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                                alt={t("googlePlay")}
                                className="w-[88px] sm:w-[108px] md:w-[128px]"
                            />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
