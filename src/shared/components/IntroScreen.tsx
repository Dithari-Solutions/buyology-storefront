"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";

const AUTO_DISMISS_MS = 7000;

type ServiceDef = {
  icon: React.ReactNode;
  label: string;
  desc: string;
  color: string;
  routeKey: string;
  query?: string;
};

const SERVICE_DEFS: ServiceDef[] = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
    label: "Buy",
    desc: "Brand new products from local stores",
    color: "#FBBB14",
    routeKey: "shop",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </svg>
    ),
    label: "Refurbished",
    desc: "Quality certified refurbished devices",
    color: "#34d399",
    routeKey: "shop",
    query: "?type=refurbished",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    label: "Repair",
    desc: "Expert device repair & diagnostics",
    color: "#f87171",
    routeKey: "repair",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
      </svg>
    ),
    label: "Rent",
    desc: "Flexible short & long-term rental",
    color: "#60a5fa",
    routeKey: "rent",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    label: "Express",
    desc: "30-min delivery from nearby stores",
    color: "#FBBB14",
    routeKey: "quick-delivery",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    label: "B2B",
    desc: "Business-grade bulk sourcing & deals",
    color: "#c084fc",
    routeKey: "b2b",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    label: "Sell",
    desc: "Turn old devices into cash — coming soon",
    color: "#fb923c",
    routeKey: "sell",
  },
];

export default function IntroScreen() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  const router = useRouter();
  const lang = (useSelector((state: RootState) => state.language.lang) as Lang) ?? "en";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / AUTO_DISMISS_MS) * 100, 100);
      setProgress(pct);
      if (elapsed >= AUTO_DISMISS_MS) {
        clearInterval(interval);
        setVisible(false);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [mounted]);

  function getPath(routeKey: string, query?: string) {
    const slug = PATH_SLUGS[routeKey]?.[lang] ?? routeKey;
    return `/${lang}/${slug}${query ?? ""}`;
  }

  function handleServiceClick(routeKey: string, query?: string) {
    setVisible(false);
    router.push(getPath(routeKey, query));
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
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-between overflow-hidden py-10 px-6"
          style={{ background: "linear-gradient(145deg, #0f0825 0%, #2a1a5e 45%, #1a0f3c 100%)" }}
        >
          {/* Background orbs */}
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

          {/* ── BRAND SECTION ── */}
          <div className="relative z-10 flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1], delay: 0.05 }}
              className="w-16 h-16 rounded-[20px] flex items-center justify-center mb-4"
              style={{ background: "#FBBB14", boxShadow: "0 16px 48px rgba(251,187,20,0.35)" }}
            >
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#1a0f3c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
              className="text-[38px] sm:text-[46px] font-extrabold text-white tracking-tight leading-none mb-1.5"
            >
              Buyology
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="text-[14px] sm:text-[15px] text-white/60 font-medium"
            >
              Your all-in-one local tech platform
            </motion.p>
          </div>

          {/* ── SERVICES GRID ── */}
          <div className="relative z-10 w-full max-w-lg">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="text-center text-[11px] font-semibold text-white/40 uppercase tracking-[0.18em] mb-4"
            >
              What we offer
            </motion.p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SERVICE_DEFS.map((s, i) => (
                <motion.button
                  key={s.label}
                  initial={{ opacity: 0, y: 16, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{
                    duration: 0.38,
                    delay: 0.55 + i * 0.08,
                    ease: [0.34, 1.3, 0.64, 1],
                  }}
                  onClick={() => handleServiceClick(s.routeKey, s.query)}
                  className="flex flex-col gap-2 rounded-2xl p-4 text-left cursor-pointer group relative overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
                    style={{ background: `radial-gradient(circle at 30% 50%, ${s.color}18 0%, transparent 70%)` }}
                  />

                  {/* Icon */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative z-10 transition-transform duration-200 group-hover:scale-110"
                    style={{ background: `${s.color}1a`, color: s.color }}
                  >
                    {s.icon}
                  </div>

                  {/* Text */}
                  <div className="relative z-10">
                    <p className="text-[13px] font-bold text-white leading-tight flex items-center gap-1">
                      {s.label}
                      <svg
                        width="10" height="10" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                        className="opacity-0 group-hover:opacity-60 -translate-x-1 group-hover:translate-x-0 transition-all duration-200"
                      >
                        <path d="M7 17L17 7M17 7H7M17 7v10" />
                      </svg>
                    </p>
                    <p className="text-[11px] text-white/50 leading-snug mt-0.5 line-clamp-2">{s.desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* ── BOTTOM: progress + skip ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 1.1 }}
            className="relative z-10 flex flex-col items-center gap-3 w-full"
          >
            <div className="w-full max-w-[180px] h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.12)" }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${progress}%`, background: "#FBBB14", transition: "none" }}
              />
            </div>

            <button
              onClick={() => setVisible(false)}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-white/45 hover:text-white transition-colors cursor-pointer group"
            >
              Skip intro
              <svg
                width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                className="group-hover:translate-x-0.5 transition-transform"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
