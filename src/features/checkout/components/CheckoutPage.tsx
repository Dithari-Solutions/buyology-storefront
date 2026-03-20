"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import type { RootState } from "@/store";
import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import ShippingStep from "./ShippingStep";
import PaymentStep from "./PaymentStep";
import CheckoutSummary from "./CheckoutSummary";
import type { ShippingFormData, CheckoutStep, PaymentMethod } from "../types";

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
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                ) : (
                                    idx + 1
                                )}
                            </div>
                            <span
                                className={`text-[12px] font-semibold ${
                                    isActive ? "text-gray-900" : isCompleted ? "text-[#402F75]" : "text-gray-400"
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

// ── Order Confirmed Screen ────────────────────────────────────────────────────

function OrderConfirmed({ lang }: { lang: string }) {
    const { t } = useTranslation("checkout");

    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-[#EDE9FF] flex items-center justify-center mb-5">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    const lang = useSelector((state: RootState) => state.language.lang) as string;

    const [step, setStep] = useState<CheckoutStep>("shipping");
    const [shippingData, setShippingData] = useState<ShippingFormData | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);

    function handleShippingContinue(data: ShippingFormData) {
        setShippingData(data);
        setStep("payment");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function handlePlaceOrder(paymentMethod: PaymentMethod) {
        setIsSubmitting(true);
        // Simulate order submission (replace with real API call)
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsSubmitting(false);
        setOrderPlaced(true);
        console.log("Order placed with:", { shippingData, paymentMethod });
    }

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
            <Header />
            <main className="w-[90%] mx-auto py-8 md:py-12">
                <StepIndicator current={step} />

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-6 items-start">
                    {/* Left column */}
                    <div>
                        {step === "shipping" && (
                            <ShippingStep
                                onContinue={handleShippingContinue}
                                initialData={shippingData ?? undefined}
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
            </main>
            <Footer />
        </>
    );
}
