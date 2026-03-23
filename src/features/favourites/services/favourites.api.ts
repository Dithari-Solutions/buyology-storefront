import { apiClient } from "@/shared/lib/apiClient";

interface ApiEnvelope<T> {
    statusCode: number;
    message: string;
    data: T | null;
}

export interface ApiFavoriteItem {
    id: string;
    productId: string;
    productSku: string;
    savedAt: string;
}

export interface ApiFavoriteList {
    authCredentialId: string;
    total: number;
    items: ApiFavoriteItem[];
}

export async function getFavourites(authCredentialId: string): Promise<ApiFavoriteList> {
    const { data } = await apiClient.get<ApiEnvelope<ApiFavoriteList>>(
        `/api/favorites/${authCredentialId}`
    );
    if (!data.data) throw new Error(data.message);
    return data.data;
}

export async function addFavourite(
    authCredentialId: string,
    productId: string
): Promise<ApiFavoriteItem> {
    const { data } = await apiClient.post<ApiEnvelope<ApiFavoriteItem>>(
        `/api/favorites/${authCredentialId}/products/${productId}`
    );
    if (!data.data) throw new Error(data.message);
    return data.data;
}

export async function removeFavourite(
    authCredentialId: string,
    productId: string
): Promise<void> {
    await apiClient.delete(`/api/favorites/${authCredentialId}/products/${productId}`);
}
