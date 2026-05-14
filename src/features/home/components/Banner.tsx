"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import BannerBg from "@/assets/banner/banner.png";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";
import type { RootState } from "@/store";
import { getBanners, type ApiBanner } from "@/features/home/services/bannerService";

const CATEGORY_KEYS = ["laptops", "smartphones", "tablets", "gaming", "accessories"] as const;

const isExternal = (url: string) => /^https?:\/\//i.test(url);

function buildInternalHref(lang: Lang, url: string): string {
    const path = url.startsWith("/") ? url : `/${url}`;
    return `/${lang}${path}`;
}

export default function Banner() {
    const { t } = useTranslation("banner");
    const router = useRouter();
    const lang = (useSelector((state: RootState) => state.language.lang) as Lang) ?? "en";
    const shopSlug = PATH_SLUGS.shop?.[lang] ?? "shop";

    const [banners, setBanners] = useState<ApiBanner[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        let mounted = true;
        getBanners(lang)
            .then((list) => {
                if (mounted) setBanners(list);
            })
            .catch(() => {});
        return () => {
            mounted = false;
        };
    }, [lang]);

    useEffect(() => {
        if (banners.length <= 1) return;
        const id = window.setInterval(() => {
            setActiveIndex((i) => (i + 1) % banners.length);
        }, 5000);
        return () => window.clearInterval(id);
    }, [banners.length]);

    const stats = [
        { value: t("stats.devicesValue"),   label: t("stats.devicesLabel") },
        { value: t("stats.customersValue"), label: t("stats.customersLabel") },
        { value: t("stats.shippingValue"),  label: t("stats.shippingLabel") },
    ];

    const currentBanner = banners[activeIndex];
    const backgroundUrl = currentBanner?.backgroundImageUrl ?? BannerBg.src;
    const overlayText = currentBanner?.text ?? null;
    const buttonLabel = currentBanner?.buttonLabel ?? null;
    const buttonUrl = currentBanner?.buttonUrl ?? null;
    const showApiCta = !!(buttonLabel && buttonUrl);

    const arrowIcon = (
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
    );

    const ctaButtonClass =
        "flex items-center gap-2 text-[13px] sm:text-[15px] font-bold text-[#402F75] px-5 sm:px-7 py-2.5 sm:py-3 rounded-full transition-all duration-200 hover:opacity-90 hover:shadow-2xl active:scale-95 cursor-pointer";

    return (
        <section className="relative w-[95%] md:w-[90%] mt-3 md:mt-6 overflow-hidden rounded-3xl">
            {/* Background image */}
            <div
                className="absolute inset-0 transition-[background-image] duration-700"
                style={{
                    backgroundImage: `url(${backgroundUrl})`,
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
                            <button
                                key={key}
                                onClick={() => router.push(`/${lang}/${shopSlug}?category=${key}`)}
                                className="text-white/70 hover:text-white text-[12px] font-medium transition-all px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 hover:border-white/35 backdrop-blur-sm cursor-pointer"
                            >
                                {t(`categories.${key}`)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Middle: headline + subtitle + CTAs ── */}
                <div className="flex flex-col max-w-[500px] mt-6 md:mt-0 md:my-auto">
                    <p className="text-white/50 text-[10px] sm:text-[12px] font-semibold tracking-[0.2em] uppercase mb-2 sm:mb-3">
                        {t("eyebrow")}
                    </p>
                    {overlayText ? (
                        <h1 className="text-[26px] sm:text-[34px] md:text-[44px] lg:text-[54px] font-extrabold text-white leading-[1.1] mb-3 sm:mb-5 whitespace-pre-line">
                            {overlayText}
                        </h1>
                    ) : (
                        <h1 className="text-[28px] sm:text-[38px] md:text-[50px] lg:text-[60px] font-extrabold text-white leading-[1.05] mb-3 sm:mb-5">
                            {t("headlineLine1")}
                            <br />
                            <span style={{ color: "#FBBB14" }}>{t("headlineLine2")}</span>
                        </h1>
                    )}
                    {!overlayText && (
                        <p className="text-white/60 text-[13px] sm:text-[15px] leading-relaxed mb-6 sm:mb-8 max-w-[340px]">
                            {t("subtitle")}
                        </p>
                    )}

                    {/* CTA buttons */}
                    <div className="flex items-center gap-3 flex-wrap">
                        {showApiCta ? (
                            isExternal(buttonUrl!) ? (
                                <a
                                    href={buttonUrl!}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={ctaButtonClass}
                                    style={{ backgroundColor: "#FBBB14" }}
                                >
                                    {buttonLabel}
                                    {arrowIcon}
                                </a>
                            ) : (
                                <Link
                                    href={buildInternalHref(lang, buttonUrl!)}
                                    className={ctaButtonClass}
                                    style={{ backgroundColor: "#FBBB14" }}
                                >
                                    {buttonLabel}
                                    {arrowIcon}
                                </Link>
                            )
                        ) : (
                            <>
                                <button
                                    onClick={() => router.push(`/${lang}/${shopSlug}`)}
                                    className={ctaButtonClass}
                                    style={{ backgroundColor: "#FBBB14" }}
                                >
                                    {t("shopNow")}
                                    {arrowIcon}
                                </button>
                                <button
                                    onClick={() => router.push(`/${lang}/${shopSlug}`)}
                                    className="text-[13px] sm:text-[15px] font-semibold text-white px-5 sm:px-7 py-2.5 sm:py-3 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:border-white/50 cursor-pointer"
                                >
                                    {t("browseDeals")}
                                </button>
                            </>
                        )}
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

                {/* Pagination dots when multiple banners */}
                {banners.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                        {banners.map((_, i) => (
                            <button
                                key={i}
                                aria-label={`Banner ${i + 1}`}
                                onClick={() => setActiveIndex(i)}
                                className={`h-1.5 rounded-full transition-all ${
                                    i === activeIndex ? "w-6 bg-white" : "w-1.5 bg-white/40"
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
