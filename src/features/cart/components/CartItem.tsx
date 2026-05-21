"use client";

import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import type { AppDispatch, RootState } from "@/store";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";
import {
    removeItem,
    updateQuantity,
    toggleSelectItem,
    saveForLater,
    moveToCart,
    removeItemThunk,
    updateQuantityThunk,
    selectSelectedIds,
    selectCartCurrency,
} from "../store/cartSlice";
import type { CartItemMeta } from "../types";
import MacPro14 from "@/assets/products/macpro14/1.png";

interface CartItemProps {
    item: CartItemMeta;
    showSaveForLater?: boolean;
}

export default function CartItem({ item, showSaveForLater = true }: CartItemProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useTranslation("cart");
    const selectedIds = useSelector(selectSelectedIds);
    const userId = useSelector((state: RootState) => state.auth.userId);
    const lang = useSelector((state: RootState) => state.language.lang) as Lang;
    const currency = useSelector(selectCartCurrency) ?? "$";
    const isSelected = selectedIds.includes(item.id);

    const shopSlug = PATH_SLUGS.shop?.[lang] ?? "shop";
    const productHref = item.slug ? `/${lang}/${shopSlug}/${item.slug}` : null;

    const subtotal = (item.price * item.quantity).toFixed(2);

    function handleDecrement() {
        if (item.quantity <= 1) return;
        const newQty = item.quantity - 1;
        dispatch(updateQuantity({ id: item.id, quantity: newQty }));
        if (userId && item.cartItemId) {
            dispatch(updateQuantityThunk({
                userId,
                cartItemId: item.cartItemId,
                localId: item.id,
                quantity: newQty,
                previousQuantity: item.quantity,
            }));
        }
    }

    function handleIncrement() {
        const newQty = item.quantity + 1;
        dispatch(updateQuantity({ id: item.id, quantity: newQty }));
        if (userId && item.cartItemId) {
            dispatch(updateQuantityThunk({
                userId,
                cartItemId: item.cartItemId,
                localId: item.id,
                quantity: newQty,
                previousQuantity: item.quantity,
            }));
        }
    }

    function handleRemove() {
        dispatch(removeItem(item.id));
        if (userId && item.cartItemId) {
            dispatch(removeItemThunk({ userId, cartItemId: item.cartItemId }));
        }
    }

    return (
        <div className="relative flex items-start gap-2.5 sm:gap-3 p-3 sm:p-4 md:p-5 bg-white rounded-2xl border border-[#FBBB14] shadow-sm hover:shadow-md transition-shadow">

            {/* ── Checkbox ── */}
            <div className="pt-1 flex-shrink-0">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => dispatch(toggleSelectItem(item.id))}
                    className="w-4 h-4 accent-[#402F75] cursor-pointer rounded"
                    aria-label={`Select ${item.title}`}
                />
            </div>

            {/* ── Quick Delivery badge ── */}
            {item.quickDelivery && (
                <span className="absolute top-2 end-2 z-10 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full leading-none flex items-center gap-1">
                    ⚡ {t("cartItems.quickDelivery")}
                </span>
            )}

            {/* ── Image with discount badge ── */}
            <div className="relative w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] md:w-[110px] md:h-[110px] rounded-xl border border-[#FBBB14] flex-shrink-0 flex items-center justify-center overflow-hidden">
                {productHref ? (
                    <Link href={productHref} className="w-full h-full">
                        <Image
                            src={item.imageUrl || MacPro14}
                            alt={item.title}
                            fill
                            className="object-contain p-2"
                            sizes="110px"
                        />
                    </Link>
                ) : (
                    <Image
                        src={item.imageUrl || MacPro14}
                        alt={item.title}
                        fill
                        className="object-contain p-2"
                        sizes="110px"
                    />
                )}
                {item.discountPercent > 0 && (
                    <span className="absolute top-1.5 start-1.5 bg-[#402F75] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none z-10">
                        -{item.discountPercent}%
                    </span>
                )}
            </div>

            {/* ── Info Block ── */}
            <div className="flex-1 min-w-0 flex flex-col gap-2">

                {/* Title + Price */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-3">
                    {productHref ? (
                        <Link href={productHref} className="font-bold text-[15px] sm:text-[17px] md:text-[20px] text-gray-900 leading-snug hover:text-[#402F75] transition-colors line-clamp-2 pe-14 sm:pe-0">
                            {item.title}
                        </Link>
                    ) : (
                        <h3 className="font-bold text-[15px] sm:text-[17px] md:text-[20px] text-gray-900 leading-snug line-clamp-2 pe-14 sm:pe-0">{item.title}</h3>
                    )}
                    <div className="flex sm:flex-col items-baseline sm:items-end gap-2 sm:gap-0.5 flex-shrink-0">
                        <span className="text-[#402F75] font-bold text-[16px] sm:text-[18px] md:text-[20px] whitespace-nowrap">
                            {currency} {(item.price ?? 0).toLocaleString()}
                        </span>
                        {item.originalPrice && item.originalPrice > item.price && (
                            <span className="text-gray-400 line-through text-[12px] sm:text-[14px] md:text-[15px] whitespace-nowrap">
                                {currency} {(item.originalPrice ?? 0).toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>

                {/* Short description — hide on the smallest screens to keep card compact */}
                {item.description && (
                    <p className="hidden sm:block text-[13px] text-gray-500 leading-snug line-clamp-2">
                        {item.description.length > 110 ? `${item.description.slice(0, 110).trimEnd()}...` : item.description}
                    </p>
                )}

                {/* Variant tags */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2 text-[11px] sm:text-[12px] text-gray-500">
                    <span className="bg-gray-50 border border-gray-100 rounded-md px-2 py-0.5">
                        {t("cartItems.color")}: <strong className="text-gray-700">{item.variant.color}</strong>
                    </span>
                    <span className="bg-gray-50 border border-gray-100 rounded-md px-2 py-0.5">
                        {t("cartItems.storage")}: <strong className="text-gray-700">{item.variant.storage}</strong>
                    </span>
                </div>

                {/* Qty + Subtotal + Actions */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-1">

                    {/* Qty + Subtotal */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <div className="flex items-center border border-[#FBBB14] rounded-[10px]">
                            <button
                                onClick={handleDecrement}
                                disabled={item.quantity <= 1}
                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-tl-[10px] rounded-bl-[10px] border-r border-[#FBBB14] flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                aria-label="Decrease quantity"
                            >
                                <svg width="12" height="2" viewBox="0 0 12 2" fill="#402F75">
                                    <rect width="12" height="2" rx="1" />
                                </svg>
                            </button>
                            <span className="w-9 sm:w-10 text-center font-bold text-[14px] text-[#402F75]">
                                {item.quantity}
                            </span>
                            <button
                                onClick={handleIncrement}
                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-tr-[10px] rounded-br-[10px] border-l border-[#FBBB14] flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                                aria-label="Increase quantity"
                            >
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="#402F75">
                                    <rect x="5" width="2" height="12" rx="1" />
                                    <rect y="5" width="12" height="2" rx="1" />
                                </svg>
                            </button>
                        </div>
                        {/* Subtotal */}
                        <div className="text-start">
                            <p className="text-[11px] sm:text-[12px] text-gray-400 leading-tight">{t("cartItems.subtotal")}:</p>
                            <p className="text-[#402F75] font-bold text-[14px] sm:text-[16px] leading-tight">{currency} {subtotal}</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {showSaveForLater && !item.savedForLater && (
                            <button
                                onClick={() => dispatch(saveForLater(item.id))}
                                className="text-[12px] sm:text-[13px] text-[#402F75] py-[6px] px-[10px] rounded-[10px] border border-[#FBBB14] font-medium cursor-pointer hover:bg-[#FBBB14]/10 transition-colors whitespace-nowrap"
                            >
                                {t("cartItems.saveForLater")}
                            </button>
                        )}
                        {item.savedForLater && (
                            <button
                                onClick={() => dispatch(moveToCart(item.id))}
                                className="text-[12px] sm:text-[13px] text-[#402F75] py-[6px] px-[10px] rounded-[10px] border border-[#FBBB14] font-medium hover:bg-[#FBBB14]/10 transition-colors cursor-pointer whitespace-nowrap"
                            >
                                {t("cartItems.moveToCart")}
                            </button>
                        )}
                        <button
                            onClick={handleRemove}
                            className="border border-[#FFC9C9] py-[6px] px-[10px] rounded-[10px] flex items-center gap-1.5 text-[12px] sm:text-[13px] text-[#FB2C36] font-medium hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap"
                            aria-label={`Remove ${item.title}`}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FB2C36" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                                <path d="M10 11v6M14 11v6" />
                                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                            </svg>
                            <span className="hidden sm:inline">{t("cartItems.remove")}</span>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
