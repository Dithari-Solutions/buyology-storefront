"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { selectCartTotals } from "@/features/cart/store/cartSlice";
import Image from "next/image";
import { b2bAccountApi } from "@/features/b2b/account/api";
import TabbyLogo from "@/assets/payments/tabby.png";
import TamaraLogo from "@/assets/payments/tamara.png";
import type { ShippingFormData, PaymentMethod } from "../types";

// ── Brand Badge Components — official provider logos ──────────────────────────

function TabbyBadge() {
    return <Image src={TabbyLogo} alt="Tabby" className="h-5 w-auto object-contain" />;
}

function TamaraBadge() {
    return <Image src={TamaraLogo} alt="Tamara" className="h-5 w-auto object-contain" />;
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
    deliveryMethod: "EXPRESS" | "REGULAR" | "PICKUP";
    /** True when Express may be offered (≥1 quick-eligible item AND map coordinates). */
    expressEligible?: boolean;
    /** True when ≥1 cart item is quick-delivery eligible. */
    hasExpressItem?: boolean;
    /** True when the chosen address has map coordinates. */
    hasCoords?: boolean;
    /** True when the cart mixes quick-eligible and regular-only items. */
    mixedCart?: boolean;
    /** Customer picks Express vs Regular. */
    onDeliveryMethodChange?: (method: "EXPRESS" | "REGULAR") => void;
    onEdit: () => void;
    onPlaceOrder: (paymentMethod: PaymentMethod, creditAmount: number) => void;
    isSubmitting?: boolean;
    /** Authenticated user id (users.id) — required to surface the B2B credit option. */
    userId?: string | null;
    /** Cart currency for the credit panel. */
    currency?: string;
    /** When set (Buy Now), use this as the order total instead of the cart total. */
    orderTotalOverride?: number;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PaymentStep({ shipping, deliveryMethod, expressEligible = false, hasExpressItem = false, hasCoords = false, mixedCart = false, onDeliveryMethodChange, onEdit, onPlaceOrder, isSubmitting, userId, currency, orderTotalOverride }: PaymentStepProps) {
    const { t } = useTranslation("checkout");
    const isPickup = deliveryMethod === "PICKUP";
    // Payment method for the amount due (B2B credit is a separate modifier, not a method).
    const [selected, setSelected] = useState<Exclude<PaymentMethod, "credit">>("card");
    const totals = useSelector(selectCartTotals);
    const orderTotal = orderTotalOverride ?? totals.total;

    const [wallet, setWallet] = useState<{
        balance: number;
        currency: string;
        minOrderAmount?: number;
    } | null>(null);

    // B2B credit application (separate from the payment method)
    const [useCredit, setUseCredit] = useState(false);
    const [creditMode, setCreditMode] = useState<"full" | "custom">("full");
    const [customCredit, setCustomCredit] = useState("");

    useEffect(() => {
        if (!userId) return;
        let cancelled = false;
        // Request the wallet already converted into the order's currency so B2B credit
        // works in any branch (the backend also converts the actual deduction).
        b2bAccountApi.getMyWallet(userId, (currency ?? "AED").toUpperCase()).then((w) => {
            if (!cancelled) setWallet(w);
        });
        return () => { cancelled = true; };
    }, [userId, currency]);

    const orderCcy = (currency ?? "AED").toUpperCase();

    // Reason the credit panel may be unusable.
    const creditDisabledReason: string | null = (() => {
        if (!wallet) return null; // no wallet at all → not a B2B member, hide entirely
        if (wallet.balance <= 0) return "Wallet balance is empty.";
        if (wallet.minOrderAmount != null && orderTotal < wallet.minOrderAmount) {
            return `Minimum order of ${wallet.minOrderAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2, maximumFractionDigits: 2,
            })} ${wallet.currency} required to pay with credit.`;
        }
        return null;
    })();
    const creditEligible = !!wallet && wallet.balance > 0 && creditDisabledReason === null;

    // If credit becomes ineligible, turn the toggle off.
    useEffect(() => {
        if (useCredit && !creditEligible) setUseCredit(false);
    }, [creditEligible, useCredit]);

    // Most credit that can apply to this order (can't exceed balance or total).
    const maxCredit = wallet ? Math.min(wallet.balance, orderTotal) : 0;
    const creditApplied = (() => {
        if (!useCredit || !creditEligible) return 0;
        if (creditMode === "full") return maxCredit;
        const typed = parseFloat(customCredit);
        if (!Number.isFinite(typed) || typed <= 0) return 0;
        return Math.min(typed, maxCredit);
    })();
    const newTotal = Math.max(0, orderTotal - creditApplied);
    const fullyCovered = creditApplied > 0 && newTotal <= 0.0001;

    const countryName = COUNTRY_NAMES[shipping.country] ?? shipping.country;

    const PAYMENT_OPTIONS: {
        id: Exclude<PaymentMethod, "credit">;
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
            badge: null,
            detail: t("payment.card.detail"),
        },
        {
            id: "tabby",
            label: t("payment.tabby.label"),
            description: t("payment.tabby.description", { amount: (newTotal / 4).toFixed(2), currency: orderCcy }),
            badge: <TabbyBadge />,
            detail: t("payment.tabby.detail", { amount: (newTotal / 4).toFixed(2), currency: orderCcy }),
        },
        {
            id: "tamara",
            label: t("payment.tamara.label"),
            description: t("payment.tamara.description", { amount: (newTotal / 3).toFixed(2), currency: orderCcy }),
            badge: <TamaraBadge />,
            detail: t("payment.tamara.detail", { amount: (newTotal / 3).toFixed(2), currency: orderCcy }),
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
                            <p className="text-[12px] font-semibold text-gray-500 mb-1">
                                {isPickup ? t("pickup.summaryLabel", { defaultValue: "Pickup from store" }) : t("shippingTo")}
                            </p>
                            <p className="text-[13px] font-bold text-gray-800">
                                {shipping.firstName} {shipping.lastName}
                            </p>
                            {isPickup ? (
                                <p className="text-[12px] text-gray-500 mt-0.5 leading-relaxed">
                                    {t("pickup.summaryNote", { defaultValue: "You'll collect this order from your chosen store. We'll email you when it's ready." })}
                                </p>
                            ) : (
                                <p className="text-[12px] text-gray-500 mt-0.5 leading-relaxed">
                                    {shipping.streetAddress}
                                    {shipping.apartment && `, ${shipping.apartment}`}
                                    {" · "}
                                    {shipping.city}{shipping.postalCode && `, ${shipping.postalCode}`}{" · "}{countryName}
                                </p>
                            )}
                            {shipping.email && (
                                <p className="text-[12px] text-gray-400 mt-0.5">{shipping.email}{shipping.phone && ` · ${shipping.phone}`}</p>
                            )}

                            {/* ── Delivery method chooser (hidden for store pickup) ── */}
                            {!isPickup && (
                            <div className="mt-4">
                                <p className="text-[12px] font-semibold text-gray-500 mb-2">{t("delivery.heading", { defaultValue: "Delivery method" })}</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {/* Express / Quick */}
                                    <button
                                        type="button"
                                        disabled={!expressEligible}
                                        onClick={() => onDeliveryMethodChange?.("EXPRESS")}
                                        className={`text-left rounded-xl border p-3 transition-colors ${
                                            !expressEligible
                                                ? "opacity-50 cursor-not-allowed border-gray-100 bg-gray-50"
                                                : deliveryMethod === "EXPRESS"
                                                    ? "border-[#402F75] bg-[#F6F4FF] cursor-pointer"
                                                    : "border-gray-200 hover:border-[#402F75]/40 cursor-pointer"
                                        }`}
                                    >
                                        <span className="flex items-center gap-1.5 text-[12px] font-bold text-gray-800">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="1" y="3" width="15" height="13" rx="1" />
                                                <path d="M16 8h4l3 3v5h-7V8z" />
                                                <circle cx="5.5" cy="18.5" r="2.5" />
                                                <circle cx="18.5" cy="18.5" r="2.5" />
                                            </svg>
                                            {t("delivery.express", { defaultValue: "Quick delivery" })}
                                        </span>
                                        <span className="block text-[11px] text-gray-500 mt-0.5">{t("delivery.expressEta", { defaultValue: "~30 minutes" })}</span>
                                    </button>
                                    {/* Regular */}
                                    <button
                                        type="button"
                                        onClick={() => onDeliveryMethodChange?.("REGULAR")}
                                        className={`text-left rounded-xl border p-3 transition-colors cursor-pointer ${
                                            deliveryMethod === "REGULAR"
                                                ? "border-[#402F75] bg-[#F6F4FF]"
                                                : "border-gray-200 hover:border-[#402F75]/40"
                                        }`}
                                    >
                                        <span className="flex items-center gap-1.5 text-[12px] font-bold text-gray-800">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="1" y="3" width="15" height="13" rx="1" />
                                                <path d="M16 8h4l3 3v5h-7V8z" />
                                                <circle cx="5.5" cy="18.5" r="2.5" />
                                                <circle cx="18.5" cy="18.5" r="2.5" />
                                            </svg>
                                            {t("delivery.regular", { defaultValue: "Regular delivery" })}
                                        </span>
                                        <span className="block text-[11px] text-gray-500 mt-0.5">{t("delivery.regularEta", { defaultValue: "2–3 business days" })}</span>
                                    </button>
                                </div>

                                {/* Express disabled reason */}
                                {!expressEligible && (
                                    <p className="text-[11px] text-gray-400 mt-2 leading-normal">
                                        {hasExpressItem && !hasCoords ? (
                                            <>
                                                {t("delivery.needPin", { defaultValue: "Quick delivery is available for your items, but this address has no map pin." })}{" "}
                                                <button onClick={onEdit} className="font-bold underline text-[#402F75] hover:text-[#2e2156] cursor-pointer">{t("delivery.addPin", { defaultValue: "Add location pin" })}</button>
                                            </>
                                        ) : (
                                            t("delivery.notAvailable", { defaultValue: "Quick delivery isn't available for your items in this area." })
                                        )}
                                    </p>
                                )}

                                {/* Mixed-cart notice — proceed, but tell the shopper */}
                                {mixedCart && deliveryMethod === "EXPRESS" && (
                                    <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-2.5">
                                        <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="12" y1="8" x2="12" y2="12" />
                                            <line x1="12" y1="16" x2="12.01" y2="16" />
                                        </svg>
                                        <p className="text-[11px] text-amber-700 leading-normal">
                                            {t("delivery.mixedNotice", { defaultValue: "Some items in your order qualify for quick delivery and others will arrive with regular delivery. Your order will still be placed together." })}
                                        </p>
                                    </div>
                                )}
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

            {/* B2B credit — applied as a discount on the amount due, not a payment method */}
            {wallet && (
                <div className="bg-white rounded-2xl shadow-sm border border-[#FBBB14]/40 p-6">
                    <div className="flex items-center justify-between gap-2 mb-4">
                        <h2 className="text-[16px] font-bold text-gray-900 flex items-center gap-2">
                            <CreditBadge />
                            B2B Credit
                        </h2>
                        <span className="text-[12px] text-gray-500">
                            Available: <strong>{wallet.balance.toLocaleString()} {wallet.currency}</strong>
                        </span>
                    </div>

                    {!creditEligible ? (
                        <p className="text-[12px] text-amber-700 font-medium">
                            {creditDisabledReason ?? "B2B credit is not available for this order."}
                        </p>
                    ) : (
                        <div className="space-y-3">
                            <label className="flex items-center gap-2.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={useCredit}
                                    onChange={(e) => setUseCredit(e.target.checked)}
                                    className="w-4 h-4 accent-[#402F75]"
                                />
                                <span className="text-[13px] font-semibold text-gray-800">Apply my B2B credit to this order</span>
                            </label>

                            {useCredit && (
                                <div className="pl-6 space-y-2.5">
                                    <label className="flex items-center gap-2.5 cursor-pointer">
                                        <input type="radio" name="creditMode" checked={creditMode === "full"} onChange={() => setCreditMode("full")} className="w-4 h-4 accent-[#402F75]" />
                                        <span className="text-[13px] text-gray-700">
                                            Use full credit (<strong>{maxCredit.toFixed(2)} {orderCcy}</strong>)
                                        </span>
                                    </label>
                                    <label className="flex items-center gap-2.5 cursor-pointer">
                                        <input type="radio" name="creditMode" checked={creditMode === "custom"} onChange={() => setCreditMode("custom")} className="w-4 h-4 accent-[#402F75]" />
                                        <span className="text-[13px] text-gray-700">Use a specific amount</span>
                                    </label>
                                    {creditMode === "custom" && (
                                        <div className="pl-6">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={maxCredit}
                                                    step="0.01"
                                                    value={customCredit}
                                                    onChange={(e) => setCustomCredit(e.target.value)}
                                                    placeholder={`0.00 – ${maxCredit.toFixed(2)}`}
                                                    className="w-40 rounded-lg border border-gray-200 px-3 py-2 text-[13px] focus:border-[#402F75] focus:outline-none"
                                                />
                                                <span className="text-[12px] text-gray-500">{orderCcy}</span>
                                            </div>
                                            {parseFloat(customCredit) > maxCredit && (
                                                <p className="text-[11px] text-amber-700 mt-1">Capped at {maxCredit.toFixed(2)} {orderCcy} (your usable credit).</p>
                                            )}
                                        </div>
                                    )}
                                    <p className="text-[12px] text-[#402F75] font-medium">
                                        {creditApplied.toFixed(2)} {orderCcy} credit applied · {newTotal.toFixed(2)} {orderCcy} due now
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Payment method (for the amount due after any credit) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-[16px] font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                    {t("payment.heading")}
                </h2>
                {fullyCovered ? (
                    <p className="text-[12px] text-green-700 font-medium mb-4">
                        Your B2B credit covers the full order — no card payment needed.
                    </p>
                ) : (
                    <p className="text-[12px] text-gray-500 mb-4">
                        Pay the remaining <strong>{newTotal.toFixed(2)} {orderCcy}</strong> with:
                    </p>
                )}

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
            {creditApplied > 0 && (
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
                        {t("cta.placeOrder", { total: newTotal.toFixed(2), currency: orderCcy })}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </>
                )}
            </button>
        </div>
    );
}
