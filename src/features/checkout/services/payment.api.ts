import { apiClient } from "@/shared/lib/apiClient";
import type { InitiatePaymentResponse, TransactionResponse } from "../types";

interface ApiEnvelope<T> {
    statusCode: number;
    message: string;
    data: T | null;
}

export interface InitiatePaymentPayload {
    appOrderId?: string;
    /** Optional — omitted for Buy Now, where the order isn't tied to the user's cart. */
    cartId?: string;
    addressId?: string;
    deliveryMethod?: "EXPRESS" | "REGULAR";
    shippingFee?: number;
    methodType: "CARD" | "TABBY" | "TAMARA";
    amount: number;
    currency: string;
    customerId: string;
    customerEmail: string;
    customerPhone?: string;
    billingName: string;
    billingStreet?: string;
    billingBuilding?: string;
    billingFloor?: string;
    billingApartment?: string;
    billingCity?: string;
    billingState?: string;
    billingCountry?: string;
    billingPostalCode?: string;
    redirectionUrl?: string;
}

export async function initiatePayment(
    payload: InitiatePaymentPayload
): Promise<InitiatePaymentResponse> {
    const { data } = await apiClient.post<ApiEnvelope<InitiatePaymentResponse>>(
        "/api/payments/initiate",
        payload
    );
    if (!data.data) throw new Error(data.message);
    return data.data;
}

/** Re-initiate payment for an existing PENDING_PAYMENT order ("pay again"). */
export async function repayOrder(
    orderId: string,
    payload: { methodType: "CARD" | "TABBY" | "TAMARA"; customerEmail?: string; redirectionUrl?: string }
): Promise<InitiatePaymentResponse> {
    const { data } = await apiClient.post<ApiEnvelope<InitiatePaymentResponse>>(
        `/api/payments/orders/${orderId}/repay`,
        payload
    );
    if (!data.data) throw new Error(data.message);
    return data.data;
}

export async function getTransaction(transactionId: string): Promise<TransactionResponse> {
    const { data } = await apiClient.get<ApiEnvelope<TransactionResponse>>(
        `/api/payments/transactions/${transactionId}`
    );
    if (!data.data) throw new Error(data.message);
    return data.data;
}

/**
 * Fallback confirmation for when the server-to-server webhook is delayed or blocked.
 * Forwards the signed Paymob redirect query params to the backend, which verifies the
 * HMAC and — if valid and paid — marks the order PAID through the same idempotent path
 * the webhook uses. Best-effort: never throws, so it can't break the return-to-site UX.
 */
export async function confirmPaymentRedirect(params: Record<string, string>): Promise<void> {
    try {
        await apiClient.post("/api/payments/confirm-redirect", params);
    } catch {
        // Swallow — the webhook remains the authoritative confirmation path.
    }
}

/** All payment attempts for an order — used to recover status when the tx id is lost. */
export async function getTransactionsByOrder(orderId: string): Promise<TransactionResponse[]> {
    const { data } = await apiClient.get<ApiEnvelope<TransactionResponse[]>>(
        `/api/payments/orders/${orderId}/transactions`
    );
    return data.data ?? [];
}
