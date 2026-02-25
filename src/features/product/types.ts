import type { Lang } from "@/config/pathSlugs";

// ── Value Objects ─────────────────────────────────────────────────────────────

export interface ProductColor {
    label: string;
    value: string;
}

export interface ProductStorage {
    label: string;
    value: string;
}

export type SpecIconKey = "processor" | "display" | "ram" | "battery" | "gpu" | "connectivity";

export interface ProductSpec {
    label: string;
    value: string;
    iconKey: SpecIconKey;
}

// ── Review ────────────────────────────────────────────────────────────────────

export interface ReviewReply {
    id: string;
    author: string;
    content: string;
    timeAgo: string;
    likes: number;
}

export interface Review {
    id: string;
    author: string;
    content: string;
    timeAgo: string;
    likes: number;
    imageUrl?: string;
    replies?: ReviewReply[];
}

// ── Domain Model ──────────────────────────────────────────────────────────────

export interface Product {
    id: string;
    /** Language-specific URL slugs, e.g. { en: "macbook-pro-14", az: "macbook-pro-14", ar: "macbook-pro-14" } */
    slugs: Record<Lang, string>;
    title: string;
    rating: number;
    reviewCount: number;
    inStock: boolean;
    stockCount: number;
    price: number;
    originalPrice: number;
    discountPercent: number;
    description: string;
    colors: ProductColor[];
    storageOptions: ProductStorage[];
    specs: ProductSpec[];
    keyFeatures: string[];
}
