"use client";

import { useState } from "react";
import Preloader from "@/shared/components/Preloader";

/**
 * Plays the Buyology intro once on initial page load / refresh. It is client-controlled
 * (mount → full timeline → onComplete → unmount), so it ALWAYS finishes — unlike a Next
 * loading.tsx fallback, which Next unmounts the moment the route is ready (cutting it off).
 * AppShell mounts once per full page load and is not remounted on client navigations, so
 * this runs only on a real page open, never on route changes.
 */
export default function AppIntro() {
    const [done, setDone] = useState(false);
    if (done) return null;
    return <Preloader onComplete={() => setDone(true)} />;
}
