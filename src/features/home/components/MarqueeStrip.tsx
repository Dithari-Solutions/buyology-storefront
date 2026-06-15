"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { selectPreferredCurrency } from "@/features/country/store/countrySlice";
import { convertAmount } from "@/features/currency/services/currency.api";

// Free-shipping threshold is defined in AED on the backend (100 AED).
const FREE_SHIPPING_AED = 100;

export default function MarqueeStrip() {
    const { t } = useTranslation("home");
    const currency = (useSelector((s: RootState) => selectPreferredCurrency(s)) as string) || "AED";
    const code = (currency || "AED").toUpperCase();

    // Convert 100 AED into the shopper's detected currency. We stash the result
    // tagged with the currency it was fetched for, so the label derives cleanly
    // (no synchronous state writes in the effect) and falls back to AED.
    const [conv, setConv] = useState<{ code: string; value: number } | null>(null);
    useEffect(() => {
        if (code === "AED") return;
        let active = true;
        convertAmount(FREE_SHIPPING_AED, "AED", code).then((v) => {
            if (active && v != null) setConv({ code, value: v });
        });
        return () => { active = false; };
    }, [code]);

    const thresholdLabel = code !== "AED" && conv?.code === code
        ? `${Math.round(conv.value)} ${code}`
        : `${FREE_SHIPPING_AED} AED`;

    const itemsRaw = t("marquee.items", { returnObjects: true });
    const staticItems: string[] = Array.isArray(itemsRaw) ? itemsRaw : [];
    const items: string[] = [t("marquee.freeShipping", { amount: thresholdLabel }), ...staticItems];

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
