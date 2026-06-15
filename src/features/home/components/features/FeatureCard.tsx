import Link from "next/link";

interface FeatureCardProps {
    id: string;
    title: string;
    description: string;
    href?: string;
    cta?: string;
}

const iconProps = {
    width: 26,
    height: 26,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
};

// Per-service light accent + simple line icon (clean, professional — no busy gradients).
const SERVICE: Record<string, { bg: string; fg: string; icon: React.ReactNode }> = {
    rent: {
        bg: "#EDE9FF", fg: "#402F75",
        icon: (<svg {...iconProps}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01" /></svg>),
    },
    repair: {
        bg: "#E5F2FF", fg: "#1a6fa8",
        icon: (<svg {...iconProps}><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.7 2.7-2-2 2.7-2.7z" /></svg>),
    },
    brandNew: {
        bg: "#FFF6DD", fg: "#bd8400",
        icon: (<svg {...iconProps}><path d="M12 2.5l2.4 6.1L21 9l-5 4 1.6 6.5L12 16l-5.6 3.5L8 13 3 9l6.6-.4z" /></svg>),
    },
    refurbished: {
        bg: "#E6F8EF", fg: "#1f9d57",
        icon: (<svg {...iconProps}><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" /></svg>),
    },
    sell: {
        bg: "#FFEAEE", fg: "#dd3f5a",
        icon: (<svg {...iconProps}><path d="M20.6 13.4 12 22l-9-9V3h10l8.6 8.6a2 2 0 0 1 0 2.8z" /><circle cx="7.5" cy="7.5" r="1.3" /></svg>),
    },
    games: {
        bg: "#F4E8FF", fg: "#7c3aed",
        icon: (<svg {...iconProps}><rect x="2" y="7" width="20" height="10" rx="5" /><path d="M7 12h2M8 11v2M15 11h.01M18 13h.01" /></svg>),
    },
    default: {
        bg: "#EDE9FF", fg: "#402F75",
        icon: (<svg {...iconProps}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>),
    },
};

export default function FeatureCard({ id, title, description, href, cta = "Learn more" }: FeatureCardProps) {
    const s = SERVICE[id] ?? SERVICE.default;

    const inner = (
        <>
            <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: s.bg, color: s.fg }}
            >
                {s.icon}
            </div>

            <h3 className="text-[18px] md:text-[20px] font-bold text-gray-900 mb-2 group-hover:text-[#402F75] transition-colors">
                {title}
            </h3>
            <p className="text-[13px] md:text-[14px] text-gray-500 leading-relaxed line-clamp-2 flex-1">
                {description}
            </p>

            <div className="flex items-center gap-1.5 mt-5 text-[13px] font-semibold text-[#402F75]">
                <span>{cta}</span>
                <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    className="transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180"
                >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
            </div>
        </>
    );

    const className =
        "group relative flex flex-col h-full min-h-[190px] rounded-3xl bg-white border border-gray-100 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-[0_20px_50px_-20px_rgba(64,47,117,0.3)]";

    return href ? (
        <Link href={href} className={`${className} cursor-pointer`}>{inner}</Link>
    ) : (
        <div className={className}>{inner}</div>
    );
}
