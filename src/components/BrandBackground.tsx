// Premium, fixed full-viewport backdrop for the whole site. A soft light base
// with a few large, low-opacity color orbs (purple / gold / rose) blended like a
// mesh gradient — colorful but refined, no busy patterns. Sits behind everything
// at z-index -1; pages render transparent on top of it.
export default function BrandBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
        background: [
          "radial-gradient(42vw 42vw at 6% 4%, rgba(124,58,237,0.16), transparent 60%)",
          "radial-gradient(40vw 40vw at 96% 2%, rgba(251,187,20,0.15), transparent 60%)",
          "radial-gradient(50vw 50vw at 94% 96%, rgba(244,114,182,0.13), transparent 62%)",
          "radial-gradient(46vw 46vw at 2% 98%, rgba(64,47,117,0.13), transparent 60%)",
          "radial-gradient(60vw 40vw at 50% 50%, rgba(99,102,241,0.05), transparent 70%)",
          "linear-gradient(160deg, #FBFAFF 0%, #F5F3FF 36%, #FDFBFF 64%, #FFF8EC 100%)",
        ].join(", "),
      }}
    />
  );
}
