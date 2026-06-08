"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { COLORS } from "@/shared/styles/variables";
import CartIcon from "@/assets/icons/cart.png";
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

function extractSpecs(product: ApiProduct): string[] {
    return product.specs.slice(0, 4).map((group) => {
        const base = group.options[0];
        if (!base) return group.name;
        return base.unit ? `${base.value} ${base.unit}` : base.value;
    });
}

export default function SuperDealsCard({ product }: { product: ApiProduct }) {
    const { t } = useTranslation("home");
    const id = useId();
    const clipId = `superDealClip-${id.replace(/[^a-zA-Z0-9-]/g, "")}`;

    const dispatch = useDispatch<AppDispatch>();
    const userId = useSelector((state: RootState) => state.auth.userId);
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
        if (!userId) return;
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
                        rating: 0,
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
        <div className="relative w-[300px] sm:w-[420px] md:w-[560px] h-[230px] sm:h-[260px] md:h-[290px] p-[10px] bg-white rounded-[20px] border border-[#FBBB14] flex flex-row gap-[12px] md:gap-[16px] cursor-pointer hover:shadow-md transition-shadow">

            {/* Image section */}
            <div className="relative overflow-hidden rounded-[14px] flex items-center justify-center w-[120px] sm:w-[150px] md:w-[185px] flex-shrink-0 h-full">
                <svg width="0" height="0" className="absolute">
                    <defs>
                        <clipPath id={clipId} clipPathUnits="objectBoundingBox">
                            <path d="M 0,0 L 0.55,0 C 0.64,0 0.64,0.08 0.64,0.08 L 0.64,0.16 C 0.64,0.23 0.75,0.23 0.75,0.23 L 0.86,0.23 C 1,0.23 1,0.31 1,0.31 L 1,1 L 0,1 Z" />
                        </clipPath>
                    </defs>
                </svg>
                <div
                    className="absolute inset-0 bg-[#F6F4FF]"
                    style={{ clipPath: `url(#${clipId})` }}
                />
                {discountPercent > 0 && (
                    <div
                        className="absolute top-[6px] right-[6px] z-10 flex items-center justify-center w-[30px] h-[30px] sm:w-[38px] sm:h-[38px] md:w-[46px] md:h-[46px] rounded-full text-white text-[8px] sm:text-[10px] md:text-xs font-bold"
                        style={{ backgroundColor: COLORS.primary }}
                    >
                        -{discountPercent}%
                    </div>
                )}
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={product.title}
                        width={150}
                        height={130}
                        unoptimized
                        sizes="(max-width: 640px) 100px, (max-width: 768px) 120px, 145px"
                        className="object-contain w-[100px] sm:w-[120px] md:w-[145px] relative z-10"
                    />
                ) : (
                    <div className="w-[100px] sm:w-[120px] md:w-[145px] h-[130px] bg-gray-200 rounded-lg relative z-10" />
                )}
            </div>

            {/* Details section */}
            <div className="flex flex-col justify-between flex-1 min-w-0 py-[4px]">

                {/* Title */}
                <h3 className="font-bold text-[15px] md:text-[17px] leading-snug text-gray-900 truncate pr-2">
                    {product.title}
                </h3>

                {/* Specs grid */}
                <div className="grid grid-cols-2 gap-[5px]">
                    {specs.map((spec, i) => (
                        <div key={i} className="flex items-center gap-[5px] bg-gray-50 rounded-[8px] px-[8px] py-[5px]">
                            <span className="w-[4px] h-[4px] rounded-full bg-gray-400 flex-shrink-0" />
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
                            <div className="flex items-center gap-[5px]">
                                <span className="bg-[#402F75] text-white text-[10px] font-bold px-[7px] py-[2px] rounded-full leading-tight">
                                    -{discountPercent}%
                                </span>
                                <span className="text-gray-400 line-through text-[12px]">{formatPrice(basePrice)}</span>
                            </div>
                        )}
                        <span className="text-[17px] sm:text-[19px] md:text-[21px] text-[#402F75] font-bold leading-none">
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
                            className={`cursor-pointer border rounded-full bg-white hover:shadow-md transition-shadow p-[5px] sm:p-[7px] ${isFav ? "border-[#FBBB14]" : "border-gray-200"}`}
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
                                className={`flex items-center justify-center gap-[5px] rounded-[30px] cursor-pointer font-bold transition-colors duration-300 p-[7px] sm:py-[7px] sm:px-[10px] md:py-[8px] md:px-[12px] ${
                                    added ? "bg-green-500 text-white" : "bg-[#FBBB14] text-white hover:bg-[#f0b000]"
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
    );
}
