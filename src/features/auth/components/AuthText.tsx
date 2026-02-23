"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import BuyIcon from "@/assets/icons/buy.png";
import ToolIcon from "@/assets/icons/tool.png";
import HeartIcon from "@/assets/icons/heart.png";
import CalendarIcon from "@/assets/icons/calendar.png";
import ArrowLeftIcon from "@/assets/icons/Arrow-left.png";

export default function AuthText() {
    const { t } = useTranslation("auth");

    const features = [
        { icon: BuyIcon,      alt: "Cart",     label: t("buyNewHead"),     desc: t("buyNewDesc") },
        { icon: HeartIcon,    alt: "Heart",    label: t("secondHandHead"), desc: t("secondHandDesc") },
        { icon: CalendarIcon, alt: "Calendar", label: t("rentHead"),       desc: t("rentDesc") },
        { icon: ToolIcon,     alt: "Tool",     label: t("repairHead"),     desc: t("repairDesc") },
    ];

    const [headStart, headHighlight] = t("authHead").split(",");

    return (
        <div className="h-full flex flex-col justify-center pe-0 lg:pe-8 xl:pe-12">

            {/* Heading */}
            <h1 className="text-white text-[30px] sm:text-[36px] lg:text-[42px] xl:text-[48px] font-bold leading-[1.15] mb-4">
                {headStart},{" "}
                <span className="text-[#FBBB14]">{headHighlight?.trim()}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-white/70 mb-8 text-[14px] sm:text-[15px] leading-relaxed max-w-[400px]">
                {t("desc")}
            </p>

            {/* Feature grid */}
            <div className="grid grid-cols-2 gap-3 mb-10">
                {features.map(({ icon, alt, label, desc }) => (
                    <div
                        key={alt}
                        className="flex items-start gap-3 bg-white/10 rounded-[16px] p-4 border border-white/10"
                    >
                        <div className="flex-shrink-0 w-9 h-9 rounded-[10px] bg-[#FBBB14]/20 flex items-center justify-center">
                            <Image src={icon} alt={alt} className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-white font-semibold text-[13px] leading-tight">{label}</p>
                            <p className="text-white/55 text-[11px] mt-[2px] leading-snug">{desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Back Button */}
            <Link href="/">
                <div className="inline-flex items-center gap-3 bg-white/15 hover:bg-white/20 border border-white/20 py-[10px] px-5 rounded-full cursor-pointer transition-all duration-200 w-fit">
                    <Image src={ArrowLeftIcon} alt="Arrow Left" className="w-4 h-4" />
                    <span className="text-[13px] font-medium text-white">{t("backToWebsite")}</span>
                </div>
            </Link>
        </div>
    );
}
