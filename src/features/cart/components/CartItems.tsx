"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import type { AppDispatch, RootState } from "@/store";
import { clearCart, clearCartThunk, selectCartItems, selectSavedItems, selectCartLoading } from "../store/cartSlice";
import CartItem from "./CartItem";

function CartItemSkeleton() {
    return (
        <div className="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-4 md:p-5 bg-white rounded-2xl border border-[#FBBB14] shadow-sm animate-pulse min-h-[200px] sm:min-h-[180px] md:min-h-[170px] overflow-hidden">
            {/* Checkbox skeleton */}
            <div className="pt-1 flex-shrink-0">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
            </div>

            {/* Image skeleton */}
            <div className="relative w-[90px] h-[90px] sm:w-[110px] sm:h-[110px] rounded-xl border border-[#FBBB14] flex-shrink-0 flex items-center justify-center overflow-hidden bg-gray-100">
                <div className="w-full h-full bg-gray-200"></div>
            </div>

            {/* Info Block skeleton */}
            <div className="flex-1 min-w-0 flex flex-col gap-2">
                {/* Title + Price skeleton */}
                <div className="flex items-start justify-between gap-2">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                        <div className="h-4 bg-gray-100 rounded w-12"></div>
                    </div>
                </div>

                {/* Variant tags skeleton */}
                <div className="flex flex-wrap gap-2">
                    <div className="h-6 bg-gray-100 rounded-md w-20"></div>
                    <div className="h-6 bg-gray-100 rounded-md w-24"></div>
                </div>

                {/* Qty + Subtotal + Actions skeleton */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-1">
                    {/* Qty control skeleton */}
                    <div className="flex items-center gap-2">
                        <div className="h-4 bg-gray-200 rounded w-8"></div>
                        <div className="flex items-center border border-[#FBBB14] rounded-[10px] px-3 py-2 gap-3">
                            <div className="w-4 h-4 bg-gray-200 rounded"></div>
                            <div className="w-6 h-4 bg-gray-200 rounded"></div>
                            <div className="w-4 h-4 bg-gray-200 rounded"></div>
                        </div>
                        <div className="text-start">
                            <div className="h-4 bg-gray-100 rounded w-16 mb-1"></div>
                            <div className="h-5 bg-gray-200 rounded w-12"></div>
                        </div>
                    </div>

                    {/* Actions skeleton */}
                    <div className="flex items-center gap-3">
                        <div className="h-8 bg-gray-100 rounded-md w-24"></div>
                        <div className="h-8 bg-red-100 rounded-md w-20"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CartItems() {
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useTranslation("cart");
    const userId = useSelector((state: RootState) => state.auth.userId);

    const cartItems = useSelector(selectCartItems);
    const savedItems = useSelector(selectSavedItems);
    const loading = useSelector(selectCartLoading);
    const [confirmingClear, setConfirmingClear] = useState(false);

    function handleClearCart() {
        dispatch(clearCart());
        if (userId) {
            dispatch(clearCartThunk(userId));
        }
        setConfirmingClear(false);
    }

    return (
        <div className="flex flex-col gap-6">

            {/* ── Active Cart Section ── */}
            <section className="bg-white p-3 sm:p-4 md:p-[20px] rounded-2xl md:rounded-[20px]">
                <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-3 flex-wrap">
                    <h2 className="text-[16px] sm:text-[18px] font-bold text-gray-900">
                        {t("cartItems.heading")}{" "}
                        <span className="text-gray-400 font-normal">
                            ({loading.cart || loading.products ? "..." : cartItems.length})
                        </span>
                    </h2>
                    {cartItems.length > 0 && !loading.cart && !loading.products && (
                        confirmingClear ? (
                            <div className="flex items-center gap-2">
                                <span className="hidden sm:inline text-[12px] text-gray-500">{t("cartItems.confirmClear", { defaultValue: "Are you sure?" })}</span>
                                <button
                                    onClick={handleClearCart}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-gradient-to-r from-[#FB2C36] to-[#dc2626] text-white text-[12px] font-bold shadow-sm hover:shadow-md hover:brightness-110 transition-all cursor-pointer"
                                >
                                    {t("cartItems.confirm", { defaultValue: "Yes, clear" })}
                                </button>
                                <button
                                    onClick={() => setConfirmingClear(false)}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-gray-200 text-gray-600 text-[12px] font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    {t("cartItems.cancel", { defaultValue: "Cancel" })}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setConfirmingClear(true)}
                                className="group inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#FFC9C9] text-[#FB2C36] text-[12px] font-bold bg-white hover:bg-gradient-to-r hover:from-[#FB2C36] hover:to-[#dc2626] hover:text-white hover:border-transparent shadow-sm hover:shadow-md transition-all cursor-pointer"
                                aria-label={t("cartItems.clearCart")}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                                    <path d="M10 11v6M14 11v6" />
                                    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                                </svg>
                                {t("cartItems.clearCart")}
                            </button>
                        )
                    )}
                </div>

                {loading.cart ? (
                    <div className="grid grid-cols-1 2xl:grid-cols-2 gap-3">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <CartItemSkeleton key={i} />
                        ))}
                    </div>
                ) : cartItems.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 text-sm">
                        {t("empty.description")}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 2xl:grid-cols-2 gap-3">
                        {cartItems.map((item) => (
                            <CartItem key={item.id} item={item} showSaveForLater />
                        ))}
                    </div>
                )}
            </section>

            {/* ── Saved for Later Section ── */}
            {savedItems.length > 0 && (
                <section className="bg-white p-3 sm:p-4 md:p-[20px] rounded-2xl md:rounded-[20px]">
                    <h2 className="text-[16px] sm:text-[18px] font-bold text-gray-900 mb-3 sm:mb-4">
                        {t("savedForLater.heading")}{" "}
                        <span className="text-gray-400 font-normal">({savedItems.length})</span>
                    </h2>
                    <div className="grid grid-cols-1 2xl:grid-cols-2 gap-3">
                        {savedItems.map((item) => (
                            <CartItem key={item.id} item={item} showSaveForLater={false} />
                        ))}
                    </div>
                </section>
            )}

        </div>
    );
}
