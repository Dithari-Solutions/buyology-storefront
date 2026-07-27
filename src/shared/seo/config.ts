import type { Lang } from "@/config/pathSlugs";
import { PATH_SLUGS } from "@/config/pathSlugs";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://buyology.online";

export const SITE_NAME = "Buyology";

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;

export const SUPPORTED_LANGS: Lang[] = ["en", "az", "ar"];

export const LOCALE_MAP: Record<Lang, string> = {
  en: "en_US",
  az: "az_AZ",
  ar: "ar_AE",
};

export const SITE_META: Record<
  Lang,
  {
    title: string;
    titleTemplate: string;
    description: string;
    keywords: string[];
    tagline: string;
  }
> = {
  en: {
    title: "Shop New & Refurbished Devices — Rent, Repair | Buyology",
    titleTemplate: "%s | Buyology",
    description:
      "Shop brand new and refurbished devices — phones, laptops, gadgets. Buy, rent, repair or sell now, with free shipping, fast delivery and new arrivals weekly.",
    keywords: [
      "buyology",
      "refurbished devices",
      "brand new devices",
      "new arrivals",
      "free shipping",
      "online shopping",
      "ecommerce",
      "buy electronics",
      "rent electronics",
      "repair service",
      "sell online",
      "marketplace",
      "smartphones",
      "laptops",
      "gadgets",
      "flash sale",
      "super deals",
      "B2B marketplace",
      "quick delivery",
    ],
    tagline: "Buy, Rent, Repair and Sell — all in one place.",
  },
  az: {
    title: "Yeni və Refurbished Cihazlar — İcarə, Təmir | Buyology",
    titleTemplate: "%s | Buyology",
    description:
      "Yeni və refurbished cihazlar — telefon, noutbuk, qadcet. İndi al, icarəyə götür, təmir et və ya sat: pulsuz çatdırılma və hər həftə yeni məhsullar.",
    keywords: [
      "buyology",
      "refurbished cihazlar",
      "yeni məhsullar",
      "pulsuz çatdırılma",
      "onlayn alış-veriş",
      "elektronika",
      "telefon almaq",
      "noutbuk almaq",
      "icarə",
      "təmir",
      "sat",
      "endirim",
      "B2B",
      "tez çatdırılma",
      "Azərbaycan",
    ],
    tagline: "Al, icarəyə götür, təmir et və sat — hamısı bir yerdə.",
  },
  ar: {
    title: "أجهزة جديدة ومجددة — شراء وإيجار وإصلاح | Buyology",
    titleTemplate: "%s | Buyology",
    description:
      "تسوق أجهزة جديدة ومجددة — هواتف ولابتوب وإكسسوارات. اشترِ أو استأجر أو أصلح أو بع الآن مع شحن مجاني وتوصيل سريع ووصول منتجات جديدة أسبوعياً.",
    keywords: [
      "بيولوجي",
      "أجهزة مجددة",
      "أجهزة جديدة",
      "شحن مجاني",
      "تسوق إلكتروني",
      "متجر إلكتروني",
      "شراء إلكترونيات",
      "إيجار",
      "إصلاح",
      "بيع",
      "سوق",
      "هواتف",
      "أجهزة",
      "تخفيضات",
      "B2B",
      "توصيل سريع",
    ],
    tagline: "اشترِ واستأجر وأصلح وبع — كل ذلك في مكان واحد.",
  },
};

/**
 * Public business identity — surfaced in the footer (NAP: name/address/phone)
 * and in LocalBusiness / Organization JSON-LD. Overridable via env so a staging
 * deploy can point at non-production contact details.
 *
 * IMPORTANT: these values MUST match the connected Google Business Profile
 * exactly. Google cross-references the on-page NAP against the verified profile;
 * any divergence (name, address, or phone) is a negative local-SEO signal. The
 * defaults below mirror the "Buyology Factory Outlet" GBP (Sharjah).
 */
export const BUSINESS = {
  /** GBP listing name — used for the footer heading + LocalBusiness `name`. */
  name: process.env.NEXT_PUBLIC_BUSINESS_NAME || "Buyology Factory Outlet",
  legalName: process.env.NEXT_PUBLIC_BUSINESS_NAME || "Buyology Factory Outlet",
  streetAddress:
    process.env.NEXT_PUBLIC_BUSINESS_STREET || "Industrial Area 17, Industrial Area",
  addressLocality: process.env.NEXT_PUBLIC_BUSINESS_CITY || "Sharjah",
  addressRegion: process.env.NEXT_PUBLIC_BUSINESS_REGION || "Sharjah",
  postalCode: process.env.NEXT_PUBLIC_BUSINESS_POSTAL_CODE || "",
  addressCountry: process.env.NEXT_PUBLIC_BUSINESS_COUNTRY || "AE",
  /** Display form used in the footer + schema `telephone`. */
  telephone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || "+971 52 708 5203",
  email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "support.ae@buyology.com",
  /** Approximate coordinates of Industrial Area 17, Sharjah (authoritative
   *  locator is the Google Place ID below, surfaced as LocalBusiness `hasMap`). */
  latitude: 25.301,
  longitude: 55.445,
  openingHours: "Mo-Fr 09:00-18:00",
  /** Google Business Profile linkage. */
  googlePlaceId: "ChIJo9WfKO9fXz4R9AcqCSYu7v4",
  googleMapsUrl:
    "https://www.google.com/maps/place/?q=place_id:ChIJo9WfKO9fXz4R9AcqCSYu7v4",
} as const;

/** `tel:` href form — digits and a leading + only. */
export const BUSINESS_TEL_HREF = `tel:${BUSINESS.telephone.replace(/[^+\d]/g, "")}`;

/** Single-line postal address, e.g. "Industrial Area 17, ..., Sharjah, AE". */
export const BUSINESS_ADDRESS_LINE = [
  BUSINESS.streetAddress,
  BUSINESS.addressLocality,
  BUSINESS.postalCode,
  BUSINESS.addressCountry,
]
  .filter(Boolean)
  .join(", ");

/**
 * Build a localized URL path for a canonical route name.
 * e.g. localizedPath("shop", "az") → "/az/magaza"
 */
export function localizedPath(canonical: string, lang: Lang, suffix = ""): string {
  const slug = PATH_SLUGS[canonical]?.[lang] ?? canonical;
  const base = slug ? `/${lang}/${slug}` : `/${lang}`;
  return suffix ? `${base}${suffix.startsWith("/") ? suffix : `/${suffix}`}` : base;
}

/**
 * Build absolute canonical + hreflang alternate map for a route.
 */
export function buildAlternates(canonical: string | null, suffix = "") {
  const languages: Record<string, string> = {};
  for (const l of SUPPORTED_LANGS) {
    const path = canonical === null ? `/${l}${suffix}` : localizedPath(canonical, l, suffix);
    languages[l] = `${SITE_URL}${path}`;
  }
  languages["x-default"] = languages["en"];
  return languages;
}

export function absoluteUrl(path: string): string {
  if (!path) return SITE_URL;
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getSafeLang(value: string | null | undefined): Lang {
  if (value === "az" || value === "ar" || value === "en") return value;
  return "en";
}
