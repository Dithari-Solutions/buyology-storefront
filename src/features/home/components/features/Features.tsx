"use client";

import { useTranslation } from "react-i18next";
import RentBg from "@/assets/features/rent-feat.png";
import RepairBg from "@/assets/features/repair-feat.png";
import BrandNewBg from "@/assets/features/brand-new-feat.png";
import RefubishedBg from "@/assets/features/refurbished-feat.png";
import FeatureCard from "./FeatureCard";

export default function Features() {
    const { t } = useTranslation("home");

    return (
        <section className="flex flex-col items-center w-full mt-[30px] md:mt-[50px]">
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
                <a
                    href="#"
                    className="hidden sm:flex items-center gap-[6px] text-[13px] font-semibold text-[#402F75] hover:text-[#2e2055] transition-colors whitespace-nowrap mb-1 flex-shrink-0 ms-4 group"
                >
                    {t("features.seeAll")}
                    <span className="transition-transform duration-200 group-hover:translate-x-[3px]">→</span>
                </a>
            </div>

            {/*
                Bento grid layout:
                Mobile (1 col): all cards stacked
                sm (2 col):  [ Rent tall ] [ Repair  ]
                             [ Rent tall ] [ BrandNew ]
                             [    Refurbished wide    ]
                lg (3 col):  [ Rent tall ] [ Repair   ] [ BrandNew  ]
                             [ Rent tall ] [  Refurbished wide      ]
            */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 sm:grid-rows-[260px_260px] lg:grid-rows-[240px_240px] gap-4 w-[95%] md:w-[90%]">
                {/* Tall card — spans both rows on sm+ */}
                <div className="min-h-[220px] sm:row-span-2">
                    <FeatureCard
                        id="rent"
                        title={t("features.rent")}
                        description={t("features.rentDesc")}
                        bg={RentBg}
                        variant="tall"
                    />
                </div>

                {/* Top-right: Repair */}
                <div className="min-h-[220px]">
                    <FeatureCard
                        id="repair"
                        title={t("features.repair")}
                        description={t("features.repairDesc")}
                        bg={RepairBg}
                        variant="normal"
                    />
                </div>

                {/* Brand New — 3rd col on lg, below Repair on sm */}
                <div className="min-h-[220px]">
                    <FeatureCard
                        id="brandNew"
                        title={t("features.brandNew")}
                        description={t("features.brandNewDesc")}
                        bg={BrandNewBg}
                        variant="normal"
                    />
                </div>

                {/* Wide bottom card — spans 2 cols on lg, 1 col on sm */}
                <div className="min-h-[220px] lg:col-span-2">
                    <FeatureCard
                        id="refurbished"
                        title={t("features.refurbished")}
                        description={t("features.refurbishedDesc")}
                        bg={RefubishedBg}
                        variant="wide"
                    />
                </div>
            </div>
        </section>
    );
}
