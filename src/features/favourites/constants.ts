export const FAVOURITE_CATEGORIES = [
    "all",
    "laptops",
    "smartphones",
    "refurbished",
    "gaming",
    "tablets",
] as const;

export type FavouriteCategory = (typeof FAVOURITE_CATEGORIES)[number];
