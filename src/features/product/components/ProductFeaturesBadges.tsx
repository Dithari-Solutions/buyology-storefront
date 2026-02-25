const FEATURES = [
    {
        label: "Free Delivery",
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
                <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                <line x1="12" y1="12" x2="12" y2="12.01" strokeWidth="2" />
            </svg>
        ),
    },
    {
        label: "2 Year Warranty",
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l-7 4v5c0 5.55 3.84 10.74 7 12 3.16-1.26 7-6.45 7-12V6l-7-4z" />
                <polyline points="9 12 11 14 15 10" />
            </svg>
        ),
    },
    {
        label: "Ships in 2-3 Days",
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="1" />
                <path d="M16 8h4l3 5v3h-7V8z" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
        ),
    },
];

export default function ProductFeaturesBadges() {
    return (
        <div className="grid grid-cols-3 gap-4">
            {FEATURES.map((feature) => (
                <div key={feature.label} className="flex flex-col items-center gap-2 text-center">
                    <div className="w-12 h-12 rounded-full bg-[#EDE9FF] flex items-center justify-center">
                        {feature.icon}
                    </div>
                    <span className="text-xs text-gray-600 font-medium leading-snug">{feature.label}</span>
                </div>
            ))}
        </div>
    );
}
