const FEATURES = [
    {
        label: "Free Delivery",
        sublabel: "On all orders",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="1" />
                <path d="M16 8h4l3 5v3h-7V8z" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
        ),
    },
    {
        label: "2-Year Warranty",
        sublabel: "Official coverage",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l-7 4v5c0 5.55 3.84 10.74 7 12 3.16-1.26 7-6.45 7-12V6l-7-4z" />
                <polyline points="9 12 11 14 15 10" />
            </svg>
        ),
    },
    {
        label: "Ships in 2–3 Days",
        sublabel: "Fast dispatch",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>
        ),
    },
];

export default function ProductFeaturesBadges() {
    return (
        <div className="flex items-stretch rounded-2xl border border-gray-100 bg-gray-50 overflow-hidden divide-x divide-gray-100">
            {FEATURES.map((feature) => (
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
