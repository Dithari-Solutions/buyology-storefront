"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";

export default function FavouritesGuest() {
    const { t } = useTranslation("favourites");
    const lang = useSelector(
        (state: { language: { lang: Lang } }) => state.language.lang
    );

    const authSlug = PATH_SLUGS["auth"]?.[lang] ?? "auth";

    return (
        <div className="flex-1 flex items-center justify-center py-[60px] px-[20px]">
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 max-w-[600px] w-full px-[40px] py-[48px] flex flex-col items-center text-center gap-[24px]">
                {/* Heart icon */}
                <div className="w-[80px] h-[80px] rounded-full bg-[#F6F4FF] flex items-center justify-center">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                </div>

                {/* Title + subtitle */}
                <div className="flex flex-col gap-[10px]">
                    <h1 className="text-[22px] font-bold text-gray-900">{t("guest.title")}</h1>
                    <p className="text-[14px] text-gray-500 leading-relaxed max-w-[400px]">
                        {t("guest.subtitle")}
                    </p>
                </div>

                {/* Feature pills */}
                <div className="flex flex-wrap items-center justify-center gap-[10px]">
                    <div className="flex items-center gap-[8px] border border-gray-200 rounded-[30px] px-[14px] py-[8px] text-[13px] text-gray-600">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        {t("guest.feature1")}
                    </div>
                    <div className="flex items-center gap-[8px] border border-gray-200 rounded-[30px] px-[14px] py-[8px] text-[13px] text-gray-600">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="17 1 21 5 17 9" />
                            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                            <polyline points="7 23 3 19 7 15" />
                            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                        </svg>
                        {t("guest.feature2")}
                    </div>
                    <div className="flex items-center gap-[8px] border border-gray-200 rounded-[30px] px-[14px] py-[8px] text-[13px] text-gray-600">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FBBB14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        {t("guest.feature3")}
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-[12px] flex-wrap justify-center">
                    <Link href={`/${lang}/${authSlug}`}>
                        <button className="flex items-center gap-[8px] bg-[#402F75] text-white rounded-[30px] px-[28px] py-[11px] text-[14px] font-bold hover:bg-[#352667] transition-colors cursor-pointer">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                <polyline points="10 17 15 12 10 7" />
                                <line x1="15" y1="12" x2="3" y2="12" />
                            </svg>
                            {t("guest.signIn")}
                        </button>
                    </Link>
                    <Link href={`/${lang}/${authSlug}`}>
                        <button className="bg-[#FBBB14] text-white rounded-[30px] px-[28px] py-[11px] text-[14px] font-bold hover:bg-[#f0b000] transition-colors cursor-pointer">
                            {t("guest.createAccount")}
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
