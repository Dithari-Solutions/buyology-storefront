import type { Lang } from "@/config/pathSlugs";

export interface FavouriteItemMeta {
    id: string;
    title: string;
    price: number;
    originalPrice: number;
    discount: number;
    rating: number;
    inStock: boolean;
    category: string;
    slugs: Record<Lang, string>;
    processor?: string;
    ram?: string;
    storage?: string;
}

export interface FavouritesState {
    items: FavouriteItemMeta[];
}
