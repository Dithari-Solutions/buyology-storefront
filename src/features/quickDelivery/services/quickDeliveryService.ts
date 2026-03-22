import { apiClient } from "@/shared/lib/apiClient";
import type { ApiProduct } from "@/features/product/services/productService";
import type { Lang } from "@/config/pathSlugs";

export async function getQuickDeliveryProducts(
    lat: number,
    lng: number,
    lang: Lang = "en"
): Promise<ApiProduct[]> {
    const { data } = await apiClient.get<{ data: ApiProduct[] }>("/api/product/quick-delivery", {
        params: { lat, lng, lang },
    });
    return data.data;
}
