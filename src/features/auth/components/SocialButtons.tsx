"use client";

import Image from "next/image"
import AppleLogo from "@/assets/icons/AppleLogo.png"
import GoogleLogo from "@/assets/icons/GoogleLogo.png"
import SnapChatLogo from "@/assets/icons/SnapChatLogo.png"
import FaceBookLogo from "@/assets/icons/FaceBookLogo.png"
import { useAppleSignin } from "@/shared/hooks/useAppleSignin"
import { useSocialSignin } from "@/shared/hooks/useSocialSignin"

type Provider = "google" | "apple" | "facebook" | "snapchat";

const socials: { src: typeof GoogleLogo; alt: string; label: string; provider: Provider }[] = [
    { src: GoogleLogo,   alt: "Google",   label: "Google",   provider: "google" },
    { src: AppleLogo,    alt: "Apple",    label: "Apple",    provider: "apple" },
    { src: FaceBookLogo, alt: "Facebook", label: "Facebook", provider: "facebook" },
    { src: SnapChatLogo, alt: "Snapchat", label: "Snapchat", provider: "snapchat" },
];

export default function SocialButtons({ onError }: { onError?: (msg: string | null) => void }) {
    const { handleAppleSignin } = useAppleSignin();
    const { handleGoogleSignin, handleFacebookSignin, handleSnapchatSignin } = useSocialSignin();

    const runners: Record<Provider, () => Promise<void>> = {
        google: handleGoogleSignin,
        apple: handleAppleSignin,
        facebook: handleFacebookSignin,
        snapchat: handleSnapchatSignin,
    };

    const handleClick = async (provider: Provider) => {
        if (onError) onError(null);
        try {
            await runners[provider]();
        } catch (err) {
            const message = err instanceof Error ? err.message : `${provider} Sign In failed`;
            if (onError) onError(message);
        }
    };

    return (
        <div className="grid grid-cols-2 gap-[10px] w-full">
            {socials.map(({ src, alt, label, provider }) => (
                <button
                    key={alt}
                    type="button"
                    onClick={() => handleClick(provider)}
                    className="flex items-center justify-center gap-[8px] border border-gray-200 rounded-[12px] py-[10px] px-[12px] bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-150 cursor-pointer"
                >
                    <Image src={src} alt={alt} width={18} height={18} className="flex-shrink-0" />
                    <span className="text-[13px] font-medium text-gray-700">{label}</span>
                </button>
            ))}
        </div>
    );
}
