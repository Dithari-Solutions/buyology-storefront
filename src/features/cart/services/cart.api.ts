import axios from "axios";
import { apiClient } from "@/shared/lib/apiClient";
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

export async function getCart(
    authCredentialId: string,
    coords?: { lat: number; lng: number }
): Promise<ApiCartResponse> {
    const params = coords ? `?lat=${coords.lat}&lng=${coords.lng}` : "";
    const { data } = await apiClient.get<ApiEnvelope<ApiCartResponse>>(
        `/api/cart/${authCredentialId}${params}`
    );
    if (!data.data) throw new Error(data.message);
    return data.data;
}

export async function addItemToCart(authCredentialId: string, payload: AddToCartPayload): Promise<ApiCartResponse> {
    try {
        const { data } = await apiClient.post<ApiEnvelope<ApiCartResponse>>(
            `/api/cart/${authCredentialId}/items`,
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
    authCredentialId: string,
    cartItemId: string,
    quantity: number
): Promise<ApiCartResponse | null> {
    const { data } = await apiClient.patch<ApiEnvelope<ApiCartResponse>>(
        `/api/cart/${authCredentialId}/items/${cartItemId}`,
        { quantity }
    );
    return data?.data ?? null;
}

export async function removeCartItem(authCredentialId: string, cartItemId: string): Promise<ApiCartResponse> {
    const { data } = await apiClient.delete<ApiEnvelope<ApiCartResponse>>(
        `/api/cart/${authCredentialId}/items/${cartItemId}`
    );
    if (!data.data) throw new Error(data.message);
    return data.data;
}

export async function clearCartApi(authCredentialId: string): Promise<void> {
    await apiClient.delete(`/api/cart/${authCredentialId}`);
}

export async function checkoutCart(authCredentialId: string): Promise<ApiCartResponse> {
    const { data } = await apiClient.post<ApiEnvelope<ApiCartResponse>>(
        `/api/cart/${authCredentialId}/checkout`
    );
    if (!data.data) throw new Error(data.message);
    return data.data;
}
