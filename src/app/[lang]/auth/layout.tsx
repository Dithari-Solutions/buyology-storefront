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
            <div className="mb-[30px] sm:mb-[20px] flex justify-center lg:justify-start">
                <Image 
                    src={Logo} 
                    alt="Buyology" 
                    className="w-[160px] sm:w-[180px] md:w-[190px] lg:w-[200px]" 
                />
            </div>

            {/* Main Content: AuthText (desktop only) + Form */}
            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 w-full items-start justify-center z-[10]">

                {/* Left side: AuthText (hidden on mobile) */}
                <div className="hidden lg:flex w-full justify-start">
                    <AuthText />
                </div>

                {/* Right side: Form */}
                <div className="w-full lg:min-w-[520px] lg:max-w-[560px] flex justify-center items-center">
                    {children}
                </div>
            </div>

            {/* Background vector — fixed so it never moves when form expands */}
            <div className="fixed right-0 bottom-0 z-[0] pointer-events-none">
                <Image src={AuthVector} alt="vector" />
            </div>
        </div>
    );
}
