"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";

export default function FavouritesEmptyItems() {
    const { t } = useTranslation("favourites");
    const lang = useSelector(
        (state: { language: { lang: Lang } }) => state.language.lang
    );

    const shopSlug = PATH_SLUGS["shop"]?.[lang] ?? "shop";

    return (
        <div className="flex-1 flex items-center justify-center py-[60px] px-[20px] bg-white rounded-[20px]">
            <div className="flex flex-col items-center text-center gap-[20px] max-w-[400px]">
                <div className="w-[80px] h-[80px] rounded-full bg-[#F6F4FF] flex items-center justify-center">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                </div>
                <div className="flex flex-col gap-[8px]">
                    <h2 className="text-[20px] font-bold text-gray-900">{t("empty.title")}</h2>
                    <p className="text-[14px] text-gray-500 leading-relaxed">{t("empty.subtitle")}</p>
                </div>
                <Link href={`/${lang}/${shopSlug}`}>
                    <button className="bg-[#402F75] text-white rounded-[30px] px-[28px] py-[11px] text-[14px] font-bold hover:bg-[#352667] transition-colors cursor-pointer">
                        {t("empty.browse")}
                    </button>
                </Link>
            </div>
        </div>
    );
}
