"use client";

import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";
import FeatureCard from "./FeatureCard";

export default function Features() {
    const { t } = useTranslation("home");
    const lang = useSelector((state: RootState) => state.language.lang) as Lang;
    const shopSlug = PATH_SLUGS.shop?.[lang] ?? "shop";
    const rentSlug = PATH_SLUGS.rent?.[lang] ?? "rent";
    const repairSlug = PATH_SLUGS.repair?.[lang] ?? "repair";
    const sellSlug = PATH_SLUGS.sell?.[lang] ?? "sell";
    const gamesSlug = PATH_SLUGS.games?.[lang] ?? "games";

    const cta = t("features.learnMore", { defaultValue: "Learn more" });

    const services = [
        { id: "rent", title: t("features.rent"), description: t("features.rentDesc"), href: `/${lang}/${rentSlug}` },
        { id: "repair", title: t("features.repair"), description: t("features.repairDesc"), href: `/${lang}/${repairSlug}` },
        { id: "brandNew", title: t("features.brandNew"), description: t("features.brandNewDesc"), href: `/${lang}/${shopSlug}?condition=NEW` },
        { id: "refurbished", title: t("features.refurbished"), description: t("features.refurbishedDesc"), href: `/${lang}/${shopSlug}?condition=REFURBISHED` },
        { id: "sell", title: t("features.sell"), description: t("features.sellDesc"), href: `/${lang}/${sellSlug}` },
        { id: "games", title: t("features.games"), description: t("features.gamesDesc"), href: `/${lang}/${gamesSlug}` },
    ];

    return (
        <section className="flex flex-col items-center w-full">
            {/* Header */}
            <div className="w-[95%] md:w-[90%] flex items-end justify-between mb-[20px] md:mb-[28px]">
                <div>
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
            </div>

            {/* Uniform grid of service cards — clean, equal-sized, row by row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 w-[95%] md:w-[90%]">
                {services.map((s) => (
                    <FeatureCard
                        key={s.id}
                        id={s.id}
                        title={s.title}
                        description={s.description}
                        href={s.href}
                        cta={cta}
                    />
                ))}
            </div>
        </section>
    );
}
