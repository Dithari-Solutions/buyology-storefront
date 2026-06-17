"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { listMyRefunds } from "../services/refundService";
import type { RefundRequestDetail } from "../types";
import { ACTIVE_REFUND_STATUSES } from "../types";
import RefundStatusBadge from "./RefundStatusBadge";
import RequestRefundModal from "./RequestRefundModal";
import ChooseReturnMethodModal from "./ChooseReturnMethodModal";

// Window length the UI assumes when deciding whether to *show* the request button.
// Backend is the source of truth and rejects late submissions; we keep this in sync.
const ASSUMED_WINDOW_DAYS = 14;

interface Props {
    orderId: string;
    orderStatus: string;
    deliveredAt: string | null;
    orderCurrency: string;
}

export default function RefundCard({ orderId, orderStatus, deliveredAt, orderCurrency }: Props) {
    const { t } = useTranslation("refund");
    const [loading, setLoading] = useState(true);
    const [refund, setRefund] = useState<RefundRequestDetail | null>(null);
    const [showRequest, setShowRequest] = useState(false);
    const [showMethod, setShowMethod] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        listMyRefunds(0, 50)
            .then((page) => {
                if (cancelled) return;
                // Find the most recent active refund for this order. If none active,
                // surface the most recent terminal one so the user sees their history.
                const forOrder = page.content
                    .filter((r) => r.orderId === orderId)
                    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
                const active = forOrder.find((r) => ACTIVE_REFUND_STATUSES.includes(r.status));
                setRefund(active ?? forOrder[0] ?? null);
            })
            .catch(() => {
                /* fail silently — the card just won't show */
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [orderId, reloadKey]);

    const isWithinWindow = (() => {
        if (!deliveredAt) return false;
        const deliveredMs = new Date(deliveredAt).getTime();
        if (Number.isNaN(deliveredMs)) return false;
        const cutoff = deliveredMs + ASSUMED_WINDOW_DAYS * 24 * 60 * 60 * 1000;
        return Date.now() <= cutoff;
    })();

    const hasActive = refund != null && ACTIVE_REFUND_STATUSES.includes(refund.status);
    const showRequestButton =
        !loading && !hasActive && orderStatus === "DELIVERED" && isWithinWindow;

    if (loading) return null; // Keep the surrounding layout stable.
    if (!showRequestButton && !refund) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {refund ? <ActiveRefundView refund={refund} onChooseMethod={() => setShowMethod(true)} /> : null}

            {showRequestButton && (
                <button
                    onClick={() => setShowRequest(true)}
                    className="w-full rounded-lg bg-[#402F75] py-2.5 text-sm font-semibold text-white hover:bg-[#332561]"
                >
                    {t("button.request")}
                </button>
            )}

            {showRequest && (
                <RequestRefundModal
                    orderId={orderId}
                    onClose={() => setShowRequest(false)}
                    onSubmitted={() => setReloadKey((k) => k + 1)}
                />
            )}

            {showMethod && refund && (
                <ChooseReturnMethodModal
                    refundId={refund.id}
                    orderCurrency={orderCurrency}
                    onClose={() => setShowMethod(false)}
                    onChosen={() => setReloadKey((k) => k + 1)}
                />
            )}
        </div>
    );
}

function ActiveRefundView({
    refund,
    onChooseMethod,
}: {
    refund: RefundRequestDetail;
    onChooseMethod: () => void;
}) {
    const { t } = useTranslation("refund");
    // APPROVED: first choice. COURIER_FEE_PENDING: the courier fee payment was not
    // completed — let the customer retry it (or switch to drop-off).
    const canChooseMethod = refund.status === "APPROVED" || refund.status === "COURIER_FEE_PENDING";
    const isFeePending = refund.status === "COURIER_FEE_PENDING";

    return (
        <div>
            <div className="mb-3 flex items-center justify-between gap-3 flex-wrap">
                <h2 className="text-[15px] font-bold text-gray-900">{t("summary.title")}</h2>
                <RefundStatusBadge status={refund.status} />
            </div>
            <p className="text-[13px] text-gray-500">
                {t("summary.requestId")}:{" "}
                <span className="font-mono text-gray-700">{refund.id.slice(0, 8)}…</span>
            </p>
            <p className="text-[13px] text-gray-500">
                {t("summary.amount")}: {refund.refundAmount.toFixed(2)} {refund.refundCurrency}
            </p>
            {refund.returnMethod && (
                <p className="text-[13px] text-gray-500">
                    {t("summary.method")}: {t(`method.${refund.returnMethod === "STORE_DROPOFF" ? "dropoff" : "courier"}.title`)}
                </p>
            )}
            {refund.rejectionReason && (
                <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">
                    {refund.rejectionReason}
                </p>
            )}

            {isFeePending && (
                <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-[13px] text-amber-800">
                    {t("method.feePending", { defaultValue: "Your courier pickup fee payment is still pending. Complete it below to schedule your return pickup." })}
                </p>
            )}

            {canChooseMethod && (
                <button
                    onClick={onChooseMethod}
                    className="mt-3 w-full rounded-lg bg-[#402F75] py-2.5 text-sm font-semibold text-white hover:bg-[#332561]"
                >
                    {isFeePending
                        ? t("button.payCourierFee", { defaultValue: "Pay courier pickup fee" })
                        : t("button.chooseMethod")}
                </button>
            )}
        </div>
    );
}
