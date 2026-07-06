"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import type { Lang } from "@/config/pathSlugs";
import { listMyQuotes, type B2bQuote, type B2bQuoteStatus } from "@/features/b2b/services/quote.api";

// ── My quotes (history / status list) ─────────────────────────────────────────

const STATUS_CLASS: Record<B2bQuoteStatus, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
    SUBMITTED: "bg-yellow-100 text-yellow-800",
    QUOTED: "bg-blue-100 text-blue-800",
    ACCEPTED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    EXPIRED: "bg-gray-100 text-gray-500",
    CANCELLED: "bg-gray-100 text-gray-500",
    ORDERED: "bg-[#EDE9FF] text-[#402F75]",
};

export default function B2BQuotesPage() {
    const { t } = useTranslation("b2b-rfq");
    const params = useParams();
    const lang = (params?.lang as Lang) ?? "en";

    const [quotes, setQuotes] = useState<B2bQuote[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        listMyQuotes()
            .then((qs) => {
                if (cancelled) return;
                // Hide the DRAFT quote (that's the live cart, shown on /b2b/cart).
                setQuotes(qs.filter((q) => q.status !== "DRAFT"));
                setError("");
            })
            .catch(() => {
                if (!cancelled) setError(t("b2bQuote.loadError"));
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            <h1 className="text-2xl font-semibold text-gray-900">{t("b2bQuote.listTitle")}</h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">{t("b2bQuote.listSubtitle")}</p>

            {error && (
                <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}

            {loading ? (
                <div className="mt-8 text-sm text-gray-500">{t("b2bQuote.loading")}</div>
            ) : quotes.length === 0 ? (
                <div className="mt-8 rounded-md border border-dashed border-gray-300 px-6 py-12 text-center">
                    <p className="text-sm text-gray-500">{t("b2bQuote.empty")}</p>
                    <a
                        href={`/${lang}/b2b/cart`}
                        className="mt-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50"
                    >
                        {t("b2bQuote.emptyCta")}
                    </a>
                </div>
            ) : (
                <ul className="mt-6 divide-y divide-gray-200 rounded-md border border-gray-200">
                    {quotes.map((q) => {
                        const date = q.submittedAt ?? q.createdAt;
                        return (
                            <li key={q.id}>
                                <a
                                    href={`/${lang}/b2b/quotes/${q.id}`}
                                    className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-gray-50 md:flex-row md:items-center md:justify-between"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASS[q.status]}`}>
                                                {t(`b2bQuote.status.${q.status}`)}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="mt-1.5 text-sm text-gray-700">
                                            {q.items.length}{" "}
                                            {q.items.length === 1 ? "item" : "items"}
                                            {q.quotedSubtotal != null && (
                                                <span className="ml-2 font-semibold text-gray-900">
                                                    {q.quotedSubtotal.toLocaleString(undefined, {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })}{" "}
                                                    {q.currency}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <svg className="hidden flex-shrink-0 text-gray-300 md:block" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 18l6-6-6-6" />
                                    </svg>
                                </a>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
