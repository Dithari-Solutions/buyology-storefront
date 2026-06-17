export type RefundRequestStatus =
    | "PENDING_REVIEW"
    | "APPROVED"
    | "DROPOFF_SELECTED"
    | "COURIER_FEE_PENDING"
    | "COURIER_REQUESTED"
    | "RECEIVED"
    | "REJECTED"
    | "PAID"
    | "FAILED";

export type RefundReturnMethod = "STORE_DROPOFF" | "COURIER_PICKUP";

/** Paymob checkout session returned when the customer must pay the courier pickup fee. */
export interface CourierFeePayment {
    transactionId: string;
    methodType: string;
    amount: number;
    currency: string;
    clientSecret: string;
    checkoutUrl: string;
}

/**
 * Result of choosing a return method. For STORE_DROPOFF, `payment` is null. For
 * COURIER_PICKUP, the request enters COURIER_FEE_PENDING and `payment` carries the
 * Paymob checkout the customer must complete to pay the courier fee.
 */
export interface SetReturnMethodResult {
    refund: RefundRequestDetail;
    payment: CourierFeePayment | null;
}

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
    "COURIER_FEE_PENDING",
    "COURIER_REQUESTED",
    "RECEIVED",
    "PAID",
];
