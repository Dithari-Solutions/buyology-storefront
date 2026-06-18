import { SITE_NAME, SITE_URL } from "./config";

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // Schema.org JSON-LD for search engines.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [
      "https://www.facebook.com/buyologyuae/",
      "http://instagram.com/buyologyuae/",
      "https://www.linkedin.com/company/buyologytech/posts/?feedView=all",
      "https://www.youtube.com/@Buyologytech",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        availableLanguage: ["English", "Azerbaijani", "Arabic"],
        areaServed: ["AZ", "AE", "WW"],
      },
    ],
  };
}

export function websiteJsonLd(lang: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: `${SITE_URL}/${lang}`,
    inLanguage: lang,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/${lang}/shop?query={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export interface ProductJsonLdInput {
  name: string;
  description: string;
  sku: string;
  url: string;
  images: string[];
  brand?: string | null;
  price?: number;
  currency?: string;
  availability: "InStock" | "OutOfStock" | "PreOrder";
  condition?: "NewCondition" | "RefurbishedCondition" | "UsedCondition";
  category?: string;
  ratingValue?: number;
  reviewCount?: number;
}

export function productJsonLd(p: ProductJsonLdInput) {
  const offers: Record<string, unknown> = {
    "@type": "Offer",
    url: p.url,
    availability: `https://schema.org/${p.availability}`,
    itemCondition: `https://schema.org/${p.condition ?? "NewCondition"}`,
    priceCurrency: p.currency ?? "USD",
    seller: { "@type": "Organization", name: SITE_NAME },
  };
  if (typeof p.price === "number" && p.price > 0) {
    offers.price = p.price.toFixed(2);
  }

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    sku: p.sku,
    image: p.images,
    url: p.url,
    offers,
  };

  if (p.brand) {
    data.brand = { "@type": "Brand", name: p.brand };
  }
  if (p.category) {
    data.category = p.category;
  }
  if (typeof p.ratingValue === "number" && typeof p.reviewCount === "number" && p.reviewCount > 0) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: p.ratingValue.toFixed(1),
      reviewCount: p.reviewCount,
    };
  }

  return data;
}

export function itemListJsonLd(
  items: Array<{ name: string; url: string; image?: string }>,
  listName: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    itemListElement: items.map((it, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: it.url,
      name: it.name,
      ...(it.image ? { image: it.image } : {}),
    })),
  };
}
