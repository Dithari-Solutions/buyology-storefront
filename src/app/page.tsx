
import SocialButtons from "@/features/auth/components/SocialButtons";
import Stories from "@/features/home/components/Stories";
import Header from "@/shared/components/Header";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Stories/>
      </main>
    </>
  );
}
