"use client";

import { useRouter, useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";

export default function QuickDeliveryBanner() {
    const { t } = useTranslation("home");
    const router = useRouter();
    const params = useParams();
    const lang = (params?.lang as Lang) ?? "en";

    function handleClick() {
        const slug = PATH_SLUGS["quick-delivery"]?.[lang] ?? "quick-delivery";
        router.push(`/${lang}/${slug}`);
    }

    return (
        <section className="w-full flex justify-center mt-[30px] md:mt-[50px]">
            <div
                onClick={handleClick}
                className="relative w-[95%] md:w-[90%] rounded-[24px] overflow-hidden cursor-pointer group"
                style={{ background: "linear-gradient(115deg, #1a0a3c 0%, #2d1660 30%, #402F75 60%, #6B45C8 85%, #8B5CF6 100%)" }}
            >
                {/* Animated glow rings */}
                <div className="absolute -top-20 -end-20 w-64 h-64 rounded-full opacity-20 bg-[#FBBB14] blur-3xl pointer-events-none" />
                <div className="absolute -bottom-16 -start-16 w-48 h-48 rounded-full opacity-15 bg-purple-400 blur-3xl pointer-events-none" />

                <div className="relative flex flex-col sm:flex-row items-center justify-between px-6 sm:px-10 md:px-[60px] py-8 md:py-[44px] gap-6">

                    {/* Left: icon + text */}
                    <div className="flex items-center gap-5 sm:gap-7">
                        {/* Lightning bolt icon */}
                        <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl bg-[#FBBB14] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <svg
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white"
                            >
                                <path d="M13 2L4.09 12.97H11L10 22L20.91 11.03H14L13 2Z" />
                            </svg>
                        </div>

                        <div className="flex flex-col items-start">
                            {/* Badge */}
                            <span className="inline-flex items-center gap-1 bg-[#FBBB14] text-white text-[11px] font-bold px-3 py-[5px] rounded-full mb-2 shadow-md">
                                {t("quickDelivery.label")}
                            </span>
                            <h2 className="text-[24px] sm:text-[28px] md:text-[34px] font-extrabold text-white leading-tight">
                                {t("quickDelivery.tagline")}
                            </h2>
                            <p className="text-white/60 text-[13px] md:text-[14px] mt-1 max-w-sm">
                                {t("quickDelivery.description")}
                            </p>
                        </div>
                    </div>

                    {/* Right: CTA */}
                    <div className="flex-shrink-0">
                        <div className="flex items-center gap-[8px] bg-[#FBBB14] hover:bg-[#f0b000] text-white font-bold text-[14px] sm:text-[15px] px-6 py-[13px] rounded-full shadow-lg group-hover:shadow-[#FBBB14]/40 group-hover:shadow-xl transition-all duration-300">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                            {t("quickDelivery.cta")}
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
