"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import VideoLoader from "@/shared/components/VideoLoader";

const INTRO_STORAGE_KEY = "buyology_intro_seen";
const INTRO_DURATION_MS = 3200;

export default function IntroScreen() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!localStorage.getItem(INTRO_STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!mounted || !visible) return;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => {
      localStorage.setItem(INTRO_STORAGE_KEY, "1");
      setVisible(false);
    }, INTRO_DURATION_MS);
    return () => {
      document.body.style.overflow = "";
      window.clearTimeout(t);
    };
  }, [mounted, visible]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div key="intro" exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
          <VideoLoader />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
