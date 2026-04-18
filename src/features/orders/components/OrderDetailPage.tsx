"use client";

import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getAccessToken } from "@/shared/lib/tokenManager";
import type { RootState } from "@/store";
import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import { getOrderDetail } from "../services/orders.api";
import type { OrderDetail, OrderStatus, TrackingEvent } from "../types";
import ChatPanel from "./ChatPanel";

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<OrderStatus, string> = {
    PENDING_PAYMENT: "Awaiting payment confirmation",
    PAID: "Payment confirmed — preparing your order",
    PROCESSING: "Your order is being prepared",
    COURIER_ASSIGNED: "A courier has been assigned",
    PICKED_UP: "Courier has picked up your order",
    SHIPPED: "Order has been shipped",
    IN_TRANSIT: "Your order is on the way",
    DELIVERED: "Delivered",
    CANCELLED: "Order cancelled",
    FAILED: "Delivery failed — contact support",
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
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold ${STATUS_COLORS[status]}`}>
            {STATUS_LABELS[status]}
        </span>
    );
}

// ── TrackingTimeline ──────────────────────────────────────────────────────────

function TrackingTimeline({ events }: { events: TrackingEvent[] }) {
    const sorted = [...events].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const actorLabel: Record<string, string> = {
        SYSTEM: "System",
        ADMIN: "Admin",
        COURIER: "Courier",
    };

    return (
        <ol className="relative border-l-2 border-gray-100 ml-3 flex flex-col gap-0">
            {sorted.map((event, i) => {
                const isCurrent = i === sorted.length - 1;
                return (
                    <li key={event.id} className="mb-6 ml-6">
                        <span
                            className={`absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white ${
                                isCurrent ? "bg-[#402F75]" : "bg-gray-300"
                            }`}
                        >
                            {isCurrent && (
                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            )}
                        </span>
                        <div className="flex items-baseline justify-between gap-4 flex-wrap">
                            <p className={`text-[13px] font-bold ${isCurrent ? "text-[#402F75]" : "text-gray-700"}`}>
                                {STATUS_LABELS[event.status]}
                            </p>
                            <time className="text-[11px] text-gray-400 flex-shrink-0">
                                {new Date(event.createdAt).toLocaleString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </time>
                        </div>
                        {event.notes && (
                            <p className="text-[12px] text-gray-500 mt-0.5">{event.notes}</p>
                        )}
                        {event.proofImageUrl && (
                            <div className="mt-2 mb-1">
                                <p className="text-[11px] text-gray-400 mb-1">Courier Photo:</p>
                                <img
                                    src={event.proofImageUrl}
                                    alt="Delivery Proof"
                                    className="w-full max-w-[200px] h-auto rounded-lg border border-gray-100 shadow-sm"
                                />
                            </div>
                        )}
                        {event.locationDescription && (
                            <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                {event.locationDescription}
                            </p>
                        )}
                        <p className="text-[11px] text-gray-400 mt-0.5">
                            — {actorLabel[event.actorRole] ?? event.actorRole}
                        </p>
                    </li>
                );
            })}
        </ol>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function OrderDetailPage({ orderId }: { orderId: string }) {
    const router = useRouter();
    const lang = useSelector((state: RootState) => state.language.lang) as string;
    const userId = useSelector((state: RootState) => state.auth.userId);
    const authRestored = useSelector((state: RootState) => state.auth.isRestored);

    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [connected, setConnected] = useState(false);
    const clientRef = useRef<Client | null>(null);

    const COURIER_ACTIVE_STATUSES: OrderStatus[] = ["COURIER_ASSIGNED", "PICKED_UP", "IN_TRANSIT"];
    const COURIER_CHAT_STATUSES: OrderStatus[] = [...COURIER_ACTIVE_STATUSES, "DELIVERED", "CANCELLED", "FAILED"];

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
        getOrderDetail(orderId)
            .then(setOrder)
            .catch((err) => setError(err instanceof Error ? err.message : "Failed to load order."))
            .finally(() => setLoading(false));
    }, [userId, orderId]);

    // WebSocket connection for live status updates
    useEffect(() => {
        if (!userId || !orderId || !authRestored) return;

        const token = getAccessToken();
        if (!token) return;

        const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
        const wsUrl = `${baseURL.replace(/^http/, "ws")}/ws`;

        const client = new Client({
            webSocketFactory: () => new SockJS(wsUrl),
            connectHeaders: {
                Authorization: `Bearer ${token}`,
                "X-Client-Type": "WEB",
            },
            onConnect: () => {
                setConnected(true);
                client.subscribe(`/topic/orders/${orderId}/status`, (frame) => {
                    const update = JSON.parse(frame.body);
                    // Refresh entire order to get latest tracking history, location, courier details, etc.
                    getOrderDetail(orderId).then(setOrder).catch(console.error);
                });
            },
            onDisconnect: () => setConnected(false),
            onStompError: () => setConnected(false),
            reconnectDelay: 5000,
        });

        client.activate();
        clientRef.current = client;

        return () => {
            client.deactivate();
        };
    }, [userId, orderId, authRestored]);

    // Poll every 10 s while courier is active on an EXPRESS order (fallback or location tracking)
    useEffect(() => {
        if (!userId || !order) return;
        if (order.deliveryMethod !== "EXPRESS") return;
        if (!COURIER_ACTIVE_STATUSES.includes(order.status)) return;

        // If connected via WebSocket, status updates are pushed.
        // But for location tracking, we still poll as a fallback or if not pushed.
        const interval = setInterval(() => {
            getOrderDetail(orderId).then(setOrder).catch(() => {});
        }, 10000);
        return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, orderId, order?.status, order?.deliveryMethod]);

    if (!authRestored) return null;
    if (!userId) return null;

    return (
        <>
            <Header />
            <main className="w-[90%] mx-auto py-8 md:py-12">
                {/* Back link */}
                <a
                    href={`/${lang}/orders`}
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-gray-500 hover:text-[#402F75] transition-colors mb-6 cursor-pointer"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 5l-7 7 7 7" />
                    </svg>
                    Back to Orders
                </a>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 rounded-full bg-[#EDE9FF] flex items-center justify-center mb-4">
                            <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2">
                                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.3" />
                                <path d="M21 12a9 9 0 00-9-9" />
                            </svg>
                        </div>
                        <p className="text-[13px] text-gray-500">Loading order details…</p>
                    </div>
                ) : error ? (
                    <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-center">
                        <p className="text-[14px] font-semibold text-red-700 mb-2">{error}</p>
                        <a href={`/${lang}/orders`} className="text-[13px] font-bold text-red-600 hover:underline">
                            Back to orders
                        </a>
                    </div>
                ) : order ? (
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
                        {/* ── Left column ──────────────────────────────────── */}
                        <div className="flex flex-col gap-5">
                            {/* Order header */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                    <div>
                                        <p className="text-[13px] text-gray-500 mb-1">Order</p>
                                        <h1 className="text-[20px] font-bold text-gray-900">
                                            #{order.id.slice(-8).toUpperCase()}
                                        </h1>
                                        <p className="text-[12px] text-gray-400 mt-0.5">
                                            Placed on{" "}
                                            {new Date(order.createdAt).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {order.deliveryMethod === "EXPRESS" &&
                                            order.deliveryOrderId &&
                                            COURIER_CHAT_STATUSES.includes(order.status) && (
                                                <>
                                                    <button
                                                        onClick={() => setIsChatOpen(true)}
                                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#402F75] text-white text-[13px] font-bold shadow-sm hover:bg-[#34265f] transition-colors"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                                        </svg>
                                                        Chat
                                                    </button>
                                                    <button
                                                        onClick={() => alert("Please install the mobile app to use the call feature.")}
                                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-[#402F75] border border-[#402F75] text-[13px] font-bold shadow-sm hover:bg-gray-50 transition-colors"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                                                        </svg>
                                                        Call
                                                    </button>
                                                </>
                                            )}
                                        <StatusBadge status={order.status} />
                                    </div>
                                </div>
                            </div>

                            {/* Delivery address */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-[15px] font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                    Delivery Address
                                </h2>
                                <p className="text-[14px] font-semibold text-gray-800">
                                    {order.recipientFirstName} {order.recipientLastName}
                                </p>
                                <p className="text-[13px] text-gray-500 mt-0.5">{order.recipientPhone}</p>
                                <p className="text-[13px] text-gray-500 mt-1">
                                    {order.addressLine1}
                                    {order.addressLine2 ? `, ${order.addressLine2}` : ""}
                                </p>
                                <p className="text-[13px] text-gray-500">
                                    {[order.city, order.state, order.country, order.postalCode]
                                        .filter(Boolean)
                                        .join(", ")}
                                </p>
                                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 border border-gray-100">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="1" y="3" width="15" height="13" rx="1" />
                                        <path d="M16 8h4l3 3v5h-7V8z" />
                                        <circle cx="5.5" cy="18.5" r="2.5" />
                                        <circle cx="18.5" cy="18.5" r="2.5" />
                                    </svg>
                                    <span className="text-[11px] font-semibold text-gray-500">
                                        {order.deliveryMethod === "EXPRESS" ? "Express delivery" : "Regular delivery"}
                                    </span>
                                </div>
                            </div>

                            {/* Order items */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-[15px] font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                                        <line x1="3" y1="6" x2="21" y2="6" />
                                        <path d="M16 10a4 4 0 01-8 0" />
                                    </svg>
                                    Order Items
                                </h2>
                                <div className="flex flex-col divide-y divide-gray-50">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13px] font-semibold text-gray-800 truncate">
                                                    {item.variantSku || item.productSku}
                                                </p>
                                                <p className="text-[11px] text-gray-400 mt-0.5">
                                                    Qty: {item.quantity} × {order.currency} {item.unitPrice.toFixed(2)}
                                                </p>
                                            </div>
                                            <p className="text-[13px] font-bold text-gray-900 flex-shrink-0">
                                                {order.currency} {item.totalPrice.toFixed(2)}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Pricing summary */}
                                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-1.5">
                                    <div className="flex justify-between text-[12px] text-gray-500">
                                        <span>Subtotal</span>
                                        <span>{order.currency} {order.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-[12px] text-gray-500">
                                        <span>Shipping</span>
                                        <span>{order.shippingFee === 0 ? "Free" : `${order.currency} ${order.shippingFee.toFixed(2)}`}</span>
                                    </div>
                                    {order.discount > 0 && (
                                        <div className="flex justify-between text-[12px] text-green-600">
                                            <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                                            <span>− {order.currency} {order.discount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-[15px] font-bold text-gray-900 mt-2 pt-2 border-t border-gray-100">
                                        <span>Total</span>
                                        <span>{order.currency} {order.totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Courier live location (EXPRESS only) */}
                            {order.deliveryMethod === "EXPRESS" && COURIER_ACTIVE_STATUSES.includes(order.status) && (() => {
                                const courierEvents = [...order.trackingHistory]
                                    .filter(e => e.actorRole === "COURIER" && e.latitude != null && e.longitude != null)
                                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                                const latest = courierEvents[0];
                                return (
                                    <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
                                        <h2 className="text-[15px] font-bold text-gray-900 mb-3 flex items-center gap-2">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="3" />
                                                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                                            </svg>
                                            Courier Location
                                            <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                Live
                                            </span>
                                        </h2>

                                        {order.courierName && (
                                            <div className="mb-4 flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                <div className="w-10 h-10 rounded-full bg-[#402F75] text-white flex items-center justify-center font-bold text-[14px]">
                                                    {order.courierName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-bold text-gray-900">{order.courierName}</p>
                                                    {order.courierPhone && (
                                                        <p className="text-[11px] text-gray-500">{order.courierPhone}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {latest ? (
                                            <>
                                                {latest.locationDescription && (
                                                    <p className="text-[13px] text-gray-600 mb-3 flex items-center gap-1.5">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                                                            <circle cx="12" cy="10" r="3" />
                                                        </svg>
                                                        {latest.locationDescription}
                                                    </p>
                                                )}
                                                <p className="text-[11px] text-gray-400 mb-3">
                                                    Last updated{" "}
                                                    {new Date(latest.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                                                </p>
                                                <iframe
                                                    title="Courier location"
                                                    width="100%"
                                                    height="220"
                                                    style={{ border: 0, borderRadius: 12 }}
                                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${latest.longitude! - 0.01},${latest.latitude! - 0.01},${latest.longitude! + 0.01},${latest.latitude! + 0.01}&layer=mapnik&marker=${latest.latitude},${latest.longitude}`}
                                                />
                                                <a
                                                    href={`https://www.google.com/maps?q=${latest.latitude},${latest.longitude}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-[#402F75] hover:underline"
                                                >
                                                    Open in Google Maps →
                                                </a>
                                                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                                                    <button
                                                        onClick={() => setIsChatOpen(true)}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#402F75] text-white text-[13px] font-bold shadow-sm hover:bg-[#34265f] transition-colors"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                                        </svg>
                                                        Chat with Courier
                                                    </button>
                                                    <button
                                                        onClick={() => alert("Please install the mobile app to use the call feature.")}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#402F75] border border-[#402F75] text-[13px] font-bold shadow-sm hover:bg-gray-50 transition-colors"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                                                        </svg>
                                                        Call Courier
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-[13px] text-gray-400">
                                                    Waiting for courier to share location…
                                                </p>
                                                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                                                    <button
                                                        onClick={() => setIsChatOpen(true)}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#402F75] text-white text-[13px] font-bold shadow-sm hover:bg-[#34265f] transition-colors"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                                        </svg>
                                                        Chat with Courier
                                                    </button>
                                                    <button
                                                        onClick={() => alert("Please install the mobile app to use the call feature.")}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#402F75] border border-[#402F75] text-[13px] font-bold shadow-sm hover:bg-gray-50 transition-colors"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                                                        </svg>
                                                        Call Courier
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })()}

                            {/* Carrier tracking (REGULAR only) */}
                            {order.deliveryMethod === "REGULAR" && order.trackingCode && (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                    <h2 className="text-[15px] font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 6 12 12 16 14" />
                                        </svg>
                                        Carrier Tracking
                                    </h2>
                                    <div className="flex items-center justify-between gap-3 flex-wrap">
                                        <div>
                                            {order.carrierName && (
                                                <p className="text-[13px] font-semibold text-gray-800">{order.carrierName}</p>
                                            )}
                                            <p className="text-[12px] text-gray-500 font-mono mt-0.5">{order.trackingCode}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Right column — Tracking Timeline ─────────────── */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:sticky lg:top-24">
                            <h2 className="text-[15px] font-bold text-gray-900 mb-5 flex items-center gap-2">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                </svg>
                                Tracking History
                            </h2>
                            {order.trackingHistory.length === 0 ? (
                                <p className="text-[13px] text-gray-400">No tracking events yet.</p>
                            ) : (
                                <TrackingTimeline events={order.trackingHistory} />
                            )}

                            {/* Milestone timestamps */}
                            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
                                {order.paidAt && (
                                    <div className="flex justify-between text-[11px] text-gray-400">
                                        <span>Paid</span>
                                        <span>{new Date(order.paidAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                                    </div>
                                )}
                                {order.shippedAt && (
                                    <div className="flex justify-between text-[11px] text-gray-400">
                                        <span>Shipped</span>
                                        <span>{new Date(order.shippedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                                    </div>
                                )}
                                {order.deliveredAt && (
                                    <div className="flex justify-between text-[11px] text-gray-400">
                                        <span>Delivered</span>
                                        <span>{new Date(order.deliveredAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                                    </div>
                                )}
                                {order.cancelledAt && (
                                    <div className="flex justify-between text-[11px] text-red-400">
                                        <span>Cancelled</span>
                                        <span>{new Date(order.cancelledAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : null}
            </main>
            {order && order.deliveryOrderId && (
                <ChatPanel
                    ecommerceOrderId={order.id}
                    deliveryOrderId={order.deliveryOrderId}
                    orderStatus={order.status}
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                />
            )}
            <Footer />
        </>
    );
}
