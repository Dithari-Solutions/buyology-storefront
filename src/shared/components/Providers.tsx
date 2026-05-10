"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Provider } from "react-redux";
import { store } from "@/store";
import { I18nextProvider } from "react-i18next";
import i18n from "@/shared/i18n";
import HtmlLangDir from "@/shared/components/HtmlLangDir";
import IntroScreen from "@/shared/components/IntroScreen";
import PageTransition from "@/shared/components/PageTransition";
import SignupGate from "@/shared/components/SignupGate";
import { tryRestoreSession } from "@/shared/lib/tokenManager";
import { initFromLocalStorage, fetchCountriesThunk, setCountryThunk } from "@/features/country/store/countrySlice";
import { findCountryByAlias } from "@/features/country/lib/match";
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

// Maps URL language to a country alias used as a fallback when no
// preference is saved. The alias is resolved against the active countries
// list (alpha-2/alpha-3 tolerant), so it works regardless of the form the
// admin used when seeding the country.
const LANG_DEFAULT_COUNTRY: Record<string, string> = { az: "AZ" };

function GeolocationInitializer() {
  const dispatch = useDispatch<AppDispatch>();
  const userId = useSelector((state: RootState) => state.auth.userId);

  // Countries list — needed to resolve currency when setting country
  const countries = useSelector((state: RootState) => state.country.countries);

  // Detected country code stored in Redux after reverse geocoding
  const detectedCountryCode = useSelector(selectDetectedCountryCode);

  // Current UI language (set by LangSync from URL segment)
  const lang = useSelector((state: RootState) => state.language.lang as string);

  // Tracks the last country code we PATCHed to the backend, so we don't spam
  // the profile endpoint when geolocation re-resolves the same country.
  const lastAppliedRef = useRef<string | null>(null);
  // Tracks whether a lang-based default was already applied
  const langAppliedRef = useRef(false);

  // Step 1 — kick off geolocation on mount and poll every minute so the
  // detected country stays fresh as the user moves.
  useEffect(() => {
    dispatch(requestLocationThunk());
    const id = setInterval(() => {
      dispatch(requestLocationThunk());
    }, 60_000);
    return () => clearInterval(id);
  }, [dispatch]);

  // Step 1b — apply lang-based country default once countries are loaded, if no saved preference.
  // Waits for the countries list so currency resolves correctly (e.g. AZN not AED).
  // Geolocation can still override this later.
  useEffect(() => {
    if (!lang || langAppliedRef.current || countries.length === 0) return;
    if (typeof window !== "undefined" && localStorage.getItem("selectedCountryCode")) return;
    const langCountry = LANG_DEFAULT_COUNTRY[lang];
    if (!langCountry) return;
    const matched = findCountryByAlias(countries, langCountry);
    if (!matched) return;
    langAppliedRef.current = true;
    dispatch(setCountryThunk({ countryCode: matched.code, userId }));
  }, [lang, countries, dispatch, userId]);

  // Step 2 — apply the detected country whenever geolocation changes it.
  // Skips if the country isn't in the active countries list or if it matches
  // what we already applied (avoids redundant profile PATCHes).
  useEffect(() => {
    if (!detectedCountryCode) return;
    if (countries.length === 0) return;
    const matched = findCountryByAlias(countries, detectedCountryCode);
    if (!matched) return;
    if (lastAppliedRef.current === matched.code) return;
    lastAppliedRef.current = matched.code;
    dispatch(setCountryThunk({ countryCode: matched.code, userId }));
  }, [detectedCountryCode, countries, dispatch, userId]);

  return null;
}

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <IntroScreen />
      <PageTransition />
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
