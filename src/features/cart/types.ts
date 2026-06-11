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
    /** UUID of the store this item was priced from */
    storeId?: string;
    title: string;
    /** Short product description shown under the title, truncated in UI */
    description?: string;
    imageUrl: string;
    /** Product slug for linking to the product detail page */
    slug?: string;
    variant: CartItemVariant;
    /** Full selected specs from the cart API (groupName + value + unit + color). */
    selectedSpecs?: ApiSpecSelection[];
    price: number;
    originalPrice: number;
    discountPercent: number;
    quantity: number;
    savedForLater: boolean;
    /** true = store is within ~30-min delivery radius of the user */
    quickDelivery?: boolean;
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
    message: string | null;
}

// ── Cart State ────────────────────────────────────────────────────────────────

export interface CartState {
    items: CartItemMeta[];
    /** IDs of items the user has checked (selected for order summary) */
    selectedIds: string[];
    promo: PromoState;
    /** Delivery fee returned by the backend — 0 until cart is loaded */
    shippingFee: number;
    /** Free-shipping threshold in the cart's display currency (subtotal ≥ this ⇒ delivery free) */
    freeShippingThreshold: number | null;
    /** True when the cart subtotal qualifies for free shipping */
    qualifiesForFreeShipping: boolean;
    /** API cart UUID */
    cartId: string | null;
    /** ISO 3166-1 alpha-3 — null until first item is added */
    countryCode: string | null;
    /** ISO 4217 currency code — null until first item is added */
    currency: string | null;
    loading: { cart: boolean; products: boolean; promo: boolean };
}

// ── Derived / View ────────────────────────────────────────────────────────────

export interface CartTotals {
    subtotal: number;
    promoDiscount: number;
    shipping: number;
    total: number;
    selectedItemCount: number;
    selectedLineCount: number;
}

// ── API Types ─────────────────────────────────────────────────────────────────

export interface AddToCartPayload {
    /** Required — the store the product is purchased from; determines price and country */
    storeId: string;
    productId: string;
    variantId?: string;
    specOptionIds?: string[];
    quantity?: number;
}

export interface ApiSpecSelection {
    specOptionId: string;
    groupCode: string;
    /** Human-readable group label (e.g. "RAM") from the backend. */
    groupName?: string | null;
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
    /** The store this item was priced from */
    storeId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    /** Pre-discount unit/total price for strike-through display. Null when not discounted. */
    originalUnitPrice?: number | null;
    originalTotalPrice?: number | null;
    /** true = store is within ~30-min delivery radius of the user */
    quickDelivery: boolean;
    selectedSpecs: ApiSpecSelection[];
    createdAt: string;
    updatedAt: string;
}

export interface ApiCartResponse {
    id: string;
    authCredentialId: string;
    status: "ACTIVE" | "CHECKED_OUT" | "ABANDONED";
    totalPrice: number;
    /** Delivery fee computed by the backend — always display this value, never hardcode */
    shippingFee: number | null;
    /** Backend-converted free-shipping threshold in the cart currency */
    freeShippingThreshold?: number | null;
    /** Backend-converted current delivery fee in the cart currency (0 if cart qualifies) */
    deliveryFee?: number | null;
    /** True when the cart subtotal qualifies for free shipping */
    qualifiesForFreeShipping?: boolean | null;
    /** ISO 3166-1 alpha-3 — null until first item is added */
    countryCode: string | null;
    /** ISO 4217 currency code — null until first item is added */
    currency: string | null;
    createdAt: string;
    updatedAt: string;
    items: ApiCartItem[];
}
