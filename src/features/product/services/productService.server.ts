import { cache } from "react";
import { getProductBySlug, getB2bProductBySlug, type ApiProduct } from "./productService";
import type { Lang } from "@/config/pathSlugs";

/**
 * Request-deduplicated `getProductBySlug` for the product detail route.
 *
 * The detail page fetches the product TWICE per navigation — once in
 * `generateMetadata` and once in the page component. React's `cache()` memoizes
 * by argument identity for the duration of a single server render, so calling
 * this with the SAME primitive args from both places collapses them into one
 * backend round-trip. (Primitives, not an options object, so the two callers
 * actually hit the same cache key.)
 */
export const getProductBySlugCached = cache(
  (slug: string, lang?: Lang, countryCode?: string, currency?: string): Promise<ApiProduct> =>
    getProductBySlug(slug, { lang, countryCode, currency })
);

/**
 * Request-deduplicated `getB2bProductBySlug` for the B2B product detail route.
 * Same rationale as {@link getProductBySlugCached} — the B2B detail page fetches
 * the product once in `generateMetadata` and once in the page component; caching
 * by primitive args collapses them into one backend round-trip. 404s when the
 * product isn't B2B-available.
 */
export const getB2bProductBySlugCached = cache(
  (slug: string, lang?: Lang, countryCode?: string, currency?: string): Promise<ApiProduct> =>
    getB2bProductBySlug(slug, { lang, countryCode, currency })
);
