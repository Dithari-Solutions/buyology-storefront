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
        <section className="w-[95%] md:w-[90%] mt-[30px] md:mt-[50px]">
            <div className="flex items-center justify-between mb-4 md:mb-5">
                <h2 className="text-[22px] sm:text-[26px] md:text-[30px] font-bold">Super Deals</h2>
                <div className="flex items-center gap-2 md:gap-3">
                    <button
                        onClick={() => scroll("left")}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-gray-300 flex items-center justify-center bg-white hover:bg-gray-50 transition-colors"
                    >
                        <Image src={arrowLeft} alt="Previous" width={18} height={18} className="w-[14px] md:w-[18px]" />
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-gray-300 flex items-center justify-center bg-white hover:bg-gray-50 transition-colors rotate-180"
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
