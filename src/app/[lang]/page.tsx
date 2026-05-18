import dynamic from "next/dynamic";
import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import ScrollReveal from "@/shared/components/ScrollReveal";
import { makeStaticMetadata } from "@/shared/seo/staticMeta";

export const generateMetadata = makeStaticMetadata("home", { canonical: null });
import Banner from "@/features/home/components/Banner";
import Stories from "@/features/story/components/Stories";
import MarqueeStrip from "@/features/home/components/MarqueeStrip";
import PopularCategories from "@/features/home/components/PopularCategories";

// Below-the-fold sections — code-split out of the initial hydration bundle.
// Keeping ssr: true preserves SEO; the route still streams them on the server,
// but the client-JS for each lives in its own chunk and hydrates lazily.
const QuickDeliveryBanner = dynamic(() => import("@/features/home/components/QuickDeliveryBanner"));
const LimitedStock = dynamic(() => import("@/features/home/components/limitedStock/LimitedStock"));
const SuperDeals = dynamic(() => import("@/features/home/components/superDeals/SuperDeals"));
const Features = dynamic(() => import("@/features/home/components/features/Features"));
const TrustStats = dynamic(() => import("@/features/home/components/TrustStats"));
const Newsletter = dynamic(() => import("@/features/home/components/Newsletter"));

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex flex-col items-center justify-center pb-10 md:pb-16">
        <Stories />
        <ScrollReveal className="w-full flex justify-center">
          <Banner />
        </ScrollReveal>
        <ScrollReveal className="w-full" delay={0.05}>
          <MarqueeStrip />
        </ScrollReveal>
        <ScrollReveal className="w-full flex justify-center" delay={0.1}>
          <PopularCategories />
        </ScrollReveal>
        <ScrollReveal className="w-full flex justify-center" delay={0.1}>
          <QuickDeliveryBanner />
        </ScrollReveal>
        <ScrollReveal className="w-full flex justify-center" delay={0.1}>
          <LimitedStock />
        </ScrollReveal>
        <ScrollReveal className="w-full flex justify-center" delay={0.1}>
          <SuperDeals />
        </ScrollReveal>
        <ScrollReveal className="w-full flex justify-center" delay={0.05}>
          <Features />
        </ScrollReveal>
        <ScrollReveal className="w-full flex justify-center" delay={0.1}>
          <TrustStats />
        </ScrollReveal>
        <ScrollReveal className="w-full flex justify-center" delay={0.1}>
          <Newsletter />
        </ScrollReveal>
      </main>
      <Footer />
    </>
  );
}
