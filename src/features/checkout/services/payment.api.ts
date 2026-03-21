import { apiClient } from "@/shared/lib/apiClient";
import type { InitiatePaymentResponse, TransactionResponse } from "../types";

interface ApiEnvelope<T> {
    statusCode: number;
    message: string;
    data: T | null;
}

export interface InitiatePaymentPayload {
    appOrderId: string;
    methodType: "CARD" | "TABBY" | "TAMARA";
    amount: number;
    currency: string;
    customerId: string;
    customerEmail: string;
    customerPhone?: string;
    billingName: string;
    billingApartment?: string;
    billingFloor?: string;
    billingStreet?: string;
    billingBuilding?: string;
    billingCity?: string;
    billingCountry?: string;
    billingState?: string;
    billingPostalCode?: string;
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
