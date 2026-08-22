import { createSlice, createSelector, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type { AddToCartPayload, ApiCartItem, ApiCartResponse, CartItemMeta, CartState, CartTotals } from "../types";
import { VALID_PROMO_CODES } from "../constants";
import {
    addItemToCart,
    clearCartApi,
    getCart,
    removeCartItem,
    updateCartItemQuantity,
    CountryRestrictionError,
    validatePromoCode,
    type ValidatePromoCodeRequest,
    setCartItemSelection,
} from "../services/cart.api";
import { getProductById, getPrimaryImage } from "@/features/product/services/productService";
import { promoBasisSignature } from "./promoBasis";
import type { Lang } from "@/config/pathSlugs";

// ── Initial State ─────────────────────────────────────────────────────────────

const EMPTY_PROMO = {
    code: "", discount: 0, applied: false, error: null, message: null,
    status: "none" as const, revalidating: false, validatedFor: null,
    invalidReason: null, lostDiscount: 0,
};

const initialState: CartState = {
    items: [],
    promo: { ...EMPTY_PROMO },
    shippingFee: 0,
    freeShippingThreshold: null,
    qualifiesForFreeShipping: false,
    expressAvailable: false,
    expressDeliveryFee: null,
    cartId: null,
    countryCode: null,
    currency: null,
    loading: { cart: false, products: false, promo: false },
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
            storeId: apiItem.storeId,
            title: match?.title ?? apiItem.productSku,
            imageUrl: match?.imageUrl ?? "",
            variant: match?.variant ?? { color: "", storage: "" },
            selectedSpecs: apiItem.selectedSpecs ?? [],
            price: apiItem.unitPrice,
            // Prefer the backend's pre-discount price; fall back to any existing meta.
            originalPrice: apiItem.originalUnitPrice ?? match?.originalPrice ?? apiItem.unitPrice,
            discountPercent: apiItem.originalUnitPrice && apiItem.originalUnitPrice > apiItem.unitPrice
                ? Math.round(((apiItem.originalUnitPrice - apiItem.unitPrice) / apiItem.originalUnitPrice) * 100)
                : (match?.discountPercent ?? 0),
            quantity: apiItem.quantity,
            quickDelivery: apiItem.quickDelivery,
            savedForLater: match?.savedForLater ?? false,
            // The server's word, not local memory: the backend orders exactly the selected lines.
            selected: apiItem.selected ?? true,
        };
    });
}

// ── Async Thunks ──────────────────────────────────────────────────────────────

export interface FetchCartThunkArg {
    /** @deprecated unused — the cart id is read from the access token */
    authCredentialId?: string;
    coords?: { lat: number; lng: number };
}

export const fetchCartThunk = createAsyncThunk(
    "cart/fetchCart",
    async ({ coords }: FetchCartThunkArg) => getCart(coords)
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
            const result = await addItemToCart(arg.payload);
            return { result, tempId: arg.tempId };
        } catch (err) {
            if (err instanceof CountryRestrictionError) {
                return rejectWithValue({ tempId: arg.tempId, message: "COUNTRY_RESTRICTION" });
            }
            const message = err instanceof Error ? err.message : "Failed to add item to cart";
            return rejectWithValue({ tempId: arg.tempId, message });
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
        await removeCartItem(arg.cartItemId);
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
            const result = await updateCartItemQuantity(arg.cartItemId, arg.quantity);
            return { result, localId: arg.localId, quantity: arg.quantity };
        } catch {
            return rejectWithValue({ localId: arg.localId, previousQuantity: arg.previousQuantity, quantity: arg.quantity });
        }
    }
);

export const clearCartThunk = createAsyncThunk(
    "cart/clearCartAsync",
    async (_userId?: string) => {
        await clearCartApi();
    }
);

export const fetchCartProductsThunk = createAsyncThunk(
    "cart/fetchCartProducts",
    async ({ productIds, lang }: { productIds: string[]; lang: Lang }, { getState }) => {
        const state = getState() as RootState;
        const countryCode = state.country.selectedCountryCode;
        const currency = state.country.preferredCurrency;
        const unique = [...new Set(productIds)];
        const products = await Promise.all(
            unique.map((id) => getProductById(id, { lang, countryCode, currency }))
        );
        return products;
    }
);

/**
 * Ticks or unticks one line, server-first with an optimistic flip.
 *
 * <p>The flag decides what the backend prices, reserves and ships, so it must live there — a
 * local-only toggle is the cosmetic-checkbox bug this replaced. The fulfilled payload is the full
 * cart response, whose totalPrice is the recomputed SELECTED subtotal.
 */
export const setItemSelectionThunk = createAsyncThunk(
    "cart/setItemSelection",
    async ({ cartItemId, selected }: { cartItemId: string; selected: boolean }) =>
        setCartItemSelection(cartItemId, selected)
);

async function callValidate(state: RootState, code: string) {
    const items = state.cart.items.filter((i) => i.selected !== false && !i.savedForLater);
    const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const payload: ValidatePromoCodeRequest = {
        code,
        orderAmount: subtotal,
        productIds: items.map((i) => i.productId),
    };
    const signature = promoBasisSignature(state.cart.items, state.cart.currency);
    const result = await validatePromoCode(payload);
    return { code, result, signature };
}

export const applyPromoThunk = createAsyncThunk(
    "cart/applyPromo",
    async (code: string, { getState, rejectWithValue }) => {
        try {
            const { result, signature } = await callValidate(getState() as RootState, code);
            if (!result.valid) {
                return rejectWithValue(result.message);
            }
            return { code, result, signature };
        } catch (err) {
            return rejectWithValue(err instanceof Error ? err.message : "Failed to validate promo code");
        }
    }
);

/**
 * Re-asks the backend whether the applied code still holds, after the cart changed under it.
 *
 * <p>Without this the discount was a one-shot fact: quantities changed, the subtotal fell under
 * the code's minimum, and the customer was still quoted the discounted total — the backend then
 * silently zeroed the discount at createOrder and charged full price. A previously-valid code
 * must either stay valid or VISIBLY stop applying; the total never moves silently.
 */
export const revalidatePromoThunk = createAsyncThunk(
    "cart/revalidatePromo",
    async (_: void, { getState }) => {
        const state = getState() as RootState;
        return callValidate(state, state.cart.promo.code);
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
                state.items.push({ ...action.payload, selected: action.payload.selected ?? true });
            }
        },

        removeItem(state, action: PayloadAction<string>) {
            state.items = state.items.filter((i) => i.id !== action.payload);
        },

        updateQuantity(state, action: PayloadAction<{ id: string; quantity: number }>) {
            const item = state.items.find((i) => i.id === action.payload.id);
            if (item && action.payload.quantity > 0) {
                item.quantity = action.payload.quantity;
            }
        },

        saveForLater(state, action: PayloadAction<string>) {
            const item = state.items.find((i) => i.id === action.payload);
            if (item) {
                item.savedForLater = true;
                // Locally only — the component ALSO dispatches setItemSelectionThunk(false), which
                // is what stops the backend ordering and charging a saved-for-later row.
                item.selected = false;
            }
        },

        moveToCart(state, action: PayloadAction<string>) {
            const item = state.items.find((i) => i.id === action.payload);
            if (item) {
                item.savedForLater = false;
                item.selected = true;
            }
        },

        setShippingFee(state, action: PayloadAction<number>) {
            state.shippingFee = action.payload;
        },

        clearCart(state) {
            state.items = state.items.filter((i) => i.savedForLater);
            state.promo = { ...EMPTY_PROMO };
            state.countryCode = null;
            state.currency = null;
            state.cartId = null;
            state.shippingFee = 0;
            state.freeShippingThreshold = null;
            state.qualifiesForFreeShipping = false;
            state.expressAvailable = false;
            state.expressDeliveryFee = null;
        },

        removePromo(state) {
            state.promo = { ...EMPTY_PROMO };
        },
    },

    extraReducers: (builder) => {
        // ... (existing cases)
        builder.addCase(applyPromoThunk.pending, (state) => {
            state.loading.promo = true;
            state.promo.error = null;
            state.promo.message = null;
        });
        builder.addCase(applyPromoThunk.fulfilled, (state, action) => {
            state.loading.promo = false;
            state.promo = {
                ...EMPTY_PROMO,
                code: action.payload.code,
                discount: action.payload.result.discountAmount,
                applied: true,
                status: "applied",
                message: action.payload.result.message,
                validatedFor: action.payload.signature,
            };
        });
        builder.addCase(applyPromoThunk.rejected, (state, action) => {
            state.loading.promo = false;
            state.promo = {
                ...state.promo,
                applied: false,
                status: "error",
                error: "invalid",
                // The backend's own words, verbatim — its new "already applied to an order you
                // haven't paid for yet" message is actionable ONLY if the customer sees it.
                message: action.payload as string || "Invalid promo code",
            };
        });
        builder.addCase(revalidatePromoThunk.pending, (state) => {
            state.promo.revalidating = true;
        });
        builder.addCase(revalidatePromoThunk.fulfilled, (state, action) => {
            state.promo.revalidating = false;
            if (!state.promo.code || state.promo.code !== action.payload.code) {
                return;   // the code changed or was removed while this answer was in flight
            }
            const { result, signature } = action.payload;
            if (result.valid) {
                state.promo = {
                    ...state.promo,
                    discount: result.discountAmount,
                    applied: true,
                    status: "applied",
                    invalidReason: null,
                    lostDiscount: 0,
                    validatedFor: signature,
                };
            } else {
                // Park it visibly. The code and the reason stay on screen; only the money leaves
                // the total — which is exactly what the backend will do at createOrder.
                state.promo = {
                    ...state.promo,
                    applied: false,
                    status: "invalidated",
                    invalidReason: result.message,
                    lostDiscount: state.promo.discount,
                    validatedFor: signature,
                };
            }
        });
        builder.addCase(revalidatePromoThunk.rejected, (state) => {
            // Network says nothing about validity: keep the discount, try again on the next
            // basis change. The place-order checkpoint is the hard gate.
            state.promo.revalidating = false;
        });

        // ── fetchCart ──────────────────────────────────────────────────────────
        builder.addCase(fetchCartThunk.pending, (state) => {
            state.loading.cart = true;
        });

        builder.addCase(fetchCartThunk.fulfilled, (state, action) => {
            const apiCart: ApiCartResponse = action.payload;
            state.cartId = apiCart.id;
            state.countryCode = apiCart.countryCode;
            state.currency = apiCart.currency;
            state.shippingFee = apiCart.deliveryFee ?? apiCart.shippingFee ?? 0;
            state.freeShippingThreshold = apiCart.freeShippingThreshold ?? null;
            state.qualifiesForFreeShipping = apiCart.qualifiesForFreeShipping ?? false;
            state.expressAvailable = apiCart.expressAvailable ?? false;
            state.expressDeliveryFee = apiCart.expressDeliveryFee ?? null;
            state.items = mergeApiItems(state.items, apiCart.items);
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
                    description: product.description ?? item.description,
                    imageUrl: getPrimaryImage(product.media),
                    slug: product.slug,
                    // Prices are snapshot values from the cart API (unitPrice) — never overwrite them
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
                state.items.push({ ...displayMeta, id: tempId, pending: true, selected: true });
            }
        });

        builder.addCase(addToCartThunk.fulfilled, (state, action) => {
            const { result, tempId } = action.payload as { result: ApiCartResponse; tempId: string };
            state.cartId = result.id;
            state.countryCode = result.countryCode;
            state.currency = result.currency;
            state.shippingFee = result.deliveryFee ?? result.shippingFee ?? 0;
            state.freeShippingThreshold = result.freeShippingThreshold ?? null;
            state.qualifiesForFreeShipping = result.qualifiesForFreeShipping ?? false;
            state.expressAvailable = result.expressAvailable ?? false;
            state.expressDeliveryFee = result.expressDeliveryFee ?? null;
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
                    originalPrice: apiItem.originalUnitPrice ?? state.items[idx].originalPrice ?? apiItem.unitPrice,
                    discountPercent: apiItem.originalUnitPrice && apiItem.originalUnitPrice > apiItem.unitPrice
                        ? Math.round(((apiItem.originalUnitPrice - apiItem.unitPrice) / apiItem.originalUnitPrice) * 100)
                        : state.items[idx].discountPercent,
                    pending: false,
                };
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
            // Out-of-order / stale-response guard: if a newer click already moved the
            // quantity away from what THIS request set, ignore this response so the
            // displayed value doesn't bounce back to an older number.
            if (stateItem.quantity !== quantity) return;
            if (result) {
                const apiItem = result.items.find((i) => i.id === localId);
                if (apiItem) stateItem.quantity = apiItem.quantity;
            }
            // else: 200 with no body — the optimistic value is already correct.
        });

        builder.addCase(updateQuantityThunk.rejected, (state, action) => {
            const payload = action.payload as { localId: string; previousQuantity: number; quantity: number } | undefined;
            if (payload) {
                const item = state.items.find((i) => i.id === payload.localId);
                // Only revert if the value that failed is still the one showing — a stale
                // failure must not clobber a fresh optimistic quantity from a newer click.
                if (item && item.quantity === payload.quantity) item.quantity = payload.previousQuantity;
            }
        });

        // ── selection: optimistic flip, server response wins, revert on failure ──
        builder.addCase(setItemSelectionThunk.pending, (state, action) => {
            const { cartItemId, selected } = action.meta.arg;
            const item = state.items.find((i) => i.id === cartItemId);
            if (item) item.selected = selected;
        });
        builder.addCase(setItemSelectionThunk.fulfilled, (state, action) => {
            const apiCart: ApiCartResponse = action.payload;
            state.cartId = apiCart.id;
            state.shippingFee = apiCart.deliveryFee ?? apiCart.shippingFee ?? 0;
            state.freeShippingThreshold = apiCart.freeShippingThreshold ?? null;
            state.qualifiesForFreeShipping = apiCart.qualifiesForFreeShipping ?? false;
            state.expressAvailable = apiCart.expressAvailable ?? false;
            state.expressDeliveryFee = apiCart.expressDeliveryFee ?? null;
            state.items = mergeApiItems(state.items, apiCart.items);
        });
        builder.addCase(setItemSelectionThunk.rejected, (state, action) => {
            const { cartItemId, selected } = action.meta.arg;
            const item = state.items.find((i) => i.id === cartItemId);
            if (item) item.selected = !selected;
        });
    },
});

// ── Actions ───────────────────────────────────────────────────────────────────

export const {
    addItem,
    removeItem,
    updateQuantity,
    saveForLater,
    moveToCart,
    setShippingFee,
    clearCart,
    removePromo,
} = cartSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectCartItems = (state: RootState) =>
    state.cart.items.filter((i) => !i.savedForLater);

export const selectCartCount = (state: RootState) =>
    state.cart.items.filter((i) => !i.savedForLater).length;

export const selectSavedItems = (state: RootState) =>
    state.cart.items.filter((i) => i.savedForLater);

/**
 * Derived, not stored: selection lives on each item, mirrored from the server. Kept as a selector
 * so existing subscribers need no shape change.
 */
export const selectSelectedIds = createSelector(
    (state: RootState) => state.cart.items,
    (items) => items.filter((i) => i.selected !== false).map((i) => i.id)
);

export const selectPromo = (state: RootState) => state.cart.promo;

export const selectCartLoading = (state: RootState) => state.cart.loading;

export const selectCartCurrency = (state: RootState) => state.cart.currency;

export const selectCartCountryCode = (state: RootState) => state.cart.countryCode;

export const selectCartShippingFee = (state: RootState) => state.cart.shippingFee;

export const selectFreeShippingThreshold = (state: RootState) => state.cart.freeShippingThreshold;

export const selectQualifiesForFreeShipping = (state: RootState) => state.cart.qualifiesForFreeShipping;

/** Whether 30-minute delivery can be chosen for this cart. */
export const selectExpressAvailable = (state: RootState) => state.cart.expressAvailable;

/**
 * The 30-minute delivery fee, or null when express is unavailable.
 *
 * <p>{@link selectCartShippingFee} is always the STANDARD rate, so anything that lets the customer
 * choose express has to reach for this instead — otherwise the total on screen is not the total
 * they are charged.
 */
export const selectExpressDeliveryFee = (state: RootState) => state.cart.expressDeliveryFee;

export const selectCartTotals = createSelector(
    selectCartItems,
    (state: RootState) => state.cart.promo,
    (state: RootState) => state.cart.shippingFee,
    (items, promo, shippingFee): CartTotals => {
        const selectedLines = items.filter((i) => i.selected !== false);

        const subtotal = selectedLines.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0,
        );

        const promoDiscount = promo.status === "applied" ? promo.discount : 0;
        const discountedSubtotal = Math.max(0, subtotal - promoDiscount);

        const shipping = shippingFee;
        const total = parseFloat((discountedSubtotal + shipping).toFixed(2));

        const selectedItemCount = selectedLines.reduce((acc, i) => acc + i.quantity, 0);

        return {
            subtotal,
            promoDiscount,
            shipping,
            total,
            selectedItemCount,
            selectedLineCount: selectedLines.length,
            promoInvalidated: promo.status === "invalidated",
            promoRevalidating: promo.revalidating,
        };
    },
);

export default cartSlice.reducer;
