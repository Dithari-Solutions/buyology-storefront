export default function BrandBackground() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0 }}
      >
        <defs>
          {/* Base gradient: lavender to golden cream */}
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EAE4FF" />
            <stop offset="30%" stopColor="#F2EEFF" />
            <stop offset="55%" stopColor="#FAFAFF" />
            <stop offset="80%" stopColor="#FFF6E0" />
            <stop offset="100%" stopColor="#FFE8A8" />
          </linearGradient>

          {/* Purple glow — top left */}
          <radialGradient id="g1" cx="8%" cy="12%" r="45%" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7B3AED" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#7B3AED" stopOpacity="0" />
          </radialGradient>

          {/* Purple glow — top right */}
          <radialGradient id="g2" cx="95%" cy="8%" r="38%" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4A2C9E" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#4A2C9E" stopOpacity="0" />
          </radialGradient>

          {/* Golden glow — bottom right */}
          <radialGradient id="g3" cx="92%" cy="88%" r="40%" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FBBB14" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#FBBB14" stopOpacity="0" />
          </radialGradient>

          {/* Golden glow — bottom left */}
          <radialGradient id="g4" cx="12%" cy="85%" r="32%" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F5A800" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#F5A800" stopOpacity="0" />
          </radialGradient>

          {/* Dot grid pattern */}
          <pattern id="dots" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
            <circle cx="18" cy="18" r="1.1" fill="#7C3AED" opacity="0.12" />
          </pattern>

          {/* Cross accent pattern */}
          <pattern id="crosses" x="0" y="0" width="72" height="72" patternUnits="userSpaceOnUse">
            <line x1="36" y1="32" x2="36" y2="40" stroke="#FBBB14" strokeWidth="1" opacity="0.08" />
            <line x1="32" y1="36" x2="40" y2="36" stroke="#FBBB14" strokeWidth="1" opacity="0.08" />
          </pattern>
        </defs>

        {/* === Base gradient layer === */}
        <rect width="1440" height="900" fill="url(#bgGrad)" />

        {/* === Glow orbs === */}
        <rect width="1440" height="900" fill="url(#g1)" />
        <rect width="1440" height="900" fill="url(#g2)" />
        <rect width="1440" height="900" fill="url(#g3)" />
        <rect width="1440" height="900" fill="url(#g4)" />

        {/* === Texture layers === */}
        <rect width="1440" height="900" fill="url(#dots)" />
        <rect width="1440" height="900" fill="url(#crosses)" />

        {/* === Large golden wavy strokes (brand signature) === */}
        <path
          d="M -80 0 C 120 50 20 220 140 350 C 260 480 80 580 160 720 C 240 860 380 880 320 1000"
          fill="none" stroke="#FBBB14" strokeWidth="80" strokeLinecap="round" opacity="0.17"
        />
        <path
          d="M 1540 80 C 1320 160 1380 320 1460 450 C 1540 580 1400 660 1460 820 C 1520 980 1640 900 1620 1000"
          fill="none" stroke="#FBBB14" strokeWidth="76" strokeLinecap="round" opacity="0.15"
        />
        <path
          d="M 350 1000 C 420 840 600 800 700 660 C 800 520 720 400 880 330"
          fill="none" stroke="#FBBB14" strokeWidth="58" strokeLinecap="round" opacity="0.12"
        />

        {/* === Decorative ring cluster — top right === */}
        <circle cx="1220" cy="75" r="58" fill="none" stroke="#402F75" strokeWidth="1.5" opacity="0.10" />
        <circle cx="1220" cy="75" r="42" fill="none" stroke="#FBBB14" strokeWidth="1" opacity="0.18" />
        <circle cx="1220" cy="75" r="26" fill="none" stroke="#7B3AED" strokeWidth="1" opacity="0.12" />
        <circle cx="1220" cy="75" r="5" fill="#FBBB14" opacity="0.4" />

        {/* === Decorative ring cluster — bottom left === */}
        <circle cx="140" cy="840" r="68" fill="none" stroke="#402F75" strokeWidth="1.5" opacity="0.09" />
        <circle cx="140" cy="840" r="50" fill="none" stroke="#FBBB14" strokeWidth="1" opacity="0.16" />
        <circle cx="140" cy="840" r="32" fill="none" stroke="#7B3AED" strokeWidth="1" opacity="0.10" />
        <circle cx="140" cy="840" r="6" fill="#7B3AED" opacity="0.3" />

        {/* === Small corner accents === */}
        <circle cx="48" cy="55" r="28" fill="none" stroke="#7B3AED" strokeWidth="1.5" opacity="0.12" />
        <circle cx="48" cy="55" r="14" fill="none" stroke="#FBBB14" strokeWidth="1" opacity="0.20" />
        <circle cx="48" cy="55" r="4" fill="#7B3AED" opacity="0.25" />

        <circle cx="1410" cy="440" r="35" fill="none" stroke="#FBBB14" strokeWidth="1.5" opacity="0.18" />
        <circle cx="1410" cy="440" r="18" fill="none" stroke="#402F75" strokeWidth="1" opacity="0.12" />
        <circle cx="1410" cy="440" r="4" fill="#FBBB14" opacity="0.35" />

        {/* === Hexagon accents === */}
        <polygon points="1080,35 1108,20 1136,35 1136,68 1108,83 1080,68"
          fill="none" stroke="#402F75" strokeWidth="1.5" opacity="0.09" />
        <polygon points="22,400 50,385 78,400 78,430 50,445 22,430"
          fill="none" stroke="#7B3AED" strokeWidth="1.5" opacity="0.10" />
        <polygon points="1320,855 1348,840 1376,855 1376,885 1348,900 1320,885"
          fill="none" stroke="#FBBB14" strokeWidth="1.5" opacity="0.14" />

        {/* === Circuit-style lines === */}
        <line x1="20" y1="200" x2="200" y2="200" stroke="#7B3AED" strokeWidth="1" opacity="0.07" />
        <line x1="200" y1="200" x2="200" y2="100" stroke="#7B3AED" strokeWidth="1" opacity="0.07" />
        <circle cx="200" cy="200" r="3" fill="#7B3AED" opacity="0.15" />

        <line x1="1420" y1="700" x2="1240" y2="700" stroke="#FBBB14" strokeWidth="1" opacity="0.09" />
        <line x1="1240" y1="700" x2="1240" y2="800" stroke="#FBBB14" strokeWidth="1" opacity="0.09" />
        <circle cx="1240" cy="700" r="3" fill="#FBBB14" opacity="0.18" />

        {/* === Scattered small dots for depth === */}
        <circle cx="300" cy="150" r="2.5" fill="#FBBB14" opacity="0.25" />
        <circle cx="780" cy="50" r="2" fill="#7B3AED" opacity="0.20" />
        <circle cx="1100" cy="800" r="2.5" fill="#FBBB14" opacity="0.22" />
        <circle cx="500" cy="850" r="2" fill="#7B3AED" opacity="0.18" />
        <circle cx="980" cy="120" r="2" fill="#402F75" opacity="0.16" />
      </svg>
    </div>
  );
}
