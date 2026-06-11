"use client";

import { useTranslation } from "react-i18next";

const DeliveryIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8h4l3 5v3h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
);
const WarrantyIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l-7 4v5c0 5.55 3.84 10.74 7 12 3.16-1.26 7-6.45 7-12V6l-7-4z" />
        <polyline points="9 12 11 14 15 10" />
    </svg>
);
const ShipIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

interface Props {
    /** From the product response — qualifies for free delivery (price ≥ 100-AED-equiv). */
    freeDelivery?: boolean | null;
    /** Delivery fee in the product's display currency when not free. */
    deliveryFee?: number | null;
    currency?: string | null;
}

export default function ProductFeaturesBadges({ freeDelivery, deliveryFee, currency }: Props) {
    const { t } = useTranslation("product");

    const charged = freeDelivery === false && deliveryFee != null && deliveryFee > 0;
    const feeText = `${Number(deliveryFee).toFixed(2)} ${currency ?? ""}`.trim();

    const features = [
        {
            label: charged
                ? t("features.delivery.feeLabel", { defaultValue: "Delivery" })
                : t("features.delivery.freeLabel", { defaultValue: "Free Delivery" }),
            sublabel: charged
                ? feeText
                : t("features.delivery.freeSub", { defaultValue: "On all orders" }),
            icon: DeliveryIcon,
        },
        {
            label: t("features.warranty.label", { defaultValue: "1-Year Warranty" }),
            sublabel: t("features.warranty.sub", { defaultValue: "Official coverage" }),
            icon: WarrantyIcon,
        },
        {
            label: t("features.ships.label", { defaultValue: "Ships in 2–3 Days" }),
            sublabel: t("features.ships.sub", { defaultValue: "Fast dispatch" }),
            icon: ShipIcon,
        },
    ];

    return (
        <div className="flex items-stretch rounded-2xl border border-gray-100 bg-gray-50 overflow-hidden divide-x divide-gray-100">
            {features.map((feature) => (
                <div
                    key={feature.label}
                    className="flex flex-1 flex-col items-center gap-2 px-3 py-4 text-center min-w-0"
                >
                    <div className="w-9 h-9 rounded-xl bg-[#EDE9FF] flex items-center justify-center flex-shrink-0">
                        {feature.icon}
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[12px] font-bold text-gray-800 leading-snug">{feature.label}</span>
                        <span className="text-[11px] text-gray-400 leading-snug">{feature.sublabel}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
