import type { Metadata } from "next";
import Image from "next/image";
import LangSync from "@/shared/components/LangSync";
import AuthBgVector from "@/assets/vectors/auth-bg-vector.png";
import { SITE_META, getSafeLang } from "@/shared/seo/config";
import { buildPageMetadata } from "@/shared/seo/buildMetadata";

type Lang = "en" | "az" | "ar";

const validLangs: Lang[] = ["en", "az", "ar"];

export function generateStaticParams() {
  return validLangs.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const safe = getSafeLang(lang);
  const meta = SITE_META[safe];
  return buildPageMetadata({
    lang: safe,
    canonical: null,
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
  });
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const resolvedLang: Lang = validLangs.includes(lang as Lang)
    ? (lang as Lang)
    : "en";

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: "#F7F7F7" }}>

      {/* ─── Fixed background accent — covers Header, main and Footer ─── */}
      <div className="fixed inset-0 pointer-events-none select-none z-0" aria-hidden="true">

        {/* Bottom-left accent */}
        <Image
          src={AuthBgVector}
          alt=""
          aria-hidden="true"
          priority
          sizes="(max-width: 640px) 320px, (max-width: 768px) 440px, (max-width: 1024px) 580px, 660px"
          className="absolute bottom-0 left-0 w-[320px] sm:w-[440px] md:w-[580px] lg:w-[660px] h-auto"
          style={{ opacity: 0.45, mixBlendMode: "multiply" }}
        />

        {/* Top-right accent — mirrored */}
        <Image
          src={AuthBgVector}
          alt=""
          aria-hidden="true"
          sizes="(max-width: 640px) 320px, (max-width: 768px) 440px, (max-width: 1024px) 580px, 660px"
          className="absolute top-0 right-0 w-[320px] sm:w-[440px] md:w-[580px] lg:w-[660px] h-auto"
          style={{ opacity: 0.4, mixBlendMode: "multiply", transform: "rotate(180deg)" }}
        />
      </div>

      {/* Page content — stacks above the fixed background */}
      <div className="relative z-10">
        <LangSync lang={resolvedLang} />
        {children}
      </div>
    </div>
  );
}
