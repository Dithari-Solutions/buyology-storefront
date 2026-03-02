"use client";

import { useTranslation } from "react-i18next";

export default function MarqueeStrip() {
    const { t } = useTranslation("home");
    const items = t("marquee.items", { returnObjects: true }) as string[];

    return (
        <div className="w-full overflow-hidden py-3 mt-4" style={{ backgroundColor: "#402F75" }}>
            <style>{`
                @keyframes marquee-scroll {
                    0%   { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .marquee-inner {
                    display: flex;
                    width: max-content;
                    animation: marquee-scroll 35s linear infinite;
                }
                .marquee-inner:hover {
                    animation-play-state: paused;
                }
            `}</style>
            <div className="marquee-inner">
                {[...items, ...items].map((item, i) => (
                    <span
                        key={i}
                        className="flex items-center gap-2 text-white text-xs sm:text-sm font-medium whitespace-nowrap px-6 sm:px-10"
                    >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="#FBBB14" className="flex-shrink-0">
                            <polygon points="5,0 6.5,3.5 10,3.8 7.5,6.2 8.3,10 5,8.2 1.7,10 2.5,6.2 0,3.8 3.5,3.5" />
                        </svg>
                        {item}
                    </span>
                ))}
            </div>
        </div>
    );
}
