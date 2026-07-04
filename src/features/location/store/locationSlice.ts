import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "@/store";

// IP detection lifecycle. Product visibility is gated on this so nothing renders
// until we know where the visitor is (see useStoreServiceStatus). "done" means
// the lookup settled — whether or not it resolved to a country.
type IpStatus = "idle" | "loading" | "done";

interface LocationState {
  coords: { lat: number; lng: number } | null;
  loading: boolean;
  denied: boolean;
  detectedCountryCode: string | null;
  ipStatus: IpStatus;
}

const initialState: LocationState = {
  coords: null,
  loading: false,
  denied: false,
  detectedCountryCode: null,
  ipStatus: "idle",
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
    // Return the RAW detected country (ISO alpha-2). Whether we actually serve
    // that region is validated against the backend's active-countries list (see
    // useStoreServiceStatus) — never a hardcoded allowlist here.
    return { countryCode: data?.countryCode?.toUpperCase() ?? null };
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
          // Raw detected country — served-region validation happens against the
          // active-countries list, not a hardcoded set (see useStoreServiceStatus).
          const iso2 = (data?.address?.country_code as string | undefined)?.toUpperCase();
          if (iso2) countryCode = iso2;
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
      .addCase(detectCountryByIPThunk.pending, (state) => {
        state.ipStatus = "loading";
      })
      .addCase(detectCountryByIPThunk.fulfilled, (state, action) => {
        // Store even a null result: it means "detection settled, region unknown"
        // (kept distinct from "not detected yet" via ipStatus).
        state.detectedCountryCode = action.payload.countryCode;
        state.ipStatus = "done";
      })
      .addCase(detectCountryByIPThunk.rejected, (state) => {
        state.ipStatus = "done";
      });
  },
});

export default locationSlice.reducer;

export const selectUserCoords = (state: RootState) => state.location.coords;
export const selectLocationDenied = (state: RootState) => state.location.denied;
export const selectDetectedCountryCode = (state: RootState) => state.location.detectedCountryCode;
export const selectIpStatus = (state: RootState) => state.location.ipStatus;
