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
    const [activeIndex, setActiveIndex] = useState(0);
    const isJumping = useRef(false);
    // scrollLeft sign convention: +1 LTR; -1 for engines that report negative under dir=rtl.
    const dirSign = useRef(1);
    // Only loop when one set of products overflows — otherwise a single product would
    // render as three identical cards.
    const [enableLoop, setEnableLoop] = useState(false);

    useEffect(() => {
        getLimitedStockProducts({ lang, countryCode: countryCode ?? undefined, currency: currency ?? undefined })
            .then((p) => { setProducts(p); setActiveIndex(0); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [lang, countryCode, currency]);

    // Detect the scrollLeft sign convention (negative under dir=rtl in modern engines).
    useEffect(() => {
        const el = sliderRef.current;
        if (!el) return;
        if (getComputedStyle(el).direction !== "rtl") { dirSign.current = 1; return; }
        const prev = el.scrollLeft;
        el.scrollLeft = 1;
        dirSign.current = el.scrollLeft > 0 ? 1 : -1;
        el.scrollLeft = prev;
    }, [products]);

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
            el.scrollLeft = (el.scrollWidth / 3) * dirSign.current;
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
        if (!el || products.length === 0) return;
        const sx = dirSign.current;
        const per = el.clientWidth || 1;
        const idx = Math.round((el.scrollLeft * sx) / per); // logical card index across the 3 sets
        // Track the active dot (mod the real product count, so loop sets map back).
        setActiveIndex(((idx % products.length) + products.length) % products.length);

        if (isJumping.current || !enableLoop) return;
        const oneSetWidth = el.scrollWidth / 3;
        // Reposition only when scrolled out of the middle set [N, 2N) — seamless
        // because every set is identical, and N-relative (no premature jump for big N).
        if (idx < products.length) {
            isJumping.current = true;
            el.scrollLeft += oneSetWidth * sx; // logical += one set
            requestAnimationFrame(() => { isJumping.current = false; });
        } else if (idx >= products.length * 2) {
            isJumping.current = true;
            el.scrollLeft -= oneSetWidth * sx; // logical -= one set
            requestAnimationFrame(() => { isJumping.current = false; });
        }
    };

    // Jump the slider to the i-th product within the currently-visible set.
    const goTo = (i: number) => {
        const el = sliderRef.current;
        if (!el || products.length === 0) return;
        const sx = dirSign.current;
        const per = el.clientWidth || 1;
        const current = Math.round((el.scrollLeft * sx) / per);
        const setStart = current - (((current % products.length) + products.length) % products.length);
        el.scrollTo({ left: (setStart + i) * per * sx, behavior: "smooth" });
    };

    const displayItems = enableLoop && products.length > 0
        ? [...products, ...products, ...products]
        : products;

    return (
        <section className="mt-[50px] w-[95%] md:w-[90%]">
            {/* Header */}
            <div className="flex items-end justify-between mb-5 md:mb-6">
                <div>
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

            {/* Slider pagination dots */}
            {!loading && products.length > 1 && (
                <div
                    className="flex justify-center items-center gap-1.5 mt-5"
                    role="group"
                    aria-label={t("limitedStock.title", { defaultValue: "Limited Stock" })}
                >
                    {products.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            aria-label={`Go to item ${i + 1} of ${products.length}`}
                            aria-current={i === activeIndex ? "true" : undefined}
                            onClick={() => goTo(i)}
                            className="group flex items-center justify-center h-6 cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#402F75] focus-visible:ring-offset-2"
                            style={{ width: i === activeIndex ? 32 : 18 }}
                        >
                            <span
                                className="h-2 w-full rounded-full transition-colors duration-300"
                                style={{ backgroundColor: i === activeIndex ? "#402F75" : "#D6CEE8" }}
                            />
                        </button>
                    ))}
                </div>
            )}
        </section>
    );
}
