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

        {/* Animated aurora — drifting brand-colour orbs fill the canvas with depth and
            movement (stunning on first view) while staying behind the content. */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="bg-orb"
            style={{
              top: "-12%", left: "-8%",
              width: "clamp(420px, 48vw, 780px)", height: "clamp(420px, 48vw, 780px)",
              background: "radial-gradient(circle, rgba(64,47,117,0.40), transparent 68%)",
              animation: "bgOrbA 19s ease-in-out infinite",
            }}
          />
          <div
            className="bg-orb"
            style={{
              bottom: "-14%", right: "-6%",
              width: "clamp(380px, 44vw, 720px)", height: "clamp(380px, 44vw, 720px)",
              background: "radial-gradient(circle, rgba(251,187,20,0.38), transparent 68%)",
              animation: "bgOrbB 23s ease-in-out infinite",
            }}
          />
          <div
            className="bg-orb"
            style={{
              top: "24%", right: "16%",
              width: "clamp(320px, 38vw, 600px)", height: "clamp(320px, 38vw, 600px)",
              background: "radial-gradient(circle, rgba(91,74,156,0.30), transparent 70%)",
              animation: "bgOrbC 27s ease-in-out infinite",
            }}
          />
          <div
            className="bg-orb"
            style={{
              bottom: "16%", left: "10%",
              width: "clamp(300px, 34vw, 540px)", height: "clamp(300px, 34vw, 540px)",
              background: "radial-gradient(circle, rgba(251,187,20,0.24), transparent 70%)",
              animation: "bgOrbA 25s ease-in-out infinite reverse",
            }}
          />
        </div>

        {/* Bottom-left accent */}
        <Image
          src={AuthBgVector}
          alt=""
          aria-hidden="true"
          priority
          fetchPriority="high"
          sizes="(max-width: 640px) 320px, (max-width: 768px) 440px, (max-width: 1024px) 580px, 660px"
          className="absolute bottom-0 left-0 w-[68vw] max-w-[860px] h-auto"
          style={{ opacity: 0.3, mixBlendMode: "multiply", aspectRatio: "851 / 575" }}
        />

        {/* Top-right accent — mirrored */}
        <Image
          src={AuthBgVector}
          alt=""
          aria-hidden="true"
          priority
          sizes="(max-width: 640px) 320px, (max-width: 768px) 440px, (max-width: 1024px) 580px, 660px"
          className="absolute top-0 right-0 w-[68vw] max-w-[860px] h-auto"
          style={{ opacity: 0.28, mixBlendMode: "multiply", transform: "rotate(180deg)", aspectRatio: "851 / 575" }}
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
