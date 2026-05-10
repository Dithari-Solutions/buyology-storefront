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

function writeCookie(key: string, value: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`;
}

function persist(countryCode: string, currency: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("selectedCountryCode", countryCode);
  localStorage.setItem("preferredCurrency", currency);
  writeCookie("selectedCountryCode", countryCode);
  writeCookie("preferredCurrency", currency);
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

    persist(resolvedCode, resolvedCurrency);

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
      persist(state.selectedCountryCode, state.preferredCurrency);
    },
    syncFromProfile(
      state,
      action: PayloadAction<{ selectedCountryCode?: string | null; preferredCurrency?: string | null }>
    ) {
      if (action.payload.selectedCountryCode) {
        state.selectedCountryCode = action.payload.selectedCountryCode;
      }
      if (action.payload.preferredCurrency) {
        state.preferredCurrency = action.payload.preferredCurrency;
      }
      persist(state.selectedCountryCode, state.preferredCurrency);
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
          }
          if (state.preferredCurrency !== matched.currency) {
            state.preferredCurrency = matched.currency;
          }
          persist(state.selectedCountryCode, state.preferredCurrency);
        }
      })
      .addCase(fetchCountriesThunk.rejected, (state) => {
        state.loading = false;
      })
      .addCase(setCountryThunk.fulfilled, (state, action) => {
        state.selectedCountryCode = action.payload.countryCode;
        state.preferredCurrency = action.payload.currency;
        persist(state.selectedCountryCode, state.preferredCurrency);
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
