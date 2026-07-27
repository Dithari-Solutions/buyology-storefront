"use client";

import type { StaticImageData } from "next/image";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";
import { conditionHref } from "@/shared/utils/categoryHref";
import FeatureCard from "./FeatureCard";
import BrandNewImg from "@/assets/features/brand-new-feat.png";
import RefurbishedImg from "@/assets/features/refurbished-feat.png";
import RepairImg from "@/assets/features/repair-feat.png";

export default function Features() {
    const { t } = useTranslation("home");
    const lang = useSelector((state: RootState) => state.language.lang) as Lang;
    const rentSlug = PATH_SLUGS.rent?.[lang] ?? "rent";
    const repairSlug = PATH_SLUGS.repair?.[lang] ?? "repair";
    const sellSlug = PATH_SLUGS.sell?.[lang] ?? "sell";
    const gamesSlug = PATH_SLUGS.games?.[lang] ?? "games";

    // Photo cards where we have product photography; soft illustrated cards for
    // the rest. Interleaved (photo/illustrated/photo…) so neither family clusters
    // in any of the responsive layouts. Same shape, corner arrow, and caption.
    const services: Array<{ id: string; title: string; href: string; image?: StaticImageData | string; objectPosition?: string }> = [
        { id: "brandNew", title: t("features.brandNew"), href: conditionHref(lang, "NEW"), image: BrandNewImg },
        { id: "rent", title: t("features.rent"), href: `/${lang}/${rentSlug}`, image: "/rent.png" },
        { id: "refurbished", title: t("features.refurbished"), href: conditionHref(lang, "REFURBISHED"), image: RefurbishedImg, objectPosition: "40% 50%" },
        { id: "sell", title: t("features.sell"), href: `/${lang}/${sellSlug}`, image: "/sell.png" },
        { id: "repair", title: t("features.repair"), href: `/${lang}/${repairSlug}`, image: RepairImg },
        { id: "games", title: t("features.games"), href: `/${lang}/${gamesSlug}` },
    ];

    return (
        <section className="flex flex-col items-center w-full">
            {/* Header */}
            <div className="w-[95%] md:w-[90%] mb-[20px] md:mb-[28px]">
                <span className="inline-flex items-center gap-[6px] text-[11px] font-semibold text-[#402F75] bg-[#EDE9FF] px-3 py-[5px] rounded-full mb-3">
                    <span className="w-[5px] h-[5px] rounded-full bg-[#402F75]" />
                    {t("features.label")}
                </span>
                <h2 className="text-[22px] sm:text-[26px] md:text-[32px] font-bold leading-tight text-gray-900">
                    {t("features.title")}
                </h2>
                <p className="text-gray-500 text-[13px] md:text-[15px] mt-[6px] max-w-md">
                    {t("features.subtitle")}
                </p>
            </div>

            {/* Uniform image-card row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5 w-[95%] md:w-[90%]">
                {services.map((s) => (
                    <FeatureCard
                        key={s.id}
                        id={s.id}
                        title={s.title}
                        href={s.href}
                        image={s.image}
                        objectPosition={s.objectPosition}
                    />
                ))}
            </div>
        </section>
    );
}
