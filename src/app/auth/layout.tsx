import Image from "next/image";
import { ReactNode } from "react";
import Logo from "@/../public/logo.png";
import { COLORS } from "@/shared/styles/variables";
import AuthText from "@/features/auth/components/AuthText";
import AuthVector from "@/assets/vectors/auth-bg-vector.png";

interface AuthLayoutProps {
    children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div 
            className="relative min-h-screen flex flex-col px-5 sm:px-10 md:px-16 lg:px-24 xl:px-32 py-8"
            style={{ backgroundColor: COLORS.primary }}
        >

            {/* Logo */}
            <div className="mb-[15px] sm:mb-[20px] flex justify-start">
                <Image src={Logo} alt="Buyology" className="w-[80px] sm:w-[120px] md:w-[150px] lg:w-[180px]" />
            </div>

            {/* Main Content: AuthText + Form */}
            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 w-full items-start justify-center z-[10]">

                {/* Left side: AuthText */}
                <div className="w-full flex justify-center lg:justify-start my-15 lg:mb-0">
                    <AuthText />
                </div>

                {/* Right side: Form */}
                <div className="w-full flex justify-center items-center">
                    {children}
                </div>
            </div>
            <div className="absolute right-0 bottom-0 z-[0]">
                <Image src={AuthVector} alt="vector" />
            </div>
        </div>
    );
}