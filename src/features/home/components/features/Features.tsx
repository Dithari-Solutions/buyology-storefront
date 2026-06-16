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

    // Tessellating "Twin-Hero Mosaic" bento — tiles fully fill the rectangle, no
    // gaps. `cell` carries explicit grid-line placement at lg (4 cols × 4 rows)
    // plus a tidy 2-col fallback at sm. lg layout (verified, no overlaps):
    //   rent rent  brandNew repair
    //   rent rent  brandNew repair
    //   refb refb  sell     sell
    //   game game  sell     sell
    const services = [
        { id: "rent", variant: "hero" as const, cell: "sm:col-span-2 sm:row-span-2 lg:col-start-1 lg:col-end-3 lg:row-start-1 lg:row-end-3", title: t("features.rent"), description: t("features.rentDesc"), href: `/${lang}/${rentSlug}` },
        { id: "brandNew", variant: "tall" as const, cell: "lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-3", title: t("features.brandNew"), description: t("features.brandNewDesc"), href: `/${lang}/${shopSlug}?condition=NEW` },
        { id: "repair", variant: "tall" as const, cell: "lg:col-start-4 lg:col-end-5 lg:row-start-1 lg:row-end-3", title: t("features.repair"), description: t("features.repairDesc"), href: `/${lang}/${repairSlug}` },
        { id: "refurbished", variant: "wide" as const, cell: "sm:col-span-2 lg:col-start-1 lg:col-end-3 lg:row-start-3 lg:row-end-4", title: t("features.refurbished"), description: t("features.refurbishedDesc"), href: `/${lang}/${shopSlug}?condition=REFURBISHED` },
        { id: "sell", variant: "hero" as const, cell: "sm:col-span-2 sm:row-span-2 lg:col-start-3 lg:col-end-5 lg:row-start-3 lg:row-end-5", title: t("features.sell"), description: t("features.sellDesc"), href: `/${lang}/${sellSlug}` },
        { id: "games", variant: "wide" as const, cell: "sm:col-span-2 lg:col-start-1 lg:col-end-3 lg:row-start-4 lg:row-end-5", title: t("features.games"), description: t("features.gamesDesc"), href: `/${lang}/${gamesSlug}` },
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

            {/* Mosaic bento: rows auto-size on mobile (stacked), fixed at sm+ so the
                tiles tessellate into one another's space. Seam (gap-2 = 8px) matches
                the tile radius (rounded-lg) so junctions stay tight — one interlocking
                mosaic, not separate floating cards. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 w-[95%] md:w-[90%] auto-rows-auto sm:auto-rows-[200px] lg:auto-rows-[205px] rounded-lg shadow-[0_30px_80px_-45px_rgba(49,46,129,0.5)]">
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
