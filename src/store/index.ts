import { configureStore } from "@reduxjs/toolkit";
import languageReducer from "./languageSlice";
import cartReducer from "@/features/cart/store/cartSlice";

export const store = configureStore({
    reducer: {
        language: languageReducer,
        cart: cartReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
