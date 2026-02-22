import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import Providers from "@/shared/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type Lang = "en" | "az" | "ar";

const meta: Record<Lang, { title: string; description: string }> = {
  en: {
    title: "Buyology - E-commerce Platform",
    description: "Buy, Rent, Fix and Sell products in one place by one click.",
  },
  az: {
    title: "Buyology - E-ticarət Platforması",
    description: "Məhsulları bir kliklə al, icarəyə götür, təmir et və sat.",
  },
  ar: {
    title: "Buyology - منصة التجارة الإلكترونية",
    description: "اشترِ واستأجر وأصلح وبع المنتجات في مكان واحد بنقرة واحدة.",
  },
};

function getSafeLang(lang: string | null): Lang {
  if (lang === "az" || lang === "ar" || lang === "en") {
    return lang;
  }
  return "en";
}

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const headerLang = headersList.get("x-lang");

  const lang = getSafeLang(headerLang);

  return {
    title: meta[lang].title,
    description: meta[lang].description,
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#F7F7F7]`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}