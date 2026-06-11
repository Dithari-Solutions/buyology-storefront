"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useSelector } from "react-redux";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";

interface GuestPromptProps {
    icon: ReactNode;
    title: string;
    subtitle: string;
    signInLabel?: string;
    createAccountLabel?: string;
}

/**
 * Shared "you're not signed in" panel with Sign in + Create account buttons. Used on the
 * cart, profile (and favourites) pages when there's no authenticated user.
 */
export default function GuestPrompt({
    icon,
    title,
    subtitle,
    signInLabel = "Sign in",
    createAccountLabel = "Create account",
}: GuestPromptProps) {
    const lang = useSelector((state: { language: { lang: Lang } }) => state.language.lang);
    const authSlug = PATH_SLUGS["auth"]?.[lang] ?? "auth";

    return (
        <div className="flex-1 flex items-center justify-center py-[60px] px-[20px]">
            <div className="relative bg-gradient-to-b from-white to-[#FAF9FF] rounded-[24px] shadow-sm border border-gray-100 max-w-[600px] w-full px-[40px] py-[48px] flex flex-col items-center text-center gap-[24px] overflow-hidden">
                {/* Soft brand glow */}
                <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-[260px] h-[260px] rounded-full bg-[#402F75]/[0.06] blur-3xl" />

                {/* Icon badge */}
                <div className="relative w-[84px] h-[84px] rounded-[24px] bg-white shadow-sm ring-1 ring-[#402F75]/10 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-[24px] bg-gradient-to-br from-[#EDE9FF] to-[#F6F4FF]" />
                    <div className="relative text-[#402F75]">{icon}</div>
                </div>

                {/* Title + subtitle */}
                <div className="relative flex flex-col gap-[10px]">
                    <h1 className="text-[22px] font-bold text-gray-900">{title}</h1>
                    <p className="text-[14px] text-gray-500 leading-relaxed max-w-[400px]">{subtitle}</p>
                </div>

                {/* Buttons */}
                <div className="relative flex items-center gap-[12px] flex-wrap justify-center">
                    <Link href={`/${lang}/${authSlug}`}>
                        <button className="flex items-center gap-[8px] bg-[#402F75] text-white rounded-[30px] px-[28px] py-[11px] text-[14px] font-bold hover:bg-[#352667] transition-colors cursor-pointer">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                <polyline points="10 17 15 12 10 7" />
                                <line x1="15" y1="12" x2="3" y2="12" />
                            </svg>
                            {signInLabel}
                        </button>
                    </Link>
                    <Link href={`/${lang}/${authSlug}?mode=register`}>
                        <button className="bg-[#FBBB14] text-[#402F75] rounded-[30px] px-[28px] py-[11px] text-[14px] font-bold hover:bg-[#f0b000] transition-colors cursor-pointer">
                            {createAccountLabel}
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
