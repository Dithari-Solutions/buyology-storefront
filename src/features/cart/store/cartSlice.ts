import { createSlice, createSelector, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type { AddToCartPayload, ApiCartItem, ApiCartResponse, CartItemMeta, CartState, CartTotals } from "../types";
import { FLAT_SHIPPING_COST, TAX_RATE, VALID_PROMO_CODES } from "../constants";
import {
    addItemToCart,
    clearCartApi,
    getCart,
    removeCartItem,
    updateCartItemQuantity,
} from "../services/cart.api";
import { getProductById, getPrimaryImage } from "@/features/product/services/productService";
import type { Lang } from "@/config/pathSlugs";

// ── Initial State ─────────────────────────────────────────────────────────────

const initialState: CartState = {
    items: [],
    selectedIds: [],
    promo: { code: "", discount: 0, applied: false, error: null },
    shippingFree: true,
    taxRate: TAX_RATE,
    cartId: null,
    loading: { cart: false, products: false },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function mergeApiItems(existing: CartItemMeta[], apiItems: ApiCartItem[]): CartItemMeta[] {
    return apiItems.map((apiItem) => {
        const match = existing.find(
            (i) => i.productId === apiItem.productId && (i.variantId ?? null) === apiItem.variantId
        );
        return {
            id: apiItem.id,
            cartItemId: apiItem.id,
            productId: apiItem.productId,
            variantId: apiItem.variantId ?? undefined,
            title: match?.title ?? apiItem.productSku,
            imageUrl: match?.imageUrl ?? "",
            variant: match?.variant ?? { color: "", storage: "" },
            price: apiItem.unitPrice,
            originalPrice: match?.originalPrice ?? apiItem.unitPrice,
            discountPercent: match?.discountPercent ?? 0,
            quantity: apiItem.quantity,
            savedForLater: false,
        };
    });
}

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const fetchCartThunk = createAsyncThunk(
    "cart/fetchCart",
    async (userId: string) => getCart(userId)
);

export interface AddToCartThunkArg {
    userId: string;
    payload: AddToCartPayload;
    displayMeta: Omit<CartItemMeta, "id" | "cartItemId" | "pending">;
    tempId: string;
}

export const addToCartThunk = createAsyncThunk(
    "cart/addToCart",
    async (arg: AddToCartThunkArg, { rejectWithValue }) => {
        try {
            const result = await addItemToCart(arg.userId, arg.payload);
            return { result, tempId: arg.tempId };
        } catch {
            return rejectWithValue({ tempId: arg.tempId });
        }
    }
);

export interface RemoveItemThunkArg {
    userId: string;
    cartItemId: string;
}

export const removeItemThunk = createAsyncThunk(
    "cart/removeItemAsync",
    async (arg: RemoveItemThunkArg) => {
        await removeCartItem(arg.userId, arg.cartItemId);
    }
);

export interface UpdateQuantityThunkArg {
    userId: string;
    cartItemId: string;
    localId: string;
    quantity: number;
    previousQuantity: number;
}

export const updateQuantityThunk = createAsyncThunk(
    "cart/updateQuantityAsync",
    async (arg: UpdateQuantityThunkArg, { rejectWithValue }) => {
        try {
            const result = await updateCartItemQuantity(arg.userId, arg.cartItemId, arg.quantity);
            return { result, localId: arg.localId, quantity: arg.quantity };
        } catch {
            return rejectWithValue({ localId: arg.localId, previousQuantity: arg.previousQuantity });
        }
    }
);

export const clearCartThunk = createAsyncThunk(
    "cart/clearCartAsync",
    async (userId: string) => {
        await clearCartApi(userId);
    }
);

export const fetchCartProductsThunk = createAsyncThunk(
    "cart/fetchCartProducts",
    async ({ productIds, lang }: { productIds: string[]; lang: Lang }) => {
        const unique = [...new Set(productIds)];
        const products = await Promise.all(unique.map((id) => getProductById(id, lang)));
        return products;
    }
);

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

    extraReducers: (builder) => {
        // ── fetchCart ──────────────────────────────────────────────────────────
        builder.addCase(fetchCartThunk.pending, (state) => {
            state.loading.cart = true;
        });

        builder.addCase(fetchCartThunk.fulfilled, (state, action) => {
            const apiCart: ApiCartResponse = action.payload;
            state.cartId = apiCart.id;
            state.items = mergeApiItems(state.items, apiCart.items);
            state.selectedIds = state.items.map((i) => i.id);
            state.loading.cart = false;
        });

        builder.addCase(fetchCartThunk.rejected, (state) => {
            state.loading.cart = false;
        });

        // ── fetchCartProducts ──────────────────────────────────────────────────
        builder.addCase(fetchCartProductsThunk.pending, (state) => {
            state.loading.products = true;
        });

        builder.addCase(fetchCartProductsThunk.fulfilled, (state, action) => {
            state.loading.products = false;
            const products = action.payload;
            state.items = state.items.map((item) => {
                const product = products.find((p) => p.id === item.productId);
                if (!product) return item;
                return {
                    ...item,
                    title: product.title,
                    imageUrl: getPrimaryImage(product.media),
                    slug: product.slug,
                    price: product.effectivePrice,
                    originalPrice: product.basePrice,
                    discountPercent: product.discountValue ?? 0,
                };
            });
        });

        builder.addCase(fetchCartProductsThunk.rejected, (state) => {
            state.loading.products = false;
        });

        // ── addToCart: optimistic add on pending ───────────────────────────────
        builder.addCase(addToCartThunk.pending, (state, action) => {
            const { displayMeta, tempId } = action.meta.arg;
            // If product already in cart, just bump quantity optimistically
            const existing = state.items.find(
                (i) => i.productId === displayMeta.productId && !i.savedForLater
            );
            if (existing) {
                existing.quantity += displayMeta.quantity;
            } else {
                state.items.push({ ...displayMeta, id: tempId, pending: true });
                state.selectedIds.push(tempId);
            }
        });

        builder.addCase(addToCartThunk.fulfilled, (state, action) => {
            const { result, tempId } = action.payload as { result: ApiCartResponse; tempId: string };
            state.cartId = result.id;
            const { payload: addPayload } = action.meta.arg as AddToCartThunkArg;
            const apiItem = result.items.find((i) => i.productId === addPayload.productId);
            if (!apiItem) return;
            const idx = state.items.findIndex((i) => i.id === tempId);
            if (idx !== -1) {
                state.items[idx] = {
                    ...state.items[idx],
                    id: apiItem.id,
                    cartItemId: apiItem.id,
                    quantity: apiItem.quantity,
                    price: apiItem.unitPrice,
                    pending: false,
                };
                const selIdx = state.selectedIds.indexOf(tempId);
                if (selIdx !== -1) state.selectedIds[selIdx] = apiItem.id;
            } else {
                // Item was merged into existing (quantity bump case) — update its cartItemId
                const existingItem = state.items.find(
                    (i) => i.productId === addPayload.productId && !i.savedForLater
                );
                if (existingItem) {
                    existingItem.cartItemId = apiItem.id;
                    existingItem.quantity = apiItem.quantity;
                    existingItem.price = apiItem.unitPrice;
                }
            }
        });

        builder.addCase(addToCartThunk.rejected, (state, action) => {
            // Revert the optimistic add for new items
            const { tempId } = action.meta.arg as AddToCartThunkArg;
            state.items = state.items.filter((i) => i.id !== tempId);
            state.selectedIds = state.selectedIds.filter((id) => id !== tempId);
        });

        // ── updateQuantity: sync from server on success, revert on failure ────
        builder.addCase(updateQuantityThunk.fulfilled, (state, action) => {
            const { result, localId, quantity } = action.payload as {
                result: ApiCartResponse | null;
                localId: string;
                quantity: number;
            };
            const stateItem = state.items.find((i) => i.id === localId);
            if (!stateItem) return;
            if (result) {
                const apiItem = result.items.find((i) => i.id === localId);
                if (apiItem) stateItem.quantity = apiItem.quantity;
            } else {
                // 200 but no body — keep the optimistic quantity
                stateItem.quantity = quantity;
            }
        });

        builder.addCase(updateQuantityThunk.rejected, (state, action) => {
            const payload = action.payload as { localId: string; previousQuantity: number } | undefined;
            if (payload) {
                const item = state.items.find((i) => i.id === payload.localId);
                if (item) item.quantity = payload.previousQuantity;
            }
        });
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

export const selectCartCount = (state: RootState) =>
    state.cart.items.filter((i) => !i.savedForLater).length;

export const selectSavedItems = (state: RootState) =>
    state.cart.items.filter((i) => i.savedForLater);

export const selectSelectedIds = (state: RootState) => state.cart.selectedIds;

export const selectPromo = (state: RootState) => state.cart.promo;

export const selectCartLoading = (state: RootState) => state.cart.loading;

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
