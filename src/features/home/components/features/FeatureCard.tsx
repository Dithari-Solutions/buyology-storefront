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

interface ServiceTheme {
    gradient: string;
    orb1: string;
    orb2: string;
    icon: React.ReactNode;
}

// Each service gets a DESIGNED background, not a flat color:
//  - a vertical 3-stop gradient that goes bright at the TOP -> DEEP at the bottom,
//    so the bottom-pinned white text always sits on a dark band (legible) while
//    the top stays vivid;
//  - two soft colored glow orbs in CONTRASTING hues, kept in the TOP region so the
//    card reads multi-color without washing out the text;
//  - a faint dot texture + a light bottom scrim as insurance.
const SERVICE: Record<string, ServiceTheme> = {
    rent: {
        gradient: "linear-gradient(165deg, #7c3aed 0%, #5b21b6 45%, #2e1065 100%)",
        orb1: "#f0abfc", orb2: "#60a5fa",
        icon: (<svg {...iconProps}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01" /></svg>),
    },
    repair: {
        gradient: "linear-gradient(165deg, #06b6d4 0%, #0369a1 45%, #0b2a47 100%)",
        orb1: "#5eead4", orb2: "#a78bfa",
        icon: (<svg {...iconProps}><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.7 2.7-2-2 2.7-2.7z" /></svg>),
    },
    brandNew: {
        gradient: "linear-gradient(165deg, #f59e0b 0%, #b45309 45%, #4a1d05 100%)",
        orb1: "#fde047", orb2: "#fb7185",
        icon: (<svg {...iconProps}><path d="M12 2.5l2.4 6.1L21 9l-5 4 1.6 6.5L12 16l-5.6 3.5L8 13 3 9l6.6-.4z" /></svg>),
    },
    refurbished: {
        gradient: "linear-gradient(165deg, #10b981 0%, #047857 45%, #04341f 100%)",
        orb1: "#6ee7b7", orb2: "#38bdf8",
        icon: (<svg {...iconProps}><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" /></svg>),
    },
    sell: {
        gradient: "linear-gradient(165deg, #fb7185 0%, #be123c 45%, #4c0f20 100%)",
        orb1: "#fda4af", orb2: "#c084fc",
        icon: (<svg {...iconProps}><path d="M20.6 13.4 12 22l-9-9V3h10l8.6 8.6a2 2 0 0 1 0 2.8z" /><circle cx="7.5" cy="7.5" r="1.3" /></svg>),
    },
    games: {
        gradient: "linear-gradient(165deg, #a855f7 0%, #7c3aed 45%, #3b1078 100%)",
        orb1: "#f0abfc", orb2: "#818cf8",
        icon: (<svg {...iconProps}><rect x="2" y="7" width="20" height="10" rx="5" /><path d="M7 12h2M8 11v2M15 11h.01M18 13h.01" /></svg>),
    },
    default: {
        gradient: "linear-gradient(165deg, #6d28d9 0%, #402F75 45%, #211641 100%)",
        orb1: "#c4b5fd", orb2: "#818cf8",
        icon: (<svg {...iconProps}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>),
    },
};

const DOT_TEXTURE = "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1.4px)";
const SCRIM = "linear-gradient(to top, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.10) 50%, transparent 82%)";

export default function FeatureCard({ id, title, description, variant = "normal", href, cta = "Learn more" }: FeatureCardProps) {
    const s = SERVICE[id] ?? SERVICE.default;
    const isHero = variant === "hero";
    const roomy = variant === "hero" || variant === "tall";

    const inner = (
        <>
            {/* Designed background layers — colored orbs live in the TOP region */}
            <div className="pointer-events-none absolute -top-8 -end-4 w-48 h-48 rounded-full blur-2xl" style={{ backgroundColor: s.orb1, opacity: 0.5 }} />
            <div className="pointer-events-none absolute -top-6 -start-10 w-44 h-44 rounded-full blur-2xl" style={{ backgroundColor: s.orb2, opacity: 0.42 }} />
            <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: DOT_TEXTURE, backgroundSize: "16px 16px" }} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5" style={{ background: SCRIM }} />

            {/* Top row: glassy icon + corner arrow */}
            <div className="relative z-10 flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-110">
                    {s.icon}
                </div>
                <span className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white transition-all duration-300 group-hover:bg-white group-hover:text-gray-900 group-hover:rotate-45">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 17 17 7M9 7h8v8" />
                    </svg>
                </span>
            </div>

            {/* Content pinned to the bottom so cards of any height stay tidy */}
            <div className="relative z-10 mt-auto pt-6">
                <h3 className={`font-bold text-white leading-tight mb-1.5 tracking-tight ${isHero ? "text-[22px] md:text-[28px]" : "text-[18px] md:text-[20px]"}`}>
                    {title}
                </h3>
                <p className={`text-white/90 leading-relaxed ${roomy ? "text-[13px] md:text-[14px] line-clamp-3" : "text-[12px] md:text-[13px] line-clamp-2"}`}>
                    {description}
                </p>
                <div className="flex items-center gap-1.5 mt-4 text-[12px] font-semibold text-white">
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

    // radius <= seam (gap-2 = 8px) so interior junctions don't show curved voids;
    // non-displacing hover (brightness) keeps the mosaic contiguous.
    const className =
        "group relative flex flex-col overflow-hidden rounded-lg p-5 md:p-6 w-full h-full min-h-[180px] transition-[filter] duration-300 hover:brightness-110";

    return href ? (
        <Link href={href} className={`${className} cursor-pointer`} style={{ background: s.gradient }}>{inner}</Link>
    ) : (
        <div className={className} style={{ background: s.gradient }}>{inner}</div>
    );
}
