"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Preloader from "@/shared/components/Preloader";

const INTRO_STORAGE_KEY = "buyology_intro_seen";

export default function IntroScreen() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Show once per browser session (on page open) — not on client-side route changes.
    if (!sessionStorage.getItem(INTRO_STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!mounted || !visible) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mounted, visible]);

  const handleComplete = useCallback(() => {
    sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
    setVisible(false);
  }, []);

  if (!mounted || !visible) return null;

  return createPortal(<Preloader onComplete={handleComplete} />, document.body);
}
