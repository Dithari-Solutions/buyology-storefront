// features/auth/layout.tsx
import { ReactNode } from "react";
import LoginText from "@/features/auth/components/login/LoginText";

interface AuthLayoutProps {
    children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Left side: LoginText */}
            <div className="hidden md:flex md:w-1/2 bg-gray-100 items-center justify-center p-12">
                <LoginText />
            </div>

            {/* Right side: Form */}
            <div className="flex w-full md:w-1/2 items-center justify-center p-8">
                {children}
            </div>
        </div>
    );
}
