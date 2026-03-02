"use client";

import { useTranslation } from "react-i18next";
import RentBg from "@/assets/features/rent-feat.png";
import RepairBg from "@/assets/features/repair-feat.png";
import BrandNewBg from "@/assets/features/brand-new-feat.png";
import RefubishedBg from "@/assets/features/refurbished-feat.png";
import FeatureCard from "./FeatureCard";

export default function Features() {
    const { t } = useTranslation("home");

    const cards = [
        { key: "rent",        bg: RentBg        },
        { key: "repair",      bg: RepairBg      },
        { key: "brandNew",    bg: BrandNewBg    },
        { key: "refurbished", bg: RefubishedBg  },
    ] as const;

    return (
        <section className="flex flex-col items-center justify-center w-full mt-[30px] md:mt-[50px]">
            <div className="w-[95%] md:w-[90%] flex items-end justify-between mb-[15px] md:mb-[20px]">
                <div>
                    <span className="inline-flex items-center text-[11px] font-semibold text-[#402F75] bg-[#EDE9FF] px-3 py-[5px] rounded-full mb-2">
                        {t("features.label")}
                    </span>
                    <h2 className="text-[22px] sm:text-[26px] md:text-[30px] font-bold leading-tight">
                        {t("features.title")}
                    </h2>
                    <p className="text-gray-500 text-[13px] md:text-[15px] mt-1 max-w-md">
                        {t("features.subtitle")}
                    </p>
                </div>
                <a href="#" className="hidden sm:flex items-center gap-1 text-[13px] font-semibold text-[#402F75] hover:underline whitespace-nowrap mb-1 flex-shrink-0 ms-4">
                    {t("features.seeAll")} <span>→</span>
                </a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 w-[95%] md:w-[90%]">
                {cards.map(({ key, bg }) => (
                    <FeatureCard key={key} title={t(`features.${key}`)} bg={bg} />
                ))}
            </div>
        </section>
    );
}
