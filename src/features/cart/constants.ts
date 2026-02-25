import type { CartItemMeta } from "./types";

// ── Tax / Shipping ────────────────────────────────────────────────────────────

export const TAX_RATE = 0.08; // 8 %
export const FLAT_SHIPPING_COST = 9.99;

// ── Valid Promo Codes ─────────────────────────────────────────────────────────

/** Maps promo code (uppercase) → flat-dollar discount */
export const VALID_PROMO_CODES: Record<string, number> = {
    SAVE10: 10,
    SAVE20: 20,
    WELCOME15: 15,
};

// ── Seed / Mock Data ──────────────────────────────────────────────────────────
// Replace with real API integration once the backend is ready.

export const MOCK_CART_ITEMS: CartItemMeta[] = [
    {
        id: "ci-1",
        productId: "prod-macpro14",
        title: "MacBook Pro 14",
        imageUrl: "/locales/placeholder.png", // will be swapped for real API image URL
        variant: { color: "Space Gray", storage: "256GB" },
        price: 2499,
        originalPrice: 2799,
        discountPercent: 11,
        quantity: 1,
        savedForLater: false,
    },
    {
        id: "ci-2",
        productId: "prod-macpro14",
        title: "MacBook Pro 14",
        imageUrl: "/locales/placeholder.png",
        variant: { color: "Space Gray", storage: "256GB" },
        price: 2499,
        originalPrice: 2799,
        discountPercent: 11,
        quantity: 1,
        savedForLater: false,
    },
    {
        id: "ci-3",
        productId: "prod-macpro14",
        title: "MacBook Pro 14",
        imageUrl: "/locales/placeholder.png",
        variant: { color: "Space Gray", storage: "256GB" },
        price: 2499,
        originalPrice: 2799,
        discountPercent: 11,
        quantity: 1,
        savedForLater: true,
    },
];
