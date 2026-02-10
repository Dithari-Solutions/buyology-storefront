import LoginText from "@/features/auth/components/login/LoginText";
import SocialButtons from "@/features/auth/components/SocialButtons";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <LoginText />
      <SocialButtons/>
    </>
  );
}
