import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type LanguageState = {
    lang: "en" | "az" | "ar";
};

const initialState: LanguageState = {
    lang: "en",
};

export const languageSlice = createSlice({
    name: "language",
    initialState,
    reducers: {
        setLanguage: (state, action: PayloadAction<LanguageState["lang"]>) => {
            state.lang = action.payload;
        },
    },
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;