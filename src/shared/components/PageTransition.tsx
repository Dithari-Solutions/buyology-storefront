"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import VideoLoader from "@/shared/components/VideoLoader";

const TRANSITION_DURATION_MS = 1400;

export default function PageTransition() {
  const pathname = usePathname();
  const previousPathnameRef = useRef<string | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (previousPathnameRef.current === null) {
      previousPathnameRef.current = pathname;
      return;
    }
    if (previousPathnameRef.current === pathname) return;

    previousPathnameRef.current = pathname;
    setActive(true);
    const t = window.setTimeout(() => setActive(false), TRANSITION_DURATION_MS);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return (
    <AnimatePresence>{active && <VideoLoader key="page-transition" variant="slide" />}</AnimatePresence>
  );
}
