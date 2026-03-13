import { apiClient } from "@/shared/lib/apiClient";
import type { AddToCartPayload, ApiCartResponse } from "../types";

interface ApiEnvelope<T> {
    status: number;
    message: string;
    data: T | null;
}

export async function getCart(userId: string): Promise<ApiCartResponse> {
    const { data } = await apiClient.get<ApiEnvelope<ApiCartResponse>>(`/api/cart/${userId}`);
    if (!data.data) throw new Error(data.message);
    return data.data;
}

export async function addItemToCart(userId: string, payload: AddToCartPayload): Promise<ApiCartResponse> {
    const { data } = await apiClient.post<ApiEnvelope<ApiCartResponse>>(
        `/api/cart/${userId}/items`,
        payload
    );
    if (!data.data) throw new Error(data.message);
    return data.data;
}

export async function updateCartItemQuantity(
    userId: string,
    cartItemId: string,
    quantity: number
): Promise<ApiCartResponse> {
    const { data } = await apiClient.patch<ApiEnvelope<ApiCartResponse>>(
        `/api/cart/${userId}/items/${cartItemId}`,
        { quantity }
    );
    if (!data.data) throw new Error(data.message);
    return data.data;
}

export async function removeCartItem(userId: string, cartItemId: string): Promise<ApiCartResponse> {
    const { data } = await apiClient.delete<ApiEnvelope<ApiCartResponse>>(
        `/api/cart/${userId}/items/${cartItemId}`
    );
    if (!data.data) throw new Error(data.message);
    return data.data;
}

export async function clearCartApi(userId: string): Promise<void> {
    await apiClient.delete(`/api/cart/${userId}`);
}

export async function checkoutCart(userId: string): Promise<ApiCartResponse> {
    const { data } = await apiClient.post<ApiEnvelope<ApiCartResponse>>(
        `/api/cart/${userId}/checkout`
    );
    if (!data.data) throw new Error(data.message);
    return data.data;
}
