"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import type { RootState } from "@/store";
import type { Lang } from "@/config/pathSlugs";
import { SITE_URL } from "@/shared/seo/config";
import { getProfile, getAddresses } from "@/features/profile/services/profile.api";
import type { Address, UserProfile } from "@/features/profile/types";
import {
    getQuote,
    acceptQuote,
    cancelQuote,
    checkoutQuote,
    type B2bQuote,
} from "@/features/b2b/services/quote.api";

// ── B2B quote detail ──────────────────────────────────────────────────────────
// Shows per-line quoted unit prices, line totals, subtotal and validUntil for a
// QUOTED quote, with an Accept button. Checkout is GATED: only an ACCEPTED quote
// can proceed. On checkout we mirror the consumer flow — call checkoutQuote and
// redirect the browser to the returned `checkoutUrl` (the Paymob hosted page).

function fmtMoney(value: number, currency: string): string {
    return `${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

export default function B2BQuoteDetailPage() {
    const { t } = useTranslation("b2b-rfq");
    const params = useParams();
    const lang = (params?.lang as Lang) ?? "en";
    const quoteId = params?.quoteId as string;
    const userId = useSelector((s: RootState) => s.auth.userId);

    const [quote, setQuote] = useState<B2bQuote | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [accepting, setAccepting] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [checkingOut, setCheckingOut] = useState(false);

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);

    const load = useCallback(() => {
        if (!quoteId) return;
        setLoading(true);
        getQuote(quoteId)
            .then((q) => {
                setQuote(q);
                setError("");
            })
            .catch(() => setError(t("b2bQuote.loadError")))
            .finally(() => setLoading(false));
    }, [quoteId, t]);

    useEffect(() => {
        load();
    }, [load]);

    // Load profile + addresses so checkout can supply a delivery address / email.
    useEffect(() => {
        if (!userId) return;
        Promise.all([getProfile(userId), getAddresses(userId)])
            .then(([prof, addrs]) => {
                setProfile(prof);
                setAddresses(addrs);
            })
            .catch(() => {
                /* non-blocking */
            });
    }, [userId]);

    const accept = async () => {
        if (!quote) return;
        setAccepting(true);
        setError("");
        try {
            const updated = await acceptQuote(quote.id);
            setQuote(updated);
        } catch {
            setError(t("b2bQuote.acceptError"));
        } finally {
            setAccepting(false);
        }
    };

    const cancel = async () => {
        if (!quote) return;
        if (!confirm(t("b2bQuote.cancelConfirm"))) return;
        setCancelling(true);
        setError("");
        try {
            const updated = await cancelQuote(quote.id);
            setQuote(updated);
        } catch {
            setError(t("b2bQuote.cancelError"));
        } finally {
            setCancelling(false);
        }
    };

    const checkout = async () => {
        if (!quote) return;
        setCheckingOut(true);
        setError("");
        try {
            const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0];
            const result = await checkoutQuote(quote.id, {
                methodType: "CARD",
                deliveryMethod: "DELIVERY",
                addressId: defaultAddr?.id,
                customerEmail: profile?.email ?? undefined,
                redirectionUrl: `${SITE_URL}/${lang}/payment/callback`,
            });
            // Mirror the consumer checkout: redirect the browser to the payment URL.
            window.location.href = result.checkoutUrl;
        } catch {
            setError(t("b2bQuote.checkoutError"));
            setCheckingOut(false);
        }
    };

    if (loading) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-20 text-center text-sm text-gray-500">
                {t("b2bQuote.loading")}
            </div>
        );
    }

    if (!quote) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-20 text-center">
                <p className="text-sm text-red-700">{error || t("b2bQuote.loadError")}</p>
                <a href={`/${lang}/b2b/quotes`} className="mt-4 inline-block text-sm font-semibold text-[#402F75]">
                    {t("b2bQuote.backToList")}
                </a>
            </div>
        );
    }

    const currency = quote.currency;
    const isQuoted = quote.status === "QUOTED";
    const isAccepted = quote.status === "ACCEPTED";
    const isExpired = quote.status === "EXPIRED";
    const canAccept = isQuoted && !isExpired;
    const canCancel = quote.status === "SUBMITTED" || quote.status === "QUOTED";

    // Checkout is only ever unlocked for an ACCEPTED quote. For other statuses we
    // render a disabled button with an explanatory message.
    const checkoutBlockedMsg = isAccepted
        ? null
        : quote.status === "SUBMITTED"
            ? t("b2bQuote.checkoutBlockedSubmitted")
            : isQuoted
                ? t("b2bQuote.checkoutBlockedQuoted")
                : t("b2bQuote.checkoutBlockedGeneric");

    return (
        <div className="mx-auto max-w-3xl px-4 py-8">
            <a href={`/${lang}/b2b/quotes`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#402F75] hover:text-[#321f5e]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                </svg>
                {t("b2bQuote.backToList")}
            </a>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-semibold text-gray-900">{t("b2bQuote.detailTitle")}</h1>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                    {t(`b2bQuote.status.${quote.status}`)}
                </span>
            </div>

            {/* Meta */}
            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 rounded-xl border border-gray-100 bg-white p-4 text-[13px] sm:grid-cols-3">
                <div>
                    <p className="text-gray-400">{t("b2bQuote.createdAt")}</p>
                    <p className="font-medium text-gray-800">{new Date(quote.createdAt).toLocaleDateString()}</p>
                </div>
                {quote.submittedAt && (
                    <div>
                        <p className="text-gray-400">{t("b2bQuote.submittedAt")}</p>
                        <p className="font-medium text-gray-800">{new Date(quote.submittedAt).toLocaleDateString()}</p>
                    </div>
                )}
                {quote.quotedAt && (
                    <div>
                        <p className="text-gray-400">{t("b2bQuote.quotedAt")}</p>
                        <p className="font-medium text-gray-800">{new Date(quote.quotedAt).toLocaleDateString()}</p>
                    </div>
                )}
                {quote.validUntil && (
                    <div>
                        <p className="text-gray-400">{t("b2bQuote.validUntil")}</p>
                        <p className="font-medium text-gray-800">{new Date(quote.validUntil).toLocaleString()}</p>
                    </div>
                )}
            </div>

            {error && (
                <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}

            {isExpired && (
                <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 px-3.5 py-3 text-[13px] font-medium text-amber-700">
                    {t("b2bQuote.expiredNotice")}
                </div>
            )}

            {/* Line items */}
            <div className="mt-6 overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-left text-[13px]">
                    <thead className="bg-gray-50 text-gray-500">
                        <tr>
                            <th className="px-4 py-2.5 font-medium">{t("b2bQuote.columns.product")}</th>
                            <th className="px-4 py-2.5 text-center font-medium">{t("b2bQuote.columns.quantity")}</th>
                            <th className="px-4 py-2.5 text-right font-medium">{t("b2bQuote.columns.unitPrice")}</th>
                            <th className="px-4 py-2.5 text-right font-medium">{t("b2bQuote.columns.lineTotal")}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {quote.items.map((it) => (
                            <tr key={it.id}>
                                <td className="px-4 py-3">
                                    <p className="font-semibold text-gray-900">{it.productTitle ?? it.productId}</p>
                                    {it.sku && (
                                        <p className="mt-0.5 text-xs text-gray-400">
                                            {t("b2bQuote.columns.sku")}: <span className="font-mono">{it.sku}</span>
                                        </p>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-center text-gray-700">{it.quantity}</td>
                                <td className="px-4 py-3 text-right text-gray-700">
                                    {it.quotedUnitPrice != null ? (
                                        fmtMoney(it.quotedUnitPrice, currency)
                                    ) : (
                                        <span className="italic text-gray-400">{t("b2bQuote.pendingPrice")}</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right font-medium text-gray-900">
                                    {it.quotedLineTotal != null ? (
                                        fmtMoney(it.quotedLineTotal, currency)
                                    ) : (
                                        <span className="italic text-gray-400">{t("b2bQuote.pendingPrice")}</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    {quote.quotedSubtotal != null && (
                        <tfoot className="border-t border-gray-200 bg-gray-50">
                            <tr>
                                <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                    {t("b2bQuote.subtotal")}
                                </td>
                                <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                                    {fmtMoney(quote.quotedSubtotal, currency)}
                                </td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>

            {/* Notes */}
            {(quote.memberNote || quote.procurementNote) && (
                <div className="mt-4 space-y-3">
                    {quote.memberNote && (
                        <div className="rounded-xl border border-gray-100 bg-white p-3.5">
                            <p className="text-xs font-semibold text-gray-400">{t("b2bQuote.note")}</p>
                            <p className="mt-1 text-[13px] text-gray-700">{quote.memberNote}</p>
                        </div>
                    )}
                    {quote.procurementNote && (
                        <div className="rounded-xl border border-[#402F75]/15 bg-[#FAF8FF] p-3.5">
                            <p className="text-xs font-semibold text-[#402F75]">{t("b2bQuote.procurementNote")}</p>
                            <p className="mt-1 text-[13px] text-gray-700">{quote.procurementNote}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3">
                {canAccept && (
                    <button
                        onClick={accept}
                        disabled={accepting}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#402F75] px-8 py-[14px] text-[15px] font-bold text-white transition-colors hover:bg-[#321f5e] disabled:opacity-60"
                    >
                        {accepting ? t("b2bQuote.accepting") : t("b2bQuote.accept")}
                    </button>
                )}

                {/* Checkout — gated to ACCEPTED only */}
                {isAccepted ? (
                    <button
                        onClick={checkout}
                        disabled={checkingOut}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FBBB14] px-8 py-[14px] text-[15px] font-bold text-gray-900 transition-all hover:bg-[#f0b000] active:scale-[0.98] disabled:opacity-60"
                    >
                        {checkingOut ? t("b2bQuote.checkingOut") : t("b2bQuote.checkout")}
                    </button>
                ) : checkoutBlockedMsg ? (
                    <div>
                        <button
                            disabled
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gray-200 px-8 py-[14px] text-[15px] font-bold text-gray-400"
                        >
                            {t("b2bQuote.checkout")}
                        </button>
                        <p className="mt-2 text-center text-[12px] text-gray-500">{checkoutBlockedMsg}</p>
                    </div>
                ) : null}

                {canCancel && (
                    <button
                        onClick={cancel}
                        disabled={cancelling}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-red-300 px-8 py-[12px] text-[14px] font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                    >
                        {cancelling ? t("b2bQuote.cancelling") : t("b2bQuote.cancel")}
                    </button>
                )}
            </div>
        </div>
    );
}
