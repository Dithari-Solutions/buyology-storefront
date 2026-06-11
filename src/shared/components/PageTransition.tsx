"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Preloader from "@/shared/components/Preloader";

/** Plays the full Buyology intro on every client-side route change (not on refresh). */
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
  }, [pathname]);

  if (!active) return null;

  // key forces a fresh mount (and a fresh GSAP timeline) on each navigation.
  return <Preloader key={pathname} onComplete={() => setActive(false)} />;
}
