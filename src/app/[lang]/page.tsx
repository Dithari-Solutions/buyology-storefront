import dynamic from "next/dynamic";
import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import ScrollReveal from "@/shared/components/ScrollReveal";
import { makeStaticMetadata } from "@/shared/seo/staticMeta";
import { getSafeLang } from "@/shared/seo/config";
import { JsonLd, faqJsonLd } from "@/shared/seo/JsonLd";
import HomeSeoContent from "@/features/home/components/HomeSeoContent";
import { HOME_SEO_COPY } from "@/features/home/data/homeSeoCopy";

// `titleAbsolute` — the home title already ends in "| Buyology", so the root
// layout's "%s | Buyology" template would otherwise print the brand twice.
export const generateMetadata = makeStaticMetadata("home", {
  canonical: null,
  titleAbsolute: true,
});
import Banner from "@/features/home/components/Banner";
import Stories from "@/features/story/components/Stories";
import MarqueeStrip from "@/features/home/components/MarqueeStrip";
import PopularCategories from "@/features/home/components/PopularCategories";
import HomeProductBlock from "@/features/home/components/HomeProductBlock";

// Below-the-fold sections — code-split out of the initial hydration bundle.
// Each placeholder reserves vertical space so the layout doesn't shift when
// the chunk arrives.
const skel = (h: string) => (
  <div className={`w-[95%] md:w-[90%] ${h} rounded-2xl bg-gray-100 animate-pulse my-3 md:my-4`} />
);

const QuickDeliveryBanner = dynamic(
  () => import("@/features/home/components/QuickDeliveryBanner"),
  { loading: () => skel("h-[180px] md:h-[220px]") }
);
const B2BRegionBanner = dynamic(
  () => import("@/features/home/components/B2BRegionBanner"),
  { loading: () => null }
);
const Features = dynamic(
  () => import("@/features/home/components/features/Features"),
  { loading: () => skel("h-[880px] sm:h-[720px] lg:h-[400px] xl:h-[470px]") }
);
const TrustStats = dynamic(
  () => import("@/features/home/components/TrustStats"),
  { loading: () => skel("h-[180px] md:h-[220px]") }
);
const Newsletter = dynamic(
  () => import("@/features/home/components/Newsletter"),
  { loading: () => skel("h-[260px] md:h-[300px]") }
);

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const lang = getSafeLang((await params).lang);

  return (
    <>
      <JsonLd data={faqJsonLd(HOME_SEO_COPY[lang].faq)} />
      <Header />
      <main className="flex flex-col items-center justify-center pb-10 md:pb-16">
        <Stories />
        {/* Hero is the LCP element — render it directly (no opacity-gated reveal
            wrapper, which would defer the largest paint until hydration). */}
        <div className="w-full flex justify-center">
          <Banner />
        </div>
        <ScrollReveal className="w-full" delay={0.05}>
          <MarqueeStrip />
        </ScrollReveal>
        <ScrollReveal className="w-full flex justify-center" delay={0.1}>
          <PopularCategories />
        </ScrollReveal>
        <ScrollReveal className="w-full flex justify-center" delay={0.1}>
          <QuickDeliveryBanner />
        </ScrollReveal>
        {/* Renders only in B2B-enabled regions; otherwise returns null. */}
        <ScrollReveal className="w-full flex justify-center" delay={0.1}>
          <B2BRegionBanner />
        </ScrollReveal>
        {/* Product sections are gated on store availability for the visitor's
            region — hidden until a served region is confirmed. */}
        <HomeProductBlock />
        <ScrollReveal className="w-full flex justify-center" delay={0.05}>
          <Features />
        </ScrollReveal>
        <ScrollReveal className="w-full flex justify-center" delay={0.1}>
          <TrustStats />
        </ScrollReveal>
        <ScrollReveal className="w-full flex justify-center" delay={0.1}>
          <Newsletter />
        </ScrollReveal>
        {/* Server-rendered prose + FAQ. Deliberately outside ScrollReveal (which
            is opacity-gated on hydration) so the text is in the raw HTML. */}
        <HomeSeoContent lang={lang} />
      </main>
      <Footer />
    </>
  );
}
