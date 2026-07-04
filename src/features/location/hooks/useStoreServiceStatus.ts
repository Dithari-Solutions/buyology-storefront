"use client";

import { useSelector } from "react-redux";
import { findCountryByAlias } from "@/features/country/lib/match";
import {
  selectCountries,
  selectCountriesLoaded,
  selectCountryManuallySelected,
  selectSelectedCountryCode,
} from "@/features/country/store/countrySlice";
import {
  selectDetectedCountryCode,
  selectIpStatus,
} from "@/features/location/store/locationSlice";

export type StoreServiceStatus = "pending" | "served" | "unserved";

/**
 * Decides whether the storefront should show products to the current visitor.
 *
 * The source of truth for "we have a store here" is the backend's active
 * countries list (`GET /api/countries/active`, held in `country.countries`) —
 * NOT a hardcoded region set. A region is "served" only if the detected country
 * resolves (alpha-2/alpha-3 tolerant) to one of those active countries.
 *
 *  - "pending"  — we don't yet know the visitor's region (countries not loaded
 *                 or IP detection still running). Callers should hide products.
 *  - "served"   — detected (or manually chosen) region is an active country.
 *  - "unserved" — detection settled and the region isn't served, INCLUDING the
 *                 case where geo-IP couldn't resolve a country at all (strict:
 *                 we keep products hidden rather than guessing).
 */
export function useStoreServiceStatus(): StoreServiceStatus {
  const countries = useSelector(selectCountries);
  const loaded = useSelector(selectCountriesLoaded);
  const manuallySelected = useSelector(selectCountryManuallySelected);
  const selectedCountryCode = useSelector(selectSelectedCountryCode);
  const detectedCountryCode = useSelector(selectDetectedCountryCode);
  const ipStatus = useSelector(selectIpStatus);

  // Can't validate anything without the authoritative active-countries list.
  if (!loaded || countries.length === 0) return "pending";

  // An explicit manual pick (region notice / picker) overrides detection, as
  // long as the chosen country is actually one we serve.
  if (manuallySelected && findCountryByAlias(countries, selectedCountryCode)) {
    return "served";
  }

  // Otherwise wait for IP detection to finish before revealing anything.
  if (ipStatus !== "done") return "pending";

  return findCountryByAlias(countries, detectedCountryCode) ? "served" : "unserved";
}
