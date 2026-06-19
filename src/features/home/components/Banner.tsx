"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";
import type { RootState } from "@/store";
import { getBanners, type ApiBanner } from "@/features/home/services/bannerService";

const isExternal = (url: string) => /^https?:\/\//i.test(url);

function buildInternalHref(lang: Lang, url: string): string {
    const path = url.startsWith("/") ? url : `/${url}`;
    return `/${lang}${path}`;
}

export default function Banner() {
    const { t } = useTranslation("banner");
    const router = useRouter();
    const lang = (useSelector((state: RootState) => state.language.lang) as Lang) ?? "en";
    const isRtl = lang === "ar";
    const shopSlug = PATH_SLUGS.shop?.[lang] ?? "shop";

    const [banners, setBanners] = useState<ApiBanner[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const [hidden, setHidden] = useState(() => typeof document !== "undefined" && document.hidden);
    const paused = hovered || focused || hidden;

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

    // Autoplay — resets on every slide change (so manual clicks stay in sync with
    // the progress bar) and pauses on hover/focus/tab-hidden.
    useEffect(() => {
        if (banners.length <= 1 || paused) return;
        const id = window.setInterval(() => {
            setActiveIndex((i) => (i + 1) % banners.length);
        }, 5000);
        return () => window.clearInterval(id);
    }, [banners.length, paused, activeIndex]);

    useEffect(() => {
        const onVis = () => setHidden(document.hidden);
        onVis();
        document.addEventListener("visibilitychange", onVis);
        return () => document.removeEventListener("visibilitychange", onVis);
    }, []);

    const stats = [
        { value: t("stats.devicesValue"),   label: t("stats.devicesLabel") },
        { value: t("stats.customersValue"), label: t("stats.customersLabel") },
        { value: t("stats.shippingValue"),  label: t("stats.shippingLabel") },
    ];

    const currentBanner = banners[activeIndex];
    const remoteBackground = currentBanner?.backgroundImageUrl ?? null;
    const overlayText = currentBanner?.text ?? null;
    const buttonLabel = currentBanner?.buttonLabel ?? null;
    const buttonUrl = currentBanner?.buttonUrl ?? null;
    const showApiCta = !!(buttonLabel && buttonUrl);
    const hasImage = !!remoteBackground;

    const arrowIcon = (
        <svg
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 rtl:-scale-x-100"
        >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
        </svg>
    );

    const focusRing = "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#2e1065]";

    // Gold primary CTA with a hover sheen sweep (CSS-only, no JS).
    const goldClass =
        `group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-[#FBBB14] text-[#402F75] text-[13px] sm:text-[15px] font-bold px-5 sm:px-7 py-2.5 sm:py-3 shadow-[0_10px_30px_-8px_rgba(251,187,20,0.65)] transition-all duration-200 hover:shadow-[0_16px_44px_-8px_rgba(251,187,20,0.9)] active:scale-95 cursor-pointer ${focusRing} focus-visible:ring-white`;
    const goldInner = (label: React.ReactNode) => (
        <>
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/45 to-transparent" />
            <span className="relative">{label}</span>
            <span className="relative">{arrowIcon}</span>
        </>
    );

    const imageScrim = isRtl
        ? "linear-gradient(260deg, rgba(20,14,48,0.92) 0%, rgba(40,28,90,0.72) 42%, rgba(40,28,90,0.30) 70%, transparent 100%)"
        : "linear-gradient(100deg, rgba(20,14,48,0.92) 0%, rgba(40,28,90,0.72) 42%, rgba(40,28,90,0.30) 70%, transparent 100%)";

    const appBadge = (src: string, label: string, sizeClass: string) => (
        <span className="block">
            <Image src={src} alt={label} width={128} height={42} loading="lazy" unoptimized className={`${sizeClass} h-auto`} />
        </span>
    );

    return (
        <section
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocusCapture={() => setFocused(true)}
            onBlurCapture={() => setFocused(false)}
            className="relative w-[95%] md:w-[90%] mt-3 md:mt-6 overflow-hidden rounded-3xl"
        >
            {/* ── Layer 1: background (remote image OR static aurora) ── */}
            <div className="absolute inset-0">
                {hasImage ? (
                    <Image
                        key={remoteBackground}
                        src={remoteBackground!}
                        alt=""
                        fill
                        priority={activeIndex === 0}
                        unoptimized
                        sizes="(max-width: 768px) 95vw, 90vw"
                        className="object-cover transition-opacity duration-700"
                    />
                ) : (
                    <>
                        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #2e1065 0%, #402F75 48%, #5b21b6 100%)" }} />
                        <div
                            className="absolute inset-0"
                            style={{
                                background:
                                    "radial-gradient(42% 52% at 18% 26%, rgba(251,187,20,0.30), transparent 60%), radial-gradient(46% 56% at 84% 20%, rgba(124,58,237,0.55), transparent 62%), radial-gradient(54% 62% at 72% 90%, rgba(251,187,20,0.16), transparent 60%)",
                            }}
                        />
                        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1.4px)", backgroundSize: "18px 18px" }} />
                        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, transparent 28%)" }} />
                    </>
                )}
            </div>

            {/* ── Layer 2: scrims ── */}
            {hasImage && (
                <>
                    <div className="absolute inset-0" style={{ background: imageScrim }} />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(15,10,40,0.6) 0%, transparent 42%)" }} />
                </>
            )}
            {/* Top scrim for a subtle dark floor along the top edge */}
            <div className="absolute inset-x-0 top-0 h-24" style={{ background: "linear-gradient(to bottom, rgba(15,10,40,0.5) 0%, transparent 100%)" }} />

            {/* ── Layer 3: floating accent orbs (aurora state only) ── */}
            {!hasImage && (
                <>
                    <div className="pointer-events-none absolute -top-10 end-[8%] w-56 h-56 rounded-full bg-[#FBBB14]/25 blur-2xl buyo-orb" />
                    <div className="pointer-events-none absolute -bottom-16 start-[6%] w-72 h-72 rounded-full bg-[#7c3aed]/40 blur-2xl buyo-orb-alt" />
                </>
            )}

            {/* ── Layer 4: content ── */}
            <div className="relative z-10 flex flex-col min-h-[280px] sm:min-h-[400px] md:min-h-[530px] lg:min-h-[660px] px-6 sm:px-10 md:px-14 lg:px-16 py-7 sm:py-9 md:py-12">

                {/* Main: glass panel (start) + app badges (end, desktop) */}
                <div className="flex-1 grid items-center gap-8 my-6 lg:my-0 lg:grid-cols-[minmax(0,560px)_1fr]">
                    {/* Frosted dark-glass content panel — its own dark tint guarantees
                        AA legibility over any banner image or aurora region. */}
                    <div className="relative w-full max-w-[560px] lg:max-w-none rounded-2xl bg-[rgba(17,11,38,0.72)] sm:backdrop-blur-md md:backdrop-blur-xl ring-1 ring-white/15 shadow-[0_8px_40px_rgba(15,10,40,0.45)] px-6 sm:px-8 md:px-10 pt-8 sm:pt-9 pb-7 md:pb-9">
                        {/* subtle top sheen keeps it feeling like glass */}
                        <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-2xl bg-gradient-to-b from-white/[0.07] to-transparent" />
                        {/* Flash-sale notch tab on the top edge */}
                        <span className="absolute -top-3 start-6 sm:start-8 inline-flex items-center gap-1.5 text-[11px] font-extrabold text-[#402F75] bg-[#FBBB14] px-3 py-1.5 rounded-full shadow-[0_6px_18px_-4px_rgba(251,187,20,0.8)] tracking-wide whitespace-nowrap">
                            {t("flashSaleBadge")}
                        </span>

                        <p className="relative text-white/70 text-[10px] sm:text-[12px] font-semibold tracking-[0.2em] uppercase mb-2.5">
                            {t("eyebrow")}
                        </p>

                        {overlayText ? (
                            <h1 className="relative text-[26px] sm:text-[34px] md:text-[44px] lg:text-[52px] font-extrabold text-white leading-[1.1] text-balance whitespace-pre-line line-clamp-3">
                                {overlayText}
                            </h1>
                        ) : (
                            <h1 className="relative text-[28px] sm:text-[38px] md:text-[48px] lg:text-[56px] font-extrabold text-white leading-[1.05] text-balance">
                                {t("headlineLine1")}
                                <br />
                                <span className="text-[#FBBB14] drop-shadow-[0_1px_3px_rgba(10,6,30,0.55)]">{t("headlineLine2")}</span>
                            </h1>
                        )}

                        {!overlayText && (
                            <p className="relative text-white/80 text-[13px] sm:text-[15px] leading-relaxed mt-3 sm:mt-4 max-w-[360px]">
                                {t("subtitle")}
                            </p>
                        )}

                        {/* CTAs */}
                        <div className="relative flex items-center gap-3 flex-wrap mt-6 sm:mt-7">
                            {showApiCta ? (
                                isExternal(buttonUrl!) ? (
                                    <a href={buttonUrl!} target="_blank" rel="noopener noreferrer" className={goldClass}>
                                        {goldInner(buttonLabel)}
                                    </a>
                                ) : (
                                    <Link href={buildInternalHref(lang, buttonUrl!)} className={goldClass}>
                                        {goldInner(buttonLabel)}
                                    </Link>
                                )
                            ) : (
                                <>
                                    <button onClick={() => router.push(`/${lang}/${shopSlug}`)} className={goldClass}>
                                        {goldInner(t("shopNow"))}
                                    </button>
                                    <button
                                        onClick={() => router.push(`/${lang}/${shopSlug}`)}
                                        className={`text-[13px] sm:text-[15px] font-semibold text-white px-5 sm:px-7 py-2.5 sm:py-3 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:border-white/50 cursor-pointer ${focusRing} focus-visible:ring-white`}
                                    >
                                        {t("browseDeals")}
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Stat chips */}
                        <div className="relative flex items-center gap-2 flex-wrap mt-6 sm:mt-7">
                            {stats.map((stat, i) => (
                                <span key={i} className="inline-flex items-baseline gap-1.5 rounded-full bg-white/10 ring-1 ring-white/15 px-3 py-1.5">
                                    <span className="text-white font-extrabold text-[14px] sm:text-[16px] leading-none">{stat.value}</span>
                                    <span className="text-white/70 text-[10px] sm:text-[11px]">{stat.label}</span>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* App badges — desktop, bottom-end of the right column (non-interactive: store links pending) */}
                    <div className="hidden lg:flex flex-col items-end justify-end self-stretch gap-2.5 pb-1">
                        {appBadge("/app-store-badge.svg", t("appStore"), "w-[128px]")}
                        {appBadge("/google-play-badge.svg", t("googlePlay"), "w-[128px]")}
                    </div>
                </div>

                {/* App badges — mobile/tablet, below the panel */}
                <div className="flex lg:hidden items-center gap-2.5">
                    {appBadge("/app-store-badge.svg", t("appStore"), "w-[100px] sm:w-[118px]")}
                    {appBadge("/google-play-badge.svg", t("googlePlay"), "w-[100px] sm:w-[118px]")}
                </div>

                {/* Pagination — bars double as a 5s autoplay progress timer.
                    Container height is always reserved to avoid a shift when bars appear. */}
                <div className="flex items-center justify-center gap-2 mt-6 h-6">
                    {banners.length > 1 &&
                        banners.map((_, i) => {
                            const active = i === activeIndex;
                            return (
                                <button
                                    key={i}
                                    type="button"
                                    aria-label={`Go to slide ${i + 1}`}
                                    aria-current={active}
                                    onClick={() => setActiveIndex(i)}
                                    className={`group relative flex items-center justify-center h-6 cursor-pointer rounded-full ${focusRing} focus-visible:ring-white`}
                                    style={{ width: active ? 38 : 22 }}
                                >
                                    <span className="relative h-1.5 w-full rounded-full overflow-hidden bg-white/30">
                                        {active && (
                                            <span
                                                key={`${activeIndex}-${paused}`}
                                                aria-hidden="true"
                                                className="absolute inset-0 bg-white rounded-full buyo-progress"
                                                style={{ animationPlayState: paused ? "paused" : "running" }}
                                            />
                                        )}
                                    </span>
                                </button>
                            );
                        })}
                </div>
            </div>
        </section>
    );
}
