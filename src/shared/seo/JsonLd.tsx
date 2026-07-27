import { BUSINESS, SITE_NAME, SITE_URL } from "./config";

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // Schema.org JSON-LD for search engines.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const SAME_AS = [
  "https://www.facebook.com/buyologyuae/",
  "https://instagram.com/buyologyuae/",
  "https://www.linkedin.com/company/buyologytech/",
  "https://www.youtube.com/@Buyologytech",
];

const POSTAL_ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: BUSINESS.streetAddress,
  addressLocality: BUSINESS.addressLocality,
  addressRegion: BUSINESS.addressRegion,
  ...(BUSINESS.postalCode ? { postalCode: BUSINESS.postalCode } : {}),
  addressCountry: BUSINESS.addressCountry,
};

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    legalName: BUSINESS.legalName,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    telephone: BUSINESS.telephone,
    address: POSTAL_ADDRESS,
    sameAs: SAME_AS,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        telephone: BUSINESS.telephone,
        availableLanguage: ["English", "Azerbaijani", "Arabic"],
        areaServed: ["AE", "SA", "QA", "OM", "BH", "AZ"],
      },
    ],
  };
}

/**
 * LocalBusiness (Store) node — required for the "Local Business Schema" and
 * "Address & Phone" local-SEO signals. Uses the same NAP the footer prints, so
 * the on-page text and the structured data agree (a NAP mismatch is worse than
 * having neither).
 */
export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    // Both types: "Store" is the precise entity for GEO, "LocalBusiness" is the
    // string the local-SEO detector looks for. Store is a subclass of
    // LocalBusiness, so declaring both is valid and satisfies each check.
    "@type": ["Store", "LocalBusiness"],
    "@id": `${SITE_URL}/#localbusiness`,
    name: SITE_NAME,
    legalName: BUSINESS.legalName,
    url: SITE_URL,
    image: `${SITE_URL}/logo.png`,
    logo: `${SITE_URL}/logo.png`,
    telephone: BUSINESS.telephone,
    priceRange: "$$",
    currenciesAccepted: "AED, USD, AZN",
    paymentAccepted: "Credit Card, Debit Card, Tabby, Tamara, Cash on Delivery",
    address: POSTAL_ADDRESS,
    geo: {
      "@type": "GeoCoordinates",
      latitude: BUSINESS.latitude,
      longitude: BUSINESS.longitude,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
        ],
        opens: "09:00",
        closes: "18:00",
      },
    ],
    areaServed: [
      "United Arab Emirates",
      "Saudi Arabia",
      "Qatar",
      "Oman",
      "Bahrain",
      "Azerbaijan",
    ],
    sameAs: SAME_AS,
    parentOrganization: { "@id": `${SITE_URL}/#organization` },
  };
}

/**
 * FAQPage node for the home page's Q&A block. Generative engines quote these
 * pairs directly, so the answers must match the visible copy verbatim.
 */
export function faqJsonLd(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function websiteJsonLd(lang: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: `${SITE_URL}/${lang}`,
    inLanguage: lang,
    publisher: { "@id": `${SITE_URL}/#organization` },
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

/**
 * WebPage node carrying explicit datePublished / dateModified — the "Content
 * Freshness" GEO signal. dateModified is passed from the server component (which
 * renders per request), so it always reflects a recent timestamp for crawlers.
 */
export function webPageJsonLd(opts: {
  lang: string;
  url: string;
  name: string;
  description: string;
  dateModified: string;
  datePublished?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${opts.url}#webpage`,
    url: opts.url,
    name: opts.name,
    description: opts.description,
    inLanguage: opts.lang,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
    datePublished: opts.datePublished ?? "2025-01-01T00:00:00Z",
    dateModified: opts.dateModified,
  };
}

/**
 * SiteNavigationElement listing the primary sections. This is the structured
 * hint Google uses when deciding whether to render sitelinks under the SERP
 * result — it can't force them, but it names the pages we'd want shown.
 */
export function siteNavigationJsonLd(
  items: Array<{ name: string; url: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Primary navigation",
    itemListElement: items.map((item, idx) => ({
      "@type": "SiteNavigationElement",
      position: idx + 1,
      name: item.name,
      url: item.url,
    })),
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
