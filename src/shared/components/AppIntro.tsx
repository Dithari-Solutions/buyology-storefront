"use client";

import { useCallback, useState } from "react";
import Preloader from "@/shared/components/Preloader";

/**
 * Plays the Buyology intro once on initial page load / refresh. Client-controlled
 * (mount → full timeline → unmount), so it ALWAYS finishes. AppShell mounts once per full
 * page load and isn't remounted on client navigations, so this runs only on a real page open.
 * Route changes don't replay it — they fall back to the per-route skeletons (loading.tsx).
 */
export default function AppIntro() {
    const [done, setDone] = useState(false);

    // Stable callback so the Preloader's timeline isn't restarted by re-renders.
    const handleComplete = useCallback(() => {
        setDone(true);
    }, []);

    if (done) return null;
    return <Preloader onComplete={handleComplete} />;
}
