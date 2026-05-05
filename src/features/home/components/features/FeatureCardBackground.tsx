import React from "react";

interface ThemeConfig {
    gradient: string;
    glow: string;
    accent: string;
}

const THEMES: Record<string, ThemeConfig> = {
    rent: {
        gradient: "linear-gradient(135deg, #1d1145 0%, #3b2278 45%, #5a2da6 100%)",
        glow: "radial-gradient(circle at 30% 20%, rgba(251,187,20,0.30), transparent 55%), radial-gradient(circle at 80% 80%, rgba(108,79,192,0.45), transparent 60%)",
        accent: "#FBBB14",
    },
    repair: {
        gradient: "linear-gradient(135deg, #1a0f3c 0%, #2f1d6d 50%, #4632a3 100%)",
        glow: "radial-gradient(circle at 75% 30%, rgba(251,187,20,0.22), transparent 50%), radial-gradient(circle at 20% 90%, rgba(64,47,117,0.55), transparent 55%)",
        accent: "#FBBB14",
    },
    brandNew: {
        gradient: "linear-gradient(135deg, #2a0f5e 0%, #4527a0 50%, #6b3fc7 100%)",
        glow: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.20), transparent 45%), radial-gradient(circle at 90% 90%, rgba(251,187,20,0.30), transparent 60%)",
        accent: "#FBBB14",
    },
    refurbished: {
        gradient: "linear-gradient(135deg, #14253d 0%, #1f3b6b 45%, #2f5cab 100%)",
        glow: "radial-gradient(circle at 20% 30%, rgba(110,200,150,0.25), transparent 55%), radial-gradient(circle at 90% 80%, rgba(64,47,117,0.45), transparent 60%)",
        accent: "#6ec896",
    },
    sell: {
        gradient: "linear-gradient(135deg, #1a0f3c 0%, #3a1f78 50%, #5e2eb0 100%)",
        glow: "radial-gradient(circle at 90% 20%, rgba(251,187,20,0.30), transparent 55%), radial-gradient(circle at 10% 80%, rgba(108,79,192,0.45), transparent 60%)",
        accent: "#FBBB14",
    },
    games: {
        gradient: "linear-gradient(135deg, #200b4a 0%, #4a1f8f 45%, #8d3fff 100%)",
        glow: "radial-gradient(circle at 50% 50%, rgba(251,187,20,0.30), transparent 50%), radial-gradient(circle at 10% 10%, rgba(141,63,255,0.55), transparent 55%)",
        accent: "#FBBB14",
    },
};

const FALLBACK: ThemeConfig = THEMES.sell;

export default function FeatureCardBackground({ id }: { id: string }) {
    const theme = THEMES[id] ?? FALLBACK;

    return (
        <div className="absolute inset-0 pointer-events-none">
            {/* Base gradient */}
            <div className="absolute inset-0" style={{ background: theme.gradient }} />

            {/* Color glows */}
            <div className="absolute inset-0" style={{ background: theme.glow }} />

            {/* Thematic SVG pattern */}
            <svg
                className="absolute inset-0 w-full h-full opacity-70 mix-blend-screen"
                viewBox="0 0 400 300"
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
            >
                <defs>
                    <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={theme.accent} stopOpacity="0.6" />
                        <stop offset="100%" stopColor={theme.accent} stopOpacity="0" />
                    </linearGradient>
                    <radialGradient id={`spot-${id}`} cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={theme.accent} stopOpacity="0.25" />
                        <stop offset="100%" stopColor={theme.accent} stopOpacity="0" />
                    </radialGradient>
                    <pattern id={`dots-${id}`} x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1" fill="#ffffff" fillOpacity="0.18" />
                    </pattern>
                </defs>

                <rect width="400" height="300" fill={`url(#dots-${id})`} />

                {id === "rent" && (
                    <>
                        <circle cx="320" cy="60" r="80" fill={`url(#spot-${id})`} />
                        <path d="M40 250 L120 180 L200 230 L280 160 L380 220" stroke={theme.accent} strokeWidth="1.5" strokeOpacity="0.45" fill="none" />
                        <rect x="60" y="60" width="40" height="40" rx="6" stroke={theme.accent} strokeOpacity="0.4" fill="none" strokeWidth="1.2" />
                        <rect x="110" y="40" width="30" height="30" rx="4" stroke={theme.accent} strokeOpacity="0.3" fill="none" strokeWidth="1.2" />
                    </>
                )}

                {id === "repair" && (
                    <>
                        <circle cx="80" cy="220" r="90" fill={`url(#spot-${id})`} />
                        <g stroke={theme.accent} strokeWidth="1.4" strokeOpacity="0.5" fill="none">
                            <path d="M280 80 l30 30 l-15 15 l-30 -30 z" />
                            <circle cx="295" cy="65" r="14" />
                            <path d="M260 140 l40 40" strokeLinecap="round" />
                            <circle cx="320" cy="180" r="6" />
                            <circle cx="350" cy="220" r="4" />
                        </g>
                    </>
                )}

                {id === "brandNew" && (
                    <>
                        <circle cx="200" cy="120" r="120" fill={`url(#spot-${id})`} />
                        <g fill={theme.accent} fillOpacity="0.55">
                            <path d="M80 60 l4 14 l14 4 l-14 4 l-4 14 l-4 -14 l-14 -4 l14 -4 z" />
                            <path d="M320 200 l3 10 l10 3 l-10 3 l-3 10 l-3 -10 l-10 -3 l10 -3 z" />
                            <path d="M260 70 l2 7 l7 2 l-7 2 l-2 7 l-2 -7 l-7 -2 l7 -2 z" />
                            <path d="M120 230 l2 7 l7 2 l-7 2 l-2 7 l-2 -7 l-7 -2 l7 -2 z" />
                        </g>
                    </>
                )}

                {id === "refurbished" && (
                    <>
                        <circle cx="350" cy="80" r="110" fill={`url(#spot-${id})`} />
                        <g stroke={theme.accent} strokeOpacity="0.55" strokeWidth="1.5" fill="none" strokeLinecap="round">
                            <path d="M70 150 a40 40 0 1 0 60 -28" />
                            <path d="M125 110 l10 12 l-12 10" />
                            <path d="M70 150 a40 40 0 1 1 -10 24" />
                        </g>
                    </>
                )}

                {id === "sell" && (
                    <>
                        <circle cx="60" cy="60" r="80" fill={`url(#spot-${id})`} />
                        <circle cx="340" cy="240" r="80" fill={`url(#spot-${id})`} />
                        <g stroke={theme.accent} strokeOpacity="0.45" strokeWidth="1.4" fill="none">
                            <path d="M180 200 l30 -50 l30 50 z" />
                            <path d="M210 110 v40" strokeLinecap="round" />
                            <path d="M195 130 l15 -20 l15 20" />
                            <circle cx="120" cy="260" r="4" fill={theme.accent} fillOpacity="0.5" />
                            <circle cx="290" cy="80" r="3" fill={theme.accent} fillOpacity="0.5" />
                        </g>
                    </>
                )}

                {id === "games" && (
                    <>
                        <circle cx="200" cy="150" r="140" fill={`url(#spot-${id})`} />
                        <g stroke={theme.accent} strokeOpacity="0.55" strokeWidth="1.5" fill="none" strokeLinecap="round">
                            <rect x="120" y="110" width="160" height="80" rx="35" />
                            <line x1="150" y1="140" x2="170" y2="140" />
                            <line x1="160" y1="130" x2="160" y2="150" />
                            <circle cx="240" cy="140" r="5" fill={theme.accent} fillOpacity="0.6" />
                            <circle cx="260" cy="160" r="5" fill={theme.accent} fillOpacity="0.4" />
                        </g>
                        <g fill={theme.accent} fillOpacity="0.6">
                            <path d="M70 50 l3 9 l9 3 l-9 3 l-3 9 l-3 -9 l-9 -3 l9 -3 z" />
                            <path d="M340 230 l2 7 l7 2 l-7 2 l-2 7 l-2 -7 l-7 -2 l7 -2 z" />
                        </g>
                    </>
                )}
            </svg>
        </div>
    );
}
