"use client";

import { useCallback, useState } from "react";
import Preloader from "@/shared/components/Preloader";
import { loaderState } from "@/shared/components/loaderState";

/**
 * Plays the Buyology intro once on initial page load / refresh. Client-controlled
 * (mount → full timeline → unmount), so it ALWAYS finishes. AppShell mounts once per full
 * page load and isn't remounted on client navigations, so this runs only on a real page open.
 */
export default function AppIntro() {
    const [done, setDone] = useState(false);

    // Stable callback so the Preloader's timeline isn't restarted by re-renders.
    const handleComplete = useCallback(() => {
        loaderState.introDone = true; // arm PageTransition for subsequent navigations
        setDone(true);
    }, []);

    if (done) return null;
    return <Preloader onComplete={handleComplete} />;
}
