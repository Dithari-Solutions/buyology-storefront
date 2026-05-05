import type { MetadataRoute } from "next";
import { SITE_URL } from "@/shared/seo/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/*/auth",
          "/*/auth/*",
          "/*/signin",
          "/*/checkout",
          "/*/checkout/*",
          "/*/cart",
          "/*/profile",
          "/*/profile/*",
          "/*/orders",
          "/*/orders/*",
          "/*/favourites",
          "/*/payment/*",
          "/*/unsubscribe",
          "/*/become-a-supplier/step-*",
          "/*/become-a-supplier/submitted",
          "/*/b2b/apply",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/*/checkout/*", "/*/profile/*", "/*/orders/*"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
