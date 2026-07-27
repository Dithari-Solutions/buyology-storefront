"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import type { Lang } from "@/config/pathSlugs";
import type { AppDispatch } from "@/store";
import { setB2bQuoteCount } from "@/features/b2b/store/b2bQuoteSlice";
import B2BQuotePayPanel from "@/features/b2b/components/B2BQuotePayPanel";
import {
    B2B_MIN_QTY_PER_LINE,
    getQuoteCart,
    listMyQuotes,
    updateQuoteItem,
    removeQuoteItem,
    submitQuote,
    type B2bQuote,
} from "@/features/b2b/services/quote.api";

// ── B2B quote cart (the DRAFT quote) ──────────────────────────────────────────
// Lists line items with an editable quantity, enforces the MIN 5 PER LINE rule
// (per-line warning + disabled "Request a Quote" until every line >= min and the
// cart is non-empty), and submits the cart for pricing.

function fmtMoney(value: number, currency: string): string {
    return `${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

/**
 * The newest quote that is priced and ready to pay: QUOTED or ACCEPTED, not past
 * its validUntil, and not already ordered. Returns null when there's nothing to pay.
 */
function pickReadyQuote(quotes: B2bQuote[]): B2bQuote | null {
    const now = Date.now();
    const ready = quotes
        .filter(
            (q) =>
                (q.status === "QUOTED" || q.status === "ACCEPTED") &&
                !q.orderId &&
                (!q.validUntil || new Date(q.validUntil).getTime() > now),
        )
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return ready[0] ?? null;
}

export default function B2BCartPage() {
    const { t } = useTranslation("b2b-rfq");
    const params = useParams();
    const dispatch = useDispatch<AppDispatch>();
    const lang = (params?.lang as Lang) ?? "en";

    const [quote, setQuote] = useState<B2bQuote | null>(null);
    const [readyQuote, setReadyQuote] = useState<B2bQuote | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const [busyItemId, setBusyItemId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [note, setNote] = useState("");

    const load = useCallback(() => {
        setLoading(true);
        getQuoteCart()
            .then((q) => {
                setQuote(q);
                setError("");
                dispatch(setB2bQuoteCount(q.items?.length ?? 0));
            })
            .catch(() => setError(t("b2bCart.loadError")))
            .finally(() => setLoading(false));
        // Surface a priced, ready-to-pay quote at the top (non-blocking).
        listMyQuotes()
            .then((quotes) => setReadyQuote(pickReadyQuote(quotes)))
            .catch(() => {
                /* non-blocking — the draft cart still renders */
            });
    }, [t, dispatch]);

    useEffect(() => {
        load();
    }, [load]);

    const changeQty = async (itemId: string, quantity: number) => {
        if (quantity < 1) return;
        setBusyItemId(itemId);
        setError("");
        try {
            const updated = await updateQuoteItem(itemId, { quantity });
            setQuote(updated);
            dispatch(setB2bQuoteCount(updated.items?.length ?? 0));
        } catch {
            setError(t("b2bCart.updateError"));
        } finally {
            setBusyItemId(null);
        }
    };

    const removeItem = async (itemId: string) => {
        setBusyItemId(itemId);
        setError("");
        try {
            const updated = await removeQuoteItem(itemId);
            setQuote(updated);
            dispatch(setB2bQuoteCount(updated.items?.length ?? 0));
        } catch {
            setError(t("b2bCart.removeError"));
        } finally {
            setBusyItemId(null);
        }
    };

    const requestQuote = async () => {
        setSubmitting(true);
        setError("");
        try {
            await submitQuote({ memberNote: note.trim() || undefined });
            dispatch(setB2bQuoteCount(0));   // DRAFT → SUBMITTED, the cart is now empty
            setSubmitted(true);
        } catch {
            setError(t("b2bCart.submitError"));
        } finally {
            setSubmitting(false);
        }
    };

    const currency = quote?.currency ?? "AED";
    const items = quote?.items ?? [];
    const isEmpty = items.length === 0;
    // Enforce the min-per-line rule client-side too: block submit until every line
    // meets the minimum and the cart has at least one line. (Backend re-validates.)
    const anyBelowMin = items.some((it) => it.belowMinimum || it.quantity < B2B_MIN_QTY_PER_LINE);
    const canSubmit = !isEmpty && !anyBelowMin && !submitting;

    if (submitted) {
        return (
            <div className="mx-auto max-w-xl px-4 py-20">
                <div className="rounded-[24px] border border-gray-100 bg-white p-8 sm:p-10 text-center shadow-sm">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#EDE9FF]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <h1 className="text-[22px] font-bold text-gray-900">{t("b2bCart.submittedTitle")}</h1>
                    <p className="mt-2 text-[14px] leading-relaxed text-gray-500">{t("b2bCart.submittedBody")}</p>
                    <a
                        href={`/${lang}/b2b/quotes`}
                        className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#402F75] px-8 py-[13px] text-[14px] font-bold text-white transition-colors hover:bg-[#321f5e]"
                    >
                        {t("b2bCart.viewQuotes")}
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            {/* Priced, ready-to-pay quote — surfaced prominently above the draft cart */}
            {readyQuote && (
                <div className="mb-8 overflow-hidden rounded-[20px] border border-[#402F75]/20 bg-[#FAF8FF] shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#402F75]/10 px-5 py-4 sm:px-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EDE9FF]">
                                <svg viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-[17px] font-bold text-gray-900">{t("quoteReady.title")}</h2>
                                <p className="text-[13px] text-gray-500">{t("quoteReady.subtitle")}</p>
                            </div>
                        </div>
                        <a
                            href={`/${lang}/b2b/quotes/${readyQuote.id}`}
                            className="text-[13px] font-semibold text-[#402F75] hover:text-[#321f5e]"
                        >
                            {t("quoteReady.viewDetails")}
                        </a>
                    </div>

                    <div className="grid gap-4 px-5 py-5 sm:px-6 md:grid-cols-2 md:items-start">
                        <div className="space-y-2 text-[13px]">
                            {readyQuote.quotedSubtotal != null && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">{t("quoteReady.total")}</span>
                                    <span className="text-[18px] font-bold text-gray-900">
                                        {fmtMoney(readyQuote.quotedSubtotal, readyQuote.currency)}
                                    </span>
                                </div>
                            )}
                            {readyQuote.validUntil && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">{t("quoteReady.validUntil")}</span>
                                    <span className="font-medium text-gray-800">
                                        {new Date(readyQuote.validUntil).toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>
                        <B2BQuotePayPanel quote={readyQuote} />
                    </div>
                </div>
            )}

            <h1 className="text-2xl font-semibold text-gray-900">{t("b2bCart.title")}</h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">{t("b2bCart.subtitle")}</p>

            {error && (
                <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}

            {loading ? (
                <div className="mt-8 text-sm text-gray-500">{t("b2bCart.loading")}</div>
            ) : isEmpty ? (
                <div className="mt-8 rounded-md border border-dashed border-gray-300 px-6 py-12 text-center">
                    <p className="text-sm text-gray-500">{t("b2bCart.empty")}</p>
                    <a
                        href={`/${lang}/b2b/products`}
                        className="mt-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50"
                    >
                        {t("b2bCart.emptyCta")}
                    </a>
                </div>
            ) : (
                <>
                    {/* Global min warning */}
                    {anyBelowMin && (
                        <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-amber-100 bg-amber-50 p-3.5">
                            <svg className="mt-0.5 flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <p className="text-[13px] font-medium text-amber-700">
                                {t("b2bCart.minWarningGlobal", { min: B2B_MIN_QTY_PER_LINE })}
                            </p>
                        </div>
                    )}

                    <ul className="mt-6 divide-y divide-gray-200 rounded-md border border-gray-200">
                        {items.map((it) => {
                            const below = it.belowMinimum || it.quantity < B2B_MIN_QTY_PER_LINE;
                            const busy = busyItemId === it.id;
                            return (
                                <li key={it.id} className="px-4 py-4">
                                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-gray-900">
                                                {it.productTitle ?? it.productId}
                                            </p>
                                            {it.sku && (
                                                <p className="mt-0.5 text-xs text-gray-500">
                                                    {t("b2bCart.columns.sku")}: <span className="font-mono">{it.sku}</span>
                                                </p>
                                            )}
                                            <p className="mt-0.5 text-xs text-gray-500">
                                                {t("b2bCart.columns.quotedPrice")}:{" "}
                                                {it.quotedUnitPrice != null ? (
                                                    <span className="font-semibold text-gray-700">
                                                        {fmtMoney(it.quotedUnitPrice, currency)}
                                                    </span>
                                                ) : (
                                                    <span className="italic text-gray-400">{t("b2bCart.pendingPrice")}</span>
                                                )}
                                            </p>
                                        </div>

                                        {/* Quantity stepper */}
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center rounded-lg border border-gray-200">
                                                <button
                                                    type="button"
                                                    disabled={busy || it.quantity <= 1}
                                                    onClick={() => changeQty(it.id, it.quantity - 1)}
                                                    className="px-3 py-1.5 text-lg leading-none text-gray-600 disabled:opacity-40"
                                                    aria-label="decrease"
                                                >
                                                    −
                                                </button>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={it.quantity}
                                                    disabled={busy}
                                                    onChange={(e) => {
                                                        const v = parseInt(e.target.value, 10);
                                                        if (Number.isFinite(v)) changeQty(it.id, v);
                                                    }}
                                                    className={`w-14 border-x border-gray-200 py-1.5 text-center text-sm outline-none ${below ? "text-amber-700" : "text-gray-800"}`}
                                                />
                                                <button
                                                    type="button"
                                                    disabled={busy}
                                                    onClick={() => changeQty(it.id, it.quantity + 1)}
                                                    className="px-3 py-1.5 text-lg leading-none text-gray-600 disabled:opacity-40"
                                                    aria-label="increase"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeItem(it.id)}
                                                disabled={busy}
                                                className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                                            >
                                                {busy ? t("b2bCart.removing") : t("b2bCart.remove")}
                                            </button>
                                        </div>
                                    </div>

                                    {below && (
                                        <p className="mt-2 text-[12px] font-medium text-amber-700">
                                            {t("b2bCart.minWarningLine", { min: B2B_MIN_QTY_PER_LINE })}
                                        </p>
                                    )}
                                </li>
                            );
                        })}
                    </ul>

                    {/* Note + submit */}
                    <div className="mt-6">
                        <label className="text-[13px] font-semibold text-gray-700">{t("b2bCart.noteLabel")}</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={3}
                            placeholder={t("b2bCart.notePlaceholder")}
                            className="mt-1.5 w-full resize-none rounded-[12px] border border-gray-200 px-4 py-3 text-[14px] text-gray-800 outline-none transition-all focus:border-[#402F75] focus:ring-2 focus:ring-[#402F75]/10"
                        />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={requestQuote}
                            disabled={!canSubmit}
                            className="inline-flex items-center gap-2 rounded-full bg-[#FBBB14] px-8 py-[14px] text-[15px] font-bold text-gray-900 transition-all hover:bg-[#f0b000] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {submitting ? t("b2bCart.submitting") : t("b2bCart.requestQuote")}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
