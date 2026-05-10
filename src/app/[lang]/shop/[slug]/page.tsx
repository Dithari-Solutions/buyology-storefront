import type { Metadata } from "next";
import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import ProductDetailClient from "@/features/product/components/ProductDetailClient";
import { getProductBySlug } from "@/features/product/services/productService";
import { getImageUrl } from "@/shared/utils/imageUrl";
import type { Lang } from "@/config/pathSlugs";
import { buildPageMetadata } from "@/shared/seo/buildMetadata";
import { SITE_URL, SITE_NAME, getSafeLang, localizedPath } from "@/shared/seo/config";
import {
  JsonLd,
  breadcrumbJsonLd,
  productJsonLd,
} from "@/shared/seo/JsonLd";

type PageProps = {
  params: Promise<{ lang: string; slug: string }>;
};

const AVAILABILITY_MAP: Record<string, "InStock" | "OutOfStock" | "PreOrder"> = {
  IN_STOCK: "InStock",
  AVAILABLE: "InStock",
  OUT_OF_STOCK: "OutOfStock",
  UNAVAILABLE: "OutOfStock",
  PRE_ORDER: "PreOrder",
  PREORDER: "PreOrder",
};

function truncate(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).trimEnd() + "…";
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang: rawLang, slug } = await params;
  const lang = getSafeLang(rawLang);

  try {
    const product = await getProductBySlug(slug, { lang });
    const primary =
      [...product.media].sort((a, b) => a.orderIndex - b.orderIndex)[0]?.url ??
      product.media[0]?.url;
    const image = primary ? getImageUrl(primary) : undefined;

    const title = product.brandName
      ? `${product.brandName} ${product.title}`
      : product.title;
    const description = truncate(
      product.description ||
        `Buy ${title} on ${SITE_NAME}. SKU ${product.sku}. Fast delivery, secure checkout.`
    );

    const keywords = [
      product.title,
      product.brandName ?? "",
      product.sku,
      "buy online",
      "shop",
      SITE_NAME,
    ].filter(Boolean) as string[];

    const price = product.storePrice ?? product.effectivePrice ?? product.basePrice;
    const currency = product.currency ?? "USD";

    return buildPageMetadata({
      lang,
      canonical: "shop",
      suffix: `/${slug}`,
      title,
      description,
      keywords,
      image,
      type: "product",
      extraOpenGraph: {
        "product:brand": product.brandName ?? undefined,
        "product:availability":
          AVAILABILITY_MAP[product.availabilityStatus] === "InStock"
            ? "in stock"
            : "out of stock",
        "product:condition": product.isRefurbished ? "refurbished" : "new",
        "product:price:amount": price ? price.toFixed(2) : undefined,
        "product:price:currency": currency,
        "product:retailer_item_id": product.sku,
      },
    });
  } catch {
    return buildPageMetadata({
      lang,
      canonical: "shop",
      suffix: `/${slug}`,
      title: "Product not found",
      description: "The product you are looking for could not be found.",
      noindex: true,
    });
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { lang: rawLang, slug } = await params;
  const lang = getSafeLang(rawLang);

  try {
    const product = await getProductBySlug(slug, { lang });
    const sortedMedia = [...product.media].sort(
      (a, b) => a.orderIndex - b.orderIndex
    );
    const images = sortedMedia.map((m) => getImageUrl(m.url));

    const productUrl = `${SITE_URL}${localizedPath("shop", lang, `/${slug}`)}`;
    const shopUrl = `${SITE_URL}${localizedPath("shop", lang)}`;
    const homeUrl = `${SITE_URL}/${lang}`;

    const price =
      product.storePrice ?? product.effectivePrice ?? product.basePrice;
    const productTitle = product.brandName
      ? `${product.brandName} ${product.title}`
      : product.title;

    const productLd = productJsonLd({
      name: productTitle,
      description: product.description || productTitle,
      sku: product.sku,
      url: productUrl,
      images,
      brand: product.brandName,
      price: typeof price === "number" ? price : undefined,
      currency: product.currency ?? "USD",
      availability:
        AVAILABILITY_MAP[product.availabilityStatus] ?? "InStock",
      condition: product.isRefurbished
        ? "RefurbishedCondition"
        : "NewCondition",
      category: product.productType,
    });

    const breadcrumbLd = breadcrumbJsonLd([
      { name: "Home", url: homeUrl },
      { name: "Shop", url: shopUrl },
      { name: productTitle, url: productUrl },
    ]);

    return (
      <>
        <JsonLd data={productLd} />
        <JsonLd data={breadcrumbLd} />
        <Header />
        <main className="bg-gray-50 min-h-screen">
          <ProductDetailClient product={product} images={images} slug={slug} />
        </main>
        <Footer />
      </>
    );
  } catch {
    return (
      <>
        <Header />
        <main className="bg-gray-50 min-h-screen flex items-center justify-center">
          <p className="text-gray-500 text-[15px]">Product not found.</p>
        </main>
        <Footer />
      </>
    );
  }
}
