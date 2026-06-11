"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Preloader from "@/shared/components/Preloader";

/**
 * Plays the Buyology intro over client-side navigations. It starts on the link CLICK
 * (before the next page renders) so the cover comes up first, then reveals the new page
 * when the intro finishes. A pathname-change fallback covers programmatic navigations.
 */
export default function PageTransition() {
  const pathname = usePathname();
  const prevPathRef = useRef<string | null>(null);
  const runningRef = useRef(false);
  const [active, setActive] = useState(false);
  const [runId, setRunId] = useState(0);

  const start = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    setRunId((r) => r + 1);
    setActive(true);
  }, []);

  const finish = useCallback(() => {
    runningRef.current = false;
    setActive(false);
  }, []);

  // Cover immediately when an internal link is clicked, before navigation commits.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      const target = anchor.getAttribute("target");
      if (!href || !href.startsWith("/") || target === "_blank" || anchor.hasAttribute("download")) return;
      const path = href.split("?")[0].split("#")[0];
      if (path === window.location.pathname) return; // same page → no transition
      start();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [start]);

  // Fallback for router.push()-style navigations that don't go through a link click.
  useEffect(() => {
    if (prevPathRef.current === null) {
      prevPathRef.current = pathname;
      return;
    }
    if (prevPathRef.current === pathname) return;
    prevPathRef.current = pathname;
    start();
  }, [pathname, start]);

  if (!active) return null;

  // runId keeps the same Preloader mounted through the whole transition (even across the
  // pathname change), so the intro plays once rather than restarting mid-way.
  return <Preloader key={runId} onComplete={finish} />;
}
