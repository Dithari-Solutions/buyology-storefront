import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Footer from "@/shared/components/Footer";
import Header from "@/shared/components/Header";
import ShopBrowser from "@/features/product/components/ShopBrowser";
import { buildPageMetadata } from "@/shared/seo/buildMetadata";
import { getSafeLang } from "@/shared/seo/config";

/**
 * Readable condition landing pages — /en/shop/condition/refurbished instead of
 * /en/shop?condition=REFURBISHED. Friendlier for users and crawlers, and unlike
 * the old query-string links these are actually wired to the filter.
 *
 * The old ?condition= form still resolves (ShopBrowser reads it as a fallback).
 */

// slug (URL) ⇄ backend condition enum
const CONDITION_BY_SLUG: Record<string, "NEW" | "REFURBISHED"> = {
  new: "NEW",
  refurbished: "REFURBISHED",
};

const COPY: Record<string, { name: string; description: string }> = {
  new: {
    name: "Brand New Devices",
    description:
      "Shop brand new, sealed devices with full manufacturer warranty — phones, laptops, tablets and more, with free shipping over 100 AED and fast delivery.",
  },
  refurbished: {
    name: "Certified Refurbished Devices",
    description:
      "Shop certified refurbished devices — tested, cleaned and graded, each with a one-year warranty and up to 30% off new. Free shipping over 100 AED.",
  },
};

export function generateStaticParams() {
  return Object.keys(CONDITION_BY_SLUG).map((condition) => ({ condition }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; condition: string }>;
}): Promise<Metadata> {
  const { lang: rawLang, condition } = await params;
  const lang = getSafeLang(rawLang);
  const copy = COPY[condition.toLowerCase()];
  // Unknown condition slug: the page renders the not-found UI, but belt-and-
  // suspenders keep it out of the index (we only ever link new / refurbished).
  if (!copy) return { robots: { index: false, follow: false } };

  return buildPageMetadata({
    lang,
    canonical: "shop",
    suffix: `/condition/${condition.toLowerCase()}`,
    title: `${copy.name} — Buy Online`,
    description: copy.description,
    keywords: [copy.name, "refurbished devices", "brand new", "free shipping"],
  });
}

export default async function ShopConditionPage({
  params,
}: {
  params: Promise<{ lang: string; condition: string }>;
}) {
  const { condition } = await params;
  const enumValue = CONDITION_BY_SLUG[condition.toLowerCase()];
  if (!enumValue) notFound();

  return (
    <>
      <Header />
      <Suspense fallback={null}>
        <ShopBrowser condition={enumValue} />
      </Suspense>
      <Footer />
    </>
  );
}
