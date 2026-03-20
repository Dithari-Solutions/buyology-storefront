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

export type PaymentMethod = "card" | "tabby" | "tamara" | "paymob";

export type CheckoutStep = "shipping" | "payment";
