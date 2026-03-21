export interface ShippingFormData {
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    streetAddress: string;
    apartment: string;
    country: string;
    city: string;
    postalCode: string;
    saveInfo: boolean;
}

export type PaymentMethod = "card" | "tabby" | "tamara";

export type CheckoutStep = "shipping" | "payment";

export type PaymentStatus =
    | "PENDING"
    | "PROCESSING"
    | "SUCCESS"
    | "FAILED"
    | "CANCELLED"
    | "REFUNDED"
    | "PARTIALLY_REFUNDED";

export interface InitiatePaymentResponse {
    transactionId: string;
    methodType: "CARD" | "TABBY" | "TAMARA";
    amount: number;
    currency: string;
    clientSecret: string;
    checkoutUrl: string;
}

export interface TransactionResponse {
    id: string;
    appOrderId: string;
    methodType: "CARD" | "TABBY" | "TAMARA";
    amount: number;
    amountCents: number;
    currency: string;
    status: PaymentStatus;
    providerTransactionId: string | null;
    failureReason: string | null;
    failureCode: string | null;
    createdAt: string;
    updatedAt: string;
}
