"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface VideoLoaderProps {
  className?: string;
}

export default function VideoLoader({ className = "" }: VideoLoaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={`fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden ${className}`}
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      {/* Base purple */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #1a0b3d 0%, #2a1466 35%, #4827a8 70%, #6b3fd0 100%)",
        }}
      />

      {/* Rising purple wave layers */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-[140%] pointer-events-none"
        initial={{ y: "100%" }}
        animate={{ y: ["100%", "-15%", "100%"] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(139, 92, 246, 0.55) 0%, rgba(124, 58, 237, 0.35) 30%, transparent 65%)",
        }}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 h-[140%] pointer-events-none"
        initial={{ y: "100%" }}
        animate={{ y: ["100%", "-10%", "100%"] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: [0.4, 0, 0.2, 1], delay: 0.6 }}
        style={{
          background:
            "radial-gradient(ellipse at 30% 100%, rgba(168, 85, 247, 0.45) 0%, transparent 55%)",
        }}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 h-[140%] pointer-events-none"
        initial={{ y: "100%" }}
        animate={{ y: ["100%", "-5%", "100%"] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: [0.4, 0, 0.2, 1], delay: 1.2 }}
        style={{
          background:
            "radial-gradient(ellipse at 70% 100%, rgba(216, 180, 254, 0.35) 0%, transparent 55%)",
        }}
      />

      {/* Floating particles rising up */}
      {Array.from({ length: 14 }).map((_, i) => {
        const left = (i * 73) % 100;
        const size = 3 + ((i * 17) % 6);
        const duration = 4 + ((i * 0.7) % 3.5);
        const delay = (i * 0.45) % 4;
        return (
          <motion.span
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${left}%`,
              bottom: "-20px",
              width: size,
              height: size,
              background: "rgba(255, 255, 255, 0.7)",
              boxShadow: "0 0 8px rgba(216, 180, 254, 0.9)",
            }}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: "-110vh", opacity: [0, 1, 1, 0] }}
            transition={{ duration, repeat: Infinity, delay, ease: "easeOut" }}
          />
        );
      })}

      {/* Soft glow orbs */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none"
        style={{ background: "#a855f7", top: "-150px", right: "-150px", opacity: 0.25 }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[450px] h-[450px] rounded-full blur-3xl pointer-events-none"
        style={{ background: "#c084fc", bottom: "-120px", left: "-120px", opacity: 0.2 }}
        animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Logo with halo + breathing animation */}
      <div className="relative z-10 flex items-center justify-center">
        {/* Pulsing halo rings */}
        <motion.span
          className="absolute rounded-full border border-white/30"
          style={{ width: 200, height: 200 }}
          animate={{ scale: [1, 1.7], opacity: [0.6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.span
          className="absolute rounded-full border border-white/20"
          style={{ width: 200, height: 200 }}
          animate={{ scale: [1, 1.9], opacity: [0.4, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut", delay: 0.8 }}
        />

        {/* Soft halo glow behind logo */}
        <motion.span
          className="absolute rounded-full blur-2xl"
          style={{
            width: 240,
            height: 240,
            background:
              "radial-gradient(circle, rgba(216,180,254,0.55) 0%, rgba(168,85,247,0.25) 50%, transparent 70%)",
          }}
          animate={{ scale: [0.95, 1.1, 0.95], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 20 }}
          animate={{
            scale: [0.95, 1.05, 0.95],
            opacity: 1,
            y: [0, -8, 0],
          }}
          transition={{
            scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 0.6 },
          }}
          className="relative"
        >
          <Image
            src="/logo.png"
            alt="Buyology"
            width={140}
            height={140}
            priority
            className="drop-shadow-[0_10px_40px_rgba(216,180,254,0.55)]"
          />
        </motion.div>
      </div>

      <span className="sr-only">Loading…</span>
    </motion.div>
  );
}
