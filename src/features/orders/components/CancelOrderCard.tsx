"use client";

import { useState } from "react";
import { cancelOrder } from "../services/orders.api";
import type { OrderDetail, OrderStatus } from "../types";

// Cancellable up to (and including) IN_COURIER — blocked once the order is on its way (IN_TRANSIT)
// or later. Mirrors the backend gate; the server is the source of truth.
const CANCELLABLE: OrderStatus[] = [
    "PENDING_PAYMENT", "PAID", "PACKAGING", "READY_FOR_PICKUP", "IN_COURIER",
    "PROCESSING", "COURIER_ASSIGNED", "PICKED_UP",
];

export default function CancelOrderCard({
    orderId,
    orderStatus,
    onCancelled,
}: {
    orderId: string;
    orderStatus: OrderStatus;
    onCancelled: (order: OrderDetail) => void;
}) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!CANCELLABLE.includes(orderStatus)) return null;

    const submit = async () => {
        setBusy(true);
        setError(null);
        try {
            const updated = await cancelOrder(orderId, reason.trim() || undefined);
            onCancelled(updated);
            setOpen(false);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Could not cancel the order.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-[15px] font-bold text-gray-900">Cancel this order</h2>
            <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">
                You can cancel until your order is on its way to you. If it was already paid, your refund is
                initiated automatically and returned to your original payment method.
            </p>

            {!open ? (
                <button
                    onClick={() => setOpen(true)}
                    className="mt-4 text-[13px] font-semibold text-red-600 border border-red-300 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
                >
                    Cancel order
                </button>
            ) : (
                <div className="mt-4 flex flex-col gap-3">
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={2}
                        placeholder="Reason for cancelling (optional)"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-700 outline-none focus:border-[#402F75] focus:ring-2 focus:ring-[#402F75]/10 transition-all"
                    />
                    {error && <p className="text-[12px] text-red-500">{error}</p>}
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={submit}
                            disabled={busy}
                            className="text-[13px] font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 px-4 py-2 rounded-lg transition-colors"
                        >
                            {busy ? "Cancelling…" : "Confirm cancellation"}
                        </button>
                        <button
                            onClick={() => setOpen(false)}
                            disabled={busy}
                            className="text-[13px] font-semibold text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors"
                        >
                            Keep order
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
