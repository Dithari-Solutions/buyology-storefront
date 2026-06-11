"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import LimitedStockCard from "./LimitedStockCard";
import arrowLeft from "@/assets/icons/Arrow-left.png";
import { getLimitedStockProducts } from "@/features/product/services/productService";
import type { ApiProduct } from "@/features/product/services/productService";
import { selectSelectedCountryCode, selectPreferredCurrency } from "@/features/country/store/countrySlice";
import type { Lang } from "@/config/pathSlugs";

function LimitedStockSkeleton() {
    return (
        <div
            className="relative rounded-[24px] w-full overflow-hidden flex-shrink-0 animate-pulse"
            style={{ background: "linear-gradient(115deg, #EDE8FB 0%, #D9CFEF 25%, #B4A5D5 55%, #6B59A8 80%, #402F75 100%)" }}
        >
            <div className="flex flex-col md:flex-row items-center justify-around px-6 sm:px-10 md:px-[60px] pt-16 pb-8 sm:pt-16 sm:pb-10 md:pt-[60px] md:pb-[50px] gap-6 md:gap-10">
                <div className="w-[180px] sm:w-[230px] md:w-[280px] h-[180px] sm:h-[230px] md:h-[280px] bg-white/10 rounded-2xl flex-shrink-0" />
                <div className="flex flex-col items-center md:items-start gap-4 flex-1">
                    <div className="h-4 w-24 bg-white/20 rounded-full" />
                    <div className="h-8 w-64 bg-white/20 rounded-xl" />
                    <div className="h-6 w-48 bg-white/20 rounded-xl" />
                    <div className="flex gap-3 mt-2">
                        <div className="h-10 w-28 bg-white/20 rounded-full" />
                        <div className="h-10 w-28 bg-white/20 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LimitedStock() {
    const { t } = useTranslation("home");
    const params = useParams();
    const lang = (params?.lang as Lang) ?? "en";
    const countryCode = useSelector(selectSelectedCountryCode);
    const currency = useSelector(selectPreferredCurrency);
    const sliderRef = useRef<HTMLDivElement>(null);
    const [products, setProducts] = useState<ApiProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const isJumping = useRef(false);
    // Only loop when one set of products overflows — otherwise a single product would
    // render as three identical cards.
    const [enableLoop, setEnableLoop] = useState(false);

    useEffect(() => {
        getLimitedStockProducts({ lang, countryCode: countryCode ?? undefined, currency: currency ?? undefined })
            .then(setProducts)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [lang, countryCode, currency]);

    // Enable looping only when the first set overflows the row (and there are ≥2 products).
    useEffect(() => {
        const el = sliderRef.current;
        if (!el) { setEnableLoop(false); return; }
        const measure = () => {
            if (!el || products.length === 0) { setEnableLoop(false); return; }
            const kids = Array.from(el.children) as HTMLElement[];
            const firstSet = kids.slice(0, products.length);
            if (firstSet.length === 0) return;
            const first = firstSet[0];
            const last = firstSet[firstSet.length - 1];
            const oneSetWidth = last.offsetLeft + last.offsetWidth - first.offsetLeft;
            setEnableLoop(products.length >= 2 && oneSetWidth > el.clientWidth + 4);
        };
        const raf = requestAnimationFrame(measure);
        window.addEventListener("resize", measure);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", measure);
        };
    }, [products]);

    // When looping, start in the middle set so it can scroll both ways.
    useEffect(() => {
        if (!sliderRef.current || products.length === 0 || !enableLoop) return;
        const el = sliderRef.current;
        requestAnimationFrame(() => {
            el.scrollLeft = el.scrollWidth / 3;
        });
    }, [products, enableLoop]);

    const scroll = (direction: "left" | "right") => {
        if (!sliderRef.current) return;
        sliderRef.current.scrollBy({
            left: direction === "left" ? -sliderRef.current.clientWidth : sliderRef.current.clientWidth,
            behavior: "smooth",
        });
    };

    const handleScroll = () => {
        const el = sliderRef.current;
        if (!el || products.length === 0 || isJumping.current || !enableLoop) return;
        const oneSetWidth = el.scrollWidth / 3;
        if (el.scrollLeft < oneSetWidth * 0.25) {
            isJumping.current = true;
            el.scrollLeft += oneSetWidth;
            isJumping.current = false;
        } else if (el.scrollLeft > oneSetWidth * 2 - oneSetWidth * 0.25) {
            isJumping.current = true;
            el.scrollLeft -= oneSetWidth;
            isJumping.current = false;
        }
    };

    const displayItems = enableLoop && products.length > 0
        ? [...products, ...products, ...products]
        : products;

    return (
        <section className="mt-[50px] w-[95%] md:w-[90%]">
            {/* Header */}
            <div className="flex items-end justify-between mb-5 md:mb-6">
                <div>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-[#402F75] px-3 py-[5px] rounded-full mb-2.5">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                        </svg>
                        {t("limitedStock.badge")}
                    </span>
                    <h2 className="text-[22px] sm:text-[26px] md:text-[32px] font-extrabold leading-tight text-gray-900">
                        {t("limitedStock.title", { defaultValue: "Limited Stock" })}
                    </h2>
                </div>

                {!loading && products.length > 1 && (
                    <div className="flex items-center gap-2 md:gap-3">
                        <button
                            onClick={() => scroll("left")}
                            aria-label="Previous"
                            className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-gray-200 flex items-center justify-center bg-white hover:bg-[#402F75] hover:border-[#402F75] [&:hover_img]:invert transition-all duration-200 shadow-sm"
                        >
                            <Image src={arrowLeft} alt="" width={16} height={16} className="w-[13px] md:w-[16px]" />
                        </button>
                        <button
                            onClick={() => scroll("right")}
                            aria-label="Next"
                            className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-gray-200 flex items-center justify-center bg-white hover:bg-[#402F75] hover:border-[#402F75] [&:hover_img]:invert transition-all duration-200 rotate-180 shadow-sm"
                        >
                            <Image src={arrowLeft} alt="" width={16} height={16} className="w-[13px] md:w-[16px]" />
                        </button>
                    </div>
                )}
            </div>

            {/* Slider */}
            {loading ? (
                <LimitedStockSkeleton />
            ) : products.length === 0 ? null : (
                <div
                    ref={sliderRef}
                    onScroll={handleScroll}
                    className="flex overflow-x-auto"
                    style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        scrollSnapType: "x mandatory",
                    }}
                >
                    {displayItems.map((product, i) => (
                        <div
                            key={`${product.id}-${i}`}
                            className="w-full flex-shrink-0"
                            style={{ scrollSnapAlign: "start" }}
                        >
                            <LimitedStockCard product={product} />
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
