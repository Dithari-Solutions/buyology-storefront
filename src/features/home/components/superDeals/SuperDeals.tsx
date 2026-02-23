"use client";

import { useRef } from "react";
import Image from "next/image";
import SuperDealsCard from "./SuperDealsCard";
import type { DeviceDetails } from "./SuperDealsCard";
import arrowLeft from "@/assets/icons/Arrow-left.png";

interface SuperDealsProps {
    deals: DeviceDetails[];
}

export default function SuperDeals({ deals }: SuperDealsProps) {
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
        <section className="w-[95%] md:w-[90%] mt-[30px] md:mt-[50px] mb-[30px] md:mb-[50px]">
            <div className="flex items-end justify-between mb-4 md:mb-6">
                <div>
                    <span className="inline-flex items-center text-[11px] font-semibold text-[#c08a00] bg-[#FFF8E6] px-3 py-[5px] rounded-full mb-2">
                        ⚡ Flash Sale
                    </span>
                    <h2 className="text-[22px] sm:text-[26px] md:text-[30px] font-bold leading-tight">Super Deals</h2>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                    <a href="#" className="hidden sm:flex items-center gap-1 text-[13px] font-semibold text-[#402F75] hover:underline whitespace-nowrap me-1">
                        See all <span>→</span>
                    </a>
                    <button
                        onClick={() => scroll("left")}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-gray-300 flex items-center justify-center bg-white hover:bg-[#402F75] hover:border-[#402F75] [&:hover_img]:invert transition-all duration-200"
                    >
                        <Image src={arrowLeft} alt="Previous" width={18} height={18} className="w-[14px] md:w-[18px]" />
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-gray-300 flex items-center justify-center bg-white hover:bg-[#402F75] hover:border-[#402F75] [&:hover_img]:invert transition-all duration-200 rotate-180"
                    >
                        <Image src={arrowLeft} alt="Next" width={18} height={18} className="w-[14px] md:w-[18px]" />
                    </button>
                </div>
            </div>
            <div
                ref={sliderRef}
                className="flex gap-3 md:gap-5 overflow-x-auto scroll-smooth items-stretch"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {deals.map((device, i) => (
                    <div key={i} className="flex-shrink-0 h-auto">
                        <SuperDealsCard device={device} />
                    </div>
                ))}
            </div>
        </section>
    );
}
