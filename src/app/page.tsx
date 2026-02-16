import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import macPro13 from "@/assets/devices/macPro13.png";
import Banner from "@/features/home/components/Banner";
import Stories from "@/features/home/components/Stories";
import Features from "@/features/home/components/features/Features";
import SuperDeals from "@/features/home/components/superDeals/SuperDeals";
import LimitedStock from "@/features/home/components/limitedStock/LimitedStock";

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
      <main className="flex flex-col items-center justify-center bg-[#F7F7F7]">
        <Stories />
        <Banner />
        <LimitedStock />
        <Features />
        <SuperDeals deals={superDeals} />
      </main>
      <Footer />
    </>
  );
}
