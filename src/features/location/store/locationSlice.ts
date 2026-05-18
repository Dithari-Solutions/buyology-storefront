import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "@/store";

const SUPPORTED_ISO2 = new Set([
  "AE", "AZ", "SA", "KW", "QA", "OM", "BH", "EG", "JO", "LB", "TR", "US", "GB", "DE",
]);

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

// Cheap, no-permission IP-based country detection. Hits our own /api/geoip
// route (which proxies + caches ipapi.co server-side so we don't hit per-IP
// rate limits and don't expose the lookup to the browser).
export const detectCountryByIPThunk = createAsyncThunk<
  { countryCode: string | null }
>("location/detectByIP", async () => {
  try {
    const res = await fetch("/api/geoip", { credentials: "same-origin" });
    if (!res.ok) return { countryCode: null };
    const data = (await res.json()) as { countryCode?: string | null };
    const code = data?.countryCode?.toUpperCase() ?? null;
    if (code && SUPPORTED_ISO2.has(code)) return { countryCode: code };
    return { countryCode: null };
  } catch {
    return { countryCode: null };
  }
});

// Browser-geolocation request. Only call this in response to an explicit
// user action (e.g. clicking "Use my location") — auto-firing it triggers
// the native permission prompt and hurts UX + Lighthouse Best Practices.
export const requestLocationThunk = createAsyncThunk<
  { lat: number; lng: number; countryCode: string | null },
  void,
  { rejectValue: string }
>("location/request", async (_, { rejectWithValue }) => {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return rejectWithValue("unsupported");
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        let countryCode: string | null = null;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const iso2 = (data?.address?.country_code as string | undefined)?.toUpperCase();
          if (iso2 && SUPPORTED_ISO2.has(iso2)) countryCode = iso2;
        } catch {
          // Reverse geocoding failed — keep coords, skip country.
        }

        resolve({ lat, lng, countryCode });
      },
      () => reject(rejectWithValue("denied")),
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
        if (action.payload.countryCode) {
          state.detectedCountryCode = action.payload.countryCode;
        }
        state.loading = false;
      })
      .addCase(requestLocationThunk.rejected, (state) => {
        state.loading = false;
        state.denied = true;
      })
      .addCase(detectCountryByIPThunk.fulfilled, (state, action) => {
        if (action.payload.countryCode) {
          state.detectedCountryCode = action.payload.countryCode;
        }
      });
  },
});

export default locationSlice.reducer;

export const selectUserCoords = (state: RootState) => state.location.coords;
export const selectLocationDenied = (state: RootState) => state.location.denied;
export const selectDetectedCountryCode = (state: RootState) => state.location.detectedCountryCode;
