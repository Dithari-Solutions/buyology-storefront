"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { selectSelectedCountryCode } from "@/features/country/store/countrySlice";
import { selectDetectedCountryCode } from "@/features/location/store/locationSlice";
import { aliasesFor } from "@/features/country/lib/match";
import {
  getB2bActiveCountries,
  type B2bActiveCountry,
} from "@/features/country/services/country.api";

// Module-level cache so the home banner and the B2B browse page don't each
// re-fetch the (small, rarely-changing) b2b-active list.
let cache: B2bActiveCountry[] | null = null;
let inflight: Promise<B2bActiveCountry[]> | null = null;

function loadB2bCountries(): Promise<B2bActiveCountry[]> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = getB2bActiveCountries()
      .then((list) => {
        cache = list;
        return list;
      })
      .catch(() => {
        inflight = null; // allow a retry on the next mount
        return [];
      });
  }
  return inflight;
}

function matchB2b(
  list: B2bActiveCountry[],
  code: string | null | undefined
): B2bActiveCountry | undefined {
  if (!code) return undefined;
  const candidates = aliasesFor(code).map((c) => c.toUpperCase());
  return list.find((c) => candidates.includes(c.code.toUpperCase()));
}

export interface B2bRegionState {
  loading: boolean;
  b2bCountries: B2bActiveCountry[] | null;
  /** The B2B-enabled region the visitor is in (selected first, else IP-detected). */
  region: B2bActiveCountry | null;
  /** Alpha-3 code of that region, for scoping B2B product queries. */
  regionCode: string | null;
  isB2bRegion: boolean;
}

/**
 * Resolves whether the visitor is in a B2B-enabled region, INDEPENDENT of the
 * B2C country-selection machinery.
 *
 * B2B-only regions have isActive=false, so they are excluded from
 * /api/countries/active and can never become `selectedCountryCode`. Keying B2B
 * surfaces off the selected country alone would therefore hide them entirely.
 * We instead match the b2b-active list against the selected OR the IP-detected
 * country (alpha-2/alpha-3 tolerant), so B2B-only regions light up correctly.
 */
export function useB2bRegion(): B2bRegionState {
  const selectedCountryCode = useSelector((s: RootState) =>
    selectSelectedCountryCode(s)
  );
  const detectedCountryCode = useSelector((s: RootState) =>
    selectDetectedCountryCode(s)
  );

  const [b2bCountries, setB2bCountries] = useState<B2bActiveCountry[] | null>(
    cache
  );

  useEffect(() => {
    let alive = true;
    loadB2bCountries().then((list) => {
      if (alive) setB2bCountries(list);
    });
    return () => {
      alive = false;
    };
  }, []);

  const region = b2bCountries
    ? matchB2b(b2bCountries, selectedCountryCode) ??
      matchB2b(b2bCountries, detectedCountryCode) ??
      null
    : null;

  return {
    loading: b2bCountries === null,
    b2bCountries,
    region,
    regionCode: region?.code ?? null,
    isB2bRegion: !!region,
  };
}
