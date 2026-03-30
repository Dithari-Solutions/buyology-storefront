"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import type { RootState } from "@/store";
import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import { getOrders } from "../services/orders.api";
import type { OrderSummary, OrderStatus, DeliveryMethod } from "../types";

// ── Constants ─────────────────────────────────────────────────────────────────

const ACTIVE_STATUSES: OrderStatus[] = [
    "PENDING_PAYMENT",
    "PAID",
    "PROCESSING",
    "COURIER_ASSIGNED",
    "PICKED_UP",
    "SHIPPED",
    "IN_TRANSIT",
];

const PAST_STATUSES: OrderStatus[] = ["DELIVERED", "CANCELLED", "FAILED"];

const STATUS_LABELS: Record<OrderStatus, string> = {
    PENDING_PAYMENT: "Pending Payment",
    PAID: "Paid",
    PROCESSING: "Processing",
    COURIER_ASSIGNED: "Courier Assigned",
    PICKED_UP: "Picked Up",
    SHIPPED: "Shipped",
    IN_TRANSIT: "In Transit",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    FAILED: "Failed",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
    PENDING_PAYMENT: "bg-yellow-100 text-yellow-800",
    PAID: "bg-blue-100 text-blue-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    COURIER_ASSIGNED: "bg-purple-100 text-purple-800",
    PICKED_UP: "bg-purple-100 text-purple-800",
    SHIPPED: "bg-indigo-100 text-indigo-800",
    IN_TRANSIT: "bg-orange-100 text-orange-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-gray-100 text-gray-700",
    FAILED: "bg-red-100 text-red-800",
};

// ── StatusBadge ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OrderStatus }) {
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${STATUS_COLORS[status]}`}>
            {STATUS_LABELS[status]}
        </span>
    );
}

// ── OrderCard ─────────────────────────────────────────────────────────────────

function OrderCard({ order, lang }: { order: OrderSummary; lang: string }) {
    const shortId = order.id.slice(-8).toUpperCase();
    const placedDate = new Date(order.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[14px] font-bold text-gray-900">#{shortId}</span>
                    <StatusBadge status={order.status} />
                </div>
                <p className="text-[12px] text-gray-500 mb-2">{placedDate}</p>
                <div className="flex items-center gap-4 flex-wrap text-[12px] text-gray-600">
                    <span className="flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="1" y="3" width="15" height="13" rx="1" />
                            <path d="M16 8h4l3 3v5h-7V8z" />
                            <circle cx="5.5" cy="18.5" r="2.5" />
                            <circle cx="18.5" cy="18.5" r="2.5" />
                        </svg>
                        {order.deliveryMethod === "LOCAL_EXPRESS" ? "Local Express" : "International"}
                    </span>
                    <span className="flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        {order.city}, {order.country}
                    </span>
                </div>
            </div>
            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3">
                <p className="text-[16px] font-bold text-gray-900">
                    {order.currency} {order.totalAmount.toFixed(2)}
                </p>
                <a href={`/${lang}/orders/${order.id}`}>
                    <button className="flex items-center gap-1.5 text-[13px] font-bold text-[#402F75] hover:text-[#2e2156] transition-colors cursor-pointer whitespace-nowrap">
                        View Details
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </a>
            </div>
        </div>
    );
}

// ── EmptyState ────────────────────────────────────────────────────────────────

function EmptyState({ filtered }: { filtered: boolean }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-[#EDE9FF] flex items-center justify-center mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                </svg>
            </div>
            <p className="text-[16px] font-bold text-gray-800 mb-1">
                {filtered ? "No orders match your filters" : "No orders yet"}
            </p>
            <p className="text-[13px] text-gray-500 max-w-xs">
                {filtered
                    ? "Try adjusting your filters to see more results."
                    : "Once you complete a purchase, your orders will appear here."}
            </p>
        </div>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
    const router = useRouter();
    const lang = useSelector((state: RootState) => state.language.lang) as string;
    const userId = useSelector((state: RootState) => state.auth.userId);

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
        if (!userId) {
            router.push(`/${lang}/auth`);
        }
    }, [userId, lang, router]);

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

    function clearFilters() {
        setStatusGroup("all");
        setDeliveryFilter("");
        setDateFrom("");
        setDateTo("");
    }

    if (!userId) return null;

    return (
        <>
            <Header />
            <main className="w-[90%] mx-auto py-8 md:py-12">
                {/* Page title */}
                <div className="mb-6">
                    <h1 className="text-[22px] font-bold text-gray-900">My Orders</h1>
                    <p className="text-[13px] text-gray-500 mt-0.5">Track and manage your purchases</p>
                </div>

                {/* Filter bar */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                    {/* Tabs */}
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                        {(["all", "active", "past"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setStatusGroup(tab)}
                                className={`px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                                    statusGroup === tab
                                        ? "bg-[#402F75] text-white"
                                        : "bg-white text-gray-600 border border-gray-200 hover:border-[#402F75]"
                                }`}
                            >
                                {tab === "all" ? "All Orders" : tab === "active" ? "Active" : "Past Orders"}
                            </button>
                        ))}
                    </div>

                    {/* Secondary filters */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="relative">
                            <select
                                value={deliveryFilter}
                                onChange={(e) => setDeliveryFilter(e.target.value as DeliveryMethod | "")}
                                className="border border-gray-200 rounded-xl px-3.5 py-2 text-[12px] text-gray-700 outline-none focus:border-[#402F75] appearance-none bg-white cursor-pointer pr-8 min-w-[160px]"
                            >
                                <option value="">All Delivery Methods</option>
                                <option value="LOCAL_EXPRESS">Local Express</option>
                                <option value="INTERNATIONAL">International</option>
                            </select>
                            <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </div>

                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="border border-gray-200 rounded-xl px-3.5 py-2 text-[12px] text-gray-700 outline-none focus:border-[#402F75] cursor-pointer"
                            placeholder="From"
                        />
                        <span className="text-[12px] text-gray-400">to</span>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="border border-gray-200 rounded-xl px-3.5 py-2 text-[12px] text-gray-700 outline-none focus:border-[#402F75] cursor-pointer"
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
                        <div className="w-12 h-12 rounded-full bg-[#EDE9FF] flex items-center justify-center mb-4">
                            <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2">
                                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.3" />
                                <path d="M21 12a9 9 0 00-9-9" />
                            </svg>
                        </div>
                        <p className="text-[13px] text-gray-500">Loading your orders…</p>
                    </div>
                ) : error ? (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-center">
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
                                <h2 className="text-[15px] font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#FBBB14] inline-block" />
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
                                <h2 className="text-[15px] font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
                                    Past Orders
                                </h2>
                                <div className="flex flex-col gap-3">
                                    {past.map((order) => (
                                        <OrderCard key={order.id} order={order} lang={lang} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {filtered.length === 0 && <EmptyState filtered={hasFilters} />}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-3 mt-4">
                                <button
                                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:border-[#402F75] hover:text-[#402F75] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
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
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:border-[#402F75] hover:text-[#402F75] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
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
