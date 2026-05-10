"use client";

import { motion } from "framer-motion";

interface VideoLoaderProps {
  /** When true, dims/blurs the page behind the video instead of a solid backdrop. */
  transparent?: boolean;
  /** Animate the video itself (subtle scale/float) — useful when the raw video looks flat. */
  animate?: boolean;
  className?: string;
}

export default function VideoLoader({
  transparent = false,
  animate = true,
  className = "",
}: VideoLoaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className={`fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden ${className}`}
      style={{
        background: transparent
          ? "rgba(15, 8, 37, 0.65)"
          : "linear-gradient(145deg, #0f0825 0%, #2a1a5e 45%, #1a0f3c 100%)",
        backdropFilter: transparent ? "blur(8px)" : undefined,
      }}
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      {/* Ambient orbs to make plain video feel branded */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none"
        style={{ background: "#FBBB14", top: "-200px", right: "-200px", opacity: 0.12 }}
      />
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none"
        style={{ background: "#7c3aed", bottom: "-150px", left: "-150px", opacity: 0.12 }}
      />

      <motion.video
        src="/loading-video.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        initial={animate ? { scale: 0.92, opacity: 0 } : false}
        animate={
          animate
            ? {
                scale: [0.96, 1.02, 0.96],
                opacity: 1,
                y: [0, -6, 0],
              }
            : { opacity: 1 }
        }
        transition={
          animate
            ? {
                scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 0.5 },
              }
            : { duration: 0.3 }
        }
        className="relative z-10 w-[min(70vw,420px)] h-auto rounded-3xl shadow-[0_30px_80px_-10px_rgba(0,0,0,0.6)]"
        style={{ mixBlendMode: "screen" }}
      />

      <span className="sr-only">Loading…</span>
    </motion.div>
  );
}
