import { apiClient } from "@/shared/lib/apiClient";
import type { ApiProduct } from "@/features/product/services/productService";
import type { Lang } from "@/config/pathSlugs";

export async function getQuickDeliveryProducts(
    lat: number,
    lng: number,
    lang: Lang = "en",
    countryCode?: string | null,
    currency?: string | null
): Promise<ApiProduct[]> {
    // countryCode/currency scope the store pricing — without them the backend returns
    // products with no storeId/storePrice (price shows 0 and add-to-cart has no storeId).
    const { data } = await apiClient.get<{ data: ApiProduct[] }>("/api/product/quick-delivery", {
        params: {
            lat,
            lng,
            lang,
            ...(countryCode ? { countryCode } : {}),
            ...(currency ? { currency } : {}),
        },
    });
    return data.data;
}
