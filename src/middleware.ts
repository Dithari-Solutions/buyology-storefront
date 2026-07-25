import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SLUG_TO_CANONICAL, type Lang } from "@/config/pathSlugs";

const locales = ["en", "az", "ar"] as const;
const defaultLocale = "en";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    // Preserve the query string (e.g. ?token=...) across the locale redirect.
    // 308 (permanent) rather than the default 307: the locale prefix is a fixed
    // property of the URL space, so browsers and crawlers may cache the hop
    // instead of paying for it on every visit. PageSpeed flagged this chain as
    // ~1.25 s of the mobile load ("Avoid multiple page redirects").
    return NextResponse.redirect(
      new URL(`/${defaultLocale}${pathname}${search}`, request.url),
      308
    );
  }

  const segments = pathname.split("/");
  const lang = segments[1] as Lang;
  const pathSegment = segments[2];

  // Rewrite localized slug to canonical route name
  // e.g. /az/magaza/... → /az/shop/...
  if (pathSegment && SLUG_TO_CANONICAL[lang]?.[pathSegment]) {
    const canonical = SLUG_TO_CANONICAL[lang][pathSegment];
    segments[2] = canonical;
    const rewrittenPath = segments.join("/");
    // Preserve the query string on rewrites too.
    const response = NextResponse.rewrite(new URL(`${rewrittenPath}${search}`, request.url));
    response.headers.set("x-lang", lang);
    return response;
  }

  const response = NextResponse.next();
  response.headers.set("x-lang", lang);
  return response;
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|locales|.*\\..*).*)"],
};
