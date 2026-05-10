export type RefundRequestStatus =
    | "PENDING_REVIEW"
    | "APPROVED"
    | "DROPOFF_SELECTED"
    | "COURIER_REQUESTED"
    | "RECEIVED"
    | "REJECTED"
    | "PAID"
    | "FAILED";

export type RefundReturnMethod = "STORE_DROPOFF" | "COURIER_PICKUP";

export interface RefundRequestDetail {
    id: string;
    orderId: string;
    userId: string;
    description: string;
    imageUrls: string[];
    status: RefundRequestStatus;
    returnMethod: RefundReturnMethod | null;
    courierFeeAmount: number | null;
    courierFeeCurrency: string | null;
    refundAmount: number;
    refundCurrency: string;
    adminNote: string | null;
    rejectionReason: string | null;
    createdAt: string;
    approvedAt: string | null;
    receivedAt: string | null;
    paidAt: string | null;
}

export interface SpringPage<T> {
    content: T[];
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}

// Active here means: not yet terminated by REJECTED or FAILED. Used for "do we
// already have an open request for this order?" gating.
export const ACTIVE_REFUND_STATUSES: RefundRequestStatus[] = [
    "PENDING_REVIEW",
    "APPROVED",
    "DROPOFF_SELECTED",
    "COURIER_REQUESTED",
    "RECEIVED",
    "PAID",
];
