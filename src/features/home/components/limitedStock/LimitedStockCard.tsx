"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useRouter, useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { useLoginGate } from "@/features/auth/hooks/useLoginGate";
import { setBuyNow } from "@/features/buyNow/store/buyNowSlice";
import { buyNowIntent } from "@/shared/lib/pendingIntent";
import type { AppDispatch } from "@/store";
import type { ApiProduct } from "@/features/product/services/productService";
import { getPrimaryImage } from "@/features/product/services/productService";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";
import { shouldSkipOptimization } from "@/shared/utils/imageUrl";

// Scalloped "seal" path for the discount badge (12 soft bumps in a 100×100 box).
const SEAL_D = (() => {
    const bumps = 12, cx = 50, cy = 50, rO = 49, rI = 40;
    const step = (Math.PI * 2) / bumps;
    let d = "";
    for (let i = 0; i < bumps; i++) {
        const a = i * step - Math.PI / 2;
        const aMid = a + step / 2;
        const px = cx + rO * Math.cos(a), py = cy + rO * Math.sin(a);
        const ctrlX = cx + rI * Math.cos(aMid), ctrlY = cy + rI * Math.sin(aMid);
        const nx = cx + rO * Math.cos(a + step), ny = cy + rO * Math.sin(a + step);
        if (i === 0) d += `M ${px.toFixed(2)} ${py.toFixed(2)}`;
        d += ` Q ${ctrlX.toFixed(2)} ${ctrlY.toFixed(2)} ${nx.toFixed(2)} ${ny.toFixed(2)}`;
    }
    return d + " Z";
})();

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
    const isRtl = lang === "ar";
    const dispatch = useDispatch<AppDispatch>();
    const { requireAuth, loginGate } = useLoginGate();
    const imageUrl = getPrimaryImage(product.media);
    const specs = extractSpecs(product);
    // Country-scoped pricing comes back on storePrice/originalPrice (already in the
    // display currency); fall back to the native effective/base price otherwise.
    const effectivePrice = product.storePrice ?? product.effectivePrice ?? 0;
    const basePrice = product.originalPrice ?? product.basePrice ?? effectivePrice;
    const detailHref = `/${lang}/${PATH_SLUGS.shop[lang] ?? "shop"}/${product.slug}`;

    const currencyCode = product.currency ?? "USD";
    const savings = Math.max(0, basePrice - effectivePrice);
    const discountPercent = basePrice > 0 && savings > 0 ? Math.round((savings / basePrice) * 100) : 0;
    const stockLeft = typeof product.stockQuantity === "number" && product.stockQuantity > 0 ? product.stockQuantity : null;
    const showLowStock = product.availabilityStatus === "LOW_STOCK" || (stockLeft !== null && stockLeft < 5);
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
        // Buy Now checks out ONLY this product (never the cart) via the dedicated
        // single-item flow — same as the product detail page.
        const storeId = product.storeId ?? product.storeOptions?.[0]?.storeId;
        if (!storeId) return;
        const buyNowItem = {
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
        };
        // Guest → stash the single-item buy so it's replayed after sign-in and the
        // user lands on checkout, not the home page.
        if (!requireAuth(buyNowIntent(lang, buyNowItem))) return;
        dispatch(setBuyNow(buyNowItem));
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
            className="group relative rounded-[28px] w-full overflow-hidden flex-shrink-0 cursor-pointer transition-shadow duration-300 hover:shadow-[0_30px_80px_-30px_rgba(64,47,117,0.6)]"
            style={{ background: `linear-gradient(${isRtl ? "255deg" : "105deg"}, #C7B8EC 0%, #A78FDD 22%, #6A54B2 44%, #56449A 100%)` }}
        >
            {/* Soft decorative glows */}
            <div className="pointer-events-none absolute -bottom-24 -end-16 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -top-20 end-1/3 w-72 h-72 rounded-full bg-[#FBBB14]/10 blur-3xl" />
            {/* Content-side scrim guarantees AA legibility for the white text */}
            <div
                className="pointer-events-none absolute inset-y-0 end-0 w-3/4"
                style={{ background: isRtl
                    ? "linear-gradient(to right, rgba(38,26,82,0.5) 0%, rgba(38,26,82,0.22) 45%, transparent 78%)"
                    : "linear-gradient(to left, rgba(38,26,82,0.5) 0%, rgba(38,26,82,0.22) 45%, transparent 78%)" }}
            />

            {/* Discount seal over the image */}
            {discountPercent > 0 && (
                <div className="absolute top-3 start-3 sm:top-4 sm:start-5 z-30 w-[68px] h-[68px] sm:w-[84px] sm:h-[84px] drop-shadow-[0_6px_14px_rgba(64,47,117,0.35)]">
                    <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
                        <path d={SEAL_D} fill="#FBBB14" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[#402F75] font-extrabold text-[17px] sm:text-[20px]">
                        -{discountPercent}%
                    </span>
                </div>
            )}

            {/* Limited-stock badges, top end */}
            <div className="absolute top-4 end-4 sm:top-5 sm:end-6 z-30 flex flex-col items-end gap-2">
                <span className="inline-flex items-center gap-1.5 bg-[#FBBB14] text-[#402F75] text-[12px] font-extrabold px-3.5 py-1.5 rounded-full shadow-[0_6px_16px_-4px_rgba(251,187,20,0.6)]">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M10.3 3.5 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.5a2 2 0 0 0-3.4 0z" />
                        <path d="M12 9v4M12 17h.01" />
                    </svg>
                    {t("limitedStock.badge")}
                </span>
                {showLowStock && (
                    <span className="inline-flex items-center gap-1.5 bg-[#FBBB14]/90 text-[#402F75] text-[11px] font-bold px-3 py-1 rounded-full">
                        {stockLeft !== null
                            ? t("limitedStock.onlyLeftCount", { count: stockLeft, defaultValue: `Only ${stockLeft} left` })
                            : t("limitedStock.onlyLeft")}
                    </span>
                )}
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10 px-6 sm:px-10 md:px-[56px] pt-16 pb-9 sm:pt-16 sm:pb-10 md:py-[54px]">

                {/* Device image */}
                <div className="relative flex items-center justify-center flex-shrink-0">
                    <div className="pointer-events-none absolute inset-0 m-auto w-[78%] h-[78%] rounded-full bg-white/20 blur-3xl" />
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={product.title}
                            width={300}
                            height={300}
                            unoptimized={shouldSkipOptimization(imageUrl)}
                            sizes="(max-width: 640px) 190px, (max-width: 768px) 230px, 300px"
                            className="w-[190px] sm:w-[230px] md:w-[300px] object-contain drop-shadow-2xl relative z-10 transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-[190px] sm:w-[230px] md:w-[300px] h-[190px] sm:h-[230px] md:h-[300px] bg-white/10 rounded-2xl relative z-10" />
                    )}
                </div>

                {/* Content */}
                <div className="flex flex-col items-center md:items-start text-center md:text-start min-w-0 flex-1 w-full">
                    <p className="text-white/95 text-[13px] sm:text-[15px] font-semibold mb-1.5 line-clamp-1">
                        {product.title}
                    </p>
                    <h2 className="text-[24px] sm:text-[30px] md:text-[38px] font-extrabold text-white leading-[1.08] tracking-tight mb-4">
                        {t("limitedStock.headlineLine1")} {t("limitedStock.headlineLine2")}
                    </h2>

                    {/* Specs — gold-dotted inline list */}
                    {specs.length > 0 && (
                        <div className="flex flex-wrap justify-center md:justify-start gap-x-5 gap-y-2 mb-6">
                            {specs.map((spec) => (
                                <span key={spec} className="inline-flex items-center gap-2 text-white text-[12.5px] md:text-[14px] font-medium">
                                    <span className="w-[6px] h-[6px] rounded-full bg-[#FBBB14] flex-shrink-0" />
                                    {spec}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Price + Buy Now */}
                    <div className="w-full flex items-center justify-center md:justify-between gap-5 flex-wrap mt-1">
                        {effectivePrice > 0 && (
                            <div className="flex items-end gap-2.5">
                                <span className="text-[32px] sm:text-[38px] md:text-[44px] font-black text-white leading-none tracking-tight">
                                    {formatPrice(effectivePrice)}
                                </span>
                                {basePrice > effectivePrice && (
                                    <span className="text-white/75 line-through text-[16px] sm:text-[18px] font-medium leading-none mb-1">
                                        {formatPrice(basePrice)}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Stop the card's navigate-to-detail click/Enter when buying. */}
                        <span onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                            <button
                                type="button"
                                onClick={handleBuyNow}
                                className="group/btn inline-flex items-center gap-2.5 rounded-full bg-white ps-1.5 pe-6 py-1.5 text-[15px] font-bold text-[#402F75] shadow-[0_10px_30px_-10px_rgba(20,12,50,0.6)] transition-all duration-200 hover:shadow-[0_16px_44px_-10px_rgba(20,12,50,0.75)] active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#58469E]"
                            >
                                <span className="w-9 h-9 rounded-full bg-[#402F75] flex items-center justify-center text-white transition-transform duration-300 group-hover/btn:rotate-45">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="rtl:-scale-x-100">
                                        <path d="M7 17 17 7M9 7h8v8" />
                                    </svg>
                                </span>
                                {t("limitedStock.buyNow")}
                            </button>
                        </span>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}
