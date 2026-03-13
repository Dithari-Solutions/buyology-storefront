import { configureStore } from "@reduxjs/toolkit";
import languageReducer from "./languageSlice";
import cartReducer from "@/features/cart/store/cartSlice";
import favouritesReducer from "@/features/favourites/store/favouritesSlice";
import authReducer from "@/features/auth/store/authSlice";

export const store = configureStore({
    reducer: {
        language: languageReducer,
        cart: cartReducer,
        favourites: favouritesReducer,
        auth: authReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
