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

    // Bento layout: one large tile (Rent), two small (Repair / Brand New),
    // then three wide rows. `cell` holds the grid span classes per breakpoint.
    const services = [
        { id: "rent", variant: "tall" as const, cell: "sm:row-span-2 lg:col-span-2 lg:row-span-2", title: t("features.rent"), description: t("features.rentDesc"), href: `/${lang}/${rentSlug}` },
        { id: "repair", variant: "normal" as const, cell: "", title: t("features.repair"), description: t("features.repairDesc"), href: `/${lang}/${repairSlug}` },
        { id: "brandNew", variant: "normal" as const, cell: "", title: t("features.brandNew"), description: t("features.brandNewDesc"), href: `/${lang}/${shopSlug}?condition=NEW` },
        { id: "refurbished", variant: "wide" as const, cell: "sm:col-span-2 lg:col-span-2", title: t("features.refurbished"), description: t("features.refurbishedDesc"), href: `/${lang}/${shopSlug}?condition=REFURBISHED` },
        { id: "sell", variant: "wide" as const, cell: "sm:col-span-2 lg:col-span-2", title: t("features.sell"), description: t("features.sellDesc"), href: `/${lang}/${sellSlug}` },
        { id: "games", variant: "wide" as const, cell: "sm:col-span-2 lg:col-span-2", title: t("features.games"), description: t("features.gamesDesc"), href: `/${lang}/${gamesSlug}` },
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

            {/* Bento grid of colorful service cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 w-[95%] md:w-[90%] auto-rows-[200px] sm:auto-rows-[210px] lg:auto-rows-[195px]">
                {services.map((s) => (
                    <div key={s.id} className={s.cell}>
                        <FeatureCard
                            id={s.id}
                            title={s.title}
                            description={s.description}
                            variant={s.variant}
                            href={s.href}
                            cta={cta}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}
