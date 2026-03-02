"use client";

import { useTranslation } from "react-i18next";

const STAT_ICONS = [
    <svg key="customers" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>,
    <svg key="devices" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
    </svg>,
    <svg key="delivery" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3" />
        <rect x="9" y="11" width="14" height="10" rx="2" />
        <circle cx="12" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
    </svg>,
    <svg key="rating" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>,
];

const STAT_KEYS = ["customers", "devices", "delivery", "rating"] as const;

export default function TrustStats() {
    const { t } = useTranslation("home");

    return (
        <section className="w-full flex items-center justify-center mt-[30px] md:mt-[50px]">
            <div
                className="w-[95%] md:w-[90%] rounded-3xl px-6 sm:px-10 md:px-16 py-10 md:py-14"
                style={{
                    background: "linear-gradient(135deg, #402F75 0%, #5a4299 50%, #6b53af 100%)",
                }}
            >
                <div className="text-center mb-8 md:mb-10">
                    <span className="inline-flex items-center text-[11px] font-semibold text-[#FBBB14] bg-white/10 px-3 py-[5px] rounded-full mb-3">
                        {t("trustStats.label")}
                    </span>
                    <h2 className="text-[22px] sm:text-[26px] md:text-[30px] font-bold text-white leading-tight">
                        {t("trustStats.title")}
                    </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {STAT_KEYS.map((key, i) => (
                        <div
                            key={key}
                            className="flex flex-col items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl py-6 px-4 text-center"
                        >
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#FBBB14]/20 text-[#FBBB14]">
                                {STAT_ICONS[i]}
                            </div>
                            <div>
                                <p className="text-[28px] sm:text-[32px] md:text-[36px] font-extrabold text-white leading-none">
                                    {t(`trustStats.${key}.value`)}
                                </p>
                                <p className="text-white/60 text-[12px] sm:text-[13px] mt-1 font-medium">
                                    {t(`trustStats.${key}.label`)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
