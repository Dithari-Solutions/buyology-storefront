"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { selectCartTotals } from "@/features/cart/store/cartSlice";
import type { ShippingFormData, PaymentMethod } from "../types";

// ── Brand Badge Components ────────────────────────────────────────────────────

function StripeBadge() {
    return (
        <span className="inline-flex items-center gap-1 bg-[#635BFF] text-white text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wide">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.479 9.883c-2.148-.574-2.838-.852-2.838-1.574 0-.646.602-1.054 1.568-1.054 1.699 0 3.395.646 4.561 1.254l.658-4.049c-.917-.498-2.785-1.129-5.047-1.129-2.066 0-3.787.542-5.024 1.574C6.177 5.836 5.5 7.138 5.5 8.76c0 3.154 1.933 4.227 5.051 5.076 2.016.542 2.621.917 2.621 1.636 0 .719-.625 1.128-1.75 1.128-1.783 0-3.899-.771-5.344-1.833l-.721 4.093c1.207.833 3.527 1.64 5.923 1.64 2.18 0 3.997-.541 5.24-1.574 1.304-1.074 1.98-2.627 1.98-4.561C18.5 11.386 16.683 10.667 13.479 9.883z" />
            </svg>
            stripe
        </span>
    );
}

function TabbyBadge() {
    return (
        <span className="inline-flex items-center bg-[#3DBFA0] text-white text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wide">
            tabby
        </span>
    );
}

function TamaraBadge() {
    return (
        <span className="inline-flex items-center bg-[#00B69B] text-white text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wide">
            tamara
        </span>
    );
}

function PaymobBadge() {
    return (
        <span className="inline-flex items-center gap-1 bg-[#402F75] text-white text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wide">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            paymob
        </span>
    );
}

// ── Country lookup ────────────────────────────────────────────────────────────

const COUNTRY_NAMES: Record<string, string> = {
    AZ: "Azerbaijan",
    AE: "United Arab Emirates",
    SA: "Saudi Arabia",
    EG: "Egypt",
    TR: "Turkey",
    DE: "Germany",
    FR: "France",
    GB: "United Kingdom",
    US: "United States",
    RU: "Russia",
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface PaymentStepProps {
    shipping: ShippingFormData;
    onEdit: () => void;
    onPlaceOrder: (paymentMethod: PaymentMethod) => void;
    isSubmitting?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PaymentStep({ shipping, onEdit, onPlaceOrder, isSubmitting }: PaymentStepProps) {
    const { t } = useTranslation("checkout");
    const [selected, setSelected] = useState<PaymentMethod>("card");
    const totals = useSelector(selectCartTotals);
    const total = totals.total;

    const countryName = COUNTRY_NAMES[shipping.country] ?? shipping.country;

    const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; description: string; badge: React.ReactNode; detail?: string }[] = [
        {
            id: "card",
            label: t("payment.card.label"),
            description: t("payment.card.description"),
            badge: <StripeBadge />,
            detail: t("payment.card.detail"),
        },
        {
            id: "tabby",
            label: t("payment.tabby.label"),
            description: t("payment.tabby.description", { amount: (total / 4).toFixed(2) }),
            badge: <TabbyBadge />,
            detail: t("payment.tabby.detail", { amount: (total / 4).toFixed(2) }),
        },
        {
            id: "tamara",
            label: t("payment.tamara.label"),
            description: t("payment.tamara.description", { amount: (total / 3).toFixed(2) }),
            badge: <TamaraBadge />,
            detail: t("payment.tamara.detail", { amount: (total / 3).toFixed(2) }),
        },
        {
            id: "paymob",
            label: t("payment.paymob.label"),
            description: t("payment.paymob.description"),
            badge: <PaymobBadge />,
        },
    ];

    return (
        <div className="flex flex-col gap-4">
            {/* Shipping summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#402F75]/20 p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 w-5 h-5 rounded-full bg-[#402F75] flex items-center justify-center flex-shrink-0">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[12px] font-semibold text-gray-500 mb-1">{t("shippingTo")}</p>
                            <p className="text-[13px] font-bold text-gray-800">
                                {shipping.firstName} {shipping.lastName}
                            </p>
                            <p className="text-[12px] text-gray-500 mt-0.5 leading-relaxed">
                                {shipping.streetAddress}
                                {shipping.apartment && `, ${shipping.apartment}`}
                                {" · "}
                                {shipping.city}{shipping.postalCode && `, ${shipping.postalCode}`}{" · "}{countryName}
                            </p>
                            {shipping.email && (
                                <p className="text-[12px] text-gray-400 mt-0.5">{shipping.email}{shipping.phone && ` · ${shipping.phone}`}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onEdit}
                        className="text-[12px] font-bold text-[#402F75] hover:text-[#2e2156] transition-colors flex-shrink-0 cursor-pointer"
                    >
                        {t("edit")}
                    </button>
                </div>
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-[16px] font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                    {t("payment.heading")}
                </h2>

                <div className="flex flex-col gap-3">
                    {PAYMENT_OPTIONS.map((option) => {
                        const isSelected = selected === option.id;
                        return (
                            <label
                                key={option.id}
                                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? "border-[#402F75] bg-[#EDE9FF]/40" : "border-gray-100 hover:border-gray-200 bg-white"}`}
                            >
                                {/* Radio */}
                                <div className="mt-0.5 flex-shrink-0">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value={option.id}
                                        checked={isSelected}
                                        onChange={() => setSelected(option.id)}
                                        className="sr-only"
                                    />
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "border-[#402F75]" : "border-gray-300"}`}>
                                        {isSelected && (
                                            <div className="w-2 h-2 rounded-full bg-[#402F75]" />
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <span className={`text-[13px] font-bold ${isSelected ? "text-[#402F75]" : "text-gray-800"}`}>
                                            {option.label}
                                        </span>
                                        {option.badge}
                                    </div>
                                    <p className="text-[12px] text-gray-500 mt-1 leading-relaxed">
                                        {option.description}
                                    </p>
                                    {isSelected && option.detail && (
                                        <p className="text-[11px] text-[#402F75]/80 mt-1.5 font-medium">
                                            {option.detail}
                                        </p>
                                    )}
                                </div>
                            </label>
                        );
                    })}
                </div>

                {/* Secure note */}
                <div className="mt-4 flex items-center gap-2 text-[11px] text-gray-400">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    {t("payment.secureNote")}
                </div>
            </div>

            {/* Place Order CTA */}
            <button
                onClick={() => onPlaceOrder(selected)}
                disabled={isSubmitting}
                className="w-full bg-[#FBBB14] hover:bg-[#f0b000] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all py-[14px] rounded-xl font-bold text-[15px] text-gray-900 flex items-center justify-center gap-2 cursor-pointer"
            >
                {isSubmitting ? (
                    <>
                        <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.3" />
                            <path d="M21 12a9 9 0 00-9-9" />
                        </svg>
                        {t("cta.processing")}
                    </>
                ) : (
                    <>
                        {t("cta.placeOrder", { total: total.toFixed(2) })}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </>
                )}
            </button>
        </div>
    );
}
