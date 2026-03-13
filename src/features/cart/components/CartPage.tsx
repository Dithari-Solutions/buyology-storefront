"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import type { AppDispatch, RootState } from "@/store";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";
import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import CartItems from "./CartItems";
import OrderSummary from "./OrderSummary";
import { selectCartItems, selectSavedItems, selectCartLoading, fetchCartThunk, fetchCartProductsThunk } from "../store/cartSlice";
import type { ApiCartResponse } from "../types";

function EmptyCartState({ lang }: { lang: Lang }) {
    const { t } = useTranslation("cart");
    const shopSlug = PATH_SLUGS.shop?.[lang] ?? "shop";

    return (
        <div className="flex flex-col items-center justify-center py-24 gap-5 text-center bg-whtie rounded-[20px]">
            {/* Cart illustration */}
            <div className="w-20 h-20 rounded-full bg-[#EDE9FF] flex items-center justify-center">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.93-1.47L23 6H6" />
                </svg>
            </div>
            <div>
                <h2 className="text-[20px] font-bold text-gray-800 mb-1">{t("empty.title")}</h2>
                <p className="text-gray-400 text-[14px] max-w-xs">{t("empty.description")}</p>
            </div>
            <Link href={`/${lang}/${shopSlug}`}>
                <button className="bg-[#402F75] hover:bg-[#2e2156] transition-colors text-white font-bold px-8 py-3 rounded-full text-[14px] cursor-pointer">
                    {t("empty.continueShopping")}
                </button>
            </Link>
        </div>
    );
}

export default function CartPage() {
    const { t } = useTranslation("cart");
    const dispatch = useDispatch<AppDispatch>();
    const lang = useSelector((state: RootState) => state.language.lang) as Lang;
    const userId = useSelector((state: RootState) => state.auth.userId);

    const cartItems = useSelector(selectCartItems);
    const savedItems = useSelector(selectSavedItems);
    const loading = useSelector(selectCartLoading);
    const isLoading = loading?.cart || loading?.products;
    const hasContent = cartItems.length > 0 || savedItems.length > 0;

    // Sync cart from API on mount when authenticated
    useEffect(() => {
        if (userId) {
            dispatch(fetchCartThunk(userId)).then((action) => {
                if (fetchCartThunk.fulfilled.match(action)) {
                    const cart = action.payload as ApiCartResponse;
                    const productIds = cart.items.map((i) => i.productId);
                    if (productIds.length > 0) {
                        dispatch(fetchCartProductsThunk({ productIds, lang }));
                    }
                }
            });
        }
    }, [userId, lang, dispatch]);

    return (
        <>
            <Header />
            <main className="w-[90%] mx-auto py-8 md:py-12">
                {!isLoading && !hasContent ? (
                    <EmptyCartState lang={lang} />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-6 items-start">
                        <CartItems />
                        <OrderSummary />
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
}
