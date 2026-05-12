"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useParams } from "next/navigation";
import SuperDealsCard from "./SuperDealsCard";
import arrowLeft from "@/assets/icons/Arrow-left.png";
import { getSuperDealProducts } from "@/features/product/services/productService";
import type { ApiProduct } from "@/features/product/services/productService";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";

function SuperDealsSkeleton() {
    return (
        <div className="flex-shrink-0 w-[300px] sm:w-[420px] md:w-[560px] h-[230px] sm:h-[260px] md:h-[290px] bg-white rounded-[20px] border border-gray-100 animate-pulse p-[10px] flex gap-4">
            <div className="w-[120px] sm:w-[150px] md:w-[185px] h-full rounded-[14px] bg-gray-100 flex-shrink-0" />
            <div className="flex flex-col justify-between flex-1 py-1">
                <div className="h-5 bg-gray-100 rounded-full w-3/4" />
                <div className="grid grid-cols-2 gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-7 bg-gray-100 rounded-lg" />
                    ))}
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex justify-between items-end">
                    <div className="flex flex-col gap-1">
                        <div className="h-3 w-20 bg-gray-100 rounded-full" />
                        <div className="h-6 w-16 bg-gray-100 rounded-full" />
                    </div>
                    <div className="h-9 w-24 bg-gray-100 rounded-full" />
                </div>
            </div>
        </div>
    );
}

export default function SuperDeals() {
    const { t } = useTranslation("home");
    const params = useParams();
    const lang = (params?.lang as Lang) ?? "en";
    const sliderRef = useRef<HTMLDivElement>(null);
    const [products, setProducts] = useState<ApiProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadTick, setReloadTick] = useState(0);
    const isJumping = useRef(false);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        getSuperDealProducts({ lang })
            .then((data) => {
                if (cancelled) return;
                setProducts(Array.isArray(data) ? data : []);
            })
            .catch((err) => {
                if (cancelled) return;
                setError(err instanceof Error ? err.message : "Couldn't load deals.");
                setProducts([]);
            })
            .finally(() => {
                if (cancelled) return;
                setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [lang, reloadTick]);

    // Jump to the middle set on initial render so looping works in both directions
    useEffect(() => {
        if (!sliderRef.current || products.length === 0) return;
        const el = sliderRef.current;
        requestAnimationFrame(() => {
            el.scrollLeft = el.scrollWidth / 3;
        });
    }, [products]);

    const scroll = (direction: "left" | "right") => {
        if (!sliderRef.current) return;
        const scrollAmount = sliderRef.current.clientWidth * 0.8;
        sliderRef.current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    // Only reposition once scrolling has come to a rest. Performing the jump
    // mid-animation (the previous implementation) caused the smooth-scroll
    // engine to fight the manual scrollLeft write and produced the visible
    // glitches the user reported. We debounce on the scroll event to detect
    // "scroll end" instead of mutating during animation.
    const scrollEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleScroll = () => {
        const el = sliderRef.current;
        if (!el || products.length === 0) return;
        if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
        scrollEndTimer.current = setTimeout(() => {
            if (!el || products.length === 0 || isJumping.current) return;
            const oneSetWidth = el.scrollWidth / 3;
            const left = el.scrollLeft;
            if (left < oneSetWidth * 0.5) {
                isJumping.current = true;
                el.scrollTo({ left: left + oneSetWidth, behavior: "auto" });
                requestAnimationFrame(() => { isJumping.current = false; });
            } else if (left > oneSetWidth * 1.5) {
                isJumping.current = true;
                el.scrollTo({ left: left - oneSetWidth, behavior: "auto" });
                requestAnimationFrame(() => { isJumping.current = false; });
            }
        }, 120);
    };

    useEffect(() => {
        return () => {
            if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
        };
    }, []);

    // Triple the items for infinite loop
    const displayItems = products.length > 0
        ? [...products, ...products, ...products]
        : [];

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
                    <Link
                        href={`/${lang}/${PATH_SLUGS.shop?.[lang] ?? "shop"}`}
                        className="hidden sm:flex items-center gap-2 text-[12px] font-semibold text-[#402F75] bg-[#EDE9FF] hover:bg-[#402F75] hover:text-white px-4 py-2 rounded-full transition-all duration-200 whitespace-nowrap"
                    >
                        {t("superDeals.seeAll")}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </Link>
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
            {loading ? (
                <div className="flex gap-4 md:gap-6 overflow-hidden pb-5">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <SuperDealsSkeleton key={i} />
                    ))}
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-center">
                    <p className="text-[13px] font-semibold text-red-700 mb-2">{error}</p>
                    <button
                        onClick={() => setReloadTick((t) => t + 1)}
                        className="inline-flex items-center gap-1.5 text-[12px] font-bold text-red-700 hover:underline cursor-pointer"
                    >
                        Retry
                    </button>
                </div>
            ) : products.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-5 text-center text-[13px] text-gray-400">
                    No deals available right now.
                </div>
            ) : (
                <div
                    ref={sliderRef}
                    onScroll={handleScroll}
                    className="flex gap-4 md:gap-6 overflow-x-auto pb-5"
                    style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        scrollBehavior: "smooth",
                        overscrollBehaviorX: "contain",
                    }}
                >
                    {displayItems.map((product, i) => {
                        const setIdx = Math.floor(i / products.length);
                        const itemIdx = i % products.length;
                        return (
                            <div
                                key={`set${setIdx}-item${itemIdx}-${product.id}`}
                                className="flex-shrink-0"
                            >
                                <SuperDealsCard product={product} />
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
