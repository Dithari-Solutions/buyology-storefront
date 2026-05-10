import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import ScrollReveal from "@/shared/components/ScrollReveal";
import { makeStaticMetadata } from "@/shared/seo/staticMeta";

export const generateMetadata = makeStaticMetadata("home", { canonical: null });
import Banner from "@/features/home/components/Banner";
import Stories from "@/features/story/components/Stories";
import Features from "@/features/home/components/features/Features";
import SuperDeals from "@/features/home/components/superDeals/SuperDeals";
import LimitedStock from "@/features/home/components/limitedStock/LimitedStock";
import MarqueeStrip from "@/features/home/components/MarqueeStrip";
import PopularCategories from "@/features/home/components/PopularCategories";
import TrustStats from "@/features/home/components/TrustStats";
import Newsletter from "@/features/home/components/Newsletter";
import QuickDeliveryBanner from "@/features/home/components/QuickDeliveryBanner";

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
