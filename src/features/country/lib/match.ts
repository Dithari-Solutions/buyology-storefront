import type { Country } from "../services/country.api";

// All known equivalent codes for a given country, keyed by either alpha-2
// or alpha-3. The admin dashboard accepts 2–3 char codes, so countries can
// be stored either way; this lets the frontend match regardless.
const EQUIVALENTS: Record<string, string[]> = {
  AE: ["AE", "UAE", "ARE"], UAE: ["AE", "UAE", "ARE"], ARE: ["AE", "UAE", "ARE"],
  AZ: ["AZ", "AZE"], AZE: ["AZ", "AZE"],
  SA: ["SA", "SAU"], SAU: ["SA", "SAU"],
  KW: ["KW", "KWT"], KWT: ["KW", "KWT"],
  QA: ["QA", "QAT"], QAT: ["QA", "QAT"],
  OM: ["OM", "OMN"], OMN: ["OM", "OMN"],
  BH: ["BH", "BHR"], BHR: ["BH", "BHR"],
  EG: ["EG", "EGY"], EGY: ["EG", "EGY"],
  JO: ["JO", "JOR"], JOR: ["JO", "JOR"],
  LB: ["LB", "LBN"], LBN: ["LB", "LBN"],
  TR: ["TR", "TUR"], TUR: ["TR", "TUR"],
  US: ["US", "USA"], USA: ["US", "USA"],
  GB: ["GB", "GBR"], GBR: ["GB", "GBR"],
  DE: ["DE", "DEU"], DEU: ["DE", "DEU"],
};

export function aliasesFor(code: string | null | undefined): string[] {
  if (!code) return [];
  const upper = code.toUpperCase();
  return EQUIVALENTS[upper] ?? [upper];
}

export function findCountryByAlias(
  countries: Country[],
  code: string | null | undefined,
): Country | undefined {
  if (!code) return undefined;
  const candidates = aliasesFor(code);
  for (const candidate of candidates) {
    const match = countries.find((c) => c.code.toUpperCase() === candidate);
    if (match) return match;
  }
  return undefined;
}
