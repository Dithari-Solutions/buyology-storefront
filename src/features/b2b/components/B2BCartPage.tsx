"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
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
    type B2bQuoteItem,
} from "@/features/b2b/services/quote.api";

// ── B2B quote cart (the DRAFT quote) — styled to match the B2C cart layout ─────
// Same shell (gradient background, hero header, [1fr · summary] grid, item cards,
// sticky summary aside) as CartPage, but with the RFQ behaviour: min 5 per line,
// no buyable price (quoted by procurement), and "Request a Quote" instead of pay.

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
    const anyBelowMin = items.some((it) => it.belowMinimum || it.quantity < B2B_MIN_QTY_PER_LINE);
    const canSubmit = !isEmpty && !anyBelowMin && !submitting;
    const subtotal = quote?.quotedSubtotal ?? null;

    // ── Submitted success state ───────────────────────────────────────────────
    if (submitted) {
        return (
            <div className="relative bg-gradient-to-b from-[#F7F5FF] via-[#FBF9FF] to-white min-h-screen">
                <main className="relative mx-auto max-w-xl px-4 py-16 sm:py-24">
                    <div className="rounded-[24px] border border-gray-100 bg-white p-8 sm:p-10 text-center shadow-sm">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#EDE9FF]">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <h1 className="text-[22px] font-bold text-gray-900">{t("b2bCart.submittedTitle")}</h1>
                        <p className="mt-2 text-[14px] leading-relaxed text-gray-500">{t("b2bCart.submittedBody")}</p>
                        <Link
                            href={`/${lang}/b2b/quotes`}
                            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#402F75] px-8 py-[13px] text-[14px] font-bold text-white transition-colors hover:bg-[#321f5e]"
                        >
                            {t("b2bCart.viewQuotes")}
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    const hasContent = !isEmpty;

    return (
        <div className="relative bg-gradient-to-b from-[#F7F5FF] via-[#FBF9FF] to-white min-h-screen">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[320px] overflow-hidden">
                <div className="absolute -top-32 start-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-[#EDE9FF] blur-3xl opacity-60" />
            </div>

            <main className="relative w-[99%] max-w-[1900px] mx-auto px-3 sm:px-5 lg:px-6 py-6 sm:py-8 md:py-12">

                {/* ── Hero header ── */}
                <div className="mb-6 sm:mb-8">
                    <nav className="flex items-center gap-1.5 text-[12px] sm:text-[13px] text-gray-500 mb-3">
                        <Link href={`/${lang}`} className="hover:text-[#402F75] transition-colors">
                            {lang === "az" ? "Ana səhifə" : lang === "ar" ? "الرئيسية" : "Home"}
                        </Link>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rtl:rotate-180">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                        <span className="text-gray-800 font-medium">{t("b2bCart.title")}</span>
                    </nav>

                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-gradient-to-br from-[#402F75] to-[#5d44a8] items-center justify-center shadow-lg shadow-[#402F75]/20">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="9" cy="21" r="1" />
                                    <circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.93-1.47L23 6H6" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-[24px] sm:text-[28px] md:text-[34px] font-bold text-gray-900 leading-tight flex items-center gap-3">
                                    {t("b2bCart.title")}
                                    {hasContent && !loading && (
                                        <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full bg-[#402F75] text-white text-[12px] font-bold">
                                            {items.length}
                                        </span>
                                    )}
                                    <span className="inline-flex items-center rounded-full bg-[#EDE9FF] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#402F75]">
                                        {t("b2bCart.badge", { defaultValue: "Wholesale" })}
                                    </span>
                                </h1>
                                <p className="text-[12px] sm:text-[13px] text-gray-500 mt-0.5">{t("b2bCart.subtitle")}</p>
                            </div>
                        </div>

                        {hasContent && (
                            <Link
                                href={`/${lang}/b2b/products`}
                                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-gray-200 text-[13px] font-semibold text-gray-700 hover:border-[#402F75] hover:text-[#402F75] transition-colors shadow-sm"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rtl:rotate-180">
                                    <path d="M19 12H5M12 19l-7-7 7-7" />
                                </svg>
                                {t("b2bCart.continueShopping", { defaultValue: "Continue browsing" })}
                            </Link>
                        )}
                    </div>

                    {/* Trust strip (B2B) */}
                    {hasContent && (
                        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-gray-600">
                            <span className="inline-flex items-center gap-1.5">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                                    <line x1="7" y1="7" x2="7.01" y2="7" />
                                </svg>
                                {t("b2bCart.trust.bulkPricing", { defaultValue: "Negotiated bulk pricing" })}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                </svg>
                                {t("b2bCart.trust.procurement", { defaultValue: "Dedicated procurement team" })}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                                </svg>
                                {t("b2bCart.trust.securePay", { defaultValue: "Card, BNPL or bank transfer" })}
                            </span>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
                )}

                {/* Priced, ready-to-pay quote — surfaced above the draft cart */}
                {readyQuote && (
                    <div className="mb-6 overflow-hidden rounded-[20px] border border-[#402F75]/20 bg-white shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#402F75]/10 px-5 py-4 sm:px-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EDE9FF]">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-[16px] font-bold text-gray-900">{t("quoteReady.title")}</h2>
                                    <p className="text-[13px] text-gray-500">{t("quoteReady.subtitle")}</p>
                                </div>
                            </div>
                            <Link href={`/${lang}/b2b/quotes/${readyQuote.id}`} className="text-[13px] font-semibold text-[#402F75] hover:text-[#321f5e]">
                                {t("quoteReady.viewDetails")}
                            </Link>
                        </div>
                        <div className="grid gap-4 px-5 py-5 sm:px-6 md:grid-cols-2 md:items-start">
                            <div className="space-y-2 text-[13px]">
                                {readyQuote.quotedSubtotal != null && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">{t("quoteReady.total")}</span>
                                        <span className="text-[18px] font-bold text-gray-900">{fmtMoney(readyQuote.quotedSubtotal, readyQuote.currency)}</span>
                                    </div>
                                )}
                                {readyQuote.validUntil && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">{t("quoteReady.validUntil")}</span>
                                        <span className="font-medium text-gray-800">{new Date(readyQuote.validUntil).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                            <B2BQuotePayPanel quote={readyQuote} onUpdated={(q) => setReadyQuote(q)} />
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="w-8 h-8 border-2 border-[#402F75] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : isEmpty ? (
                    <div className="relative overflow-hidden bg-white rounded-[24px] border border-gray-100 shadow-sm">
                        <div className="pointer-events-none absolute -top-24 -end-24 w-72 h-72 rounded-full bg-[#EDE9FF] blur-3xl opacity-70" />
                        <div className="relative flex flex-col items-center justify-center px-6 py-16 sm:py-20 gap-6 text-center">
                            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#402F75] to-[#5d44a8] flex items-center justify-center shadow-lg shadow-[#402F75]/20">
                                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.93-1.47L23 6H6" />
                                </svg>
                            </div>
                            <p className="text-[15px] text-gray-500 max-w-md">{t("b2bCart.empty")}</p>
                            <Link
                                href={`/${lang}/b2b/products`}
                                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#402F75] to-[#5d44a8] text-white font-bold px-8 py-3.5 text-[14px] shadow-lg shadow-[#402F75]/20 transition-all hover:-translate-y-0.5"
                            >
                                {t("b2bCart.emptyCta")}
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rtl:rotate-180">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] 2xl:grid-cols-[1fr_440px] gap-4 sm:gap-6 items-start">

                        {/* ── Left: line items ── */}
                        <div className="flex flex-col gap-4">
                            {anyBelowMin && (
                                <div className="flex items-start gap-2.5 rounded-[18px] border border-amber-100 bg-amber-50 p-3.5">
                                    <svg className="mt-0.5 flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    <p className="text-[13px] font-medium text-amber-700">{t("b2bCart.minWarningGlobal", { min: B2B_MIN_QTY_PER_LINE })}</p>
                                </div>
                            )}

                            {items.map((it) => (
                                <B2BLineCard
                                    key={it.id}
                                    item={it}
                                    currency={currency}
                                    busy={busyItemId === it.id}
                                    onChangeQty={(q) => changeQty(it.id, q)}
                                    onRemove={() => removeItem(it.id)}
                                />
                            ))}
                        </div>

                        {/* ── Right: quote summary ── */}
                        <aside className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 md:p-6 lg:sticky lg:top-6 self-start w-full">
                            <h2 className="text-[16px] sm:text-[18px] font-bold text-gray-900 mb-4 sm:mb-5">
                                {t("b2bCart.summaryHeading", { defaultValue: "Quote summary" })}
                            </h2>

                            <div className="flex flex-col gap-3 text-[14px]">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">
                                        {t("b2bCart.summaryLines", { defaultValue: "Lines" })} ({items.length})
                                    </span>
                                    <span className="font-semibold text-gray-800">{items.reduce((s, i) => s + i.quantity, 0)} {t("b2bCart.units", { defaultValue: "units" })}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">{t("b2bCart.subtotal")}</span>
                                    {subtotal != null ? (
                                        <span className="font-semibold text-gray-800">{fmtMoney(subtotal, currency)}</span>
                                    ) : (
                                        <span className="italic text-gray-400">{t("b2bCart.pendingPrice")}</span>
                                    )}
                                </div>
                            </div>

                            <div className="h-px bg-gray-100 my-4" />

                            <div className="flex items-end justify-between gap-3">
                                <span className="text-[15px] sm:text-[17px] font-bold text-gray-900">{t("b2bCart.total", { defaultValue: "Total" })}</span>
                                {subtotal != null ? (
                                    <span className="text-[22px] sm:text-[26px] font-bold text-[#402F75] leading-none whitespace-nowrap">{fmtMoney(subtotal, currency)}</span>
                                ) : (
                                    <span className="text-[13px] font-semibold text-gray-400 text-end max-w-[55%]">{t("b2bCart.priceOnQuote", { defaultValue: "Priced after you request a quote" })}</span>
                                )}
                            </div>

                            {/* Member note */}
                            <div className="mt-5">
                                <label className="text-[13px] font-semibold text-gray-700">{t("b2bCart.noteLabel")}</label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    rows={3}
                                    placeholder={t("b2bCart.notePlaceholder")}
                                    className="mt-1.5 w-full resize-none rounded-[12px] border border-gray-200 px-4 py-3 text-[14px] text-gray-800 outline-none transition-all focus:border-[#402F75] focus:ring-2 focus:ring-[#402F75]/10"
                                />
                            </div>

                            {/* CTA */}
                            <button
                                onClick={requestQuote}
                                disabled={!canSubmit}
                                className="w-full mt-5 bg-[#FBBB14] hover:bg-[#f0b000] active:scale-[0.98] transition-all py-[14px] rounded-xl font-bold text-[15px] text-gray-900 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {submitting ? t("b2bCart.submitting") : t("b2bCart.requestQuote")}
                                {!submitting && (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rtl:rotate-180">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                )}
                            </button>
                            {anyBelowMin && (
                                <p className="mt-2 text-center text-[12px] font-medium text-amber-700">
                                    {t("b2bCart.minWarningGlobal", { min: B2B_MIN_QTY_PER_LINE })}
                                </p>
                            )}

                            {/* Benefits (B2B) */}
                            <div className="mt-5 border-t border-gray-100 pt-5">
                                <h3 className="font-bold text-[14px] text-gray-800 mb-4">{t("b2bCart.benefitsHeading", { defaultValue: "Why order via B2B" })}</h3>
                                <div className="flex flex-col gap-3">
                                    {[
                                        { title: t("b2bCart.benefit1.title", { defaultValue: "Bulk pricing" }), desc: t("b2bCart.benefit1.desc", { defaultValue: "Procurement prices your order — no fixed retail price." }) },
                                        { title: t("b2bCart.benefit2.title", { defaultValue: "Flexible payment" }), desc: t("b2bCart.benefit2.desc", { defaultValue: "Pay by card, BNPL or bank transfer with proof of payment." }) },
                                        { title: t("b2bCart.benefit3.title", { defaultValue: "Dedicated support" }), desc: t("b2bCart.benefit3.desc", { defaultValue: "A procurement contact for lead times and terms." }) },
                                    ].map((b) => (
                                        <div key={b.title} className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-[#EDE9FF] flex items-center justify-center flex-shrink-0">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-[13px] text-gray-800 leading-snug">{b.title}</p>
                                                <p className="text-[11px] text-gray-400">{b.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </aside>
                    </div>
                )}
            </main>
        </div>
    );
}

// ── Single B2B line card — mirrors the B2C CartItem card ──────────────────────
function B2BLineCard({
    item,
    currency,
    busy,
    onChangeQty,
    onRemove,
}: {
    item: B2bQuoteItem;
    currency: string;
    busy: boolean;
    onChangeQty: (quantity: number) => void;
    onRemove: () => void;
}) {
    const { t } = useTranslation("b2b-rfq");
    const below = item.belowMinimum || item.quantity < B2B_MIN_QTY_PER_LINE;

    return (
        <div className="group relative w-full flex items-start gap-3 sm:gap-4 p-3.5 sm:p-4 md:p-5 bg-white rounded-[22px] border border-gray-100 shadow-[0_2px_10px_-4px_rgba(16,12,40,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-20px_rgba(64,47,117,0.3)] hover:border-gray-200">
            {/* Image placeholder (quote lines carry no image) */}
            <div className="relative w-[84px] h-[84px] sm:w-[104px] sm:h-[104px] md:w-[116px] md:h-[116px] rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#F1EEFB] to-[#FBFAFF] ring-1 ring-black/[0.04]">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
            </div>

            {/* Info block */}
            <div className="relative z-10 flex-1 min-w-0 flex flex-col gap-2.5 justify-between">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-3 min-w-0">
                    <h3 className="font-bold text-[15px] sm:text-[17px] md:text-[19px] text-gray-900 leading-snug line-clamp-2 min-w-0 break-words">
                        {item.productTitle ?? item.productId}
                    </h3>
                    <div className="flex sm:flex-col items-baseline sm:items-end gap-2 sm:gap-0.5 flex-shrink-0">
                        {item.quotedUnitPrice != null ? (
                            <span className="text-[#402F75] font-extrabold text-[16px] sm:text-[18px] md:text-[20px] whitespace-nowrap tracking-tight">
                                {currency} {item.quotedUnitPrice.toLocaleString()}
                            </span>
                        ) : (
                            <span className="inline-flex items-center rounded-full bg-[#F4F2FB] px-2.5 py-1 text-[12px] font-semibold text-[#402F75]">
                                {t("b2bCart.pendingPrice")}
                            </span>
                        )}
                    </div>
                </div>

                {item.sku && (
                    <div className="flex flex-wrap gap-1.5 text-[11px] sm:text-[12px]">
                        <span className="inline-flex items-center gap-1.5 bg-[#F6F4FB] border border-[#402F75]/[0.07] rounded-lg px-2.5 py-1 text-gray-500">
                            {t("b2bCart.columns.sku")}: <strong className="text-gray-700 font-semibold font-mono">{item.sku}</strong>
                        </span>
                    </div>
                )}

                {/* Qty + line total + remove */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-auto pt-1">
                    <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                        <div className="inline-flex items-center gap-0.5 bg-[#F4F2FB] rounded-full p-1">
                            <button
                                onClick={() => onChangeQty(item.quantity - 1)}
                                disabled={busy || item.quantity <= 1}
                                className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-[#402F75] hover:bg-[#402F75] hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#402F75] disabled:cursor-not-allowed transition-colors cursor-pointer"
                                aria-label="Decrease quantity"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-3.5 h-3.5"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            </button>
                            <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                disabled={busy}
                                onChange={(e) => {
                                    const v = parseInt(e.target.value, 10);
                                    if (Number.isFinite(v)) onChangeQty(v);
                                }}
                                className={`w-11 text-center bg-transparent font-extrabold text-[14px] tabular-nums outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${below ? "text-amber-700" : "text-[#402F75]"}`}
                            />
                            <button
                                onClick={() => onChangeQty(item.quantity + 1)}
                                disabled={busy}
                                className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-[#402F75] hover:bg-[#402F75] hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
                                aria-label="Increase quantity"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-3.5 h-3.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            </button>
                        </div>
                        {item.quotedLineTotal != null && (
                            <div className="flex flex-col">
                                <span className="text-[11px] text-gray-400 leading-tight">{t("b2bCart.columns.lineTotal", { defaultValue: "Line total" })}</span>
                                <span className="text-[#402F75] font-extrabold text-[15px] sm:text-[17px] leading-tight tracking-tight">{currency} {item.quotedLineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={onRemove}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 text-[12px] sm:text-[13px] font-semibold text-gray-400 hover:text-[#FB2C36] px-3 py-2 rounded-full hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
                        aria-label="Remove line"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                        </svg>
                        <span className="hidden sm:inline">{busy ? t("b2bCart.removing") : t("b2bCart.remove")}</span>
                    </button>
                </div>

                {below && (
                    <p className="text-[12px] font-medium text-amber-700">{t("b2bCart.minWarningLine", { min: B2B_MIN_QTY_PER_LINE })}</p>
                )}
            </div>
        </div>
    );
}
