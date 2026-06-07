import { apiClient } from "@/shared/lib/apiClient";
import type { InitiatePaymentResponse, TransactionResponse } from "../types";

interface ApiEnvelope<T> {
    statusCode: number;
    message: string;
    data: T | null;
}

export interface InitiatePaymentPayload {
    appOrderId?: string;
    cartId: string;
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

/** All payment attempts for an order — used to recover status when the tx id is lost. */
export async function getTransactionsByOrder(orderId: string): Promise<TransactionResponse[]> {
    const { data } = await apiClient.get<ApiEnvelope<TransactionResponse[]>>(
        `/api/payments/orders/${orderId}/transactions`
    );
    return data.data ?? [];
}
