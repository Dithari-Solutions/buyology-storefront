"use client";

import { useRef } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import SuperDealsCard from "./SuperDealsCard";
import type { DeviceDetails } from "./SuperDealsCard";
import arrowLeft from "@/assets/icons/Arrow-left.png";

interface SuperDealsProps {
    deals: DeviceDetails[];
}

export default function SuperDeals({ deals }: SuperDealsProps) {
    const { t } = useTranslation("home");
    const sliderRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (!sliderRef.current) return;
        const scrollAmount = sliderRef.current.clientWidth * 0.8;
        sliderRef.current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    return (
        <section className="w-[95%] md:w-[90%] mt-8 md:mt-14 mb-8 md:mb-14">
            {/* Header */}
            <div className="flex items-end justify-between mb-5 md:mb-8">
                <div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#A86C00] bg-[#FFF7DC] border border-[#FBBB14]/50 px-3 py-[5px] rounded-full mb-2.5">
                        ⚡ {t("superDeals.flashSale")}
                    </span>
                    <h2 className="text-[22px] sm:text-[26px] md:text-[32px] font-extrabold leading-tight text-gray-900">
                        {t("superDeals.title")}
                    </h2>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                    <a
                        href="#"
                        className="hidden sm:flex items-center gap-1.5 text-[13px] font-semibold text-[#402F75] hover:text-[#2f2258] transition-colors whitespace-nowrap me-1"
                    >
                        {t("superDeals.seeAll")} <span className="text-[15px]">→</span>
                    </a>
                    <button
                        onClick={() => scroll("left")}
                        aria-label={t("superDeals.prev")}
                        className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-gray-200 flex items-center justify-center bg-white hover:bg-[#402F75] hover:border-[#402F75] [&:hover_img]:invert transition-all duration-200 shadow-sm"
                    >
                        <Image src={arrowLeft} alt="" width={16} height={16} className="w-[13px] md:w-[16px]" />
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        aria-label={t("superDeals.next")}
                        className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-gray-200 flex items-center justify-center bg-white hover:bg-[#402F75] hover:border-[#402F75] [&:hover_img]:invert transition-all duration-200 rotate-180 shadow-sm"
                    >
                        <Image src={arrowLeft} alt="" width={16} height={16} className="w-[13px] md:w-[16px]" />
                    </button>
                </div>
            </div>

            {/* Slider */}
            <div
                ref={sliderRef}
                className="flex gap-4 md:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-5"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {deals.map((device, i) => (
                    <div key={i} className="flex-shrink-0 snap-start">
                        <SuperDealsCard device={device} />
                    </div>
                ))}
            </div>
        </section>
    );
}
