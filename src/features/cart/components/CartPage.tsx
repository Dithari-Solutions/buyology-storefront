"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import type { RootState } from "@/store";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";
import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import CartItems from "./CartItems";
import OrderSummary from "./OrderSummary";
import { selectCartItems, selectSavedItems } from "../store/cartSlice";

function EmptyCartState({ lang }: { lang: Lang }) {
    const { t } = useTranslation("cart");
    const shopSlug = PATH_SLUGS.shop?.[lang] ?? "shop";

    return (
        <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
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
    const lang = useSelector((state: RootState) => state.language.lang) as Lang;

    const cartItems = useSelector(selectCartItems);
    const savedItems = useSelector(selectSavedItems);
    const hasContent = cartItems.length > 0 || savedItems.length > 0;

    return (
        <>
            <Header />
            <main className="w-[90%] mx-auto py-8 md:py-12">

                {/* ── Page title ── */}
                <h1 className="text-[22px] md:text-[26px] font-bold text-gray-900 mb-6">
                    {t("title")}
                    {hasContent && (
                        <span className="text-gray-400 font-normal text-[16px] ms-2">
                            ({cartItems.length + savedItems.length})
                        </span>
                    )}
                </h1>

                {!hasContent ? (
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
