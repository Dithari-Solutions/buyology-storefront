import type { Lang } from "@/config/pathSlugs";

export interface FavouriteItemMeta {
    id: string;
    title: string;
    description?: string;
    price: number;
    originalPrice: number;
    discount: number;
    currency?: string;
    rating: number;
    inStock: boolean;
    category: string;
    categoryName?: string;
    slugs: Record<Lang, string>;
    imageUrl?: string;
    processor?: string;
    ram?: string;
    storage?: string;
    // Fields the shop ProductCard uses (add-to-cart + badges).
    storeId?: string;
    storeOptions?: Array<{ storeId: string; storePrice: number; currency: string; expressDelivery: boolean | null }> | null;
    expressDelivery?: boolean | null;
    availabilityStatus?: string;
    stockQuantity?: number | null;
    isSuperDeal?: boolean;
    availableInSelectedCountry?: boolean | null;
}

export interface FavouritesState {
    items: FavouriteItemMeta[];
    loading: boolean;
}
