"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";
import { getAllCategories, type AllCategory } from "@/features/product/services/productService";
import { CategoryIcon } from "@/shared/components/ShopNavItem";
import { categoryHref } from "@/shared/utils/categoryHref";

// Cohesive per-tile palette cycled by index — washes floor to white so they sit
// on the light page; gradient badges lead with brand purple, gold as one accent.
const WASH = [
    "linear-gradient(160deg, #EDE9FF 0%, #FFFFFF 78%)",
    "linear-gradient(160deg, #FFF6E0 0%, #FFFFFF 78%)",
    "linear-gradient(160deg, #E7F1FF 0%, #FFFFFF 78%)",
    "linear-gradient(160deg, #E9FAF1 0%, #FFFFFF 78%)",
    "linear-gradient(160deg, #EEF1FF 0%, #FFFFFF 78%)",
    "linear-gradient(160deg, #F4E9FF 0%, #FFFFFF 78%)",
];
const ICON_GRADIENT = [
    "linear-gradient(135deg, #5b21b6, #402F75)",
    "linear-gradient(135deg, #D9870A, #B06B00)",
    "linear-gradient(135deg, #2563EB, #1a6fa8)",
    "linear-gradient(135deg, #10b981, #0e9f6e)",
    "linear-gradient(135deg, #6366F1, #402F75)",
    "linear-gradient(135deg, #a855f7, #7c3aed)",
];
const GLOW = [
    "rgba(91,33,182,0.45)",
    "rgba(251,187,20,0.45)",
    "rgba(37,99,235,0.45)",
    "rgba(16,185,129,0.45)",
    "rgba(99,102,241,0.45)",
    "rgba(168,85,247,0.45)",
];

export default function PopularCategories() {
    const { t } = useTranslation("home");
    const lang = (useSelector((state: RootState) => state.language.lang) as Lang) ?? "en";
    const shopSlug = PATH_SLUGS.shop?.[lang] ?? "shop";

    const [categories, setCategories] = useState<AllCategory[]>([]);

    useEffect(() => {
        let active = true;
        getAllCategories(lang)
            .then((c) => { if (active) setCategories(c); })
            .catch(() => { if (active) setCategories([]); });
        return () => { active = false; };
    }, [lang]);

    // Real top-level, active categories (the same set the header Shop menu uses).
    const roots = categories
        .filter((c) => !c.parentId && (c.status ? c.status.toUpperCase() === "ACTIVE" : true))
        .slice(0, 6);

    // Nothing to show yet (loading or no categories) — keep the home page clean.
    if (roots.length === 0) return null;

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
                <Link href={`/${lang}/${shopSlug}`} className="hidden sm:flex items-center gap-2 text-[12px] font-semibold text-[#402F75] bg-[#EDE9FF] hover:bg-[#402F75] hover:text-white px-4 py-2 rounded-full transition-all duration-200 whitespace-nowrap flex-shrink-0 ms-4">
                    {t("categories.seeAll")}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 rtl:-scale-x-100">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-4 w-[95%] md:w-[90%]">
                {roots.map((cat, i) => (
                    <Link
                        key={cat.id}
                        href={categoryHref(lang, cat)}
                        className="cat-tile group relative isolate overflow-hidden flex flex-col items-start gap-3.5 rounded-[20px] p-4 md:p-5 min-h-[132px] md:min-h-[148px] cursor-pointer border border-[rgba(64,47,117,0.07)] hover:border-[rgba(64,47,117,0.16)] hover:-translate-y-1.5 motion-reduce:hover:translate-y-0 will-change-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[#402F75] focus-visible:ring-offset-2"
                        style={{ backgroundImage: WASH[i % WASH.length], "--glow": GLOW[i % GLOW.length] } as React.CSSProperties}
                    >
                        {/* Ghost watermark icon for depth */}
                        <div className="pointer-events-none absolute -bottom-3 -end-3 -z-10 opacity-[0.06] text-[#402F75] rtl:-scale-x-100 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 [&_svg]:w-24 [&_svg]:h-24">
                            <CategoryIcon icon={cat.icon} name={cat.name} />
                        </div>

                        {/* Glossy gradient icon badge in a soft white ring/halo */}
                        <div className="p-[3px] rounded-[17px] bg-white/60 ring-1 ring-[rgba(64,47,117,0.08)] shadow-[0_4px_10px_rgba(64,47,117,0.15)] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 motion-reduce:transition-none motion-reduce:group-hover:transform-none">
                            <div
                                className="relative w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center overflow-hidden text-white [&_svg]:w-6 [&_svg]:h-6 sm:[&_svg]:w-7 sm:[&_svg]:h-7"
                                style={{ background: ICON_GRADIENT[i % ICON_GRADIENT.length] }}
                            >
                                <span className="absolute inset-0 bg-gradient-to-b from-white/25 to-transparent" />
                                <span className="relative flex">
                                    <CategoryIcon icon={cat.icon} name={cat.name} />
                                </span>
                            </div>
                        </div>

                        {/* Bottom row: name (start) + reveal arrow chip (end) */}
                        <div className="mt-auto flex items-center justify-between gap-2 w-full">
                            <p className="font-semibold text-[13.5px] sm:text-[14px] text-[#1d1b29] leading-snug line-clamp-2 tracking-[-0.01em]">
                                {cat.name}
                            </p>
                            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-white/70 backdrop-blur flex items-center justify-center text-[#402F75] opacity-0 -translate-x-1 rtl:translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 transition-all duration-300 shadow-[0_2px_6px_rgba(64,47,117,0.18)]">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 rtl:-scale-x-100">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
