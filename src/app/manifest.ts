import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/shared/seo/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Buy, Rent, Repair and Sell`,
    short_name: SITE_NAME,
    description:
      "All-in-one e-commerce platform to buy, rent, repair and sell products in one click.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F7F7",
    theme_color: "#ffffff",
    orientation: "portrait",
    categories: ["shopping", "business", "lifestyle"],
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
