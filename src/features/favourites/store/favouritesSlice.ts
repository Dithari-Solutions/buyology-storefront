import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type { FavouriteItemMeta, FavouritesState } from "../types";
import { getFavourites, addFavourite, removeFavourite, clearFavouritesApi } from "../services/favourites.api";
import { getProductById, getPrimaryImage } from "@/features/product/services/productService";

const initialState: FavouritesState = {
    items: [],
    loading: false,
};

// ── Async thunks ────────────────────────────────────────────────────────────

/** Fetch the user's favourites list and enrich each entry with full product data. */
export const fetchFavouritesThunk = createAsyncThunk(
    "favourites/fetch",
    async (_userId: string | undefined, thunkAPI) => {
        const state = thunkAPI.getState() as RootState;
        // Fetch each product in the detected country's currency so favourites prices +
        // savings are shown in that currency (not the backend's USD default).
        const countryCode = state.country.selectedCountryCode ?? undefined;
        const currency = state.country.preferredCurrency ?? undefined;

        const list = await getFavourites();

        const settled = await Promise.allSettled(
            list.items.map((item) => getProductById(item.productId, { countryCode, currency }))
        );

        const items: FavouriteItemMeta[] = [];
        list.items.forEach((favItem, idx) => {
            const result = settled[idx];
            if (result.status !== "fulfilled") return;
            const p = result.value;

            const ramSpec = p.specs.find((s) => s.code === "ram");
            const storageSpec = p.specs.find((s) => s.code === "storage");
            const processorSpec = p.specs.find(
                (s) => s.code === "processor" || s.code === "cpu"
            );

            items.push({
                id: p.id,
                title: p.title,
                description: p.description,
                price: p.storePrice ?? p.effectivePrice ?? 0,
                // Country-scoped pre-discount price lives in `originalPrice` (same field the
                // Super Deals card uses); fall back to the current price so no-discount items
                // yield zero savings rather than a wrong value.
                originalPrice: p.originalPrice ?? p.basePrice ?? p.storePrice ?? p.effectivePrice ?? 0,
                discount: p.discountValue ?? 0,
                currency: p.currency ?? undefined,
                rating: Number(p.averageRating ?? 0),
                inStock: p.availabilityStatus === "IN_STOCK",
                category: p.categoryId,
                slugs: { en: p.slug, az: p.slug, ar: p.slug },
                imageUrl: getPrimaryImage(p.media) || undefined,
                ram: ramSpec?.options[0]
                    ? `${ramSpec.options[0].value}${ramSpec.options[0].unit ?? ""}`
                    : undefined,
                storage: storageSpec?.options[0]
                    ? `${storageSpec.options[0].value}${storageSpec.options[0].unit ?? ""}`
                    : undefined,
                processor: processorSpec?.options[0]
                    ? `${processorSpec.options[0].value}${processorSpec.options[0].unit ?? ""}`
                    : undefined,
                // Carry through what the shop ProductCard needs (add-to-cart + badges).
                storeId: p.storeId ?? p.storeOptions?.[0]?.storeId ?? undefined,
                storeOptions: p.storeOptions ?? undefined,
                expressDelivery: p.expressDelivery ?? null,
                availabilityStatus: p.availabilityStatus,
                stockQuantity: p.stockQuantity ?? null,
                isSuperDeal: p.isSuperDeal ?? false,
                availableInSelectedCountry: p.availableInSelectedCountry ?? null,
            });
        });

        return items;
    }
);

/** Add a product to favourites (optimistic — added on pending, rolled back on failure). */
export const addToFavouritesThunk = createAsyncThunk(
    "favourites/add",
    async (
        arg: { userId: string; productId: string; meta: FavouriteItemMeta },
        { rejectWithValue }
    ) => {
        try {
            await addFavourite(arg.productId);
        } catch (err: unknown) {
            // 409 = already favourited — treat as success, keep the optimistic add
            const axiosErr = err as { response?: { status?: number } };
            if (axiosErr?.response?.status !== 409) {
                return rejectWithValue(arg.productId);
            }
        }
    }
);

/** Remove a product from favourites (optimistic — removed on pending). */
export const removeFromFavouritesThunk = createAsyncThunk(
    "favourites/remove",
    async (
        arg: { userId: string; productId: string },
        { rejectWithValue }
    ) => {
        try {
            await removeFavourite(arg.productId);
        } catch {
            return rejectWithValue(arg.productId);
        }
    }
);

export const clearAllFavouritesThunk = createAsyncThunk(
    "favourites/clearAll",
    async (_arg, { rejectWithValue }) => {
        try {
            await clearFavouritesApi();
        } catch {
            return rejectWithValue(null);
        }
    }
);

// ── Slice ────────────────────────────────────────────────────────────────────

const favouritesSlice = createSlice({
    name: "favourites",
    initialState,
    reducers: {
        clearFavourites(state) {
            state.items = [];
        },
    },
    extraReducers: (builder) => {
        // fetchFavouritesThunk
        builder
            .addCase(fetchFavouritesThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchFavouritesThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchFavouritesThunk.rejected, (state) => {
                state.loading = false;
            });

        // addToFavouritesThunk — optimistic add on pending, rollback on rejected
        builder
            .addCase(addToFavouritesThunk.pending, (state, action) => {
                const { productId, meta } = action.meta.arg;
                if (!state.items.some((i) => i.id === productId)) {
                    state.items.push(meta);
                }
            })
            .addCase(addToFavouritesThunk.rejected, (state, action) => {
                const productId = action.meta.arg.productId;
                state.items = state.items.filter((i) => i.id !== productId);
            });

        // removeFromFavouritesThunk — optimistic remove on pending
        builder.addCase(removeFromFavouritesThunk.pending, (state, action) => {
            state.items = state.items.filter((i) => i.id !== action.meta.arg.productId);
        });

        // clearAllFavouritesThunk — optimistic clear on pending
        builder.addCase(clearAllFavouritesThunk.pending, (state) => {
            state.items = [];
        });
    },
});

export const { clearFavourites } = favouritesSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectFavouriteItems = (state: RootState) => state.favourites.items;
export const selectFavouritesLoading = (state: RootState) => state.favourites.loading;

export const selectFavouriteIds = (state: RootState) =>
    state.favourites.items.map((i) => i.id);

export const selectIsFavourite = (id: string) => (state: RootState) =>
    state.favourites.items.some((i) => i.id === id);

export default favouritesSlice.reducer;
