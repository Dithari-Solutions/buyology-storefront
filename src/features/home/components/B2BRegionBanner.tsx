"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { selectSelectedCountryCode } from "@/features/country/store/countrySlice";
import {
    getB2bActiveCountries,
    type B2bActiveCountry,
} from "@/features/country/services/country.api";

export default function B2BRegionBanner() {
    const { t } = useTranslation("home");
    const router = useRouter();
    const params = useParams();
    const lang = (params?.lang as Lang) ?? "en";

    const selectedCountryCode = useSelector((s: RootState) =>
        selectSelectedCountryCode(s)
    );

    const [b2bCountries, setB2bCountries] = useState<B2bActiveCountry[] | null>(null);

    useEffect(() => {
        let alive = true;
        getB2bActiveCountries()
            .then((countries) => {
                if (alive) setB2bCountries(countries);
            })
            .catch(() => {
                if (alive) setB2bCountries([]);
            });
        return () => {
            alive = false;
        };
    }, []);

    // Render nothing until the b2b-active list has loaded, or when the
    // visitor's region is not B2B-enabled.
    const isB2bRegion =
        !!b2bCountries &&
        !!selectedCountryCode &&
        b2bCountries.some(
            (c) => c.code?.toUpperCase() === selectedCountryCode.toUpperCase()
        );

    if (!isB2bRegion) return null;

    function handleClick() {
        const slug = PATH_SLUGS["b2b"]?.[lang] ?? "b2b";
        router.push(`/${lang}/${slug}`);
    }

    return (
        <section className="w-full flex justify-center mt-[30px] md:mt-[50px]">
            <div
                onClick={handleClick}
                className="relative w-[95%] md:w-[90%] rounded-[24px] overflow-hidden cursor-pointer group"
                style={{ background: "linear-gradient(115deg, #0a1a2c 0%, #10263f 30%, #16324f 60%, #1f5a8c 85%, #2f8fd6 100%)" }}
            >
                {/* Animated glow rings */}
                <div className="absolute -top-20 -end-20 w-64 h-64 rounded-full opacity-20 bg-[#FBBB14] blur-3xl pointer-events-none" />
                <div className="absolute -bottom-16 -start-16 w-48 h-48 rounded-full opacity-15 bg-sky-400 blur-3xl pointer-events-none" />

                <div className="relative flex flex-col sm:flex-row items-center justify-between px-6 sm:px-10 md:px-[60px] py-8 md:py-[44px] gap-6">

                    {/* Left: icon + text */}
                    <div className="flex items-center gap-5 sm:gap-7">
                        {/* Warehouse / bulk icon */}
                        <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl bg-[#FBBB14] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white"
                            >
                                <path d="M3 21V8l9-5 9 5v13" />
                                <path d="M9 21v-6h6v6" />
                                <path d="M3 12h18" />
                            </svg>
                        </div>

                        <div className="flex flex-col items-start text-start">
                            {/* Badge */}
                            <span className="inline-flex items-center gap-1 bg-[#FBBB14] text-white text-[11px] font-bold px-3 py-[5px] rounded-full mb-2 shadow-md">
                                {t("b2bBanner.label")}
                            </span>
                            <h2 className="text-[24px] sm:text-[28px] md:text-[34px] font-extrabold text-white leading-tight">
                                {t("b2bBanner.tagline")}
                            </h2>
                            <p className="text-white/60 text-[13px] md:text-[14px] mt-1 max-w-md">
                                {t("b2bBanner.description")}
                            </p>
                        </div>
                    </div>

                    {/* Right: CTA */}
                    <div className="flex-shrink-0">
                        <div className="flex items-center gap-[8px] bg-[#FBBB14] hover:bg-[#f0b000] text-white font-bold text-[14px] sm:text-[15px] px-6 py-[13px] rounded-full shadow-lg group-hover:shadow-[#FBBB14]/40 group-hover:shadow-xl transition-all duration-300">
                            {t("b2bBanner.cta")}
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0 rtl:-scale-x-100">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
