"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { setLanguage } from "@/store/languageSlice";
import i18n from "@/shared/i18n";
import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";
import CircleSvg from "@/assets/not-found/circle.svg";
import NotFoundVector from "@/assets/vectors/not-found-vector.svg";
import ArrowLeft from "@/assets/icons/arrow-left.svg";
import SearchIconSvg from "@/assets/icons/searchicon.svg";

const VALID_LANGS: Lang[] = ["en", "az", "ar"];

function detectLang(pathname: string | null): Lang {
    const segment = pathname?.split("/")[1] ?? "";
    return VALID_LANGS.includes(segment as Lang) ? (segment as Lang) : "en";
}

export default function NotFound() {
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useDispatch();
    const lang = detectLang(pathname);
    const { t } = useTranslation("notFound");
    const [search, setSearch] = useState("");

    useEffect(() => {
        dispatch(setLanguage(lang));
        i18n.changeLanguage(lang);
    }, [lang, dispatch]);

    const shopSlug = PATH_SLUGS.shop?.[lang] ?? "shop";
    const favSlug = PATH_SLUGS.favourites?.[lang] ?? "favourites";

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (search.trim()) {
            router.push(`/${lang}/${shopSlug}?q=${encodeURIComponent(search.trim())}`);
        }
    }

    return (
        <>
            <Header />
            <main
                className="relative min-h-screen flex flex-col items-center justify-center py-14 px-4 overflow-hidden"
                style={{ backgroundColor: "#F7F7F7" }}
            >
                {/* Decorative dots */}
                <span className="absolute top-[12%] left-[8%] w-3 h-3 rounded-full bg-[#402F75] opacity-70" />
                <span className="absolute top-[10%] right-[14%] w-2 h-2 rounded-full bg-[#FBBB14] opacity-80" />
                <span className="absolute top-[28%] right-[6%] w-2.5 h-2.5 rounded-full bg-[#402F75] opacity-40" />
                <span className="absolute top-[22%] left-[16%] w-1.5 h-1.5 rounded-full bg-[#FBBB14] opacity-60" />
                <span className="absolute bottom-[30%] left-[5%] w-5 h-5 rounded-full border-2 border-[#402F75] opacity-30" />
                <span className="absolute bottom-[28%] right-[5%] w-4 h-4 rounded-full border-2 border-[#FBBB14] opacity-40" />
                <span className="absolute top-[50%] left-[3%] w-2 h-2 rounded-full bg-[#FBBB14] opacity-50" />
                <span className="absolute top-[45%] right-[3%] w-2.5 h-2.5 rounded-full bg-[#402F75] opacity-30" />

                {/* Badge */}
                <div className="mb-8 px-4 py-1.5 rounded-full border border-gray-200 bg-white inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-gray-500 shadow-sm">
                    <span style={{ color: "#FBBB14" }}>★</span>
                    <span>{t("badge")}</span>
                </div>

                {/* 404 */}
                <div className="relative flex items-center justify-center mb-6 select-none">
                    {/* Left 4 */}
                    <span
                        className="font-black leading-none"
                        style={{
                            fontSize: "clamp(100px, 16vw, 200px)",
                            color: "#2D2A6E",
                            fontStyle: "italic",
                            letterSpacing: "-4px",
                        }}
                    >
                        4
                    </span>

                    {/* Circle asset — spins infinitely */}
                    <div
                        className="relative flex items-center justify-center mx-2"
                        style={{
                            width: "clamp(100px, 13vw, 160px)",
                            height: "clamp(100px, 13vw, 160px)",
                        }}
                    >
                        {/* Spinning circle SVG asset */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={CircleSvg.src}
                            alt=""
                            aria-hidden="true"
                            className="absolute inset-0 w-full h-full animate-spin"
                            style={{ animationDuration: "4s", transformOrigin: "center center" }}
                        />

                        {/* Static inner circle + shopping bag icon */}
                        <div
                            className="rounded-full flex items-center justify-center z-10"
                            style={{ width: "55%", height: "55%", backgroundColor: "#EDE9FF" }}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#402F75"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ width: "50%", height: "50%", minWidth: 24, minHeight: 24 }}
                            >
                                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <path d="M16 10a4 4 0 01-8 0" />
                            </svg>
                        </div>
                    </div>

                    {/* Right 4 */}
                    <span
                        className="font-black leading-none"
                        style={{
                            fontSize: "clamp(100px, 16vw, 200px)",
                            color: "#FBBB14",
                            fontStyle: "italic",
                            letterSpacing: "-4px",
                        }}
                    >
                        4
                    </span>
                </div>

                {/* Title */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-3">
                    {t("title")}
                </h1>

                {/* Wavy gold vector underline */}
                <div className="mb-6">
                    <Image
                        src={NotFoundVector}
                        alt=""
                        width={180}
                        height={6}
                        aria-hidden
                    />
                </div>

                {/* Description */}
                <p className="text-gray-500 text-center max-w-md text-sm md:text-base mb-8 leading-relaxed">
                    {t("description")}
                </p>

                {/* Search bar */}
                <form onSubmit={handleSearch} className="flex items-center gap-2 w-full max-w-sm mb-6">
                    <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2.5 shadow-sm">
                        <Image src={SearchIconSvg} alt="" width={18} height={18} aria-hidden />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t("searchPlaceholder")}
                            className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
                        style={{ backgroundColor: "#402F75" }}
                    >
                        {t("search")}
                    </button>
                </form>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
                    <Link
                        href={`/${lang}`}
                        className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
                        style={{ backgroundColor: "#402F75" }}
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                        {t("goHome")}
                    </Link>
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-opacity hover:opacity-90"
                        style={{ backgroundColor: "#FBBB14", color: "#402F75" }}
                    >
                        <Image
                            src={ArrowLeft}
                            alt=""
                            width={16}
                            height={16}
                            aria-hidden
                            style={{
                                filter: "invert(18%) sepia(63%) saturate(617%) hue-rotate(220deg) brightness(85%) contrast(95%)",
                            }}
                        />
                        {t("goBack")}
                    </button>
                </div>

                {/* Where to go */}
                <div className="w-full max-w-2xl mb-8">
                    <p className="text-xs font-semibold tracking-widest text-gray-400 text-center mb-5">
                        {t("whereToGo")}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {/* Home */}
                        <Link
                            href={`/${lang}`}
                            className="flex flex-col items-center gap-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-[#402F75] transition-colors"
                        >
                            <div
                                className="w-11 h-11 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: "#EDE9FF" }}
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                    <polyline points="9 22 9 12 15 12 15 22" />
                                </svg>
                            </div>
                            <span className="text-sm font-semibold text-gray-800 text-center">{t("cards.home.title")}</span>
                            <span className="text-xs text-gray-400 text-center leading-snug">{t("cards.home.desc")}</span>
                        </Link>

                        {/* Shop */}
                        <Link
                            href={`/${lang}/${shopSlug}`}
                            className="flex flex-col items-center gap-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-[#402F75] transition-colors"
                        >
                            <div
                                className="w-11 h-11 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: "#FFF8E1" }}
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FBBB14" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="9" cy="21" r="1" />
                                    <circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.93-1.47L23 6H6" />
                                </svg>
                            </div>
                            <span className="text-sm font-semibold text-gray-800 text-center">{t("cards.cart.title")}</span>
                            <span className="text-xs text-gray-400 text-center leading-snug">{t("cards.cart.desc")}</span>
                        </Link>

                        {/* Favourites */}
                        <Link
                            href={`/${lang}/${favSlug}`}
                            className="flex flex-col items-center gap-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-[#402F75] transition-colors"
                        >
                            <div
                                className="w-11 h-11 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: "#EDE9FF" }}
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                                </svg>
                            </div>
                            <span className="text-sm font-semibold text-gray-800 text-center">{t("cards.favourites.title")}</span>
                            <span className="text-xs text-gray-400 text-center leading-snug">{t("cards.favourites.desc")}</span>
                        </Link>

                        {/* My Account */}
                        <Link
                            href={`/${lang}`}
                            className="flex flex-col items-center gap-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-[#402F75] transition-colors"
                        >
                            <div
                                className="w-11 h-11 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: "#FFF8E1" }}
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FBBB14" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                            <span className="text-sm font-semibold text-gray-800 text-center">{t("cards.account.title")}</span>
                            <span className="text-xs text-gray-400 text-center leading-snug">{t("cards.account.desc")}</span>
                        </Link>
                    </div>
                </div>

                {/* Support banner */}
                <div
                    className="w-full max-w-2xl rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
                    style={{ backgroundColor: "#402F75" }}
                >
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FBBB14" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-white font-semibold text-sm">{t("stillLost")}</p>
                            <p className="text-purple-200 text-xs mt-0.5 max-w-xs leading-relaxed">{t("supportDesc")}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white border border-white/30 hover:bg-white/10 transition-colors">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                            {t("emailSupport")}
                        </button>
                        <button
                            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-opacity hover:opacity-90"
                            style={{ backgroundColor: "#FBBB14", color: "#402F75" }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                            </svg>
                            {t("liveChat")}
                        </button>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
