"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useRouter, useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import Button from "@/shared/components/Button";
import { useLoginGate } from "@/features/auth/hooks/useLoginGate";
import { setBuyNow } from "@/features/buyNow/store/buyNowSlice";
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
            className="relative rounded-[24px] w-full overflow-hidden flex-shrink-0 cursor-pointer"
            style={{ background: "linear-gradient(115deg, #EDE8FB 0%, #D9CFEF 25%, #B4A5D5 55%, #6B59A8 80%, #402F75 100%)" }}
        >
            {/* Low-stock badge only — no "Limited Stock"/status label here */}
            {product.availabilityStatus === "LOW_STOCK" && (
                <div className="absolute top-4 start-4 sm:top-5 sm:start-6 z-10">
                    <span className="bg-white/20 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-[5px] rounded-full border border-white/30">
                        {t("limitedStock.onlyLeft")}
                    </span>
                </div>
            )}

            <div className="flex flex-col md:flex-row items-center justify-around px-6 sm:px-10 md:px-[60px] pt-16 pb-8 sm:pt-16 sm:pb-10 md:pt-[60px] md:pb-[50px] gap-6 md:gap-10">

                {/* Device image */}
                <div className="flex items-center justify-center flex-shrink-0">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={product.title}
                            width={280}
                            height={280}
                            unoptimized
                            sizes="(max-width: 640px) 180px, (max-width: 768px) 230px, 280px"
                            className="w-[180px] sm:w-[230px] md:w-[280px] object-contain drop-shadow-2xl"
                        />
                    ) : (
                        <div className="w-[180px] sm:w-[230px] md:w-[280px] h-[180px] sm:h-[230px] md:h-[280px] bg-white/10 rounded-2xl" />
                    )}
                </div>

                {/* Content */}
                <div className="flex flex-col items-center md:items-start text-center md:text-start">
                    {product.brandName && (
                        <p className="text-white/60 text-[13px] font-medium tracking-wide uppercase mb-2">
                            {product.brandName}
                        </p>
                    )}
                    <h2 className="text-[22px] sm:text-[28px] md:text-[36px] font-bold text-white leading-tight mb-4">
                        {product.title}
                    </h2>

                    {/* Specs */}
                    {specs.length > 0 && (
                        <ul className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-[6px] mb-6">
                            {specs.map((spec) => (
                                <li key={spec} className="flex items-center gap-[6px] text-white/75 text-[13px] md:text-[14px]">
                                    <span className="w-[5px] h-[5px] rounded-full bg-[#FBBB14] flex-shrink-0" />
                                    {spec}
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Price + CTA */}
                    <div className="flex items-center gap-5 flex-wrap justify-center md:justify-start">
                        {effectivePrice > 0 && (
                            <div className="flex items-baseline gap-2">
                                <span className="text-[32px] sm:text-[36px] font-extrabold text-white leading-none">
                                    ${effectivePrice.toFixed(0)}
                                </span>
                                {basePrice > effectivePrice && (
                                    <span className="text-white/40 line-through text-[16px] font-medium">
                                        ${basePrice.toFixed(0)}
                                    </span>
                                )}
                            </div>
                        )}
                        {/* Stop the card's navigate-to-detail click when buying. */}
                        <span onClick={(e) => e.stopPropagation()}>
                            <Button title={t("limitedStock.buyNow")} onClick={handleBuyNow} />
                        </span>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}
