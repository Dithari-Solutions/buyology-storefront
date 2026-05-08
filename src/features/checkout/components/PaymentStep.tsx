"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import type { RootState } from "@/store";
import { selectCartTotals } from "@/features/cart/store/cartSlice";
import { b2bAccountApi } from "@/features/b2b/account/api";
import type { ShippingFormData, PaymentMethod } from "../types";

// ── Brand Badge Components ────────────────────────────────────────────────────

function PaymobCardBadge() {
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

function CreditBadge() {
    return (
        <span className="inline-flex items-center bg-[#FBBB14] text-[#402F75] text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wide">
            B2B credit
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
    deliveryMethod: "EXPRESS" | "REGULAR";
    onEdit: () => void;
    onPlaceOrder: (paymentMethod: PaymentMethod, creditAmount: number) => void;
    isSubmitting?: boolean;
    /** Authenticated user id (users.id) — required to surface the B2B credit option. */
    userId?: string | null;
    /** Cart currency for the credit panel. */
    currency?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PaymentStep({ shipping, deliveryMethod, onEdit, onPlaceOrder, isSubmitting, userId, currency }: PaymentStepProps) {
    const { t } = useTranslation("checkout");
    const [selected, setSelected] = useState<PaymentMethod>("card");
    const totals = useSelector(selectCartTotals);
    const cartItems = useSelector((state: RootState) => state.cart.items);
    const orderTotal = totals.total;

    const [wallet, setWallet] = useState<{
        balance: number;
        currency: string;
        minOrderAmount?: number;
    } | null>(null);

    useEffect(() => {
        if (!userId) return;
        let cancelled = false;
        b2bAccountApi.getMyWallet(userId).then((w) => {
            if (!cancelled) setWallet(w);
        });
        return () => { cancelled = true; };
    }, [userId]);

    const orderCcy = (currency ?? "AED").toUpperCase();
    const walletCcy = wallet?.currency.toUpperCase();
    const sameCurrency = walletCcy != null && walletCcy === orderCcy;

    // Reason the credit option may be unusable. Render the option but disable it
    // with a clear message instead of hiding it, so B2B users always see why
    // they can't pay with credit on this particular order.
    const creditDisabledReason: string | null = (() => {
        if (!wallet) return null; // no wallet at all → not a B2B member, hide entirely
        if (wallet.balance <= 0) return "Wallet balance is empty.";
        if (!sameCurrency) {
            return `Wallet (${wallet.currency}) doesn't match order currency (${orderCcy}).`;
        }
        if (wallet.minOrderAmount != null && orderTotal < wallet.minOrderAmount) {
            return `Minimum order of ${wallet.minOrderAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2, maximumFractionDigits: 2,
            })} ${wallet.currency} required to pay with credit.`;
        }
        return null;
    })();
    const creditEligible = !!wallet && wallet.balance > 0 && creditDisabledReason === null;

    // If the user picked credit but conditions changed, fall back to card.
    useEffect(() => {
        if (selected === "credit" && !creditEligible) setSelected("card");
    }, [creditEligible, selected]);

    // Amount of wallet credit applied when "credit" is the chosen method.
    const creditApplied = selected === "credit" && creditEligible && wallet
        ? Math.min(wallet.balance, orderTotal)
        : 0;
    const newTotal = Math.max(0, orderTotal - creditApplied);

    const hasQuickDeliveryItems = cartItems.some((i) => i.quickDelivery);
    const expressUnavailable = hasQuickDeliveryItems && deliveryMethod === "REGULAR";

    const countryName = COUNTRY_NAMES[shipping.country] ?? shipping.country;

    const PAYMENT_OPTIONS: {
        id: PaymentMethod;
        label: string;
        description: string;
        badge: React.ReactNode;
        detail?: string;
        disabled?: boolean;
        disabledReason?: string;
    }[] = [
        {
            id: "card",
            label: t("payment.card.label"),
            description: t("payment.card.description"),
            badge: <PaymobCardBadge />,
            detail: t("payment.card.detail"),
        },
        {
            id: "tabby",
            label: t("payment.tabby.label"),
            description: t("payment.tabby.description", { amount: (orderTotal / 4).toFixed(2) }),
            badge: <TabbyBadge />,
            detail: t("payment.tabby.detail", { amount: (orderTotal / 4).toFixed(2) }),
        },
        {
            id: "tamara",
            label: t("payment.tamara.label"),
            description: t("payment.tamara.description", { amount: (orderTotal / 3).toFixed(2) }),
            badge: <TamaraBadge />,
            detail: t("payment.tamara.detail", { amount: (orderTotal / 3).toFixed(2) }),
        },
    ];

    // Always show the credit option when the user has a wallet at all — disable
    // it (with a reason) when not eligible. Hide entirely only for non-B2B users.
    if (wallet) {
        PAYMENT_OPTIONS.push({
            id: "credit",
            label: "Pay with B2B credit",
            description: `Available balance: ${wallet.balance.toLocaleString()} ${wallet.currency}`,
            badge: <CreditBadge />,
            detail: creditEligible
                ? `${creditApplied.toFixed(2)} ${wallet.currency} will be deducted from your wallet automatically.`
                : undefined,
            disabled: !creditEligible,
            disabledReason: creditDisabledReason ?? undefined,
        });
    }

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

                            <div className="mt-3 flex flex-wrap gap-2">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                                    deliveryMethod === "EXPRESS"
                                        ? "bg-green-50 text-green-700 border-green-100"
                                        : "bg-gray-50 text-gray-600 border-gray-100"
                                }`}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="1" y="3" width="15" height="13" rx="1" />
                                        <path d="M16 8h4l3 3v5h-7V8z" />
                                        <circle cx="5.5" cy="18.5" r="2.5" />
                                        <circle cx="18.5" cy="18.5" r="2.5" />
                                    </svg>
                                    {deliveryMethod === "EXPRESS" ? "Express Delivery" : "Regular Delivery"}
                                </span>
                            </div>

                            {expressUnavailable && (
                                <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-2.5">
                                    <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" />
                                        <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    <p className="text-[11px] text-amber-700 leading-normal">
                                        <strong>Express unavailable:</strong> You have quick-delivery items, but this address has no map coordinates. Standard delivery will be used.
                                        <button onClick={onEdit} className="ml-1 font-bold underline hover:text-amber-900 cursor-pointer">Add location pin</button>
                                    </p>
                                </div>
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
                        const isDisabled = !!option.disabled;
                        return (
                            <label
                                key={option.id}
                                className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all ${
                                    isDisabled
                                        ? "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                                        : isSelected
                                            ? "border-[#402F75] bg-[#EDE9FF]/40 cursor-pointer"
                                            : "border-gray-100 hover:border-gray-200 bg-white cursor-pointer"
                                }`}
                            >
                                <div className="mt-0.5 flex-shrink-0">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value={option.id}
                                        checked={isSelected}
                                        disabled={isDisabled}
                                        onChange={() => !isDisabled && setSelected(option.id)}
                                        className="sr-only"
                                    />
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "border-[#402F75]" : "border-gray-300"}`}>
                                        {isSelected && (
                                            <div className="w-2 h-2 rounded-full bg-[#402F75]" />
                                        )}
                                    </div>
                                </div>
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
                                    {isDisabled && option.disabledReason && (
                                        <p className="text-[11px] text-amber-700 mt-1.5 font-medium">
                                            {option.disabledReason}
                                        </p>
                                    )}
                                    {isSelected && !isDisabled && option.detail && (
                                        <p className="text-[11px] text-[#402F75]/80 mt-1.5 font-medium">
                                            {option.detail}
                                        </p>
                                    )}
                                </div>
                            </label>
                        );
                    })}
                </div>

                <div className="mt-4 flex items-center gap-2 text-[11px] text-gray-400">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    {t("payment.secureNote")}
                </div>
            </div>

            {/* Order summary with credit applied */}
            {selected === "credit" && creditApplied > 0 && (
                <div className="rounded-2xl border border-[#402F75]/30 bg-[#FAF8FF] p-5 space-y-1.5 text-[13px]">
                    <div className="flex justify-between text-gray-700">
                        <span>Cart total</span>
                        <strong>{orderTotal.toFixed(2)} {orderCcy}</strong>
                    </div>
                    <div className="flex justify-between text-[#402F75]">
                        <span>Wallet credit applied</span>
                        <strong>− {creditApplied.toFixed(2)} {orderCcy}</strong>
                    </div>
                    <div className="flex justify-between text-gray-900 pt-1.5 border-t border-[#402F75]/10">
                        <span className="font-semibold">Amount due now</span>
                        <strong>{newTotal.toFixed(2)} {orderCcy}</strong>
                    </div>
                </div>
            )}

            {/* Place Order CTA */}
            <button
                onClick={() => onPlaceOrder(selected, creditApplied)}
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
                        {t("cta.placeOrder", { total: newTotal.toFixed(2) })}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </>
                )}
            </button>
        </div>
    );
}
