import type { Metadata } from "next";
import { buildPageMetadata } from "./buildMetadata";
import { getSafeLang } from "./config";
import { STATIC_PAGE_META, type StaticPageKey } from "./staticPageMeta";

interface Options {
  /** Canonical route name (matches PATH_SLUGS key), null for home, "__raw" for non-localized suffix routes. */
  canonical: string | null | "__raw";
  /** Optional path suffix appended after the canonical localized base. */
  suffix?: string;
  /** Disable indexing (used for private pages like checkout / profile / orders). */
  noindex?: boolean;
}

export function makeStaticMetadata(
  pageKey: StaticPageKey,
  options: Options,
) {
  return async function generateMetadata({
    params,
  }: {
    params: Promise<{ lang: string }>;
  }): Promise<Metadata> {
    const { lang: rawLang } = await params;
    const lang = getSafeLang(rawLang);
    const meta = STATIC_PAGE_META[pageKey][lang];
    return buildPageMetadata({
      lang,
      canonical: options.canonical,
      suffix: options.suffix,
      title: meta.title,
      description: meta.description,
      keywords: meta.keywords,
      noindex: options.noindex,
    });
  };
}
