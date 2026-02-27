"use client";

import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
    removeItem,
    updateQuantity,
    toggleSelectItem,
    saveForLater,
    moveToCart,
} from "../store/cartSlice";
import { selectSelectedIds } from "../store/cartSlice";
import type { CartItemMeta } from "../types";
import MacPro14 from "@/assets/products/macpro14/1.png";

interface CartItemProps {
    item: CartItemMeta;
    showSaveForLater?: boolean;
}

export default function CartItem({ item, showSaveForLater = true }: CartItemProps) {
    const dispatch = useDispatch();
    const { t } = useTranslation("cart");
    const selectedIds = useSelector(selectSelectedIds);
    const isSelected = selectedIds.includes(item.id);

    const subtotal = (item.price * item.quantity).toFixed(2);

    function handleDecrement() {
        if (item.quantity > 1) {
            dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }));
        }
    }

    function handleIncrement() {
        dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }));
    }

    return (
        <div className="flex items-start gap-3 p-4 sm:p-5 bg-white rounded-2xl border border-[#FBBB14] shadow-sm hover:shadow-md transition-shadow">

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

            {/* ── Image with discount badge ── */}
            <div className="relative w-[90px] h-[90px] sm:w-[110px] sm:h-[110px] rounded-xl border border-[#FBBB14] flex-shrink-0 flex items-center justify-center overflow-hidden">
                <Image
                    src={MacPro14}
                    alt={item.title}
                    fill
                    className="object-contain p-2"
                    sizes="110px"
                />
                {item.discountPercent > 0 && (
                    <span className="absolute top-1.5 start-1.5 bg-[#402F75] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none z-10">
                        -{item.discountPercent}%
                    </span>
                )}
            </div>

            {/* ── Info Block ── */}
            <div className="flex-1 min-w-0 flex flex-col gap-2">

                {/* Title + Price */}
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-[20px] text-gray-900 leading-snug">{item.title}</h3>
                    <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                        <span className="text-[#402F75] font-bold text-[20px]">
                            ${item.price.toLocaleString()}
                        </span>
                        <span className="text-gray-400 line-through text-[15px]">
                            ${item.originalPrice.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Variant tags */}
                <div className="flex flex-wrap gap-2 text-[12px] text-gray-500">
                    <span className="bg-gray-50 border border-gray-100 rounded-md px-2 py-0.5">
                        {t("cartItems.color")}: <strong className="text-gray-700">{item.variant.color}</strong>
                    </span>
                    <span className="bg-gray-50 border border-gray-100 rounded-md px-2 py-0.5">
                        {t("cartItems.storage")}: <strong className="text-gray-700">{item.variant.storage}</strong>
                    </span>
                </div>

                {/* Qty + Subtotal + Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-1">

                    {/* Qty control */}
                    <div className="flex items-center gap-2">
                        <span className="text-[12px] text-gray-500 font-medium me-1">
                            {t("cartItems.qty")}:
                        </span>
                        <div className="flex items-center border border-[#FBBB14] rounded-[10px]">
                            <button
                                onClick={handleDecrement}
                                disabled={item.quantity <= 1}
                                className="w-10 h-10 rounded-tl-[10px] rounded-bl-[10px] border-r border-[#FBBB14] flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                aria-label="Decrease quantity"
                            >
                                <svg width="12" height="2" viewBox="0 0 12 2" fill="#402F75">
                                    <rect width="12" height="2" rx="1" />
                                </svg>
                            </button>
                            <span className="w-10 text-center font-bold text-[14px] text-[#402F75]">
                                {item.quantity}
                            </span>
                            <button
                                onClick={handleIncrement}
                                className="w-10 h-10 rounded-tr-[10px] rounded-br-[10px] border-l border-[#FBBB14] flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
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
                            <p className="text-[14px] text-gray-400">{t("cartItems.subtotal")}:</p>
                            <p className="text-[#402F75] font-bold text-[16px]">${subtotal}</p>
                        </div>
                    </div>

                    {/* Subtotal + Remove */}
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                            {showSaveForLater && !item.savedForLater && (
                                <button
                                    onClick={() => dispatch(saveForLater(item.id))}
                                    className="text-[15px] text-[#402F75] py-[5px] px-[10px] rounded-[10px] border border-[#FBBB14] font-medium cursor-pointer"
                                >
                                    {t("cartItems.saveForLater")}
                                </button>
                            )}
                            {item.savedForLater && (
                                <button
                                    onClick={() => dispatch(moveToCart(item.id))}
                                    className="text-[12px] text-[#402F75] font-medium hover:underline cursor-pointer"
                                >
                                    {t("cartItems.moveToCart")}
                                </button>
                            )}
                            <button
                                onClick={() => dispatch(removeItem(item.id))}
                                className="border border-[#FFC9C9] py-[5px] px-[10px] rounded-[10px] flex items-center gap-1.5 text-[15px] text-[#FB2C36] font-medium hover:text-red-600 transition-colors cursor-pointer"
                                aria-label={`Remove ${item.title}`}
                            >
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#FB2C36" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                                    <path d="M10 11v6M14 11v6" />
                                    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                                </svg>
                                {t("cartItems.remove")}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
