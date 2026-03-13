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
