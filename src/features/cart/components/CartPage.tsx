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
import PopularForYou from "./PopularForYou";
import { selectCartItems, selectSavedItems, selectCartLoading, fetchCartThunk, fetchCartProductsThunk } from "../store/cartSlice";
import type { ApiCartResponse } from "../types";

function EmptyCartState({ lang }: { lang: Lang }) {
    const { t } = useTranslation("cart");
    const shopSlug = PATH_SLUGS.shop?.[lang] ?? "shop";

    return (
        <div className="relative overflow-hidden bg-white rounded-[24px] border border-gray-100 shadow-sm">
            {/* Decorative blobs */}
            <div className="pointer-events-none absolute -top-24 -end-24 w-72 h-72 rounded-full bg-[#EDE9FF] blur-3xl opacity-70" />
            <div className="pointer-events-none absolute -bottom-24 -start-24 w-72 h-72 rounded-full bg-[#FFF4D6] blur-3xl opacity-70" />

            <div className="relative flex flex-col items-center justify-center px-6 py-16 sm:py-20 md:py-24 gap-6 text-center">
                {/* Glowing illustration */}
                <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-[#402F75]/20 blur-2xl scale-110" />
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-[#402F75] to-[#5d44a8] flex items-center justify-center shadow-lg shadow-[#402F75]/20">
                        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.93-1.47L23 6H6" />
                        </svg>
                    </div>
                </div>

                <div className="max-w-md">
                    <h2 className="text-[22px] sm:text-[26px] font-bold text-gray-900 mb-2">{t("empty.title")}</h2>
                    <p className="text-gray-500 text-[14px] sm:text-[15px] leading-relaxed">{t("empty.description")}</p>
                </div>

                <Link href={`/${lang}/${shopSlug}`}>
                    <button className="group bg-gradient-to-r from-[#402F75] to-[#5d44a8] hover:shadow-xl hover:shadow-[#402F75]/30 hover:-translate-y-0.5 active:translate-y-0 transition-all text-white font-bold px-8 py-3.5 rounded-full text-[14px] cursor-pointer flex items-center gap-2 shadow-lg shadow-[#402F75]/20">
                        {t("empty.continueShopping")}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </Link>
            </div>
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

    // Sync cart from API on mount when authenticated; include device coords for quickDelivery
    useEffect(() => {
        if (!userId) return;

        const loadCart = (coords?: { lat: number; lng: number }) => {
            dispatch(fetchCartThunk({ authCredentialId: userId, coords })).then((action) => {
                if (fetchCartThunk.fulfilled.match(action)) {
                    const cart = action.payload as ApiCartResponse;
                    const productIds = cart.items.map((i) => i.productId);
                    if (productIds.length > 0) {
                        dispatch(fetchCartProductsThunk({ productIds, lang }));
                    }
                }
            });
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => loadCart({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => loadCart()
            );
        } else {
            loadCart();
        }
    }, [userId, lang, dispatch]);

    const shopSlug = PATH_SLUGS.shop?.[lang] ?? "shop";
    const cartCount = cartItems.length;

    return (
        <>
            <Header />

            {/* ── Page background with soft gradient ── */}
            <div className="relative bg-gradient-to-b from-[#F7F5FF] via-[#FBF9FF] to-white min-h-screen">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[320px] overflow-hidden">
                    <div className="absolute -top-32 start-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-[#EDE9FF] blur-3xl opacity-60" />
                </div>

                <main className="relative w-[95%] sm:w-[92%] lg:w-[90%] max-w-[1400px] mx-auto py-6 sm:py-8 md:py-12">

                    {/* ── Hero header ── */}
                    <div className="mb-6 sm:mb-8">
                        {/* Breadcrumb */}
                        <nav className="flex items-center gap-1.5 text-[12px] sm:text-[13px] text-gray-500 mb-3">
                            <Link href={`/${lang}`} className="hover:text-[#402F75] transition-colors">
                                {lang === "az" ? "Ana səhifə" : lang === "ar" ? "الرئيسية" : "Home"}
                            </Link>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rtl:rotate-180">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                            <span className="text-gray-800 font-medium">{t("title")}</span>
                        </nav>

                        <div className="flex flex-wrap items-end justify-between gap-3">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-gradient-to-br from-[#402F75] to-[#5d44a8] items-center justify-center shadow-lg shadow-[#402F75]/20">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="9" cy="21" r="1" />
                                        <circle cx="20" cy="21" r="1" />
                                        <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.93-1.47L23 6H6" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-[24px] sm:text-[28px] md:text-[34px] font-bold text-gray-900 leading-tight flex items-center gap-3">
                                        {t("title")}
                                        {hasContent && !isLoading && cartCount > 0 && (
                                            <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full bg-[#402F75] text-white text-[12px] font-bold">
                                                {cartCount}
                                            </span>
                                        )}
                                    </h1>
                                    <p className="text-[12px] sm:text-[13px] text-gray-500 mt-0.5">
                                        {isLoading
                                            ? (lang === "az" ? "Yüklənir..." : lang === "ar" ? "جار التحميل..." : "Loading...")
                                            : hasContent
                                                ? (lang === "az" ? "Sifarişinizi nəzərdən keçirin" : lang === "ar" ? "راجع طلبك قبل الدفع" : "Review your order before checkout")
                                                : (lang === "az" ? "Səbətiniz boşdur" : lang === "ar" ? "سلتك فارغة" : "Your cart is empty")}
                                    </p>
                                </div>
                            </div>

                            {hasContent && (
                                <Link
                                    href={`/${lang}/${shopSlug}`}
                                    className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-gray-200 text-[13px] font-semibold text-gray-700 hover:border-[#402F75] hover:text-[#402F75] transition-colors shadow-sm"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rtl:rotate-180">
                                        <path d="M19 12H5M12 19l-7-7 7-7" />
                                    </svg>
                                    {lang === "az" ? "Alış-verişə davam et" : lang === "ar" ? "متابعة التسوق" : "Continue shopping"}
                                </Link>
                            )}
                        </div>

                        {/* Trust strip */}
                        {hasContent && (
                            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-gray-600">
                                <span className="inline-flex items-center gap-1.5">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" />
                                        <path d="M7 11V7a5 5 0 0110 0v4" />
                                    </svg>
                                    {t("orderSummary.secureCheckout")}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="1" y="3" width="15" height="13" rx="1" />
                                        <path d="M16 8h4l3 5v3h-7V8z" />
                                        <circle cx="5.5" cy="18.5" r="2.5" />
                                        <circle cx="18.5" cy="18.5" r="2.5" />
                                    </svg>
                                    {t("benefits.fastDelivery.title")}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 2l-7 4v5c0 5.55 3.84 10.74 7 12 3.16-1.26 7-6.45 7-12V6l-7-4z" />
                                        <polyline points="9 12 11 14 15 10" />
                                    </svg>
                                    {t("benefits.warranty.title")}
                                </span>
                            </div>
                        )}
                    </div>

                    {!isLoading && !hasContent ? (
                        <EmptyCartState lang={lang} />
                    ) : (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] gap-4 sm:gap-6 items-start">
                                <CartItems />
                                <OrderSummary />
                            </div>
                            <PopularForYou />
                        </>
                    )}
                </main>
            </div>

            <Footer />
        </>
    );
}
