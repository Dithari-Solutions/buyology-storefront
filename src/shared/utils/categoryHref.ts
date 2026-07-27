import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";

/**
 * Readable category URL: /en/shop/category/smartphones
 *
 * Replaces the previous /shop?categoryId=<uuid>&categoryName=<encoded> form,
 * which the SEO audit flagged under "Friendly Links" (long, query-string based,
 * and carrying a raw UUID). Falls back to the plain shop route when a category
 * has no slug so we never emit ".../category/undefined".
 */
export function categoryHref(
  lang: Lang | string,
  category: { slug?: string | null },
): string {
  const shopSlug = PATH_SLUGS.shop?.[lang as Lang] ?? "shop";
  if (!category.slug) return `/${lang}/${shopSlug}`;
  return `/${lang}/${shopSlug}/category/${category.slug}`;
}

/**
 * Readable condition landing URL: /en/shop/condition/refurbished
 * Replaces the old /shop?condition=REFURBISHED query-string links flagged under
 * "Friendly Links". `condition` is the backend enum (NEW / REFURBISHED).
 */
export function conditionHref(lang: Lang | string, condition: "NEW" | "REFURBISHED"): string {
  const shopSlug = PATH_SLUGS.shop?.[lang as Lang] ?? "shop";
  return `/${lang}/${shopSlug}/condition/${condition.toLowerCase()}`;
}
