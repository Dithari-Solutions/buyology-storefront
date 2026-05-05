import type { MetadataRoute } from "next";
import { SITE_URL, SUPPORTED_LANGS, localizedPath } from "@/shared/seo/config";
import { getProducts } from "@/features/product/services/productService";

const STATIC_ROUTES: Array<{
  canonical: string | null;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { canonical: null, changeFrequency: "daily", priority: 1.0 },
  { canonical: "shop", changeFrequency: "daily", priority: 0.95 },
  { canonical: "rent", changeFrequency: "weekly", priority: 0.85 },
  { canonical: "repair", changeFrequency: "weekly", priority: 0.85 },
  { canonical: "sell", changeFrequency: "weekly", priority: 0.8 },
  { canonical: "quick-delivery", changeFrequency: "weekly", priority: 0.8 },
  { canonical: "b2b", changeFrequency: "weekly", priority: 0.8 },
  { canonical: "contact", changeFrequency: "monthly", priority: 0.5 },
  { canonical: "games", changeFrequency: "weekly", priority: 0.6 },
];

function langAlternates(canonical: string | null, suffix = "") {
  return Object.fromEntries(
    SUPPORTED_LANGS.map((l) => [
      l,
      `${SITE_URL}${
        canonical === null ? `/${l}` : localizedPath(canonical, l, suffix)
      }`,
    ])
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.flatMap(
    ({ canonical, changeFrequency, priority }) =>
      SUPPORTED_LANGS.map((lang) => ({
        url: `${SITE_URL}${
          canonical === null ? `/${lang}` : localizedPath(canonical, lang)
        }`,
        lastModified: now,
        changeFrequency,
        priority,
        alternates: { languages: langAlternates(canonical) },
      }))
  );

  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const products = await getProducts({ lang: "en" });
    productEntries = products.flatMap((p) =>
      SUPPORTED_LANGS.map((lang) => ({
        url: `${SITE_URL}${localizedPath("shop", lang, `/${p.slug}`)}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
        changeFrequency: "daily" as const,
        priority: 0.9,
        alternates: { languages: langAlternates("shop", `/${p.slug}`) },
      }))
    );
  } catch {
    // Graceful: still emit static sitemap if API is unreachable at build time.
  }

  return [...staticEntries, ...productEntries];
}
