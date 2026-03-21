"use client";

import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import type { RootState } from "@/store";
import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import ShippingStep from "./ShippingStep";
import PaymentStep from "./PaymentStep";
import CheckoutSummary from "./CheckoutSummary";
import PaymentIframe from "./PaymentIframe";
import type { ShippingFormData, CheckoutStep, PaymentMethod } from "../types";
import { initiatePayment, getTransaction } from "../services/payment.api";
import { selectCartTotals, clearCart } from "@/features/cart/store/cartSlice";
import type { Address, UserProfile, CreateAddressPayload } from "@/features/profile/types";
import {
    getProfile,
    getAddresses,
    createAddress,
} from "@/features/profile/services/profile.api";

const METHOD_MAP: Record<PaymentMethod, "CARD" | "TABBY" | "TAMARA"> = {
    card: "CARD",
    tabby: "TABBY",
    tamara: "TAMARA",
};

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 15;
const PENDING_TX_KEY = "buyology_pending_tx_id";

// ── Step Indicator ────────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: CheckoutStep }) {
    const { t } = useTranslation("checkout");

    const steps: { key: CheckoutStep; label: string }[] = [
        { key: "shipping", label: t("steps.shipping") },
        { key: "payment", label: t("steps.payment") },
    ];

    const currentIdx = steps.findIndex((s) => s.key === current);

    return (
        <div className="flex items-center justify-center mb-8 bg-white rounded-[20px] py-[10px]">
            {steps.map((step, idx) => {
                const isCompleted = idx < currentIdx;
                const isActive = idx === currentIdx;

                return (
                    <div key={step.key} className="flex items-center">
                        <div className="flex flex-col items-center gap-1.5">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold transition-all ${
                                    isCompleted
                                        ? "bg-[#402F75] text-white"
                                        : isActive
                                        ? "bg-[#FBBB14] text-gray-900"
                                        : "bg-gray-200 text-gray-400"
                                }`}
                            >
                                {isCompleted ? (
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                ) : (
                                    idx + 1
                                )}
                            </div>
                            <span
                                className={`text-[12px] font-semibold ${
                                    isActive
                                        ? "text-gray-900"
                                        : isCompleted
                                        ? "text-[#402F75]"
                                        : "text-gray-400"
                                }`}
                            >
                                {step.label}
                            </span>
                        </div>

                        {idx < steps.length - 1 && (
                            <div
                                className={`h-0.5 w-24 sm:w-32 mx-3 mb-4 rounded-full transition-all ${
                                    isCompleted ? "bg-[#402F75]" : "bg-gray-200"
                                }`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ── Polling Overlay ────────────────────────────────────────────────────────────

function PollingOverlay() {
    const { t } = useTranslation("checkout");
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-[#EDE9FF] flex items-center justify-center mb-5">
                <svg
                    className="animate-spin"
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#402F75"
                    strokeWidth="2"
                >
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.3" />
                    <path d="M21 12a9 9 0 00-9-9" />
                </svg>
            </div>
            <h2 className="text-[20px] font-bold text-gray-900 mb-2">
                {t("polling.title", { defaultValue: "Confirming your payment…" })}
            </h2>
            <p className="text-gray-500 text-[14px] max-w-sm">
                {t("polling.description", {
                    defaultValue: "Please wait while we verify your payment. This usually takes a few seconds.",
                })}
            </p>
        </div>
    );
}

// ── Order Confirmed Screen ────────────────────────────────────────────────────

function OrderConfirmed({ lang }: { lang: string }) {
    const { t } = useTranslation("checkout");

    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-[#EDE9FF] flex items-center justify-center mb-5">
                <svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#402F75"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            </div>
            <h2 className="text-[24px] font-bold text-gray-900 mb-2">{t("confirmed.title")}</h2>
            <p className="text-gray-500 text-[14px] max-w-sm mb-8">{t("confirmed.description")}</p>
            <a href={`/${lang}/shop`}>
                <button className="bg-[#402F75] hover:bg-[#2e2156] transition-colors text-white font-bold px-8 py-3 rounded-full text-[14px] cursor-pointer">
                    {t("confirmed.continueShopping")}
                </button>
            </a>
        </div>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
    const { t } = useTranslation("checkout");
    const dispatch = useDispatch();
    const lang = useSelector((state: RootState) => state.language.lang) as string;
    const userId = useSelector((state: RootState) => state.auth.userId);
    const cartId = useSelector((state: RootState) => state.cart.cartId);
    const totals = useSelector(selectCartTotals);

    const [step, setStep] = useState<CheckoutStep>("shipping");
    const [shippingData, setShippingData] = useState<ShippingFormData | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);

    // Profile + addresses state
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);

    // Payment state
    const [appOrderId, setAppOrderId] = useState<string | null>(null);
    const [currentTransactionId, setCurrentTransactionId] = useState<string | null>(null);
    const [iframeUrl, setIframeUrl] = useState<string | null>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);

    // ── Load profile + addresses on mount ─────────────────────────────────────

    useEffect(() => {
        if (!userId) return;
        Promise.all([getProfile(userId), getAddresses(userId)])
            .then(([prof, addrs]) => {
                setProfile(prof);
                setSavedAddresses(addrs);
            })
            .catch(() => {
                // non-blocking — user can still fill form manually
            });
    }, [userId]);

    // ── Save address from checkout ─────────────────────────────────────────────

    async function handleSaveAddress(payload: CreateAddressPayload): Promise<Address> {
        if (!userId) throw new Error("Not authenticated");
        const created = await createAddress(userId, payload);
        setSavedAddresses((prev) => {
            const updated = payload.isDefault
                ? prev.map((a) => ({ ...a, isDefault: false }))
                : prev;
            return [...updated, created];
        });
        return created;
    }

    // ── Polling ────────────────────────────────────────────────────────────────

    const pollTransactionStatus = useCallback(
        async (transactionId: string, attempts = 0) => {
            if (attempts >= MAX_POLL_ATTEMPTS) {
                setIsPolling(false);
                setPaymentError(
                    t("payment.error.timeout", {
                        defaultValue:
                            "Payment confirmation is taking longer than expected. Please check your order history or contact support.",
                    })
                );
                return;
            }

            try {
                const tx = await getTransaction(transactionId);

                if (tx.status === "SUCCESS") {
                    setIsPolling(false);
                    dispatch(clearCart());
                    setOrderPlaced(true);
                } else if (tx.status === "FAILED") {
                    setIsPolling(false);
                    setPaymentError(
                        t("payment.error.failed", {
                            defaultValue: "Payment was declined. Please try a different payment method.",
                        })
                    );
                } else if (tx.status === "CANCELLED") {
                    setIsPolling(false);
                    setPaymentError(
                        t("payment.error.cancelled", {
                            defaultValue: "Payment was cancelled. Please try again.",
                        })
                    );
                } else {
                    // PENDING or PROCESSING — keep polling
                    setTimeout(
                        () => pollTransactionStatus(transactionId, attempts + 1),
                        POLL_INTERVAL_MS
                    );
                }
            } catch {
                // Network hiccup — retry
                setTimeout(
                    () => pollTransactionStatus(transactionId, attempts + 1),
                    POLL_INTERVAL_MS
                );
            }
        },
        [dispatch, t]
    );

    // ── Handle BNPL return after redirect ─────────────────────────────────────

    useEffect(() => {
        const pendingTxId = sessionStorage.getItem(PENDING_TX_KEY);
        if (pendingTxId) {
            sessionStorage.removeItem(PENDING_TX_KEY);
            setCurrentTransactionId(pendingTxId);
            setIsPolling(true);
            setStep("payment");
            pollTransactionStatus(pendingTxId);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Handlers ──────────────────────────────────────────────────────────────

    function handleShippingContinue(data: ShippingFormData) {
        setShippingData(data);
        setStep("payment");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function handlePlaceOrder(paymentMethod: PaymentMethod) {
        if (!userId || !shippingData) return;

        setIsSubmitting(true);
        setPaymentError(null);

        try {
            // Use the cart ID as the appOrderId (reused across retries)
            const orderId = appOrderId ?? cartId;
            if (!orderId) throw new Error("No active cart found. Please add items and try again.");
            if (!appOrderId) setAppOrderId(orderId);

            // Initiate payment
            const result = await initiatePayment({
                appOrderId: orderId,
                methodType: METHOD_MAP[paymentMethod],
                amount: totals.total,
                currency: "AED",
                customerId: userId,
                customerEmail: profile?.email ?? shippingData.email,
                customerPhone: shippingData.phone || undefined,
                billingName: `${shippingData.firstName} ${shippingData.lastName}`.trim(),
                billingApartment: shippingData.apartment || undefined,
                billingStreet: shippingData.streetAddress || undefined,
                billingCity: shippingData.city || undefined,
                billingCountry: shippingData.country || undefined,
                billingPostalCode: shippingData.postalCode || undefined,
            });

            setCurrentTransactionId(result.transactionId);

            if (paymentMethod === "card") {
                // Render Paymob iframe
                const url = `https://uae.paymob.com/api/acceptance/iframes/${result.iframeId}?payment_token=${result.paymentKeyToken}`;
                setIframeUrl(url);
            } else {
                // BNPL: redirect — store transactionId so we can poll on return
                if (result.redirectUrl) {
                    sessionStorage.setItem(PENDING_TX_KEY, result.transactionId);
                    window.location.href = result.redirectUrl;
                }
            }
        } catch (err) {
            setPaymentError(
                err instanceof Error
                    ? err.message
                    : t("payment.error.generic", { defaultValue: "Payment initiation failed. Please try again." })
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleIframeClose() {
        setIframeUrl(null);
        if (currentTransactionId) {
            setIsPolling(true);
            pollTransactionStatus(currentTransactionId);
        }
    }

    function handleRetry() {
        setPaymentError(null);
        setCurrentTransactionId(null);
        // Keep appOrderId so we reuse the same order on retry
    }

    // ── Render ────────────────────────────────────────────────────────────────

    if (orderPlaced) {
        return (
            <>
                <Header />
                <main className="w-[90%] mx-auto py-8 md:py-12">
                    <OrderConfirmed lang={lang} />
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            {/* Paymob card iframe overlay */}
            {iframeUrl && <PaymentIframe iframeUrl={iframeUrl} onClose={handleIframeClose} />}

            <Header />
            <main className="w-[90%] mx-auto py-8 md:py-12">
                {isPolling ? (
                    <PollingOverlay />
                ) : (
                    <>
                        <StepIndicator current={step} />

                        {/* Payment error banner */}
                        {paymentError && (
                            <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                                <svg
                                    className="flex-shrink-0 mt-0.5"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#ef4444"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                <div className="flex-1">
                                    <p className="text-[13px] font-semibold text-red-700">{paymentError}</p>
                                    <button
                                        onClick={handleRetry}
                                        className="mt-1 text-[12px] font-bold text-red-600 hover:text-red-800 underline cursor-pointer"
                                    >
                                        {t("payment.error.retry", { defaultValue: "Try again" })}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-6 items-start">
                            {/* Left column */}
                            <div>
                                {step === "shipping" && (
                                    <ShippingStep
                                        onContinue={handleShippingContinue}
                                        initialData={shippingData ?? undefined}
                                        savedAddresses={savedAddresses}
                                        profilePhone={profile?.phoneNumber ?? undefined}
                                        onSaveAddress={handleSaveAddress}
                                    />
                                )}
                                {step === "payment" && shippingData && (
                                    <PaymentStep
                                        shipping={shippingData}
                                        onEdit={() => setStep("shipping")}
                                        onPlaceOrder={handlePlaceOrder}
                                        isSubmitting={isSubmitting}
                                    />
                                )}
                            </div>

                            {/* Right column */}
                            <CheckoutSummary />
                        </div>
                    </>
                )}
            </main>
            <Footer />
        </>
    );
}
