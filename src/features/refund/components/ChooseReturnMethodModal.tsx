"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { setReturnMethod } from "../services/refundService";
import type { RefundReturnMethod } from "../types";

// Same session key the checkout/payment-callback flow uses to recover the tx id.
const PENDING_TX_KEY = "buyology_pending_tx_id";

interface Props {
    refundId: string;
    orderCurrency: string;
    onClose: () => void;
    onChosen: () => void;
}

export default function ChooseReturnMethodModal({
    refundId,
    orderCurrency,
    onClose,
    onChosen,
}: Props) {
    const { t } = useTranslation("refund");
    const lang = (useSelector((s: RootState) => s.language.lang) as string) ?? "en";
    const [mounted, setMounted] = useState(false);
    const [submitting, setSubmitting] = useState<RefundReturnMethod | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const choose = async (method: RefundReturnMethod) => {
        setSubmitting(method);
        setError(null);
        try {
            // For courier pickup, the customer must pay the courier fee on Paymob before
            // the request advances — send where Paymob should return the browser.
            const redirectionUrl = method === "COURIER_PICKUP" && typeof window !== "undefined"
                ? `${window.location.origin}/${lang}/payment/callback?kind=courier-fee&refundId=${refundId}`
                : undefined;
            const result = await setReturnMethod(refundId, method, orderCurrency, redirectionUrl);

            if (method === "COURIER_PICKUP" && result.payment?.checkoutUrl) {
                // Hand off to Paymob. The payment-callback page confirms the fee and the
                // request advances to COURIER_REQUESTED via the webhook.
                if (typeof window !== "undefined") {
                    sessionStorage.setItem(PENDING_TX_KEY, result.payment.transactionId);
                    window.location.href = result.payment.checkoutUrl;
                }
                return;
            }

            onChosen();
            onClose();
        } catch (e) {
            setError(e instanceof Error ? e.message : t("error.generic"));
            setSubmitting(null);
        }
    };

    if (!mounted) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gradient-to-r from-[#F8F6FF] to-white px-6 py-4">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EDE9FF] text-[#402F75]">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 9l1-5h16l1 5" />
                                <path d="M5 9v11h14V9" />
                                <path d="M3 9h18" />
                            </svg>
                        </span>
                        <h3 className="text-lg font-bold text-gray-900">{t("method.modal.title")}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="-mr-1 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
                        aria-label={t("modal.cancel")}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    <p className="mb-4 text-sm text-gray-600">{t("method.modal.description")}</p>

                    <div className="space-y-3">
                        <button
                            onClick={() => choose("STORE_DROPOFF")}
                            disabled={submitting !== null}
                            className="group flex w-full items-center gap-4 rounded-xl border border-gray-200 p-4 text-left transition-all hover:border-[#402F75] hover:bg-[#F8F6FF] disabled:opacity-50 cursor-pointer"
                        >
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EDE9FF] text-[#402F75] transition-colors group-hover:bg-[#402F75] group-hover:text-white">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 9l1-5h16l1 5" />
                                    <path d="M5 9v11h14V9" />
                                    <path d="M9 20v-6h6v6" />
                                </svg>
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block text-sm font-bold text-gray-900">{t("method.dropoff.title")}</span>
                                <span className="mt-0.5 block text-xs text-gray-500">{t("method.dropoff.desc")}</span>
                            </span>
                            <svg className="shrink-0 text-gray-300 transition-colors group-hover:text-[#402F75]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 18l6-6-6-6" />
                            </svg>
                        </button>

                        <button
                            onClick={() => choose("COURIER_PICKUP")}
                            disabled={submitting !== null}
                            className="group flex w-full items-center gap-4 rounded-xl border border-gray-200 p-4 text-left transition-all hover:border-[#402F75] hover:bg-[#F8F6FF] disabled:opacity-50 cursor-pointer"
                        >
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EDE9FF] text-[#402F75] transition-colors group-hover:bg-[#402F75] group-hover:text-white">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="1" y="3" width="15" height="13" rx="1" />
                                    <path d="M16 8h4l3 3v5h-7V8z" />
                                    <circle cx="5.5" cy="18.5" r="2.5" />
                                    <circle cx="18.5" cy="18.5" r="2.5" />
                                </svg>
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block text-sm font-bold text-gray-900">{t("method.courier.title")}</span>
                                <span className="mt-0.5 block text-xs text-gray-500">
                                    {t("method.courier.desc", { currency: orderCurrency })}
                                </span>
                            </span>
                            <svg className="shrink-0 text-gray-300 transition-colors group-hover:text-[#402F75]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 18l6-6-6-6" />
                            </svg>
                        </button>
                    </div>

                    {error && (
                        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
                    )}

                    {submitting && (
                        <p className="mt-3 text-center text-xs text-gray-500">{t("method.submitting")}</p>
                    )}
                </div>
            </div>
        </div>,
        document.body,
    );
}
