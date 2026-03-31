import { apiClient } from "@/shared/lib/apiClient";
import type { InitiatePaymentResponse, TransactionResponse } from "../types";

interface ApiEnvelope<T> {
    statusCode: number;
    message: string;
    data: T | null;
}

export interface InitiatePaymentPayload {
    cartId: string;
    addressId?: string;
    shippingFee: number;
    methodType: "CARD" | "TABBY" | "TAMARA";
    amount: number;
    currency: string;
    customerId: string;
    customerEmail: string;
    customerPhone?: string;
    billingName: string;
    street?: string;
    building?: string;
    floor?: string;
    apartment?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    /** LOCAL_EXPRESS when all cart items are from stores within 30-min radius, otherwise INTERNATIONAL */
    deliveryMethod?: "LOCAL_EXPRESS" | "INTERNATIONAL";
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

export async function getTransaction(transactionId: string): Promise<TransactionResponse> {
    const { data } = await apiClient.get<ApiEnvelope<TransactionResponse>>(
        `/api/payments/transactions/${transactionId}`
    );
    if (!data.data) throw new Error(data.message);
    return data.data;
}
