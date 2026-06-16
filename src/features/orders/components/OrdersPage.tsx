"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import type { RootState } from "@/store";
import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import { getOrders } from "../services/orders.api";
import { repayOrder } from "@/features/checkout/services/payment.api";
import { SITE_URL } from "@/shared/seo/config";
import type { OrderSummary, OrderStatus, DeliveryMethod } from "../types";

// ── Constants ─────────────────────────────────────────────────────────────────

const ACTIVE_STATUSES: OrderStatus[] = [
    "PENDING_PAYMENT",
    "PAID",
    "PACKAGING",
    "IN_COURIER",
    "IN_TRANSIT",
    // legacy
    "PROCESSING",
    "COURIER_ASSIGNED",
    "PICKED_UP",
    "SHIPPED",
];

const PAST_STATUSES: OrderStatus[] = ["DELIVERED", "CANCELLED", "FAILED"];

const STATUS_LABELS: Record<OrderStatus, string> = {
    PENDING_PAYMENT: "Pending Payment",
    PAID: "Paid",
    PACKAGING: "Packaging",
    IN_COURIER: "Handed to Courier",
    IN_TRANSIT: "In Transit",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    FAILED: "Failed",
    PROCESSING: "Processing",
    COURIER_ASSIGNED: "Courier Assigned",
    PICKED_UP: "Picked Up",
    SHIPPED: "Shipped",
};

type StatusTone = "pending" | "progress" | "done" | "cancelled" | "failed";

const STATUS_TONE: Record<OrderStatus, StatusTone> = {
    PENDING_PAYMENT: "pending",
    PAID: "progress",
    PACKAGING: "progress",
    IN_COURIER: "progress",
    IN_TRANSIT: "progress",
    PROCESSING: "progress",
    COURIER_ASSIGNED: "progress",
    PICKED_UP: "progress",
    SHIPPED: "progress",
    DELIVERED: "done",
    CANCELLED: "cancelled",
    FAILED: "failed",
};

// Brand-aligned badge + accent styling, grouped by meaning rather than a rainbow.
const TONE_STYLES: Record<StatusTone, { badge: string; dot: string; accent: string }> = {
    pending: { badge: "bg-amber-50 text-amber-700", dot: "bg-amber-400", accent: "bg-amber-300" },
    progress: { badge: "bg-[#EDE9FF] text-[#402F75]", dot: "bg-[#402F75]", accent: "bg-[#402F75]" },
    done: { badge: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500", accent: "bg-emerald-400" },
    cancelled: { badge: "bg-gray-100 text-gray-600", dot: "bg-gray-400", accent: "bg-gray-300" },
    failed: { badge: "bg-red-50 text-red-700", dot: "bg-red-500", accent: "bg-red-400" },
};

// Position in the fulfilment journey (0-3) for the progress tracker.
const PROGRESS_STEPS = ["Confirmed", "Packed", "In transit", "Delivered"] as const;
const STATUS_STEP: Record<OrderStatus, number> = {
    PENDING_PAYMENT: 0,
    PAID: 0,
    PROCESSING: 1,
    PACKAGING: 1,
    COURIER_ASSIGNED: 2,
    PICKED_UP: 2,
    IN_COURIER: 2,
    SHIPPED: 2,
    IN_TRANSIT: 2,
    DELIVERED: 3,
    CANCELLED: 0,
    FAILED: 0,
};

// ── Icons ─────────────────────────────────────────────────────────────────────

const TruckIcon = ({ size = 12 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
);

const PinIcon = ({ size = 12 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const UserIcon = ({ size = 12 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

// ── StatusBadge ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OrderStatus }) {
    const tone = STATUS_TONE[status];
    const { badge, dot } = TONE_STYLES[tone];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
            {STATUS_LABELS[status]}
        </span>
    );
}

// ── OrderProgress ─────────────────────────────────────────────────────────────

function OrderProgress({ status }: { status: OrderStatus }) {
    const current = STATUS_STEP[status];
    return (
        <div className="flex items-center gap-1.5 mt-3">
            {PROGRESS_STEPS.map((label, i) => {
                const reached = i <= current;
                return (
                    <div key={label} className="flex-1 flex flex-col gap-1">
                        <span className={`h-1 rounded-full transition-colors ${reached ? "bg-[#402F75]" : "bg-gray-200"}`} />
                        <span className={`text-[10px] font-medium leading-tight ${reached ? "text-[#402F75]" : "text-gray-400"}`}>
                            {label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

// ── OrderCard ─────────────────────────────────────────────────────────────────

function OrderCard({ order, lang }: { order: OrderSummary; lang: string }) {
    const shortId = order.id.slice(-8).toUpperCase();
    const tone = STATUS_TONE[order.status];
    const isActive = ACTIVE_STATUSES.includes(order.status) && order.status !== "PENDING_PAYMENT";
    const isPendingPayment = order.status === "PENDING_PAYMENT";
    const [repaying, setRepaying] = useState(false);
    const [repayError, setRepayError] = useState<string | null>(null);

    async function handleRepay(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        setRepaying(true);
        setRepayError(null);
        try {
            const res = await repayOrder(order.id, {
                methodType: "CARD",
                // Canonical production site URL so the post-payment redirect lands on the
                // live site rather than the dev/staging host the user happens to be on.
                redirectionUrl: `${SITE_URL}/${lang}/payment/callback?orderId=${order.id}`,
            });
            // Persist the tx id so the callback can confirm the payment (mirrors checkout).
            sessionStorage.setItem("buyology_pending_tx_id", res.transactionId);
            window.location.href = res.checkoutUrl;
        } catch (err) {
            setRepayError(err instanceof Error ? err.message : "Could not start payment. Please try again.");
            setRepaying(false);
        }
    }

    const placedDate = new Date(order.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
    });
    const deliveredDate = order.deliveredAt
        ? new Date(order.deliveredAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : null;
    const recipient = `${order.recipientFirstName} ${order.recipientLastName}`.trim();

    return (
        <a
            href={`/${lang}/orders/${order.id}`}
            className="group relative flex overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#402F75]/30 hover:shadow-md"
        >
            {/* Status accent rail */}
            <span className={`w-1 shrink-0 ${TONE_STYLES[tone].accent}`} />

            <div className="flex-1 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <div className="mb-1.5 flex flex-wrap items-center gap-2">
                            <span className="text-[14px] font-bold text-gray-900">#{shortId}</span>
                            <StatusBadge status={order.status} />
                        </div>
                        <p className="text-[12px] text-gray-400">
                            Placed {placedDate}
                            {deliveredDate && tone === "done" && ` · Delivered ${deliveredDate}`}
                        </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                        <p className="text-[17px] font-extrabold text-gray-900">
                            {order.currency} {order.totalAmount.toFixed(2)}
                        </p>
                        <span className="flex items-center gap-1 text-[12px] font-bold text-[#402F75] opacity-0 transition-opacity group-hover:opacity-100 max-sm:opacity-100">
                            View Details
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </span>
                    </div>
                </div>

                {/* Meta chips */}
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-gray-500">
                    {recipient && (
                        <span className="flex items-center gap-1.5"><UserIcon /> {recipient}</span>
                    )}
                    <span className="flex items-center gap-1.5">
                        <TruckIcon /> {order.deliveryMethod === "EXPRESS" ? "Express delivery" : "Regular delivery"}
                    </span>
                    <span className="flex items-center gap-1.5"><PinIcon /> {order.city}, {order.country}</span>
                    {order.trackingCode && (
                        <span className="flex items-center gap-1.5 font-medium text-gray-600">
                            {order.carrierName ?? "Tracking"}: {order.trackingCode}
                        </span>
                    )}
                </div>

                {isActive && <OrderProgress status={order.status} />}

                {isPendingPayment && (
                    <div className="mt-3 flex flex-col gap-1.5">
                        <button
                            onClick={handleRepay}
                            disabled={repaying}
                            className="inline-flex w-fit items-center gap-1.5 rounded-xl bg-[#FBBB14] px-4 py-2 text-[12px] font-bold text-gray-900 transition-all hover:bg-[#f0b000] disabled:opacity-60 cursor-pointer"
                        >
                            {repaying ? "Starting payment…" : "Pay now"}
                            {!repaying && (
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            )}
                        </button>
                        {repayError && <p className="text-[11px] font-medium text-red-600">{repayError}</p>}
                    </div>
                )}
            </div>
        </a>
    );
}

// ── StatCard ──────────────────────────────────────────────────────────────────

function StatCard({ label, value, dot }: { label: string; value: number; dot: string }) {
    return (
        <div className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-white px-4 py-2.5 shadow-sm">
            <span className={`h-2 w-2 rounded-full ${dot}`} />
            <div className="leading-tight">
                <p className="text-[18px] font-extrabold text-gray-900">{value}</p>
                <p className="text-[11px] font-medium text-gray-400">{label}</p>
            </div>
        </div>
    );
}

// ── EmptyState ────────────────────────────────────────────────────────────────

function EmptyState({ filtered, lang, onClear }: { filtered: boolean; lang: string; onClear: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gradient-to-b from-[#F8F6FF] to-white py-16 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-[#402F75]/10">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                </svg>
            </div>
            <p className="mb-1 text-[17px] font-bold text-gray-900">
                {filtered ? "No orders match your filters" : "No orders yet"}
            </p>
            <p className="mb-5 max-w-xs text-[13px] text-gray-500">
                {filtered
                    ? "Try adjusting or clearing your filters to see more results."
                    : "When you place your first order it will show up here, ready to track."}
            </p>
            {filtered ? (
                <button
                    onClick={onClear}
                    className="rounded-xl border border-gray-200 px-5 py-2.5 text-[13px] font-bold text-gray-700 transition-colors hover:border-[#402F75] hover:text-[#402F75] cursor-pointer"
                >
                    Clear filters
                </button>
            ) : (
                <a
                    href={`/${lang}`}
                    className="rounded-xl bg-[#402F75] px-6 py-2.5 text-[13px] font-bold text-white shadow-sm transition-colors hover:bg-[#2e2156]"
                >
                    Start shopping
                </a>
            )}
        </div>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
    const router = useRouter();
    const lang = useSelector((state: RootState) => state.language.lang) as string;
    const userId = useSelector((state: RootState) => state.auth.userId);
    const authRestored = useSelector((state: RootState) => state.auth.isRestored);

    const [orders, setOrders] = useState<OrderSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Filter state
    const [statusGroup, setStatusGroup] = useState<"all" | "active" | "past">("all");
    const [deliveryFilter, setDeliveryFilter] = useState<DeliveryMethod | "">("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    // Auth guard
    useEffect(() => {
        if (!authRestored) return;
        if (!userId) {
            router.push(`/${lang}/auth`);
        }
    }, [authRestored, userId, lang, router]);

    useEffect(() => {
        if (!userId) return;
        setLoading(true);
        setError(null);
        getOrders(page, 20)
            .then((data) => {
                setOrders(data.content);
                setTotalPages(data.totalPages);
            })
            .catch((err) => setError(err instanceof Error ? err.message : "Failed to load orders."))
            .finally(() => setLoading(false));
    }, [userId, page]);

    // Client-side filtering
    const filtered = orders.filter((o) => {
        if (statusGroup === "active" && !ACTIVE_STATUSES.includes(o.status)) return false;
        if (statusGroup === "past" && !PAST_STATUSES.includes(o.status)) return false;
        if (deliveryFilter && o.deliveryMethod !== deliveryFilter) return false;
        if (dateFrom && new Date(o.createdAt) < new Date(dateFrom)) return false;
        if (dateTo && new Date(o.createdAt) > new Date(dateTo)) return false;
        return true;
    });

    const active = filtered.filter((o) => ACTIVE_STATUSES.includes(o.status));
    const past = filtered.filter((o) => PAST_STATUSES.includes(o.status));
    const hasFilters = statusGroup !== "all" || !!deliveryFilter || !!dateFrom || !!dateTo;

    // Summary across all loaded orders (unfiltered) for the header stats.
    const totalCount = orders.length;
    const activeCount = orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length;
    const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;

    function clearFilters() {
        setStatusGroup("all");
        setDeliveryFilter("");
        setDateFrom("");
        setDateTo("");
    }

    if (!authRestored) return null;
    if (!userId) return null;

    return (
        <>
            <Header />
            <main className="w-[90%] mx-auto py-8 md:py-12">
                {/* Page header */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-[24px] font-extrabold tracking-tight text-gray-900">My Orders</h1>
                        <p className="mt-0.5 text-[13px] text-gray-500">Track and manage your purchases</p>
                    </div>
                    {!loading && !error && totalCount > 0 && (
                        <div className="flex flex-wrap gap-2.5">
                            <StatCard label="Total" value={totalCount} dot="bg-gray-300" />
                            <StatCard label="Active" value={activeCount} dot="bg-[#402F75]" />
                            <StatCard label="Delivered" value={deliveredCount} dot="bg-emerald-500" />
                        </div>
                    )}
                </div>

                {/* Filter bar */}
                <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    {/* Segmented tabs */}
                    <div className="inline-flex rounded-xl bg-gray-100 p-1">
                        {(["all", "active", "past"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setStatusGroup(tab)}
                                className={`rounded-lg px-4 py-1.5 text-[12px] font-semibold transition-all cursor-pointer ${
                                    statusGroup === tab
                                        ? "bg-white text-[#402F75] shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                {tab === "all" ? "All Orders" : tab === "active" ? "Active" : "Past Orders"}
                            </button>
                        ))}
                    </div>

                    {/* Secondary filters */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        <div className="relative">
                            <select
                                value={deliveryFilter}
                                onChange={(e) => setDeliveryFilter(e.target.value as DeliveryMethod | "")}
                                className="min-w-[160px] cursor-pointer appearance-none rounded-xl border border-gray-200 bg-white px-3.5 py-2 pr-8 text-[12px] text-gray-700 outline-none focus:border-[#402F75]"
                            >
                                <option value="">All Delivery Methods</option>
                                <option value="EXPRESS">Express delivery</option>
                                <option value="REGULAR">Regular delivery</option>
                            </select>
                            <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </div>

                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="cursor-pointer rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-[12px] text-gray-700 outline-none focus:border-[#402F75]"
                            placeholder="From"
                        />
                        <span className="text-[12px] text-gray-400">to</span>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="cursor-pointer rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-[12px] text-gray-700 outline-none focus:border-[#402F75]"
                            placeholder="To"
                        />

                        {hasFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-[12px] font-semibold text-[#402F75] hover:underline cursor-pointer"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#EDE9FF]">
                            <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2">
                                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.3" />
                                <path d="M21 12a9 9 0 00-9-9" />
                            </svg>
                        </div>
                        <p className="text-[13px] text-gray-500">Loading your orders…</p>
                    </div>
                ) : error ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
                        <p className="text-[13px] font-semibold text-red-700">{error}</p>
                        <button
                            onClick={() => { setPage(0); }}
                            className="mt-2 text-[12px] font-bold text-red-600 hover:underline cursor-pointer"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <>
                        {active.length > 0 && (
                            <section className="mb-8">
                                <h2 className="mb-3 flex items-center gap-2 text-[15px] font-bold text-gray-800">
                                    <span className="inline-block h-2 w-2 rounded-full bg-[#FBBB14]" />
                                    Active Orders
                                    <span className="text-[12px] font-normal text-gray-400">({active.length})</span>
                                </h2>
                                <div className="flex flex-col gap-3">
                                    {active.map((order) => (
                                        <OrderCard key={order.id} order={order} lang={lang} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {past.length > 0 && (
                            <section className="mb-8">
                                <h2 className="mb-3 flex items-center gap-2 text-[15px] font-bold text-gray-800">
                                    <span className="inline-block h-2 w-2 rounded-full bg-gray-400" />
                                    Past Orders
                                    <span className="text-[12px] font-normal text-gray-400">({past.length})</span>
                                </h2>
                                <div className="flex flex-col gap-3">
                                    {past.map((order) => (
                                        <OrderCard key={order.id} order={order} lang={lang} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {filtered.length === 0 && <EmptyState filtered={hasFilters} lang={lang} onClear={clearFilters} />}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-4 flex items-center justify-center gap-3">
                                <button
                                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-[13px] font-semibold text-gray-600 transition-all hover:border-[#402F75] hover:text-[#402F75] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M19 12H5M12 5l-7 7 7 7" />
                                    </svg>
                                    Previous
                                </button>
                                <span className="text-[13px] text-gray-500">
                                    Page {page + 1} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage((p) => p + 1)}
                                    disabled={page >= totalPages - 1}
                                    className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-[13px] font-semibold text-gray-600 transition-all hover:border-[#402F75] hover:text-[#402F75] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                                >
                                    Next
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
            <Footer />
        </>
    );
}
