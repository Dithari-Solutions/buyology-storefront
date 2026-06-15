"use client";

import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { RootState } from "@/store";
import { PATH_SLUGS } from "@/config/pathSlugs";
import type { Lang } from "@/config/pathSlugs";

const GATE_DELAY_MS = 2 * 60 * 1000; // 2 minutes
const SESSION_KEY = "buyology_signup_gate_shown";

// All localized auth slugs ("auth" / "giris" / "duhul"). The gate must never
// interrupt the sign-in / sign-up / forgot-password journeys.
const AUTH_SLUGS = new Set(Object.values(PATH_SLUGS.auth));

/** True when the current path is any auth route, e.g. /en/auth, /az/giris/forgot-password. */
function isAuthRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  const seg = pathname.split("/")[2]; // /[lang]/[slug]/...
  return !!seg && AUTH_SLUGS.has(seg);
}

export default function SignupGate() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const authRestored = useSelector((state: RootState) => state.auth.isRestored);
  const lang = useSelector((state: RootState) => state.language.lang) as Lang;

  const router = useRouter();
  const pathname = usePathname();
  const onAuthRoute = isAuthRoute(pathname);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Don't run until auth state is known
    if (!authRestored) return;
    // Already authenticated — no gate needed
    if (isAuthenticated) {
      setVisible(false);
      return;
    }
    // Never gate on auth pages (sign-in, sign-up, forgot-password, OTP, reset).
    // Depending on the boolean (not the raw pathname) means the timer is only
    // (re)started when the user crosses the auth boundary, not on every nav.
    if (onAuthRoute) {
      setVisible(false);
      return;
    }
    // Only show once per session
    if (typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY)) return;

    timerRef.current = setTimeout(() => {
      if (!isAuthenticated) {
        setVisible(true);
        if (typeof window !== "undefined") {
          sessionStorage.setItem(SESSION_KEY, "1");
        }
      }
    }, GATE_DELAY_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authRestored, onAuthRoute]);

  // Hide immediately if user authenticates while modal is open
  useEffect(() => {
    if (isAuthenticated) setVisible(false);
  }, [isAuthenticated]);

  function goToAuth(mode: "register" | "signin") {
    setVisible(false);
    router.push(`/${lang}/${PATH_SLUGS.auth[lang]}?mode=${mode}`);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="signup-gate"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[99990] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.4, ease: [0.34, 1.2, 0.64, 1] }}
            className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl overflow-hidden"
          >
            {/* Purple header */}
            <div
              className="px-8 pt-10 pb-8 text-center"
              style={{ background: "linear-gradient(135deg, #1a0f3c 0%, #402F75 100%)" }}
            >
              <div className="w-16 h-16 rounded-[20px] bg-[#FBBB14] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-yellow-500/25">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a0f3c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h2 className="text-[22px] font-extrabold text-white mb-2 leading-tight">
                Join Buyology to Continue
              </h2>
              <p className="text-[13px] text-white/65 leading-relaxed max-w-[240px] mx-auto">
                Create a free account to browse products, track orders, and enjoy express delivery.
              </p>
            </div>

            {/* Buttons */}
            <div className="px-8 py-7 flex flex-col gap-3">
              <button
                onClick={() => goToAuth("register")}
                className="w-full py-[14px] rounded-[30px] bg-[#402F75] text-white font-bold text-[15px] cursor-pointer hover:bg-[#352566] active:scale-[0.98] transition-all duration-150 shadow-md shadow-purple-200"
              >
                Create Free Account
              </button>
              <button
                onClick={() => goToAuth("signin")}
                className="w-full py-[14px] rounded-[30px] border-2 border-[#402F75] text-[#402F75] font-bold text-[15px] cursor-pointer hover:bg-[#F6F4FF] active:scale-[0.98] transition-all duration-150"
              >
                Sign In
              </button>
            </div>

            {/* Footer note */}
            <p className="text-center text-[11px] text-gray-400 pb-6 px-6">
              Free to join · No credit card required
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
