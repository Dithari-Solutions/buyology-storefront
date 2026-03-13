"use client";

import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import type { AppDispatch, RootState } from "@/store";
import { clearCart, clearCartThunk, selectCartItems, selectSavedItems, selectCartLoading } from "../store/cartSlice";
import CartItem from "./CartItem";

function CartItemSkeleton() {
    return (
        <div className="flex items-start gap-3 p-4 sm:p-5 bg-white rounded-2xl border border-[#FBBB14] shadow-sm animate-pulse">
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

    function handleClearCart() {
        dispatch(clearCart());
        if (userId) {
            dispatch(clearCartThunk(userId));
        }
    }

    return (
        <div className="flex flex-col gap-6">

            {/* ── Active Cart Section ── */}
            <section className="bg-white p-[20px] rounded-[20px]">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[18px] font-bold text-gray-900">
                        {t("cartItems.heading")}{" "}
                        <span className="text-gray-400 font-normal">
                            ({loading.cart || loading.products ? "..." : cartItems.length})
                        </span>
                    </h2>
                    {cartItems.length > 0 && !loading.cart && !loading.products && (
                        <button
                            onClick={handleClearCart}
                            className="text-[13px] text-gray-500 hover:text-red-500 transition-colors font-medium cursor-pointer"
                        >
                            {t("cartItems.clearCart")}
                        </button>
                    )}
                </div>

                {loading.cart ? (
                    <div className="flex flex-col gap-3">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <CartItemSkeleton key={i} />
                        ))}
                    </div>
                ) : cartItems.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 text-sm">
                        {t("empty.description")}
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {cartItems.map((item) => (
                            <CartItem key={item.id} item={item} showSaveForLater />
                        ))}
                    </div>
                )}
            </section>

            {/* ── Saved for Later Section ── */}
            {savedItems.length > 0 && (
                <section className="bg-white p-[20px] rounded-[20px]">
                    <h2 className="text-[18px] font-bold text-gray-900 mb-4">
                        {t("savedForLater.heading")}{" "}
                        <span className="text-gray-400 font-normal">({savedItems.length})</span>
                    </h2>
                    <div className="flex flex-col gap-3">
                        {savedItems.map((item) => (
                            <CartItem key={item.id} item={item} showSaveForLater={false} />
                        ))}
                    </div>
                </section>
            )}

        </div>
    );
}
