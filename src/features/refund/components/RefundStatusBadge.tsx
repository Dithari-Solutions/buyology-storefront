"use client";

import { useTranslation } from "react-i18next";
import type { RefundRequestStatus } from "../types";

const STATUS_COLORS: Record<RefundRequestStatus, string> = {
    PENDING_REVIEW: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-blue-100 text-blue-800",
    DROPOFF_SELECTED: "bg-blue-100 text-blue-800",
    COURIER_FEE_PENDING: "bg-amber-100 text-amber-800",
    COURIER_REQUESTED: "bg-blue-100 text-blue-800",
    RECEIVED: "bg-blue-100 text-blue-800",
    REJECTED: "bg-red-100 text-red-800",
    PAID: "bg-green-100 text-green-800",
    FAILED: "bg-red-100 text-red-800",
};

const I18N_KEYS: Record<RefundRequestStatus, string> = {
    PENDING_REVIEW: "status.pendingReview",
    APPROVED: "status.approved",
    DROPOFF_SELECTED: "status.dropoffSelected",
    COURIER_FEE_PENDING: "status.courierFeePending",
    COURIER_REQUESTED: "status.courierRequested",
    RECEIVED: "status.received",
    REJECTED: "status.rejected",
    PAID: "status.paid",
    FAILED: "status.failed",
};

export default function RefundStatusBadge({ status }: { status: RefundRequestStatus }) {
    const { t } = useTranslation("refund");
    return (
        <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold ${STATUS_COLORS[status]}`}
        >
            {t(I18N_KEYS[status])}
        </span>
    );
}
