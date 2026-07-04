"use client";

import dynamic from "next/dynamic";

// The intro decides whether to play by reading sessionStorage (a client-only, per-session
// flag), so it must not server-render. ssr:false keeps the decision purely client-side —
// no hydration mismatch — and defers the intro/Preloader code out of the bundle for
// returning visitors, who never see it.
const AppIntroClient = dynamic(() => import("@/shared/components/AppIntroClient"), {
    ssr: false,
});

/**
 * Plays the Buyology intro once, on the first launch of a browsing session. Route changes
 * and refreshes don't replay it — they fall back to the per-route skeletons (loading.tsx).
 */
export default function AppIntro() {
    return <AppIntroClient />;
}
