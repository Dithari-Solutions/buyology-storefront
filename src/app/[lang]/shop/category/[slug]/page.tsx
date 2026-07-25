import { Suspense } from "react";
import type { Metadata } from "next";
import Footer from "@/shared/components/Footer";
import Header from "@/shared/components/Header";
import ShopBrowser from "@/features/product/components/ShopBrowser";
import { getAllCategories } from "@/features/product/services/productService";
import { buildPageMetadata } from "@/shared/seo/buildMetadata";
import { getSafeLang } from "@/shared/seo/config";
import type { Lang } from "@/config/pathSlugs";

/**
 * Readable category URLs — /en/shop/category/smartphones instead of
 * /en/shop?categoryId=<uuid>&categoryName=Smartphones.
 *
 * The old query-string form still works (ShopBrowser reads it as a fallback),
 * so anything already linked or indexed keeps resolving; only the links we
 * *emit* changed.
 */

async function resolveCategory(lang: Lang, slug: string) {
  try {
    const categories = await getAllCategories(lang);
    return categories.find((c) => c.slug === slug) ?? null;
  } catch {
    // API unreachable at request time — fall back to the slug so the page still
    // renders (unfiltered) rather than 500-ing.
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang: rawLang, slug } = await params;
  const lang = getSafeLang(rawLang);
  const category = await resolveCategory(lang, slug);
  const name = category?.name ?? prettifySlug(slug);

  return buildPageMetadata({
    lang,
    canonical: "shop",
    suffix: `/category/${slug}`,
    title: `${name} — Shop New & Refurbished`,
    description: `Shop ${name.toLowerCase()} at Buyology — brand new and certified refurbished devices with free shipping over 100 AED, fast delivery and a one-year warranty.`,
    keywords: [name, "refurbished devices", "brand new", "free shipping"],
  });
}

export default async function ShopCategoryPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang: rawLang, slug } = await params;
  const lang = getSafeLang(rawLang);
  const category = await resolveCategory(lang, slug);

  return (
    <>
      <Header />
      <Suspense fallback={null}>
        <ShopBrowser
          categoryId={category?.id ?? null}
          categoryName={category?.name ?? prettifySlug(slug)}
        />
      </Suspense>
      <Footer />
    </>
  );
}

/** "gaming-consoles" → "Gaming Consoles" (only used when the API lookup fails). */
function prettifySlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
