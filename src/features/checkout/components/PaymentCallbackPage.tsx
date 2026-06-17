"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import type { RootState } from "@/store";
import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import { getTransaction, getTransactionsByOrder, confirmPaymentRedirect } from "../services/payment.api";
import { clearCart } from "@/features/cart/store/cartSlice";
import { clearCartApi } from "@/features/cart/services/cart.api";
import PurchaseReviewPrompt from "./PurchaseReviewPrompt";

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 15;
const PENDING_TX_KEY = "buyology_pending_tx_id";

export default function PaymentCallbackPage({ lang }: { lang: string }) {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useDispatch();
    const userId = useSelector((state: RootState) => state.auth.userId);

    // A standalone refund courier-pickup fee charge (not an order): different copy,
    // no cart to clear, and we return the shopper to their orders/refunds.
    const isCourierFee = searchParams.get("kind") === "courier-fee";

    const [status, setStatus] = useState<"polling" | "success" | "failed" | "error">("polling");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [orderId, setOrderId] = useState<string | null>(null);

    const pollTransactionStatus = useCallback(
        async (transactionId: string, attempts = 0) => {
            if (attempts >= MAX_POLL_ATTEMPTS) {
                setStatus("error");
                setErrorMessage(
                    t("payment.error.timeout", {
                        defaultValue:
                            "Payment confirmation is taking longer than expected. Please check your order history or contact support.",
                    })
                );
                return;
            }

            try {
                const tx = await getTransaction(transactionId);
                setOrderId(tx.appOrderId);

                if (tx.status === "SUCCESS") {
                    if (!isCourierFee) {
                        if (userId) clearCartApi().catch(() => {});
                        dispatch(clearCart());
                    }
                    setStatus("success");
                    // No auto-redirect: stay on the success screen so the shopper can
                    // review their purchase. They navigate via the "View Order" button.
                } else if (tx.status === "FAILED") {
                    setStatus("failed");
                    setErrorMessage(
                        t("payment.error.failed", {
                            defaultValue: "Payment was declined. Please try a different payment method.",
                        })
                    );
                } else if (tx.status === "CANCELLED") {
                    setStatus("failed");
                    setErrorMessage(
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
            } catch (err) {
                // Network hiccup — retry
                setTimeout(
                    () => pollTransactionStatus(transactionId, attempts + 1),
                    POLL_INTERVAL_MS
                );
            }
        },
        [dispatch, t, userId, lang, router, isCourierFee]
    );

    useEffect(() => {
        let cancelled = false;

        // Our transaction UUID — set as ?transactionId by us, or stashed in the session
        // at checkout. NOTE: Paymob's own ?id param is its numeric transaction id, NOT
        // our UUID, so it must never be used here (it would fail the UUID lookup).
        const txIdFromUrl = searchParams.get("transactionId");
        const txIdFromSession = typeof window !== "undefined" ? sessionStorage.getItem(PENDING_TX_KEY) : null;
        const transactionId = txIdFromUrl || txIdFromSession;
        const orderIdFromUrl = searchParams.get("orderId");

        // Collect every Paymob redirect param. When it carries an `hmac`, it is a signed
        // "transaction response callback" — confirm it server-side first (a webhook
        // fallback that marks the order paid if the HMAC is valid), then poll for status.
        const redirectParams: Record<string, string> = {};
        searchParams.forEach((value, key) => { redirectParams[key] = value; });
        const hasSignedRedirect = !!redirectParams.hmac;

        // Paymob's own verdict, carried (signed) in the redirect. This is a DISPLAY
        // signal only — the webhook is the authoritative server-side mark. It exists so
        // the page can resolve a result even when an authed status read isn't possible:
        // the access token is in-memory and is wiped by the full-page redirect back from
        // Paymob, so reading status here depends on a silent refresh that may not be ready.
        const paymobSaysSuccess = redirectParams.success === "true";
        const paymobSaysFailure = redirectParams.success === "false";

        const showSuccess = (oid: string | null) => {
            if (cancelled) return;
            if (oid) setOrderId(oid);
            if (!isCourierFee) {
                if (userId) clearCartApi().catch(() => {});
                dispatch(clearCart());
            }
            setStatus("success");
        };

        const showFailed = () => {
            if (cancelled) return;
            setStatus("failed");
            setErrorMessage(
                t("payment.error.failed", {
                    defaultValue: "Payment was declined. Please try a different payment method.",
                })
            );
        };

        // Best-effort: fill in our appOrderId for the "View Order" button without
        // blocking the success UX (tolerates an expired token — the button falls back
        // to the order list while orderId stays null).
        const discoverOrderId = () => {
            if (orderIdFromUrl) { setOrderId(orderIdFromUrl); return; }
            if (transactionId) {
                getTransaction(transactionId)
                    .then((tx) => { if (!cancelled) setOrderId(tx.appOrderId); })
                    .catch(() => {});
            }
        };

        const resolveAndPoll = () => {
            if (cancelled) return;
            if (transactionId) {
                sessionStorage.removeItem(PENDING_TX_KEY);
                pollTransactionStatus(transactionId);
            } else if (orderIdFromUrl) {
                // Recovery: the tx id was lost (new tab, mobile redirect) but we have the
                // order — resolve the latest transaction for it and confirm by that.
                sessionStorage.removeItem(PENDING_TX_KEY);
                setOrderId(orderIdFromUrl);
                getTransactionsByOrder(orderIdFromUrl)
                    .then((txs) => {
                        if (cancelled) return;
                        if (!txs.length) {
                            setStatus("error");
                            setErrorMessage(t("payment.error.invalid_session", { defaultValue: "Invalid payment session." }));
                            return;
                        }
                        const success = txs.find((x) => x.status === "SUCCESS");
                        const latest = success ?? txs[txs.length - 1];
                        pollTransactionStatus(latest.id);
                    })
                    .catch(() => {
                        if (cancelled) return;
                        setStatus("error");
                        setErrorMessage(t("payment.error.invalid_session", { defaultValue: "Invalid payment session." }));
                    });
            } else {
                setStatus("error");
                setErrorMessage(t("payment.error.invalid_session", { defaultValue: "Invalid payment session." }));
            }
        };

        const run = async () => {
            if (hasSignedRedirect) {
                // 1. Authoritative: the server confirms the order from the signed redirect
                //    (HMAC-verified) and returns it — works without a session or token.
                //    Available once the backend with /confirm-redirect is deployed.
                const tx = await confirmPaymentRedirect(redirectParams);
                if (cancelled) return;
                if (tx) {
                    if (tx.status === "SUCCESS") return showSuccess(tx.appOrderId);
                    if (tx.status === "FAILED" || tx.status === "CANCELLED") return showFailed();
                    return pollTransactionStatus(tx.id); // resolved but not yet terminal
                }
                // 2. No server-side resolution (endpoint absent / invalid signature). Use
                //    Paymob's signed verdict for display; the webhook records the truth.
                if (paymobSaysSuccess) { showSuccess(orderIdFromUrl); discoverOrderId(); return; }
                if (paymobSaysFailure) return showFailed();
            }

            // 3. No signed redirect (direct/legacy nav): resolve by our session/order id.
            resolveAndPoll();
        };

        run();

        return () => { cancelled = true; };
    }, [searchParams, pollTransactionStatus, t, dispatch, userId, router, lang, isCourierFee]);

    return (
        <>
            <Header />
            <main className="w-[90%] mx-auto py-20 flex flex-col items-center justify-center text-center min-h-[50vh]">
                {status === "polling" && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-[#EDE9FF] flex items-center justify-center mb-4">
                            <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2.5">
                                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.3" />
                                <path d="M21 12a9 9 0 00-9-9" />
                            </svg>
                        </div>
                        <h1 className="text-[24px] font-bold text-gray-900">{t("payment.processing", { defaultValue: "Processing your payment..." })}</h1>
                        <p className="text-[14px] text-gray-500 max-w-md">
                            {t("payment.processing_desc", { defaultValue: "We're verifying your transaction. Please do not close this window or go back." })}
                        </p>
                    </div>
                )}

                {status === "success" && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <h1 className="text-[24px] font-bold text-gray-900">
                            {isCourierFee
                                ? t("payment.courierFee.success", { defaultValue: "Courier Fee Paid!" })
                                : t("payment.success", { defaultValue: "Payment Successful!" })}
                        </h1>
                        <p className="text-[14px] text-gray-500 mb-6">
                            {isCourierFee
                                ? t("payment.courierFee.success_desc", { defaultValue: "We've received your courier pickup fee. A courier will be in touch to collect your return — your order will be refunded in full." })
                                : t("payment.success_desc", { defaultValue: "Thank you for your order. We've received your payment and are processing your order." })}
                        </p>
                        <button
                            onClick={() => router.push(
                                isCourierFee
                                    ? `/${lang}/orders`
                                    : (orderId ? `/${lang}/orders/${orderId}` : `/${lang}/orders`)
                            )}
                            className="bg-[#402F75] text-white px-8 py-3 rounded-full font-bold text-[14px] hover:bg-[#34265f] transition-colors"
                        >
                            {isCourierFee
                                ? t("payment.courierFee.back_to_orders", { defaultValue: "Back to My Orders" })
                                : t("payment.view_order", { defaultValue: "View Order" })}
                        </button>

                        {!isCourierFee && orderId && <PurchaseReviewPrompt orderId={orderId} />}
                    </div>
                )}

                {(status === "failed" || status === "error") && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </div>
                        <h1 className="text-[24px] font-bold text-gray-900">{t("payment.failed", { defaultValue: "Payment Failed" })}</h1>
                        <p className="text-[14px] text-gray-500 max-w-md mb-6">
                            {errorMessage || t("payment.failed_desc", { defaultValue: "There was an issue processing your payment. Please try again." })}
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => router.push(isCourierFee ? `/${lang}/orders` : `/${lang}/checkout`)}
                                className="bg-[#402F75] text-white px-8 py-3 rounded-full font-bold text-[14px] hover:bg-[#34265f] transition-colors"
                            >
                                {isCourierFee
                                    ? t("payment.courierFee.back_to_orders", { defaultValue: "Back to My Orders" })
                                    : t("payment.back_to_checkout", { defaultValue: "Back to Checkout" })}
                            </button>
                            {!isCourierFee && (
                                <button
                                    onClick={() => router.push(`/${lang}/orders`)}
                                    className="bg-white text-[#402F75] border border-[#402F75] px-8 py-3 rounded-full font-bold text-[14px] hover:bg-gray-50 transition-colors"
                                >
                                    {t("payment.order_history", { defaultValue: "Order History" })}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
}
