"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Provider } from "react-redux";
import { store } from "@/store";
import { I18nextProvider } from "react-i18next";
import i18n from "@/shared/i18n";
import HtmlLangDir from "@/shared/components/HtmlLangDir";
import IntroScreen from "@/shared/components/IntroScreen";
import SignupGate from "@/shared/components/SignupGate";
import { tryRestoreSession } from "@/shared/lib/tokenManager";
import { initFromLocalStorage, fetchCountriesThunk, setCountryThunk } from "@/features/country/store/countrySlice";
import { requestLocationThunk, selectDetectedCountryCode } from "@/features/location/store/locationSlice";
import type { AppDispatch, RootState } from "@/store";

function AuthInitializer() {
  useEffect(() => {
    tryRestoreSession();
  }, []);
  return null;
}

function CountryInitializer() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(initFromLocalStorage());
    dispatch(fetchCountriesThunk());
  }, [dispatch]);

  return null;
}

function GeolocationInitializer() {
  const dispatch = useDispatch<AppDispatch>();
  const userId = useSelector((state: RootState) => state.auth.userId);

  // Countries list — needed to resolve currency when setting country
  const countries = useSelector((state: RootState) => state.country.countries);

  // Detected country code stored in Redux after reverse geocoding
  const detectedCountryCode = useSelector(selectDetectedCountryCode);

  // Ensure we only apply the auto-detected country once
  const appliedRef = useRef(false);

  // Step 1 — kick off the geolocation request once on mount
  useEffect(() => {
    dispatch(requestLocationThunk());
  }, [dispatch]);

  // Step 2 — set country as soon as it is detected from geolocation.
  // We dispatch immediately (don't wait for countries list) so the product list
  // updates without delay. setCountryThunk resolves the currency from the countries
  // list internally; if the list isn't loaded yet it falls back to the default currency
  // and will be corrected when countries load via the selector.
  useEffect(() => {
    if (!detectedCountryCode || appliedRef.current) return;

    // If countries are already loaded, verify this country is active before setting.
    // If not loaded yet, dispatch anyway — the thunk will use default currency as fallback.
    if (countries.length > 0) {
      const supported = countries.some((c) => c.code === detectedCountryCode);
      if (!supported) return;
    }

    appliedRef.current = true;
    dispatch(setCountryThunk({ countryCode: detectedCountryCode, userId }));
  }, [detectedCountryCode, countries, dispatch, userId]);

  // Step 3 — once countries load, correct the currency if the country was set early
  // (before the countries list was available).
  useEffect(() => {
    if (!detectedCountryCode || !appliedRef.current || countries.length === 0) return;
    const supported = countries.some((c) => c.code === detectedCountryCode);
    if (!supported) return;
    // Re-dispatch silently to get the right currency now that countries are loaded.
    // userId is not passed here to avoid a redundant PATCH to the profile.
    dispatch(setCountryThunk({ countryCode: detectedCountryCode }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countries]);

  return null;
}

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <IntroScreen />
      <SignupGate />
      {children}
    </>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <HtmlLangDir />
        <AuthInitializer />
        <CountryInitializer />
        <GeolocationInitializer />
        <AppShell>{children}</AppShell>
      </I18nextProvider>
    </Provider>
  );
}
