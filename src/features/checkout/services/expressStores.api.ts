import { apiClient } from "@/shared/lib/apiClient";

interface ApiEnvelope<T> {
    statusCode: number;
    message: string;
    data: T | null;
}

interface ExpressStoresResponse {
    radiusKm: number;
    storeIds: string[];
}

/**
 * The store-id set the ORDER uses to decide EXPRESS vs REGULAR, for the DELIVERY ADDRESS's
 * coordinates. Asking about the device's location instead is how express was offered on carts the
 * backend then silently downgraded.
 */
export async function getExpressStoreIds(lat: number, lng: number): Promise<string[]> {
    const { data } = await apiClient.get<ApiEnvelope<ExpressStoresResponse>>(
        `/api/stores/express-stores?lat=${lat}&lng=${lng}`
    );
    if (!data.data) throw new Error(data.message);
    return data.data.storeIds;
}
