import Image from "next/image"
import AppleLogo from "@/assets/icons/AppleLogo.png"
import GoogleLogo from "@/assets/icons/GoogleLogo.png"
import SnapChatLogo from "@/assets/icons/SnapChatLogo.png"
import FaceBookLogo from "@/assets/icons/FaceBookLogo.png"

const socials = [
    { src: GoogleLogo,   alt: "Google",   label: "Google" },
    { src: AppleLogo,    alt: "Apple",    label: "Apple" },
    { src: FaceBookLogo, alt: "Facebook", label: "Facebook" },
    { src: SnapChatLogo, alt: "Snapchat", label: "Snapchat" },
];

export default function SocialButtons() {
    return (
        <div className="grid grid-cols-2 gap-[10px] w-full">
            {socials.map(({ src, alt, label }) => (
                <button
                    key={alt}
                    type="button"
                    className="flex items-center justify-center gap-[8px] border border-gray-200 rounded-[12px] py-[10px] px-[12px] bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-150 cursor-pointer"
                >
                    <Image src={src} alt={alt} width={18} height={18} className="flex-shrink-0" />
                    <span className="text-[13px] font-medium text-gray-700">{label}</span>
                </button>
            ))}
        </div>
    );
}
