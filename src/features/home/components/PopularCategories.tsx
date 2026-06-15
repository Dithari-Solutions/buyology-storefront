"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";
import { getAllCategories, type AllCategory } from "@/features/product/services/productService";
import { CategoryIcon } from "@/shared/components/ShopNavItem";

// Tile palette cycled across the real category cards.
const TILE_BG = ["#EDE9FF", "#FFF8E6", "#E8F4FF", "#EAFAF1", "#F0F4FF", "#F5E6FF"];
const ICON_BG = ["#402F75", "#c08a00", "#1a6fa8", "#27ae60", "#402F75", "#7c3aed"];

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
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4 w-[95%] md:w-[90%]">
                {roots.map((cat, i) => (
                    <Link
                        key={cat.id}
                        href={`/${lang}/${shopSlug}?categoryId=${cat.id}&categoryName=${encodeURIComponent(cat.name)}`}
                        className="group flex flex-col items-center justify-center gap-3 py-5 px-3 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                        style={{ backgroundColor: TILE_BG[i % TILE_BG.length] }}
                    >
                        <div
                            className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl text-white transition-transform duration-300 group-hover:scale-110 [&_svg]:w-6 [&_svg]:h-6 sm:[&_svg]:w-7 sm:[&_svg]:h-7"
                            style={{ backgroundColor: ICON_BG[i % ICON_BG.length] }}
                        >
                            <CategoryIcon icon={cat.icon} name={cat.name} />
                        </div>
                        <div className="text-center w-full">
                            <p className="font-semibold text-[13px] sm:text-[14px] text-gray-800 truncate">
                                {cat.name}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
