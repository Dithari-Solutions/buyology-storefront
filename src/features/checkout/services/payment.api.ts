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
    /** Store pickup: the chosen store the customer collects from (deliveryMethod === "PICKUP"). */
    pickupStoreId?: string;
    deliveryMethod?: "EXPRESS" | "REGULAR" | "PICKUP";
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
 * the webhook uses, then returns the resolved transaction (status + appOrderId). That
 * lets the callback show the result and route to the order WITHOUT a session token or
 * an orderId in the URL. Best-effort: returns null (never throws) on any failure, so
 * the caller falls back to session/orderId polling.
 */
export async function confirmPaymentRedirect(
    params: Record<string, string>
): Promise<TransactionResponse | null> {
    try {
        const { data } = await apiClient.post<ApiEnvelope<TransactionResponse | null>>(
            "/api/payments/confirm-redirect",
            params
        );
        return data.data ?? null;
    } catch {
        // Swallow — the webhook remains the authoritative confirmation path.
        return null;
    }
}

/** All payment attempts for an order — used to recover status when the tx id is lost. */
export async function getTransactionsByOrder(orderId: string): Promise<TransactionResponse[]> {
    const { data } = await apiClient.get<ApiEnvelope<TransactionResponse[]>>(
        `/api/payments/orders/${orderId}/transactions`
    );
    return data.data ?? [];
}
