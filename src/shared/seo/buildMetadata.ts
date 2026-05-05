import type { Metadata } from "next";
import type { Lang } from "@/config/pathSlugs";
import {
  DEFAULT_OG_IMAGE,
  LOCALE_MAP,
  SITE_NAME,
  SITE_URL,
  SUPPORTED_LANGS,
  buildAlternates,
  localizedPath,
} from "./config";

export interface PageMetaInput {
  lang: Lang;
  /** Canonical route name from PATH_SLUGS, or null for home, or "__raw" for raw suffix-only paths. */
  canonical: string | null | "__raw";
  /** Optional sub-path appended to localized base (e.g. "/apply" or "/[slug]"). */
  suffix?: string;
  title: string;
  description: string;
  keywords?: string[];
  /** Override OG image (absolute URL). */
  image?: string;
  /** Override OG type (default: "website"). */
  type?: "website" | "article" | "product" | "profile";
  /** Disallow indexing. */
  noindex?: boolean;
  /** Extra OG fields (e.g. price for products). */
  extraOpenGraph?: Record<string, unknown>;
}

export function buildPageMetadata(input: PageMetaInput): Metadata {
  const {
    lang,
    canonical,
    suffix = "",
    title,
    description,
    keywords,
    image = DEFAULT_OG_IMAGE,
    type = "website",
    noindex = false,
    extraOpenGraph,
  } = input;

  const path =
    canonical === "__raw"
      ? `/${lang}${suffix}`
      : canonical === null
      ? `/${lang}`
      : localizedPath(canonical, lang, suffix);

  const url = `${SITE_URL}${path}`;

  const alternateLanguages =
    canonical === "__raw"
      ? Object.fromEntries(
          SUPPORTED_LANGS.map((l) => [l, `${SITE_URL}/${l}${suffix}`])
        )
      : buildAlternates(canonical, suffix);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
      languages: alternateLanguages,
    },
    openGraph: {
      type: type === "product" ? "website" : type,
      url,
      siteName: SITE_NAME,
      title,
      description,
      locale: LOCALE_MAP[lang],
      alternateLocale: SUPPORTED_LANGS.filter((l) => l !== lang).map(
        (l) => LOCALE_MAP[l]
      ),
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...extraOpenGraph,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      site: "@buyology",
      creator: "@buyology",
    },
    robots: noindex
      ? { index: false, follow: false, nocache: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}
