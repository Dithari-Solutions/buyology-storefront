import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import ScrollReveal from "@/shared/components/ScrollReveal";
import macPro13 from "@/assets/devices/macPro13.png";
import Banner from "@/features/home/components/Banner";
import Stories from "@/features/story/components/Stories";
import Features from "@/features/home/components/features/Features";
import SuperDeals from "@/features/home/components/superDeals/SuperDeals";
import LimitedStock from "@/features/home/components/limitedStock/LimitedStock";
import MarqueeStrip from "@/features/home/components/MarqueeStrip";
import PopularCategories from "@/features/home/components/PopularCategories";
import TrustStats from "@/features/home/components/TrustStats";
import Newsletter from "@/features/home/components/Newsletter";

const superDeals = [
  {
    name: "Hp ZBook Firefly 14 G8",
    image: macPro13,
    specs: ["16 GB RAM", "4 GB Graphics", "14 inch display", "512 GB SSD", "Windows 11 pro"],
    price: 290,
    originalPrice: 350,
    discountPercent: 30,
  },
  {
    name: "MacBook Pro 13 M1",
    image: macPro13,
    specs: ["8 GB RAM", "Apple M1 Chip", "13 inch Retina", "256 GB SSD", "macOS"],
    price: 799,
    originalPrice: 999,
    discountPercent: 20,
  },
  {
    name: "Dell XPS 15 9520",
    image: macPro13,
    specs: ["16 GB RAM", "4 GB Graphics", "15.6 inch OLED", "512 GB SSD", "Windows 11"],
    price: 950,
    originalPrice: 1200,
    discountPercent: 21,
  },
  {
    name: "Lenovo ThinkPad X1",
    image: macPro13,
    specs: ["16 GB RAM", "Iris Xe Graphics", "14 inch 2K", "512 GB SSD", "Windows 11 pro"],
    price: 680,
    originalPrice: 850,
    discountPercent: 20,
  },
];

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
          <LimitedStock />
        </ScrollReveal>
        <ScrollReveal className="w-full flex justify-center" delay={0.1}>
          <TrustStats />
        </ScrollReveal>
        <ScrollReveal className="w-full flex justify-center" delay={0.1}>
          <Features />
        </ScrollReveal>
        <ScrollReveal className="w-full flex justify-center" delay={0.1}>
          <SuperDeals deals={superDeals} />
        </ScrollReveal>
        <ScrollReveal className="w-full flex justify-center" delay={0.1}>
          <Newsletter />
        </ScrollReveal>
      </main>
      <Footer />
    </>
  );
}
