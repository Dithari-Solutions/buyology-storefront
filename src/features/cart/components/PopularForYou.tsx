"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import type { RootState } from "@/store";
import type { Lang } from "@/config/pathSlugs";
import ProductCard from "@/features/product/components/ProductCard";
import { selectSelectedCountryCode, selectPreferredCurrency } from "@/features/country/store/countrySlice";
import { selectCartItems } from "../store/cartSlice";
import { getPopularForYou, type ApiProduct } from "@/features/product/services/productService";
import { getImageUrl } from "@/shared/utils/imageUrl";

export default function PopularForYou() {
    const { t, i18n } = useTranslation("cart");
    const cartItems = useSelector(selectCartItems);
    const countryCode = useSelector(selectSelectedCountryCode);
    const currency = useSelector(selectPreferredCurrency);
    const lang = (i18n.language as Lang) ?? "en";
    const [products, setProducts] = useState<ApiProduct[]>([]);

    const productIds = cartItems.map((i) => i.productId).filter(Boolean) as string[];
    const cartKey = productIds.join(",");

    useEffect(() => {
        let cancelled = false;
        if (productIds.length === 0) {
            setProducts([]);
            return;
        }
        (async () => {
            try {
                const result = await getPopularForYou(productIds, { lang, countryCode, currency });
                if (!cancelled) setProducts(result);
            } catch {
                if (!cancelled) setProducts([]);
            }
        })();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cartKey, lang, countryCode, currency]);

    if (products.length === 0) return null;

    return (
        <section className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
                {t("popularForYou.title", { defaultValue: "Popular for you" })}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((p) => (
                    <ProductCard
                        key={p.id}
                        productId={p.id}
                        storeId={p.storeId ?? undefined}
                        slugs={{ en: p.slug, az: p.slug, ar: p.slug }}
                        title={p.title}
                        price={p.storePrice ?? p.effectivePrice ?? 0}
                        originalPrice={p.basePrice ?? 0}
                        discount={p.discountValue ?? 0}
                        currency={p.currency ?? currency ?? "USD"}
                        inStock={p.availabilityStatus === "IN_STOCK"}
                        category={p.categoryId}
                        imageUrl={getImageUrl(p.media?.[0]?.url) ?? ""}
                        expressDelivery={p.expressDelivery}
                        storeOptions={p.storeOptions}
                        availableInSelectedCountry={p.availableInSelectedCountry}
                    />
                ))}
            </div>
        </section>
    );
}
