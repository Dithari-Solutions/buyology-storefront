"use client";

import { useCallback, useState } from "react";
import Preloader from "@/shared/components/Preloader";

// Marks that the branded intro has already played in THIS browsing session. sessionStorage
// (not localStorage) so it plays once per launch: a full refresh or any in-session
// navigation is skipped, while opening the site fresh (new tab/session) shows it again.
const INTRO_KEY = "buyology:introPlayed";

/**
 * Renders the intro only on the first launch of a session. Loaded via a client-only
 * dynamic import (ssr:false), so reading sessionStorage in the state initializer is safe
 * and causes no hydration mismatch — the intro shows immediately when it hasn't played yet.
 */
export default function AppIntroClient() {
    const [show, setShow] = useState(() => {
        try {
            return sessionStorage.getItem(INTRO_KEY) !== "1";
        } catch {
            return true; // sessionStorage blocked (private mode) — treat as a fresh launch
        }
    });

    const handleComplete = useCallback(() => {
        try {
            sessionStorage.setItem(INTRO_KEY, "1");
        } catch {
            /* ignore — best-effort persistence */
        }
        setShow(false);
    }, []);

    if (!show) return null;
    return <Preloader onComplete={handleComplete} />;
}
