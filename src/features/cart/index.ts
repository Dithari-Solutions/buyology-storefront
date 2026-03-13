// ── Public API for the cart feature ──────────────────────────────────────────

export { default as CartPage } from "./components/CartPage";
export { default as CartItems } from "./components/CartItems";
export { default as CartItem } from "./components/CartItem";
export { default as OrderSummary } from "./components/OrderSummary";

export {
    addItem,
    removeItem,
    updateQuantity,
    toggleSelectItem,
    saveForLater,
    moveToCart,
    clearCart,
    applyPromo,
    removePromo,
    selectCartItems,
    selectSavedItems,
    selectSelectedIds,
    selectPromo,
    selectCartTotals,
    fetchCartThunk,
    fetchCartProductsThunk,
    addToCartThunk,
    removeItemThunk,
    updateQuantityThunk,
    clearCartThunk,
} from "./store/cartSlice";

export type { CartItemMeta, CartItemVariant, CartState, CartTotals, PromoState, AddToCartPayload, ApiCartResponse } from "./types";
