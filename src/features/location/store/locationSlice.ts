import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "@/store";

// Maps ISO 3166-1 alpha-2 (from Nominatim) → app country codes
const ISO2_TO_APP: Record<string, string> = {
  AE: "UAE",
  AZ: "AZE",
  SA: "SAU",
  KW: "KWT",
  QA: "QAT",
  OM: "OMN",
  BH: "BHR",
  EG: "EGY",
  JO: "JOR",
  LB: "LBN",
  TR: "TUR",
  US: "USA",
  GB: "GBR",
  DE: "DEU",
};

interface LocationState {
  coords: { lat: number; lng: number } | null;
  loading: boolean;
  denied: boolean;
  detectedCountryCode: string | null;
}

const initialState: LocationState = {
  coords: null,
  loading: false,
  denied: false,
  detectedCountryCode: null,
};

export const requestLocationThunk = createAsyncThunk<
  { lat: number; lng: number; countryCode: string | null },
  void,
  { rejectValue: string }
>("location/request", async (_, { rejectWithValue }) => {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return rejectWithValue("Geolocation not supported");
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // Reverse geocode to detect country code
        let countryCode: string | null = null;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const iso2 = (data?.address?.country_code as string | undefined)?.toUpperCase();
          if (iso2) countryCode = ISO2_TO_APP[iso2] ?? null;
        } catch {
          // Geocoding failed — still store coords, skip country auto-set
        }

        resolve({ lat, lng, countryCode });
      },
      (err) => {
        reject(rejectWithValue(err.message));
      },
      { timeout: 10000 }
    );
  });
});

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(requestLocationThunk.pending, (state) => {
        state.loading = true;
        state.denied = false;
      })
      .addCase(requestLocationThunk.fulfilled, (state, action) => {
        state.coords = { lat: action.payload.lat, lng: action.payload.lng };
        state.detectedCountryCode = action.payload.countryCode;
        state.loading = false;
      })
      .addCase(requestLocationThunk.rejected, (state) => {
        state.loading = false;
        state.denied = true;
      });
  },
});

export default locationSlice.reducer;

export const selectUserCoords = (state: RootState) => state.location.coords;
export const selectLocationDenied = (state: RootState) => state.location.denied;
export const selectDetectedCountryCode = (state: RootState) => state.location.detectedCountryCode;
