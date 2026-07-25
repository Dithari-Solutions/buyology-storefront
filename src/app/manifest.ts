import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/shared/seo/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Buy, Rent, Repair and Sell`,
    short_name: SITE_NAME,
    description:
      "Shop brand new and refurbished devices. Buy, rent, repair and sell products in one click, with free shipping and fast delivery.",
    // Locale-prefixed so launching the installed app doesn't pay for the
    // "/" → "/en" middleware redirect on every cold start.
    start_url: "/en",
    display: "standalone",
    background_color: "#F7F7F7",
    theme_color: "#ffffff",
    orientation: "portrait",
    categories: ["shopping", "business", "lifestyle"],
    // Square derivatives of the logo. The previous entries pointed at
    // /logo.png — a 209×44 wordmark declared as 192×192 and 512×512, which
    // installs a stretched icon.
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
