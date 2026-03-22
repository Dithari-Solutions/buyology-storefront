"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import ProductCard from "@/features/product/components/ProductCard";
import { getQuickDeliveryProducts } from "../services/quickDeliveryService";
import { getPrimaryImage } from "@/features/product/services/productService";
import type { ApiProduct } from "@/features/product/services/productService";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";

type PageState =
    | "requesting-location"
    | "loading"
    | "showing-products"
    | "empty"
    | "error"
    | "location-denied";

const COORDS_SESSION_KEY = "qd_coords";

function getCachedCoords(): { lat: number; lng: number } | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = sessionStorage.getItem(COORDS_SESSION_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as { lat: number; lng: number };
    } catch {
        return null;
    }
}

function cacheCoords(lat: number, lng: number) {
    try {
        sessionStorage.setItem(COORDS_SESSION_KEY, JSON.stringify({ lat, lng }));
    } catch {
        // ignore
    }
}

function ProductCardSkeleton() {
    return (
        <div className="p-[10px] bg-white rounded-[20px] w-full border border-[#FBBB14] animate-pulse">
            <div className="h-[200px] mb-[12px] rounded-[20px] bg-[#F6F4FF]" />
            <div className="flex items-start justify-between gap-[8px] mb-[10px]">
                <div className="h-[18px] w-[55%] bg-gray-200 rounded-full" />
                <div className="h-[22px] w-[44px] bg-gray-100 rounded-full flex-shrink-0" />
            </div>
            <div className="grid grid-cols-2 gap-[6px] mb-[10px]">
                <div className="h-[28px] bg-gray-100 rounded-[8px]" />
                <div className="h-[28px] bg-gray-100 rounded-[8px]" />
                <div className="h-[28px] bg-gray-100 rounded-[8px] col-span-2" />
            </div>
            <div className="h-px bg-gray-100 mb-[10px]" />
            <div className="flex items-end justify-between gap-[8px]">
                <div className="flex flex-col gap-[5px]">
                    <div className="h-[12px] w-[60px] bg-gray-100 rounded-full" />
                    <div className="h-[22px] w-[70px] bg-gray-200 rounded-full" />
                </div>
                <div className="flex flex-col items-end gap-[5px]">
                    <div className="h-[18px] w-[52px] bg-gray-100 rounded-[6px]" />
                    <div className="h-[34px] w-[110px] bg-[#FBBB14]/30 rounded-[30px]" />
                </div>
            </div>
        </div>
    );
}

function getSpecValue(product: ApiProduct, code: string): string {
    const spec = product.specs.find((s) => s.code === code);
    if (!spec || spec.options.length === 0) return "";
    const opt = spec.options[0];
    return `${opt.value}${opt.unit}`;
}

export default function QuickDeliveryPage() {
    const { t } = useTranslation("quick-delivery");
    const params = useParams();
    const router = useRouter();
    const lang = (params?.lang as Lang) ?? "en";

    const [state, setState] = useState<PageState>("requesting-location");
    const [products, setProducts] = useState<ApiProduct[]>([]);
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

    const fetchProducts = useCallback(
        async (lat: number, lng: number) => {
            setState("loading");
            try {
                const result = await getQuickDeliveryProducts(lat, lng, lang);
                setProducts(result);
                setState(result.length > 0 ? "showing-products" : "empty");
            } catch {
                setState("error");
            }
        },
        [lang]
    );

    // On mount: check cached coords first
    useEffect(() => {
        const cached = getCachedCoords();
        if (cached) {
            setCoords(cached);
            fetchProducts(cached.lat, cached.lng);
        }
        // else stay in "requesting-location"
    }, [fetchProducts]);

    function handleAllowLocation() {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                cacheCoords(latitude, longitude);
                setCoords({ lat: latitude, lng: longitude });
                fetchProducts(latitude, longitude);
            },
            () => {
                setState("location-denied");
            },
            { timeout: 10000 }
        );
    }

    function handleRetry() {
        if (coords) {
            fetchProducts(coords.lat, coords.lng);
        }
    }

    function handleBrowseAll() {
        router.push(`/${lang}/${PATH_SLUGS.shop[lang] ?? "shop"}`);
    }

    return (
        <main className="w-[90%] mx-auto py-[40px] min-h-[60vh]">

            {/* ── Page heading ── */}
            <div className="mb-[28px] md:mb-[36px]">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#402F75] bg-[#EDE9FF] px-3 py-[5px] rounded-full mb-2">
                    {t("badge")}
                </span>
                <h1 className="text-[26px] sm:text-[30px] md:text-[36px] font-bold leading-tight">
                    {t("title")}
                </h1>
            </div>

            {/* ── Location permission gate ── */}
            {state === "requesting-location" && (
                <div className="flex flex-col items-center justify-center text-center py-[60px] md:py-[90px] gap-6">
                    <div className="w-20 h-20 rounded-full bg-[#EDE9FF] flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                    </div>
                    <div className="max-w-sm">
                        <h2 className="text-[22px] sm:text-[26px] font-bold text-gray-900 mb-2">
                            {t("permissionHeading")}
                        </h2>
                        <p className="text-gray-500 text-[14px] leading-relaxed">
                            {t("permissionSubtext")}
                        </p>
                    </div>
                    <button
                        onClick={handleAllowLocation}
                        className="flex items-center gap-2 bg-[#402F75] hover:bg-[#321f5e] text-white font-bold text-[14px] px-8 py-[14px] rounded-full transition-colors shadow-md"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        {t("allowLocation")}
                    </button>
                </div>
            )}

            {/* ── Loading skeleton ── */}
            {state === "loading" && (
                <div>
                    <p className="text-gray-500 text-[14px] mb-6">{t("loadingText")}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-[16px]">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            )}

            {/* ── Products grid ── */}
            {state === "showing-products" && (
                <div>
                    <p className="text-[13px] text-gray-500 mb-5">
                        {t("productsTitle")} —{" "}
                        <span className="font-semibold text-gray-800">{products.length}</span> items
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-[16px]">
                        {products.map((product) => {
                            const slugs = { en: product.slug, az: product.slug, ar: product.slug };
                            const ram = getSpecValue(product, "ram");
                            const storage = getSpecValue(product, "storage");
                            return (
                                <ProductCard
                                    key={product.id}
                                    slugs={slugs}
                                    productId={product.id}
                                    title={product.title}
                                    price={product.effectivePrice}
                                    originalPrice={product.basePrice}
                                    discount={product.discountValue ?? 0}
                                    inStock={product.availabilityStatus !== "OUT_OF_STOCK"}
                                    ram={ram ? `${ram} RAM` : undefined}
                                    storage={storage ? `${storage} SSD` : undefined}
                                    imageUrl={getPrimaryImage(product.media)}
                                />
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Empty state ── */}
            {state === "empty" && (
                <div className="flex flex-col items-center justify-center text-center py-[60px] md:py-[90px] gap-6">
                    <div className="w-20 h-20 rounded-full bg-[#EDE9FF] flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    </div>
                    <div className="max-w-sm">
                        <h2 className="text-[20px] sm:text-[22px] font-bold text-gray-900 mb-2">
                            {t("emptyTitle")}
                        </h2>
                    </div>
                    <button
                        onClick={handleBrowseAll}
                        className="flex items-center gap-2 bg-[#FBBB14] hover:bg-[#f0b000] text-white font-bold text-[14px] px-8 py-[14px] rounded-full transition-colors shadow-md"
                    >
                        {t("browseAll")}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            )}

            {/* ── Error state ── */}
            {state === "error" && (
                <div className="flex flex-col items-center justify-center text-center py-[60px] md:py-[90px] gap-6">
                    <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <div className="max-w-sm">
                        <h2 className="text-[20px] sm:text-[22px] font-bold text-gray-900 mb-2">
                            {t("errorTitle")}
                        </h2>
                        <p className="text-gray-500 text-[14px]">{t("errorSubtext")}</p>
                    </div>
                    <button
                        onClick={handleRetry}
                        className="flex items-center gap-2 bg-[#402F75] hover:bg-[#321f5e] text-white font-bold text-[14px] px-8 py-[14px] rounded-full transition-colors shadow-md"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                            <path d="M1 4v6h6M23 20v-6h-6" />
                            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                        </svg>
                        {t("retry")}
                    </button>
                </div>
            )}

            {/* ── Location denied state ── */}
            {state === "location-denied" && (
                <div className="flex flex-col items-center justify-center text-center py-[60px] md:py-[90px] gap-6">
                    <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                            <line x1="3" y1="3" x2="21" y2="21" stroke="#f59e0b" strokeWidth="1.5" />
                        </svg>
                    </div>
                    <div className="max-w-sm">
                        <h2 className="text-[20px] sm:text-[22px] font-bold text-gray-900 mb-2">
                            {t("locationDeniedTitle")}
                        </h2>
                        <p className="text-gray-500 text-[14px] leading-relaxed">
                            {t("locationDeniedSubtext")}
                        </p>
                    </div>
                    <button
                        onClick={handleBrowseAll}
                        className="flex items-center gap-2 bg-[#FBBB14] hover:bg-[#f0b000] text-white font-bold text-[14px] px-8 py-[14px] rounded-full transition-colors shadow-md"
                    >
                        {t("browseAll")}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            )}
        </main>
    );
}
