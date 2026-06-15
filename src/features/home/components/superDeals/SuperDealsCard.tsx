"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";
import CartIcon from "@/assets/icons/cart.png";
import { FlameIcon } from "@/shared/icons";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import type { ApiProduct } from "@/features/product/services/productService";
import { getPrimaryImage } from "@/features/product/services/productService";
import { addItem, selectCartItems } from "@/features/cart/store/cartSlice";
import {
    addToFavouritesThunk,
    removeFromFavouritesThunk,
    selectIsFavourite,
} from "@/features/favourites/store/favouritesSlice";
import { useLoginGate } from "@/features/auth/hooks/useLoginGate";

function extractSpecs(product: ApiProduct): string[] {
    return product.specs.slice(0, 4).map((group) => {
        const base = group.options[0];
        if (!base) return group.name;
        return base.unit ? `${base.value} ${base.unit}` : base.value;
    });
}

export default function SuperDealsCard({ product }: { product: ApiProduct }) {
    const { t } = useTranslation("home");
    const router = useRouter();
    const params = useParams();
    const lang = (params?.lang as Lang) ?? "en";
    const detailHref = `/${lang}/${PATH_SLUGS.shop[lang] ?? "shop"}/${product.slug}`;

    const dispatch = useDispatch<AppDispatch>();
    const userId = useSelector((state: RootState) => state.auth.userId);
    const { requireAuth, loginGate } = useLoginGate();
    const isFav = useSelector((state: RootState) => selectIsFavourite(product.id)(state));
    const cartItems = useSelector(selectCartItems);
    const isInCart = cartItems.some((i) => i.productId === product.id);

    const imageUrl = getPrimaryImage(product.media);
    const specs = extractSpecs(product);
    const effectivePrice = product.storePrice ?? product.effectivePrice ?? 0;
    // Store-scoped pre-discount price from the backend (present only when discounted).
    const basePrice = product.originalPrice ?? product.basePrice ?? effectivePrice;
    const savings = Math.max(0, basePrice - effectivePrice);
    const currencyCode = product.currency ?? "USD";
    const formatPrice = (amount: number): string => {
        try {
            return new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: currencyCode,
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            }).format(amount);
        } catch {
            return `${currencyCode} ${amount}`;
        }
    };
    const discountPercent =
        basePrice > 0 && savings > 0
            ? Math.round((savings / basePrice) * 100)
            : 0;

    const [added, setAdded] = useState(false);
    const [favBounce, setFavBounce] = useState(false);

    function handleAddToCart(e: React.MouseEvent) {
        e.stopPropagation();
        if (!requireAuth()) return;
        if (isInCart) return;
        dispatch(
            addItem({
                id: `cart-${product.id}-${Date.now()}`,
                productId: product.id,
                title: product.title,
                description: product.description,
                imageUrl: imageUrl || "",
                slug: product.slug,
                variant: { color: product.colors?.[0] ?? "Default", storage: "" },
                price: effectivePrice,
                originalPrice: basePrice,
                discountPercent,
                quantity: 1,
                savedForLater: false,
            })
        );
        setAdded(true);
        setTimeout(() => setAdded(false), 1600);
    }

    function handleFav(e: React.MouseEvent) {
        e.stopPropagation();
        if (!requireAuth() || !userId) return;
        setFavBounce(true);
        setTimeout(() => setFavBounce(false), 400);
        if (isFav) {
            dispatch(removeFromFavouritesThunk({ userId, productId: product.id }));
        } else {
            dispatch(
                addToFavouritesThunk({
                    userId,
                    productId: product.id,
                    meta: {
                        id: product.id,
                        title: product.title,
                        description: product.description,
                        price: effectivePrice,
                        originalPrice: basePrice,
                        discount: savings,
                        currency: currencyCode,
                        rating: Number(product.averageRating ?? 0),
                        inStock: product.availabilityStatus === "IN_STOCK",
                        category: product.categoryId,
                        slugs: { en: product.slug, az: product.slug, ar: product.slug },
                        imageUrl: imageUrl || undefined,
                    },
                })
            );
        }
    }

    return (
        <>
        {loginGate}
        <div
            onClick={() => router.push(detailHref)}
            role="link"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") router.push(detailHref); }}
            className="group relative w-[300px] sm:w-[420px] md:w-[560px] h-[230px] sm:h-[260px] md:h-[290px] p-[12px] md:p-[14px] bg-white rounded-[22px] border border-gray-100 flex flex-row gap-[14px] md:gap-[18px] cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-[0_20px_50px_-20px_rgba(64,47,117,0.4)]">

            {/* Image section */}
            <div className="relative overflow-hidden rounded-[16px] bg-gradient-to-br from-[#F4F1FF] via-white to-[#FFF7E8] flex items-center justify-center w-[120px] sm:w-[150px] md:w-[185px] flex-shrink-0 h-full">
                {discountPercent > 0 && (
                    <span className="absolute top-[8px] left-[8px] z-10 inline-flex items-center gap-[3px] bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] sm:text-[11px] font-bold px-[8px] py-[4px] rounded-full leading-none shadow-[0_4px_12px_-2px_rgba(244,63,94,0.6)]">
                        <FlameIcon className="w-3 h-3" /> -{discountPercent}%
                    </span>
                )}
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={product.title}
                        width={150}
                        height={130}
                        unoptimized
                        sizes="(max-width: 640px) 100px, (max-width: 768px) 120px, 145px"
                        className="object-contain w-[100px] sm:w-[120px] md:w-[145px] relative z-[1] transition-transform duration-500 ease-out group-hover:scale-110"
                    />
                ) : (
                    <div className="w-[100px] sm:w-[120px] md:w-[145px] h-[130px] bg-gray-200 rounded-lg relative z-[1]" />
                )}
            </div>

            {/* Details section */}
            <div className="flex flex-col justify-between flex-1 min-w-0 py-[2px]">

                {/* Title */}
                <h3 className="font-bold text-[15px] md:text-[18px] leading-snug text-gray-900 truncate pr-2 group-hover:text-[#402F75] transition-colors duration-200">
                    {product.title}
                </h3>

                {/* Specs grid */}
                <div className="grid grid-cols-2 gap-[6px]">
                    {specs.map((spec, i) => (
                        <div key={i} className="flex items-center gap-[5px] bg-gray-50 rounded-[9px] px-[9px] py-[5px]">
                            <span className="w-[4px] h-[4px] rounded-full bg-[#FBBB14] flex-shrink-0" />
                            <span className="text-[11px] text-gray-600 font-medium truncate">{spec}</span>
                        </div>
                    ))}
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-100" />

                {/* Price + Actions */}
                <div className="flex items-end justify-between gap-[8px]">

                    {/* Price block */}
                    <div className="flex flex-col gap-[2px]">
                        {savings > 0 && (
                            <span className="text-gray-400 line-through text-[12px] leading-none">{formatPrice(basePrice)}</span>
                        )}
                        <span className="text-[18px] sm:text-[20px] md:text-[24px] text-[#402F75] font-extrabold leading-none tracking-tight">
                            {formatPrice(effectivePrice)}
                        </span>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-[6px]">
                        {/* Fav button */}
                        <motion.button
                            onClick={handleFav}
                            type="button"
                            aria-label={isFav ? t("superDeals.removeFromFavorites", { defaultValue: "Remove from favorites" }) : t("superDeals.addToFavorites", { defaultValue: "Add to favorites" })}
                            aria-pressed={isFav}
                            animate={favBounce ? { scale: [1, 1.45, 0.85, 1.1, 1] } : { scale: 1 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className={`cursor-pointer border rounded-full bg-white/80 backdrop-blur-sm hover:bg-white hover:scale-105 active:scale-95 transition-all p-[6px] sm:p-[8px] shadow-[0_4px_12px_-2px_rgba(64,47,117,0.2)] ${isFav ? "border-[#FBBB14] bg-yellow-50/90" : "border-gray-100"}`}
                        >
                            <motion.svg
                                width={14} height={14}
                                viewBox="0 0 24 24"
                                fill={isFav ? "#FBBB14" : "none"}
                                stroke={isFav ? "#FBBB14" : "#9ca3af"}
                                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                                animate={isFav ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </motion.svg>
                        </motion.button>

                        {/* Cart button */}
                        <div className="relative">
                            <motion.button
                                onClick={handleAddToCart}
                                type="button"
                                aria-label={t("superDeals.addToCart")}
                                animate={added
                                    ? { scale: [1, 0.88, 1.06, 1], transition: { duration: 0.35, ease: "easeOut" } }
                                    : { scale: 1 }
                                }
                                className={`flex items-center justify-center gap-[5px] rounded-full cursor-pointer font-bold transition-all duration-300 active:scale-95 p-[8px] sm:py-[8px] sm:px-[12px] md:py-[9px] md:px-[14px] ${
                                    added ? "bg-green-500 text-white shadow-[0_6px_16px_-4px_rgba(34,197,94,0.6)]" : "bg-gradient-to-r from-[#FBBB14] to-amber-400 text-white shadow-[0_4px_12px_-2px_rgba(251,187,20,0.5)] hover:shadow-[0_8px_20px_-4px_rgba(251,187,20,0.7)]"
                                }`}
                            >
                                <AnimatePresence mode="wait" initial={false}>
                                    {added ? (
                                        <motion.span
                                            key="added"
                                            initial={{ opacity: 0, scale: 0.6 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.6 }}
                                            transition={{ duration: 0.2 }}
                                            className="flex items-center gap-[5px]"
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                            <span className="hidden sm:inline text-[11px] md:text-[12px] whitespace-nowrap">Added!</span>
                                        </motion.span>
                                    ) : (
                                        <motion.span
                                            key="add"
                                            initial={{ opacity: 0, scale: 0.6 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.6 }}
                                            transition={{ duration: 0.2 }}
                                            className="flex items-center gap-[5px]"
                                        >
                                            <Image src={CartIcon} alt="cart" width={14} height={14} style={{ filter: "brightness(0) invert(1)" }} />
                                            <span className="hidden sm:inline text-[11px] md:text-[12px] whitespace-nowrap">{isInCart ? t("superDeals.inCart", { defaultValue: "In Cart" }) : t("superDeals.addToCart")}</span>
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}
