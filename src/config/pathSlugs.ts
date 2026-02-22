export type Lang = "en" | "az" | "ar";

/**
 * Maps canonical route name (= Next.js folder name) → localized URL slug per language.
 * All slugs use English/Latin letters only.
 */
export const PATH_SLUGS: Record<string, Record<Lang, string>> = {
    shop: { en: "shop", az: "magaza", ar: "matjar" },
    auth: { en: "auth", az: "giris", ar: "duhul" },
};

/**
 * Reverse map: lang → { localizedSlug → canonicalName }
 * e.g. SLUG_TO_CANONICAL["az"]["magaza"] === "shop"
 */
export const SLUG_TO_CANONICAL: Record<Lang, Record<string, string>> = {
    en: {},
    az: {},
    ar: {},
};

for (const [canonical, langs] of Object.entries(PATH_SLUGS)) {
    for (const [lang, slug] of Object.entries(langs) as [Lang, string][]) {
        SLUG_TO_CANONICAL[lang][slug] = canonical;
    }
}
