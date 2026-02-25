"use client";

import { useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import type { RootState } from "@/store";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";
import { applyPromo, removePromo, selectCartTotals, selectPromo } from "../store/cartSlice";

// ── Benefit icon helpers ──────────────────────────────────────────────────────

function TruckIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13" rx="1" />
            <path d="M16 8h4l3 5v3h-7V8z" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
    );
}

function ShieldIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l-7 4v5c0 5.55 3.84 10.74 7 12 3.16-1.26 7-6.45 7-12V6l-7-4z" />
            <polyline points="9 12 11 14 15 10" />
        </svg>
    );
}

function LockIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
    );
}

function TagIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
    );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function OrderSummary() {
    const dispatch = useDispatch();
    const { t } = useTranslation("cart");
    const lang = useSelector((state: RootState) => state.language.lang) as Lang;

    const totals = useSelector(selectCartTotals);
    const promo = useSelector(selectPromo);

    const [promoInput, setPromoInput] = useState(promo.applied ? promo.code : "");

    const shopSlug = PATH_SLUGS.shop?.[lang] ?? "shop";
    const checkoutHref = `/${lang}/checkout`;

    const benefits = [
        {
            key: "fastDelivery",
            icon: <TruckIcon />,
            title: t("benefits.fastDelivery.title"),
            desc: t("benefits.fastDelivery.desc"),
        },
        {
            key: "warranty",
            icon: <ShieldIcon />,
            title: t("benefits.warranty.title"),
            desc: t("benefits.warranty.desc"),
        },
        {
            key: "securePayment",
            icon: <LockIcon />,
            title: t("benefits.securePayment.title"),
            desc: t("benefits.securePayment.desc"),
        },
    ];

    function handleApplyPromo() {
        if (!promoInput.trim()) return;
        dispatch(applyPromo(promoInput));
    }

    function handleRemovePromo() {
        dispatch(removePromo());
        setPromoInput("");
    }

    return (
        <aside className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:sticky lg:top-6 self-start">

            {/* ── Heading ── */}
            <h2 className="text-[18px] font-bold text-gray-900 mb-5">
                {t("orderSummary.heading")}
            </h2>

            {/* ── Line Items ── */}
            <div className="flex flex-col gap-3 text-[14px]">
                <div className="flex justify-between items-center">
                    <span className="text-gray-500">
                        {t("orderSummary.subtotal")}{" "}
                        ({t("orderSummary.items_other", { count: totals.selectedItemCount })})
                    </span>
                    <span className="font-semibold text-gray-800">
                        ${totals.subtotal.toFixed(2)}
                    </span>
                </div>

                {promo.applied && (
                    <div className="flex justify-between items-center text-green-600">
                        <span className="font-medium">Promo ({promo.code})</span>
                        <span className="font-semibold">-${promo.discount.toFixed(2)}</span>
                    </div>
                )}

                <div className="flex justify-between items-center">
                    <span className="text-gray-500">{t("orderSummary.shipping")}</span>
                    {totals.shipping === 0 ? (
                        <span className="text-green-500 font-bold">{t("orderSummary.free")}</span>
                    ) : (
                        <span className="font-semibold text-gray-800">${totals.shipping.toFixed(2)}</span>
                    )}
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-gray-500">{t("orderSummary.estimatedTax")}</span>
                    <span className="font-semibold text-gray-800">${totals.tax.toFixed(2)}</span>
                </div>
            </div>

            {/* ── Divider ── */}
            <div className="h-px bg-gray-100 my-4" />

            {/* ── Total ── */}
            <div className="flex items-end justify-between">
                <span className="text-[17px] font-bold text-gray-900">{t("orderSummary.total")}</span>
                <span className="text-[26px] font-bold text-[#402F75] leading-none">
                    ${totals.total.toFixed(2)}
                </span>
            </div>
            <p className="text-[11px] text-gray-400 text-end mt-1">{t("orderSummary.includingVat")}</p>

            {/* ── CTA ── */}
            <Link href={checkoutHref}>
                <button className="w-full mt-5 bg-[#FBBB14] hover:bg-[#f0b000] active:scale-[0.98] transition-all py-[14px] rounded-xl font-bold text-[15px] text-gray-900 flex items-center justify-center gap-2 cursor-pointer">
                    {t("orderSummary.proceedToCheckout")}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </button>
            </Link>

            <p className="flex items-center justify-center gap-1.5 text-[12px] text-gray-400 mt-2.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                {t("orderSummary.secureCheckout")}
            </p>

            {/* ── Promo Code ── */}
            <div className="mt-5 border-t border-gray-100 pt-5">
                <div className="flex items-center gap-2 mb-3">
                    <TagIcon />
                    <h3 className="font-bold text-[14px] text-gray-800">{t("promoCode.heading")}</h3>
                </div>

                {promo.applied ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center justify-between gap-2">
                        <p className="text-[13px] text-green-700 font-medium">
                            {t("promoCode.applied", { amount: promo.discount.toFixed(2) })}
                        </p>
                        <button
                            onClick={handleRemovePromo}
                            className="text-[12px] text-red-500 font-medium hover:text-red-600 flex-shrink-0 cursor-pointer"
                        >
                            {t("promoCode.remove")}
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={promoInput}
                                onChange={(e) => setPromoInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                                placeholder={t("promoCode.placeholder")}
                                className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-[#402F75] transition-colors"
                            />
                            <button
                                onClick={handleApplyPromo}
                                className="bg-[#402F75] hover:bg-[#2e2156] active:scale-[0.97] transition-all text-white px-4 py-2.5 rounded-xl font-bold text-[13px] flex-shrink-0 cursor-pointer"
                            >
                                {t("promoCode.apply")}
                            </button>
                        </div>

                        {promo.error && (
                            <p className="text-[12px] text-red-500 mt-1.5 font-medium">
                                {t("promoCode.error")}
                            </p>
                        )}

                        <p className="text-[11px] text-gray-400 mt-2">{t("promoCode.hint")}</p>
                    </>
                )}
            </div>

            {/* ── Benefits ── */}
            <div className="mt-5 border-t border-gray-100 pt-5">
                <h3 className="font-bold text-[14px] text-gray-800 mb-4">{t("benefits.heading")}</h3>
                <div className="flex flex-col gap-3">
                    {benefits.map((benefit) => (
                        <div key={benefit.key} className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#EDE9FF] flex items-center justify-center flex-shrink-0">
                                {benefit.icon}
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-[13px] text-gray-800 leading-snug">
                                    {benefit.title}
                                </p>
                                <p className="text-[11px] text-gray-400">{benefit.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </aside>
    );
}
