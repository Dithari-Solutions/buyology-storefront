import axios from "axios";
import { apiClient } from "@/shared/lib/apiClient";
import { getCredentialIdFromAccessToken } from "@/shared/lib/tokenManager";
import type { AddToCartPayload, ApiCartResponse } from "../types";

interface ApiEnvelope<T> {
    success: boolean;
    message: string;
    data: T | null;
}

/** Thrown when the store's country does not match the user's selectedCountryCode */
export class CountryRestrictionError extends Error {
    constructor() {
        super("COUNTRY_RESTRICTION");
        this.name = "CountryRestrictionError";
    }
}

/**
 * The cart is keyed by auth_credentials.id (the JWT `sub`), NOT users.id. We read it
 * from the token here so callers can never pass the wrong id (e.g. Redux `userId`,
 * which holds `uid`/users.id and would 400 with "Auth credential not found").
 */
function credentialId(): string {
    const id = getCredentialIdFromAccessToken();
    if (!id) throw new Error("Not authenticated");
    return id;
}

export async function getCart(
    coords?: { lat: number; lng: number }
): Promise<ApiCartResponse> {
    const params = coords ? `?lat=${coords.lat}&lng=${coords.lng}` : "";
    const { data } = await apiClient.get<ApiEnvelope<ApiCartResponse>>(
        `/api/cart/${credentialId()}${params}`
    );
    if (!data.data) throw new Error(data.message);
    return data.data;
}

export async function addItemToCart(payload: AddToCartPayload): Promise<ApiCartResponse> {
    try {
        const { data } = await apiClient.post<ApiEnvelope<ApiCartResponse>>(
            `/api/cart/${credentialId()}/items`,
            payload
        );
        if (!data.data) throw new Error(data.message);
        return data.data;
    } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 403) {
            throw new CountryRestrictionError();
        }
        throw err;
    }
}

export async function updateCartItemQuantity(
    cartItemId: string,
    quantity: number
): Promise<ApiCartResponse | null> {
    const { data } = await apiClient.patch<ApiEnvelope<ApiCartResponse>>(
        `/api/cart/${credentialId()}/items/${cartItemId}`,
        { quantity }
    );
    return data?.data ?? null;
}

export async function removeCartItem(cartItemId: string): Promise<ApiCartResponse> {
    const { data } = await apiClient.delete<ApiEnvelope<ApiCartResponse>>(
        `/api/cart/${credentialId()}/items/${cartItemId}`
    );
    if (!data.data) throw new Error(data.message);
    return data.data;
}

export async function clearCartApi(): Promise<void> {
    await apiClient.delete(`/api/cart/${credentialId()}`);
}

export async function checkoutCart(): Promise<ApiCartResponse> {
    const { data } = await apiClient.post<ApiEnvelope<ApiCartResponse>>(
        `/api/cart/${credentialId()}/checkout`
    );
    if (!data.data) throw new Error(data.message);
    return data.data;
}

export interface ValidatePromoCodeRequest {
    code: string;
    orderAmount: number;
    productIds?: string[];
}

export interface ValidatePromoCodeResponse {
    valid: boolean;
    message: string;
    promoCodeId: string;
    discountAmount: number;
    discountType: "FIXED" | "PERCENTAGE";
    discountValue: number;
}

export async function validatePromoCode(payload: ValidatePromoCodeRequest): Promise<ValidatePromoCodeResponse> {
    const { data } = await apiClient.post<ApiEnvelope<ValidatePromoCodeResponse>>(
        "/api/promo/validate",
        payload
    );
    if (!data.data) throw new Error(data.message);
    return data.data;
}
