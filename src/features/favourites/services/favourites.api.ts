import { apiClient } from "@/shared/lib/apiClient";
import { getCredentialIdFromAccessToken } from "@/shared/lib/tokenManager";

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

/**
 * Favourites are keyed by auth_credentials.id (the JWT `sub`), NOT users.id. Read it
 * from the token so callers can never pass the wrong id (Redux `userId` holds
 * `uid`/users.id and would 404 with "Auth credential not found").
 */
function credentialId(): string {
    const id = getCredentialIdFromAccessToken();
    if (!id) throw new Error("Not authenticated");
    return id;
}

export async function getFavourites(): Promise<ApiFavoriteList> {
    const { data } = await apiClient.get<ApiEnvelope<ApiFavoriteList>>(
        `/api/favorites/${credentialId()}`
    );
    if (!data.data) throw new Error(data.message);
    return data.data;
}

export async function addFavourite(productId: string): Promise<ApiFavoriteItem> {
    const { data } = await apiClient.post<ApiEnvelope<ApiFavoriteItem>>(
        `/api/favorites/${credentialId()}/products/${productId}`
    );
    if (!data.data) throw new Error(data.message);
    return data.data;
}

export async function removeFavourite(productId: string): Promise<void> {
    await apiClient.delete(`/api/favorites/${credentialId()}/products/${productId}`);
}
