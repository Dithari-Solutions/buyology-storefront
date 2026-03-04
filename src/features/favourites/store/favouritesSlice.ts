import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type { FavouriteItemMeta, FavouritesState } from "../types";

const initialState: FavouritesState = {
    items: [],
};

const favouritesSlice = createSlice({
    name: "favourites",
    initialState,
    reducers: {
        addToFavourites(state, action: PayloadAction<FavouriteItemMeta>) {
            const exists = state.items.some((i) => i.id === action.payload.id);
            if (!exists) {
                state.items.push(action.payload);
            }
        },

        removeFromFavourites(state, action: PayloadAction<string>) {
            state.items = state.items.filter((i) => i.id !== action.payload);
        },

        toggleFavourite(state, action: PayloadAction<FavouriteItemMeta>) {
            const idx = state.items.findIndex((i) => i.id === action.payload.id);
            if (idx >= 0) {
                state.items.splice(idx, 1);
            } else {
                state.items.push(action.payload);
            }
        },

        clearFavourites(state) {
            state.items = [];
        },
    },
});

export const {
    addToFavourites,
    removeFromFavourites,
    toggleFavourite,
    clearFavourites,
} = favouritesSlice.actions;

export const selectFavouriteItems = (state: RootState) => state.favourites.items;

export const selectFavouriteIds = (state: RootState) =>
    state.favourites.items.map((i) => i.id);

export const selectIsFavourite = (id: string) => (state: RootState) =>
    state.favourites.items.some((i) => i.id === id);

export default favouritesSlice.reducer;
