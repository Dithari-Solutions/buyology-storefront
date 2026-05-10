"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

const INTRO_STORAGE_KEY = "buyology_intro_seen";
const FALLBACK_DISMISS_MS = 6000;

export default function IntroScreen() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!localStorage.getItem(INTRO_STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!mounted || !visible) return;
    document.body.style.overflow = "hidden";
    const fallback = window.setTimeout(() => dismiss(), FALLBACK_DISMISS_MS);
    return () => {
      document.body.style.overflow = "";
      window.clearTimeout(fallback);
    };
  }, [mounted, visible]);

  function dismiss() {
    localStorage.setItem(INTRO_STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(145deg, #0f0825 0%, #2a1a5e 45%, #1a0f3c 100%)" }}
        >
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none"
            style={{ background: "#FBBB14", top: "-200px", right: "-200px", opacity: 0.12 }}
            animate={{ scale: [1, 1.12, 1], opacity: [0.10, 0.18, 0.10] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none"
            style={{ background: "#7c3aed", bottom: "-150px", left: "-150px", opacity: 0.12 }}
            animate={{ scale: [1, 1.18, 1], opacity: [0.08, 0.15, 0.08] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          />

          <motion.video
            ref={videoRef}
            src="/loading-video.mp4"
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={dismiss}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{
              scale: [0.96, 1.02, 0.96],
              opacity: 1,
              y: [0, -6, 0],
            }}
            transition={{
              scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
              y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 0.5 },
            }}
            className="relative z-10 w-[min(70vw,460px)] h-auto rounded-3xl shadow-[0_30px_80px_-10px_rgba(0,0,0,0.6)]"
            style={{ mixBlendMode: "screen" }}
          />

          <button
            onClick={dismiss}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-[13px] font-semibold text-white/60 hover:text-white transition-colors cursor-pointer group py-2 px-4 z-10"
          >
            Skip
            <svg
              width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              className="group-hover:translate-x-0.5 transition-transform"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
