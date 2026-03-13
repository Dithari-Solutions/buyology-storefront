// ── Value Objects ─────────────────────────────────────────────────────────────

export interface CartItemVariant {
    color: string;
    storage: string;
}

// ── Domain Model ──────────────────────────────────────────────────────────────

export interface CartItemMeta {
    id: string;
    /** UUID returned by the cart API — used for update/remove calls */
    cartItemId?: string;
    productId: string;
    variantId?: string;
    title: string;
    imageUrl: string;
    /** Product slug for linking to the product detail page */
    slug?: string;
    variant: CartItemVariant;
    price: number;
    originalPrice: number;
    discountPercent: number;
    quantity: number;
    savedForLater: boolean;
    /** true while the add-to-cart API call is in flight */
    pending?: boolean;
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
    /** API cart UUID */
    cartId: string | null;
    loading: { cart: boolean; products: boolean };
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

// ── API Types ─────────────────────────────────────────────────────────────────

export interface AddToCartPayload {
    productId: string;
    variantId?: string;
    specOptionIds?: string[];
    quantity?: number;
}

export interface ApiSpecSelection {
    specOptionId: string;
    groupCode: string;
    value: string;
    unit: string | null;
    additionalPrice: number;
    colorCode: string | null;
}

export interface ApiCartItem {
    id: string;
    productId: string;
    productSku: string;
    variantId: string | null;
    variantSku: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    selectedSpecs: ApiSpecSelection[];
    createdAt: string;
    updatedAt: string;
}

export interface ApiCartResponse {
    id: string;
    userId: string;
    status: "ACTIVE" | "CHECKED_OUT";
    totalPrice: number;
    createdAt: string;
    updatedAt: string;
    items: ApiCartItem[];
}
