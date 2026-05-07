import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getActiveCountries, updateCountryPreference, type Country } from "../services/country.api";
import type { RootState } from "@/store";

const DEFAULT_COUNTRY = "UAE";
const DEFAULT_CURRENCY = "AED";

interface CountryState {
  countries: Country[];
  selectedCountryCode: string;
  preferredCurrency: string;
  loading: boolean;
}

function readLocal(key: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  return localStorage.getItem(key) ?? fallback;
}

const initialState: CountryState = {
  countries: [],
  selectedCountryCode: DEFAULT_COUNTRY,
  preferredCurrency: DEFAULT_CURRENCY,
  loading: false,
};

export const fetchCountriesThunk = createAsyncThunk(
  "country/fetchCountries",
  async () => getActiveCountries()
);

export const setCountryThunk = createAsyncThunk(
  "country/setCountry",
  async (
    { countryCode, currency, userId }: { countryCode: string; currency?: string; userId?: string | null },
    { getState }
  ) => {
    const state = getState() as RootState;
    const country = state.country.countries.find((c) => c.code === countryCode);
    const resolvedCurrency = currency ?? country?.currency ?? DEFAULT_CURRENCY;

    localStorage.setItem("selectedCountryCode", countryCode);
    localStorage.setItem("preferredCurrency", resolvedCurrency);

    if (userId) {
      await updateCountryPreference(userId, countryCode, resolvedCurrency).catch(console.error);
    }

    return { countryCode, currency: resolvedCurrency };
  }
);

const countrySlice = createSlice({
  name: "country",
  initialState,
  reducers: {
    initFromLocalStorage(state) {
      state.selectedCountryCode = readLocal("selectedCountryCode", DEFAULT_COUNTRY);
      state.preferredCurrency = readLocal("preferredCurrency", DEFAULT_CURRENCY);
    },
    syncFromProfile(
      state,
      action: PayloadAction<{ selectedCountryCode?: string | null; preferredCurrency?: string | null }>
    ) {
      if (action.payload.selectedCountryCode) {
        state.selectedCountryCode = action.payload.selectedCountryCode;
        localStorage.setItem("selectedCountryCode", action.payload.selectedCountryCode);
      }
      if (action.payload.preferredCurrency) {
        state.preferredCurrency = action.payload.preferredCurrency;
        localStorage.setItem("preferredCurrency", action.payload.preferredCurrency);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCountriesThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCountriesThunk.fulfilled, (state, action) => {
        state.countries = action.payload;
        state.loading = false;
        // Backfill the persisted currency if it was stamped before the
        // countries list loaded (e.g. the lang-default path persists with
        // the global default AED, even when the selected code is AZ).
        const matched = action.payload.find((c) => c.code === state.selectedCountryCode);
        if (matched && state.preferredCurrency !== matched.currency) {
          state.preferredCurrency = matched.currency;
          if (typeof window !== "undefined") {
            localStorage.setItem("preferredCurrency", matched.currency);
          }
        }
      })
      .addCase(fetchCountriesThunk.rejected, (state) => {
        state.loading = false;
      })
      .addCase(setCountryThunk.fulfilled, (state, action) => {
        state.selectedCountryCode = action.payload.countryCode;
        state.preferredCurrency = action.payload.currency;
      });
  },
});

export const { initFromLocalStorage, syncFromProfile } = countrySlice.actions;
export default countrySlice.reducer;

export const selectCountries = (state: RootState) => state.country.countries;
export const selectSelectedCountryCode = (state: RootState) => state.country.selectedCountryCode;
export const selectPreferredCurrency = (state: RootState) => state.country.preferredCurrency;
export const selectSelectedCountry = (state: RootState) =>
  state.country.countries.find((c) => c.code === state.country.selectedCountryCode);
