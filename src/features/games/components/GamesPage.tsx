"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";

function GamesIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <path d="M6 12h4" />
            <path d="M8 10v4" />
            <circle cx="15" cy="10" r="1" fill="white" />
            <circle cx="17" cy="12" r="1" fill="white" />
        </svg>
    );
}

function TokenIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FBBB14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="8" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
    );
}

function CurveDecoration({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            width="905"
            height="152"
            viewBox="0 0 905 152"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path
                d="M0.896484 31.636C20.0632 34.8026 87.9965 38.536 110.396 106.136C132.796 173.736 224.063 139.969 273.896 114.636C282.063 80.4693 316.296 31.636 363.896 31.636C411.496 31.636 469.23 71.9693 508.396 106.136C525.063 108.469 592.896 103.636 624.896 31.636C656.896 -40.364 721.396 62.5882 786.396 31.636C851.396 0.683779 910.396 99.6359 897.396 145.636"
                stroke="#402F75"
                strokeWidth="11"
            />
        </svg>
    );
}

export default function GamesPage() {
    const { t } = useTranslation("games");

    return (
        <>
            <Header />
            <main className="relative w-full min-h-[80vh] overflow-hidden bg-gray-50/50">
                {/* Top curve decoration */}
                <div className="absolute top-0 start-0 w-full pointer-events-none select-none opacity-[0.05]" aria-hidden="true">
                    <CurveDecoration className="w-full" />
                </div>

                <div className="relative z-10 w-[92%] md:w-[88%] lg:w-[82%] mx-auto py-12 md:py-20 flex flex-col gap-8">
                    
                    {/* ── Main Hero Section ── */}
                    <div className="relative bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 md:p-14 overflow-hidden text-center flex flex-col items-center">
                        {/* Subtle bg curve */}
                        <div className="absolute bottom-0 end-0 w-[50%] pointer-events-none select-none opacity-[0.03]" aria-hidden="true">
                            <CurveDecoration className="w-full" />
                        </div>

                        {/* Icon Badge */}
                        <div className="w-[80px] h-[80px] rounded-3xl bg-[#402F75] flex items-center justify-center shadow-xl mb-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                            <GamesIcon />
                        </div>

                        <h1 className="text-[32px] md:text-[48px] font-black text-[#1a0f40] leading-tight mb-4 tracking-tight">
                            {t("title")}
                        </h1>
                        
                        <p className="text-gray-500 text-[16px] md:text-[18px] leading-relaxed max-w-2xl mb-10">
                            {t("description")}
                        </p>

                        <div className="inline-flex items-center gap-3 bg-[#EDE9FF] text-[#402F75] text-[14px] font-bold px-5 py-2.5 rounded-2xl shadow-sm">
                            <TokenIcon />
                            <span>{t("downloadApp")}</span>
                        </div>
                    </div>

                    {/* ── Mobile Exclusive Section ── */}
                    <div className="relative bg-[#2D1F5E] rounded-[40px] overflow-hidden p-10 md:p-16 text-center">
                        {/* Decorative elements */}
                        <div className="absolute -bottom-10 -start-10 w-64 h-64 rounded-full bg-[#402F75] opacity-30" aria-hidden="true" />
                        <div className="absolute -top-12 -end-12 w-48 h-48 rounded-full bg-[#FBBB14] opacity-10" aria-hidden="true" />
                        
                        <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto gap-6">
                            <div className="bg-[#FBBB14] text-[#1a0f40] text-[12px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider mb-2 shadow-lg">
                                {t("mobileOnlyTitle")}
                            </div>
                            
                            <h2 className="text-white text-[24px] md:text-[36px] font-bold leading-tight">
                                {t("mobileOnlyTitle")}
                            </h2>
                            
                            <p className="text-white/70 text-[15px] md:text-[17px] leading-relaxed">
                                {t("mobileOnlyDescription")}
                            </p>

                            <div className="flex flex-wrap justify-center gap-4 mt-4">
                                <a
                                    href="#"
                                    aria-label={t("appStore")}
                                    className="transition-all hover:scale-105 active:scale-95 shadow-xl hover:shadow-[#00000040]"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                                        alt={t("appStore")}
                                        className="h-[48px] md:h-[56px] w-auto"
                                    />
                                </a>
                                <a
                                    href="#"
                                    aria-label={t("googlePlay")}
                                    className="transition-all hover:scale-105 active:scale-95 shadow-xl hover:shadow-[#00000040]"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                                        alt={t("googlePlay")}
                                        className="h-[48px] md:h-[56px] w-auto"
                                    />
                                </a>
                            </div>
                        </div>

                        {/* Bottom curve decoration */}
                        <div className="absolute bottom-0 start-0 w-full pointer-events-none select-none opacity-[0.06]" aria-hidden="true">
                            <CurveDecoration className="w-full" />
                        </div>
                    </div>

                </div>

                {/* Background curve decoration at the bottom */}
                <div className="absolute bottom-[-100px] start-0 w-full pointer-events-none select-none opacity-[0.05]" aria-hidden="true">
                    <CurveDecoration className="w-full" />
                </div>
            </main>
            <Footer />
        </>
    );
}
