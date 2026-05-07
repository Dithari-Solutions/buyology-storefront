import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getActiveCountries, updateCountryPreference, type Country } from "../services/country.api";
import { findCountryByAlias } from "../lib/match";
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
    const country = findCountryByAlias(state.country.countries, countryCode);
    const resolvedCode = country?.code ?? countryCode;
    const resolvedCurrency = currency ?? country?.currency ?? DEFAULT_CURRENCY;

    localStorage.setItem("selectedCountryCode", resolvedCode);
    localStorage.setItem("preferredCurrency", resolvedCurrency);

    if (userId) {
      await updateCountryPreference(userId, resolvedCode, resolvedCurrency).catch(console.error);
    }

    return { countryCode: resolvedCode, currency: resolvedCurrency };
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
        // Heal a persisted code that doesn't match exactly: try every known
        // alias (alpha-2 ↔ alpha-3) and adopt whichever form the admin
        // actually stored, plus its canonical currency.
        const matched = findCountryByAlias(action.payload, state.selectedCountryCode);
        if (matched) {
          if (state.selectedCountryCode !== matched.code) {
            state.selectedCountryCode = matched.code;
            if (typeof window !== "undefined") {
              localStorage.setItem("selectedCountryCode", matched.code);
            }
          }
          if (state.preferredCurrency !== matched.currency) {
            state.preferredCurrency = matched.currency;
            if (typeof window !== "undefined") {
              localStorage.setItem("preferredCurrency", matched.currency);
            }
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
  findCountryByAlias(state.country.countries, state.country.selectedCountryCode);
