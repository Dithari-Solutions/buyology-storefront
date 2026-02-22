import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SLUG_TO_CANONICAL, type Lang } from "@/config/pathSlugs";

const locales = ["en", "az", "ar"] as const;
const defaultLocale = "en";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    return NextResponse.redirect(
      new URL(`/${defaultLocale}${pathname}`, request.url)
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
    const response = NextResponse.rewrite(new URL(rewrittenPath, request.url));
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
