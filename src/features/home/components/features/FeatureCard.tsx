import Image, { type StaticImageData } from "next/image";
import Link from "next/link";

interface FeatureCardProps {
    id: string;
    title: string;
    href?: string;
    image?: StaticImageData | string;
    sizes?: string;
    objectPosition?: string;
}

const iconProps = {
    width: 28,
    height: 28,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
};

// Services without product photography get a calm, light illustrated card that
// sits as a quiet sibling beside the photo cards (distinct on-brand tint each).
const ILLUSTRATION: Record<string, { tint: string; fg: string; icon: React.ReactNode }> = {
    rent: {
        tint: "#EDE9FF", fg: "#5b21b6",
        icon: (<svg {...iconProps}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01" /></svg>),
    },
    sell: {
        tint: "#FFE9EF", fg: "#be123c",
        icon: (<svg {...iconProps}><path d="M20.6 13.4 12 22l-9-9V3h10l8.6 8.6a2 2 0 0 1 0 2.8z" /><circle cx="7.5" cy="7.5" r="1.4" /></svg>),
    },
    games: {
        tint: "#E3F1F4", fg: "#0e7490",
        icon: (<svg {...iconProps}><rect x="2" y="7" width="20" height="10" rx="5" /><path d="M7 12h2M8 11v2M15 11h.01M18 13h.01" /></svg>),
    },
    default: {
        tint: "#EDE9FF", fg: "#402F75",
        icon: (<svg {...iconProps}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>),
    },
};

export default function FeatureCard({ id, title, href, image, sizes, objectPosition }: FeatureCardProps) {
    const ill = ILLUSTRATION[id] ?? ILLUSTRATION.default;

    const inner = (
        <>
            <div className="relative aspect-[4/5] rounded-[20px] overflow-hidden ring-1 ring-black/[0.05] bg-[#F4F2FB]">
                {image ? (
                    <>
                        <Image
                            src={image}
                            alt={title}
                            fill
                            placeholder={typeof image === "string" ? "empty" : "blur"}
                            sizes={sizes ?? "(min-width:1024px) 16vw, (min-width:640px) 31vw, 46vw"}
                            style={objectPosition ? { objectPosition } : undefined}
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                        />
                        {/* Subtle light scrim keeps darker photos in step with the light row */}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/25 via-transparent to-transparent" />
                    </>
                ) : (
                    <>
                        <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${ill.tint} 0%, #FBFAFF 68%, #FFFFFF 100%)` }} />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div
                                className="w-14 h-14 rounded-2xl bg-white/85 ring-1 ring-black/[0.05] shadow-[0_6px_18px_-10px_rgba(64,47,117,0.4)] flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
                                style={{ color: ill.fg }}
                            >
                                {ill.icon}
                            </div>
                        </div>
                    </>
                )}

                {/* Corner arrow */}
                <span aria-hidden="true" className="absolute top-3 end-3 w-9 h-9 rounded-full bg-white/90 ring-1 ring-black/5 backdrop-blur-sm flex items-center justify-center text-gray-700 shadow-[0_2px_10px_rgba(16,12,40,0.12)] transition-all duration-300 group-hover:bg-white group-hover:scale-105">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" focusable="false" className="rtl:-scale-x-100">
                        <path d="M7 17 17 7M9 7h8v8" />
                    </svg>
                </span>
            </div>

            <p className="mt-3 text-center text-[13px] sm:text-[14px] font-medium text-gray-500 group-hover:text-gray-900 transition-colors">
                {title}
            </p>
        </>
    );

    const cls = "group block w-full rounded-[22px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#402F75] focus-visible:ring-offset-2";

    return href ? (
        <Link href={href} className={cls}>{inner}</Link>
    ) : (
        <div className={cls}>{inner}</div>
    );
}
