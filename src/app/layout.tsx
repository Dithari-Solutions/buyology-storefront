import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { headers } from "next/headers";
import Providers from "@/shared/components/Providers";
import "./globals.css";
import AiBotButtonLazy from "@/shared/components/AiBotButtonLazy";
import {
  SITE_NAME,
  SITE_URL,
  SITE_META,
  DEFAULT_OG_IMAGE,
  LOCALE_MAP,
  SUPPORTED_LANGS,
  getSafeLang,
} from "@/shared/seo/config";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/shared/seo/JsonLd";

// Preconnect/dns-prefetch to the configured API host (not a hardcoded dev host),
// so prod points at the prod API. Falls back to dev only if the env var is unset.
const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-dev.dithari.com"
).replace(/\/$/, "");

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const lang = getSafeLang(headersList.get("x-lang"));
  const meta = SITE_META[lang];

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: meta.title,
      template: meta.titleTemplate,
    },
    description: meta.description,
    keywords: meta.keywords,
    applicationName: SITE_NAME,
    referrer: "origin-when-cross-origin",
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: {
      canonical: `${SITE_URL}/${lang}`,
      languages: Object.fromEntries([
        ...SUPPORTED_LANGS.map((l) => [l, `${SITE_URL}/${l}`] as const),
        ["x-default", `${SITE_URL}/en`] as const,
      ]),
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: meta.title,
      description: meta.description,
      url: `${SITE_URL}/${lang}`,
      locale: LOCALE_MAP[lang],
      alternateLocale: SUPPORTED_LANGS.filter((l) => l !== lang).map(
        (l) => LOCALE_MAP[l]
      ),
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: meta.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [DEFAULT_OG_IMAGE],
      site: "@buyology",
      creator: "@buyology",
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    icons: {
      icon: [
        { url: "/buyology-logo.png", type: "image/png" },
      ],
      shortcut: "/buyology-logo.png",
      apple: "/buyology-logo.png",
    },
    manifest: "/manifest.webmanifest",
    category: "shopping",
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
      other: process.env.NEXT_PUBLIC_BING_VERIFICATION
        ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION }
        : undefined,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const lang = getSafeLang(headersList.get("x-lang"));
  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <html lang={lang} dir={dir}>
      <head>
        <Script
          src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"
          strategy="lazyOnload"
        />
        <link rel="preconnect" href={API_ORIGIN} crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={API_ORIGIN} />
        <link rel="dns-prefetch" href="https://eu2.contabostorage.com" />
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd(lang)} />
      </head>
      <body className="antialiased bg-[#F7F7F7]">
        <Providers>{children}</Providers>
        <AiBotButtonLazy />
      </body>
    </html>
  );
}
