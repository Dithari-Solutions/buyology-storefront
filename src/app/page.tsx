
import SocialButtons from "@/features/auth/components/SocialButtons";
import Banner from "@/features/home/components/Banner";
import Stories from "@/features/home/components/Stories";
import Header from "@/shared/components/Header";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex flex-col items-center justify-center">
        <Stories />
        <Banner />
      </main>
    </>
  );
}
