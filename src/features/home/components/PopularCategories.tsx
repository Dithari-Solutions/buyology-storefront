"use client";

import { useTranslation } from "react-i18next";

const CATEGORY_KEYS = [
    {
        key: "laptops",
        bg: "#EDE9FF",
        iconBg: "#402F75",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 sm:w-7 sm:h-7">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M0 21h24" />
                <path d="M8 21l2-4h4l2 4" />
            </svg>
        ),
    },
    {
        key: "smartphones",
        bg: "#FFF8E6",
        iconBg: "#c08a00",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 sm:w-7 sm:h-7">
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <circle cx="12" cy="17" r="1" fill="white" stroke="none" />
            </svg>
        ),
    },
    {
        key: "tablets",
        bg: "#E8F4FF",
        iconBg: "#1a6fa8",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 sm:w-7 sm:h-7">
                <rect x="3" y="2" width="18" height="20" rx="2" />
                <circle cx="12" cy="18" r="1" fill="white" stroke="none" />
            </svg>
        ),
    },
    {
        key: "accessories",
        bg: "#EAFAF1",
        iconBg: "#27ae60",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 sm:w-7 sm:h-7">
                <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
            </svg>
        ),
    },
    {
        key: "refurbished",
        bg: "#F0F4FF",
        iconBg: "#402F75",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 sm:w-7 sm:h-7">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
        ),
    },
    {
        key: "gaming",
        bg: "#F5E6FF",
        iconBg: "#7c3aed",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 sm:w-7 sm:h-7">
                <path d="M6 11h4M8 9v4M15 12h.01M18 12h.01M5 7h14a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2z" />
            </svg>
        ),
    },
] as const;

export default function PopularCategories() {
    const { t } = useTranslation("home");

    return (
        <section className="w-full flex flex-col items-center mt-[30px] md:mt-[50px]">
            <div className="w-[95%] md:w-[90%] flex items-end justify-between mb-[15px] md:mb-[20px]">
                <div>
                    <span className="inline-flex items-center text-[11px] font-semibold text-[#402F75] bg-[#EDE9FF] px-3 py-[5px] rounded-full mb-2">
                        {t("categories.label")}
                    </span>
                    <h2 className="text-[22px] sm:text-[26px] md:text-[30px] font-bold leading-tight">
                        {t("categories.title")}
                    </h2>
                    <p className="text-gray-500 text-[13px] md:text-[15px] mt-1 max-w-md">
                        {t("categories.subtitle")}
                    </p>
                </div>
                <a href="#" className="hidden sm:flex items-center gap-1 text-[13px] font-semibold text-[#402F75] hover:underline whitespace-nowrap mb-1 flex-shrink-0 ms-4">
                    {t("categories.seeAll")} <span>→</span>
                </a>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4 w-[95%] md:w-[90%]">
                {CATEGORY_KEYS.map((cat) => (
                    <a
                        key={cat.key}
                        href="#"
                        className="group flex flex-col items-center justify-center gap-3 py-5 px-3 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                        style={{ backgroundColor: cat.bg }}
                    >
                        <div
                            className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl transition-transform duration-300 group-hover:scale-110"
                            style={{ backgroundColor: cat.iconBg }}
                        >
                            {cat.icon}
                        </div>
                        <div className="text-center">
                            <p className="font-semibold text-[13px] sm:text-[14px] text-gray-800">
                                {t(`categories.${cat.key}.name`)}
                            </p>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                                {t(`categories.${cat.key}.count`)}
                            </p>
                        </div>
                    </a>
                ))}
            </div>
        </section>
    );
}
