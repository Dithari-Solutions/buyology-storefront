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
    title: "Buyology — Buy, Rent, Repair and Sell Online",
    titleTemplate: "%s | Buyology",
    description:
      "Buyology is the all-in-one e-commerce platform to buy, rent, repair and sell electronics, gadgets and lifestyle products. Fast delivery, verified sellers, secure checkout.",
    keywords: [
      "buyology",
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
      "super deals",
      "B2B marketplace",
      "quick delivery",
    ],
    tagline: "Buy, Rent, Repair and Sell — all in one place.",
  },
  az: {
    title: "Buyology — Onlayn Al, İcarəyə Götür, Təmir Et və Sat",
    titleTemplate: "%s | Buyology",
    description:
      "Buyology — elektronika, qadcetlər və məişət məhsullarını almaq, icarəyə götürmək, təmir etdirmək və satmaq üçün hər şey bir yerdə platforma. Sürətli çatdırılma, etibarlı satıcılar, təhlükəsiz ödəniş.",
    keywords: [
      "buyology",
      "onlayn alış-veriş",
      "elektronika",
      "telefon almaq",
      "noutbuk almaq",
      "icarə",
      "təmir",
      "sat",
      "B2B",
      "tez çatdırılma",
      "Azərbaycan",
    ],
    tagline: "Al, icarəyə götür, təmir et və sat — hamısı bir yerdə.",
  },
  ar: {
    title: "Buyology — اشترِ واستأجر وأصلح وبع عبر الإنترنت",
    titleTemplate: "%s | Buyology",
    description:
      "Buyology هي منصة التجارة الإلكترونية الشاملة لشراء واستئجار وإصلاح وبيع الإلكترونيات والأجهزة ومنتجات نمط الحياة. توصيل سريع، بائعون موثوقون، دفع آمن.",
    keywords: [
      "بيولوجي",
      "تسوق إلكتروني",
      "متجر إلكتروني",
      "شراء إلكترونيات",
      "إيجار",
      "إصلاح",
      "بيع",
      "سوق",
      "هواتف",
      "أجهزة",
      "B2B",
      "توصيل سريع",
    ],
    tagline: "اشترِ واستأجر وأصلح وبع — كل ذلك في مكان واحد.",
  },
};

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
