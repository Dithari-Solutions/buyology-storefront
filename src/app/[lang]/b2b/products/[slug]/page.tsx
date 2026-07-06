import type { Metadata } from "next";
import { cookies } from "next/headers";
import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import B2BProductDetail from "@/features/b2b/components/B2BProductDetail";
import { getB2bProductBySlugCached } from "@/features/product/services/productService.server";
import { getImageUrl } from "@/shared/utils/imageUrl";
import { buildPageMetadata } from "@/shared/seo/buildMetadata";
import { SITE_NAME, getSafeLang } from "@/shared/seo/config";

type PageProps = {
  params: Promise<{ lang: string; slug: string }>;
};

async function getCountryFromCookies(): Promise<{ countryCode?: string; currency?: string }> {
  try {
    const store = await cookies();
    const countryCode = store.get("selectedCountryCode")?.value;
    const currency = store.get("preferredCurrency")?.value;
    return {
      countryCode: countryCode ? decodeURIComponent(countryCode) : undefined,
      currency: currency ? decodeURIComponent(currency) : undefined,
    };
  } catch {
    return {};
  }
}

function truncate(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).trimEnd() + "…";
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang: rawLang, slug } = await params;
  const lang = getSafeLang(rawLang);

  try {
    const { countryCode, currency } = await getCountryFromCookies();
    const product = await getB2bProductBySlugCached(slug, lang, countryCode, currency);
    const primary =
      [...product.media].sort((a, b) => a.orderIndex - b.orderIndex)[0]?.url ?? product.media[0]?.url;
    const image = primary ? getImageUrl(primary) : undefined;

    const title = product.brandName ? `${product.brandName} ${product.title}` : product.title;
    const description = truncate(
      product.description ||
        `Request a B2B quote for ${title} on ${SITE_NAME}. Bulk pricing for businesses.`
    );

    const keywords = [
      product.title,
      product.brandName ?? "",
      product.sku,
      "B2B",
      "wholesale",
      "bulk order",
      "request a quote",
      SITE_NAME,
    ].filter(Boolean) as string[];

    return buildPageMetadata({
      lang,
      canonical: "b2b",
      suffix: `/products/${slug}`,
      title: `${title} — B2B Wholesale`,
      description,
      keywords,
      image,
      type: "product",
    });
  } catch {
    return buildPageMetadata({
      lang,
      canonical: "b2b",
      suffix: `/products/${slug}`,
      title: "Product not found",
      description: "The B2B product you are looking for could not be found.",
      noindex: true,
    });
  }
}

export default async function B2BProductDetailPage({ params }: PageProps) {
  const { lang: rawLang, slug } = await params;
  const lang = getSafeLang(rawLang);

  try {
    const { countryCode, currency } = await getCountryFromCookies();
    const product = await getB2bProductBySlugCached(slug, lang, countryCode, currency);
    const sortedMedia = [...product.media].sort((a, b) => a.orderIndex - b.orderIndex);
    const images = sortedMedia.map((m) => getImageUrl(m.url));

    return (
      <>
        <Header />
        <main className="min-h-screen">
          <B2BProductDetail product={product} images={images} slug={slug} />
        </main>
        <Footer />
      </>
    );
  } catch {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500 text-[15px]">Product not found.</p>
        </main>
        <Footer />
      </>
    );
  }
}
