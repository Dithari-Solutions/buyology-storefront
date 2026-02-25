// ── Value Objects ─────────────────────────────────────────────────────────────

export interface CartItemVariant {
    color: string;
    storage: string;
}

// ── Domain Model ──────────────────────────────────────────────────────────────

export interface CartItemMeta {
    id: string;
    productId: string;
    title: string;
    imageUrl: string;
    variant: CartItemVariant;
    price: number;
    originalPrice: number;
    discountPercent: number;
    quantity: number;
    savedForLater: boolean;
}

// ── Promo ─────────────────────────────────────────────────────────────────────

export interface PromoState {
    code: string;
    /** Flat dollar amount saved */
    discount: number;
    applied: boolean;
    error: string | null;
}

// ── Cart State ────────────────────────────────────────────────────────────────

export interface CartState {
    items: CartItemMeta[];
    /** IDs of items the user has checked (selected for order summary) */
    selectedIds: string[];
    promo: PromoState;
    shippingFree: boolean;
    taxRate: number;
}

// ── Derived / View ────────────────────────────────────────────────────────────

export interface CartTotals {
    subtotal: number;
    promoDiscount: number;
    shipping: number;
    tax: number;
    total: number;
    selectedItemCount: number;
    selectedLineCount: number;
}
