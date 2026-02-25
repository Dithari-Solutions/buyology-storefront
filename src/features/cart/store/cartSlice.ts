import { createSlice, createSelector, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type { CartItemMeta, CartState, CartTotals } from "../types";
import { FLAT_SHIPPING_COST, MOCK_CART_ITEMS, TAX_RATE, VALID_PROMO_CODES } from "../constants";

// ── Initial State ─────────────────────────────────────────────────────────────

const initialState: CartState = {
    items: MOCK_CART_ITEMS,
    selectedIds: ["ci-1", "ci-2"],
    promo: { code: "", discount: 0, applied: false, error: null },
    shippingFree: true,
    taxRate: TAX_RATE,
};

// ── Slice ─────────────────────────────────────────────────────────────────────

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addItem(state, action: PayloadAction<CartItemMeta>) {
            const existing = state.items.find((i) => i.id === action.payload.id);
            if (existing) {
                existing.quantity += 1;
            } else {
                state.items.push(action.payload);
                state.selectedIds.push(action.payload.id);
            }
        },

        removeItem(state, action: PayloadAction<string>) {
            state.items = state.items.filter((i) => i.id !== action.payload);
            state.selectedIds = state.selectedIds.filter((id) => id !== action.payload);
        },

        updateQuantity(state, action: PayloadAction<{ id: string; quantity: number }>) {
            const item = state.items.find((i) => i.id === action.payload.id);
            if (item && action.payload.quantity > 0) {
                item.quantity = action.payload.quantity;
            }
        },

        toggleSelectItem(state, action: PayloadAction<string>) {
            const idx = state.selectedIds.indexOf(action.payload);
            if (idx >= 0) {
                state.selectedIds.splice(idx, 1);
            } else {
                state.selectedIds.push(action.payload);
            }
        },

        saveForLater(state, action: PayloadAction<string>) {
            const item = state.items.find((i) => i.id === action.payload);
            if (item) {
                item.savedForLater = true;
                state.selectedIds = state.selectedIds.filter((id) => id !== action.payload);
            }
        },

        moveToCart(state, action: PayloadAction<string>) {
            const item = state.items.find((i) => i.id === action.payload);
            if (item) {
                item.savedForLater = false;
                if (!state.selectedIds.includes(action.payload)) {
                    state.selectedIds.push(action.payload);
                }
            }
        },

        clearCart(state) {
            state.items = state.items.filter((i) => i.savedForLater);
            state.selectedIds = [];
            state.promo = { code: "", discount: 0, applied: false, error: null };
        },

        applyPromo(state, action: PayloadAction<string>) {
            const code = action.payload.trim().toUpperCase();
            const discount = VALID_PROMO_CODES[code];
            if (discount !== undefined) {
                state.promo = { code, discount, applied: true, error: null };
            } else {
                state.promo = {
                    ...state.promo,
                    code: action.payload,
                    applied: false,
                    error: "invalid",
                };
            }
        },

        removePromo(state) {
            state.promo = { code: "", discount: 0, applied: false, error: null };
        },
    },
});

// ── Actions ───────────────────────────────────────────────────────────────────

export const {
    addItem,
    removeItem,
    updateQuantity,
    toggleSelectItem,
    saveForLater,
    moveToCart,
    clearCart,
    applyPromo,
    removePromo,
} = cartSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectCartItems = (state: RootState) =>
    state.cart.items.filter((i) => !i.savedForLater);

export const selectSavedItems = (state: RootState) =>
    state.cart.items.filter((i) => i.savedForLater);

export const selectSelectedIds = (state: RootState) => state.cart.selectedIds;

export const selectPromo = (state: RootState) => state.cart.promo;

export const selectCartTotals = createSelector(
    selectCartItems,
    selectSelectedIds,
    (state: RootState) => state.cart.promo,
    (state: RootState) => state.cart.shippingFree,
    (state: RootState) => state.cart.taxRate,
    (items, selectedIds, promo, shippingFree, taxRate): CartTotals => {
        const selectedLines = items.filter((i) => selectedIds.includes(i.id));

        const subtotal = selectedLines.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0,
        );

        const promoDiscount = promo.applied ? promo.discount : 0;
        const discountedSubtotal = Math.max(0, subtotal - promoDiscount);

        const shipping = shippingFree ? 0 : FLAT_SHIPPING_COST;
        const tax = parseFloat((discountedSubtotal * taxRate).toFixed(2));
        const total = parseFloat((discountedSubtotal + shipping + tax).toFixed(2));

        const selectedItemCount = selectedLines.reduce((acc, i) => acc + i.quantity, 0);

        return {
            subtotal,
            promoDiscount,
            shipping,
            tax,
            total,
            selectedItemCount,
            selectedLineCount: selectedLines.length,
        };
    },
);

export default cartSlice.reducer;
