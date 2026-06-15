"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useRouter, useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { useLoginGate } from "@/features/auth/hooks/useLoginGate";
import { setBuyNow } from "@/features/buyNow/store/buyNowSlice";
import { FlameIcon } from "@/shared/icons";
import type { AppDispatch } from "@/store";
import type { ApiProduct } from "@/features/product/services/productService";
import { getPrimaryImage } from "@/features/product/services/productService";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";

function extractSpecs(product: ApiProduct): string[] {
    return product.specs.slice(0, 5).map((group) => {
        const base = group.options[0];
        if (!base) return group.name;
        return base.unit ? `${base.value} ${base.unit}` : base.value;
    });
}

export default function LimitedStockCard({ product }: { product: ApiProduct }) {
    const { t } = useTranslation("home");
    const router = useRouter();
    const params = useParams();
    const lang = (params?.lang as Lang) ?? "en";
    const dispatch = useDispatch<AppDispatch>();
    const { requireAuth, loginGate } = useLoginGate();
    const imageUrl = getPrimaryImage(product.media);
    const specs = extractSpecs(product);
    const effectivePrice = product.effectivePrice ?? 0;
    const basePrice = product.basePrice ?? effectivePrice;
    const detailHref = `/${lang}/${PATH_SLUGS.shop[lang] ?? "shop"}/${product.slug}`;

    const currencyCode = product.currency ?? "USD";
    const savings = Math.max(0, basePrice - effectivePrice);
    const discountPercent = basePrice > 0 && savings > 0 ? Math.round((savings / basePrice) * 100) : 0;
    const formatPrice = (amount: number): string => {
        try {
            return new Intl.NumberFormat(undefined, {
                style: "currency", currency: currencyCode,
                minimumFractionDigits: 0, maximumFractionDigits: 2,
            }).format(amount);
        } catch {
            return `${currencyCode} ${amount}`;
        }
    };

    function handleBuyNow() {
        if (!requireAuth()) return;
        // Buy Now checks out ONLY this product (never the cart) via the dedicated
        // single-item flow — same as the product detail page.
        const storeId = product.storeId ?? product.storeOptions?.[0]?.storeId;
        if (!storeId) return;
        dispatch(setBuyNow({
            productId: product.id,
            storeId,
            quantity: 1,
            title: product.title,
            imageUrl: imageUrl || undefined,
            price: effectivePrice,
            originalPrice: basePrice > effectivePrice ? basePrice : undefined,
            currency: product.currency ?? "USD",
            shippingFee: product.freeDelivery ? 0 : (product.deliveryFee ?? 0),
            quickDelivery: product.expressDelivery ?? false,
        }));
        router.push(`/${lang}/checkout?buyNow=1`);
    }

    return (
        <>
        {loginGate}
        <div
            onClick={() => router.push(detailHref)}
            role="link"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") router.push(detailHref); }}
            className="group relative rounded-[28px] w-full overflow-hidden flex-shrink-0 cursor-pointer transition-shadow duration-300 hover:shadow-[0_30px_80px_-30px_rgba(64,47,117,0.65)]"
            style={{ background: "linear-gradient(120deg, #281a52 0%, #402F75 40%, #5d4a96 72%, #7a64b5 100%)" }}
        >
            {/* Decorative glow orbs for depth */}
            <div className="pointer-events-none absolute -top-24 -right-16 w-80 h-80 rounded-full bg-[#FBBB14]/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 -left-20 w-96 h-96 rounded-full bg-purple-400/25 blur-3xl" />
            <div className="pointer-events-none absolute top-1/3 left-1/2 w-72 h-72 rounded-full bg-fuchsia-400/10 blur-3xl" />

            {/* Top badges */}
            <div className="absolute top-4 start-4 sm:top-5 sm:start-6 z-20 flex flex-wrap items-center gap-2">
                {discountPercent > 0 && (
                    <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#FBBB14] to-amber-300 text-[#1a0f3c] text-[11px] font-extrabold px-3 py-[6px] rounded-full shadow-[0_6px_16px_-4px_rgba(251,187,20,0.7)] uppercase tracking-wide">
                        <FlameIcon className="w-3.5 h-3.5" /> -{discountPercent}%
                    </span>
                )}
                {product.availabilityStatus === "LOW_STOCK" && (
                    <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-[6px] rounded-full border border-white/25">
                        <span className="relative flex w-1.5 h-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FBBB14] opacity-75" />
                            <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-[#FBBB14]" />
                        </span>
                        {t("limitedStock.onlyLeft")}
                    </span>
                )}
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-around px-6 sm:px-10 md:px-[60px] pt-16 pb-8 sm:pt-16 sm:pb-10 md:pt-[60px] md:pb-[50px] gap-6 md:gap-10">

                {/* Device image with golden halo */}
                <div className="relative flex items-center justify-center flex-shrink-0">
                    <div className="pointer-events-none absolute inset-0 m-auto w-[80%] h-[80%] rounded-full bg-[#FBBB14]/25 blur-3xl" />
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={product.title}
                            width={280}
                            height={280}
                            unoptimized
                            sizes="(max-width: 640px) 180px, (max-width: 768px) 230px, 280px"
                            className="w-[180px] sm:w-[230px] md:w-[280px] object-contain drop-shadow-2xl relative z-10 transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-[180px] sm:w-[230px] md:w-[280px] h-[180px] sm:h-[230px] md:h-[280px] bg-white/10 rounded-2xl relative z-10" />
                    )}
                </div>

                {/* Content */}
                <div className="flex flex-col items-center md:items-start text-center md:text-start min-w-0">
                    {product.brandName && (
                        <p className="text-[#FBBB14] text-[12px] font-bold tracking-[0.2em] uppercase mb-2">
                            {product.brandName}
                        </p>
                    )}
                    <h2 className="text-[22px] sm:text-[28px] md:text-[38px] font-extrabold text-white leading-[1.1] tracking-tight mb-4">
                        {product.title}
                    </h2>

                    {/* Specs */}
                    {specs.length > 0 && (
                        <ul className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                            {specs.map((spec) => (
                                <li key={spec} className="inline-flex items-center gap-[6px] bg-white/10 border border-white/10 rounded-full px-3 py-1.5 text-white/85 text-[12px] md:text-[13px] font-medium">
                                    <span className="w-[5px] h-[5px] rounded-full bg-[#FBBB14] flex-shrink-0" />
                                    {spec}
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Price + CTA */}
                    <div className="flex items-end gap-5 flex-wrap justify-center md:justify-start">
                        {effectivePrice > 0 && (
                            <div className="flex flex-col">
                                {basePrice > effectivePrice && (
                                    <span className="text-white/45 line-through text-[15px] font-medium leading-none mb-1.5">
                                        {formatPrice(basePrice)}
                                    </span>
                                )}
                                <span className="text-[34px] sm:text-[40px] md:text-[44px] font-black text-white leading-none tracking-tight">
                                    {formatPrice(effectivePrice)}
                                </span>
                            </div>
                        )}
                        {/* Stop the card's navigate-to-detail click when buying. */}
                        <span onClick={(e) => e.stopPropagation()}>
                            <button
                                type="button"
                                onClick={handleBuyNow}
                                className="group/btn relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#FBBB14] to-amber-400 px-7 py-3.5 text-[15px] font-bold text-[#1a0f3c] shadow-[0_10px_30px_-8px_rgba(251,187,20,0.8)] transition-all duration-200 hover:shadow-[0_14px_42px_-8px_rgba(251,187,20,0.95)] active:scale-95 cursor-pointer"
                            >
                                <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="relative">
                                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                                </svg>
                                <span className="relative">{t("limitedStock.buyNow")}</span>
                            </button>
                        </span>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}
