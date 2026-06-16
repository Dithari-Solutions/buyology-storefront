import Link from "next/link";

interface FeatureCardProps {
    id: string;
    title: string;
    description: string;
    variant?: "hero" | "tall" | "wide" | "normal";
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

// Per-service rich gradient + simple white line icon. Colorful but refined —
// clean type on a deep gradient reads premium, not busy.
const SERVICE: Record<string, { gradient: string; icon: React.ReactNode }> = {
    rent: {
        gradient: "linear-gradient(145deg, #3b1d8a 0%, #5b21b6 50%, #7c3aed 100%)",
        icon: (<svg {...iconProps}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01" /></svg>),
    },
    repair: {
        gradient: "linear-gradient(145deg, #075985 0%, #0284c7 50%, #0ea5e9 100%)",
        icon: (<svg {...iconProps}><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.7 2.7-2-2 2.7-2.7z" /></svg>),
    },
    brandNew: {
        gradient: "linear-gradient(145deg, #92400e 0%, #d97706 50%, #f59e0b 100%)",
        icon: (<svg {...iconProps}><path d="M12 2.5l2.4 6.1L21 9l-5 4 1.6 6.5L12 16l-5.6 3.5L8 13 3 9l6.6-.4z" /></svg>),
    },
    refurbished: {
        gradient: "linear-gradient(145deg, #065f46 0%, #059669 50%, #10b981 100%)",
        icon: (<svg {...iconProps}><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" /></svg>),
    },
    sell: {
        gradient: "linear-gradient(145deg, #9f1239 0%, #e11d48 50%, #fb7185 100%)",
        icon: (<svg {...iconProps}><path d="M20.6 13.4 12 22l-9-9V3h10l8.6 8.6a2 2 0 0 1 0 2.8z" /><circle cx="7.5" cy="7.5" r="1.3" /></svg>),
    },
    games: {
        gradient: "linear-gradient(145deg, #5b21b6 0%, #7c3aed 50%, #a855f7 100%)",
        icon: (<svg {...iconProps}><rect x="2" y="7" width="20" height="10" rx="5" /><path d="M7 12h2M8 11v2M15 11h.01M18 13h.01" /></svg>),
    },
    default: {
        gradient: "linear-gradient(145deg, #312553 0%, #402F75 50%, #5d4a96 100%)",
        icon: (<svg {...iconProps}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>),
    },
};

export default function FeatureCard({ id, title, description, variant = "normal", href, cta = "Learn more" }: FeatureCardProps) {
    const s = SERVICE[id] ?? SERVICE.default;
    const isHero = variant === "hero";
    const roomy = variant === "hero" || variant === "tall";

    const inner = (
        <>
            {/* Soft depth glows */}
            <div className="pointer-events-none absolute -top-16 -end-14 w-52 h-52 rounded-full bg-white/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -start-14 w-52 h-52 rounded-full bg-black/15 blur-3xl" />

            {/* Top row: glassy icon + corner arrow */}
            <div className="relative flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-110">
                    {s.icon}
                </div>
                <span className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white transition-all duration-300 group-hover:bg-white group-hover:text-gray-900 group-hover:rotate-45">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 17 17 7M9 7h8v8" />
                    </svg>
                </span>
            </div>

            {/* Content pinned to the bottom so cards of any height stay tidy */}
            <div className="relative mt-auto pt-6">
                <h3 className={`font-bold text-white leading-tight mb-1.5 tracking-tight ${isHero ? "text-[22px] md:text-[28px]" : "text-[18px] md:text-[20px]"}`}>
                    {title}
                </h3>
                <p className={`text-white/75 leading-relaxed ${roomy ? "text-[13px] md:text-[14px] line-clamp-3" : "text-[12px] md:text-[13px] line-clamp-2"}`}>
                    {description}
                </p>
                <div className="flex items-center gap-1.5 mt-4 text-[12px] font-semibold text-white/95">
                    <span>{cta}</span>
                    <svg
                        width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        className="transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180"
                    >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </>
    );

    const className =
        "group relative flex flex-col overflow-hidden rounded-3xl p-5 md:p-6 w-full h-full min-h-[180px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_64px_-22px_rgba(64,47,117,0.6)]";

    return href ? (
        <Link href={href} className={`${className} cursor-pointer`} style={{ background: s.gradient }}>{inner}</Link>
    ) : (
        <div className={className} style={{ background: s.gradient }}>{inner}</div>
    );
}
