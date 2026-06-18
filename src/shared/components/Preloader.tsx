"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// Number of purple tiles that cover the screen and sweep up to reveal the page.
const COLUMNS = 8;

interface PreloaderProps {
    /** Called once the exit finishes (ignored when loop=true). */
    onComplete?: () => void;
    /** Shorter hold — for client-side route transitions. */
    quick?: boolean;
    /** Repeat forever and never self-dismiss — for Suspense loading fallbacks. */
    loop?: boolean;
}

/**
 * Page-load / route-change preloader. The purple tiles COVER the screen from the very
 * first frame (no transparent flash). The centred Buyology logo rises/fades in, holds,
 * then closes (fades + lifts away) as the tiles sweep up to reveal the page beneath.
 * Targets are queried from the DOM so the React Compiler can't drop them.
 */
export default function Preloader({ onComplete, quick = false, loop = false }: PreloaderProps) {
    const overlayRef = useRef<HTMLDivElement>(null);
    // Keep the latest onComplete without re-running the timeline effect (a new inline
    // callback each render would otherwise kill + restart the animation → it plays twice).
    const onCompleteRef = useRef(onComplete);
    onCompleteRef.current = onComplete;

    // Lock page scroll while the loader is up — removes the scrollbar behind it.
    useEffect(() => {
        const prevBody = document.body.style.overflow;
        const prevHtml = document.documentElement.style.overflow;
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prevBody;
            document.documentElement.style.overflow = prevHtml;
        };
    }, []);

    useEffect(() => {
        const overlay = overlayRef.current;
        if (!overlay) return;

        const cols = gsap.utils.toArray<HTMLElement>(overlay.querySelectorAll("[data-col]"));
        const logo = overlay.querySelector<HTMLElement>("[data-logo]");
        if (!cols.length) return;

        const hold = quick ? 0.2 : 0.45;

        const tl = gsap.timeline(
            loop
                ? { repeat: -1, repeatDelay: 0.15 }
                : {
                    onComplete: () => {
                        overlay.style.display = "none";
                        onCompleteRef.current?.();
                    },
                }
        );

        // Enter — the logo rises + fades in on the solid cover.
        if (logo) {
            tl.fromTo(
                logo,
                { y: 26, opacity: 0, scale: 0.92 },
                { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "power3.out", force3D: true }
            );
        }

        if (loop) {
            // Cover stays put; the logo pulses out then the timeline repeats.
            if (logo) tl.to(logo, { y: -26, opacity: 0, scale: 0.92, duration: 0.4, ease: "power2.in", force3D: true }, `+=${hold}`);
        } else {
            // Exit — the logo closes (lifts + fades away) AS the tiles sweep up to reveal the page.
            if (logo) tl.to(logo, { y: -40, opacity: 0, scale: 0.9, duration: 0.45, ease: "power2.in", force3D: true }, `+=${hold}`);
            tl.to(
                cols,
                { yPercent: -100, stagger: { each: 0.05, from: "start" }, duration: 0.5, ease: "power3.inOut", force3D: true },
                logo ? "<" : `+=${hold}`
            );
        }

        return () => {
            tl.kill();
        };
    }, [quick, loop]);

    return (
        <div ref={overlayRef} className="fixed inset-0 z-[9999] overflow-hidden" style={{ background: "transparent" }}>
            {/* Purple tiles — cover the screen with solid #402f75 from the first paint (SSR
                included), so the page never shows through, then sweep up on exit. The box-shadow
                bleeds 1px left/right to hide sub-pixel gaps between tiles at fractional widths. */}
            <div className="flex h-full w-full">
                {Array.from({ length: COLUMNS }).map((_, i) => (
                    <div
                        key={i}
                        data-col
                        className="h-full"
                        style={{
                            width: `${100 / COLUMNS}%`,
                            backgroundColor: "#402f75",
                            boxShadow: "1px 0 0 #402f75, -1px 0 0 #402f75",
                            willChange: "transform",
                        }}
                    />
                ))}
            </div>

            {/* Centred Buyology logo — kept separate from the tiles so it stays centred while
                they sweep up. GSAP fades/lifts it in, then closes it on exit. */}
            <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    data-logo
                    src="/logo.png"
                    alt="Buyology"
                    style={{
                        width: "clamp(150px, 42vw, 240px)",
                        height: "auto",
                        opacity: 0, // hidden until GSAP fades it in (no flash before JS)
                        willChange: "transform, opacity",
                    }}
                />
            </div>
        </div>
    );
}
