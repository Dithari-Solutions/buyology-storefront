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

  // Build the imageSrcSet for the Next image optimizer so the preload picks
  // the right mobile size. Without this, the browser preloads the raw 851px
  // PNG on mobile (waste of LCP budget).
  const escapedSrc = encodeURIComponent(AuthBgVector.src);
  const preloadSrcSet = [384, 640, 750, 828, 1080]
    .map((w) => `/_next/image?url=${escapedSrc}&w=${w}&q=75 ${w}w`)
    .join(", ");

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: "#F7F7F7" }}>
      {/* CRITICAL: Preload the LCP image in <head> so the browser starts the
          fetch before React boots. This shaves ~200–400 ms off mobile LCP on
          slow connections versus relying on the <Image priority> hint alone. */}
      <link
        rel="preload"
        as="image"
        href={AuthBgVector.src}
        imageSrcSet={preloadSrcSet}
        imageSizes="(max-width: 640px) 320px, (max-width: 768px) 440px, (max-width: 1024px) 580px, 660px"
        fetchPriority="high"
      />

      {/* ─── Fixed background accent — covers Header, main and Footer ─── */}
      <div className="fixed inset-0 pointer-events-none select-none z-0" aria-hidden="true">

        {/* Full-bleed brand gradient — fills the whole canvas edge to edge
            (lavender → white → warm gold), so every page reads as designed, not blank. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #E9E2FF 0%, #F3EFFF 26%, #FBFAFF 50%, #FFF7E4 80%, #FFEDC8 100%)",
          }}
        />

        {/* Bottom-left accent */}
        <Image
          src={AuthBgVector}
          alt=""
          aria-hidden="true"
          priority
          fetchPriority="high"
          sizes="(max-width: 640px) 320px, (max-width: 768px) 440px, (max-width: 1024px) 580px, 660px"
          className="absolute bottom-0 left-0 w-[72vw] max-w-[920px] h-auto"
          style={{ opacity: 0.45, mixBlendMode: "multiply", aspectRatio: "851 / 575" }}
        />

        {/* Top-right accent — mirrored */}
        <Image
          src={AuthBgVector}
          alt=""
          aria-hidden="true"
          priority
          sizes="(max-width: 640px) 320px, (max-width: 768px) 440px, (max-width: 1024px) 580px, 660px"
          className="absolute top-0 right-0 w-[72vw] max-w-[920px] h-auto"
          style={{ opacity: 0.42, mixBlendMode: "multiply", transform: "rotate(180deg)", aspectRatio: "851 / 575" }}
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
