"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// One column per letter — the letters live inside the bars and travel with them.
const WORD = "BUYOLOGY";
const LETTERS = WORD.split(""); // 8 letters → 8 columns
// Alternating wordmark colours: white, yellow, white, yellow, …
const letterColor = (i: number) => (i % 2 === 0 ? "#ffffff" : "#FFBE12");

interface PreloaderProps {
    /** Called once the exit finishes (ignored when loop=true). */
    onComplete?: () => void;
    /** Shorter hold — for client-side route transitions. */
    quick?: boolean;
    /** Repeat forever and never self-dismiss — for Suspense loading fallbacks. */
    loop?: boolean;
}

/**
 * Page-load / route-change preloader. The purple columns COVER the screen from the very
 * first frame (no transparent flash) — the letters fade/rise in, hold, then the columns
 * sweep up to reveal the page beneath (letters riding with them). Targets are queried from
 * the DOM so the React Compiler can't drop them.
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
        const letters = gsap.utils.toArray<HTMLElement>(overlay.querySelectorAll("[data-letter]"));
        const wave = overlay.querySelector<HTMLElement>("[data-wave]");
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

        // Enter — letters rise + fade in on the solid cover
        tl.fromTo(
            letters,
            { y: 28, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.05, duration: 0.4, ease: "power3.out", force3D: true }
        );
        if (wave) {
            tl.fromTo(wave, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "power2.out", force3D: true }, "-=0.2");
        }

        if (loop) {
            // Cover stays put; letters pulse out then the timeline repeats.
            tl.to(letters, { y: -28, opacity: 0, stagger: 0.04, duration: 0.35, ease: "power2.in", force3D: true }, `+=${hold}`);
            if (wave) tl.to(wave, { opacity: 0, duration: 0.3 }, "<");
        } else {
            // Exit — columns sweep up to reveal the page, letters riding with them.
            if (wave) tl.to(wave, { y: -14, opacity: 0, duration: 0.3, ease: "power2.in", force3D: true }, `+=${hold}`);
            tl.to(
                cols,
                { yPercent: -100, stagger: { each: 0.05, from: "start" }, duration: 0.5, ease: "power3.inOut", force3D: true },
                wave ? "<" : `+=${hold}`
            );
        }

        return () => {
            tl.kill();
        };
    }, [quick, loop]);

    return (
        <div ref={overlayRef} className="fixed inset-0 z-[9999] overflow-hidden" style={{ background: "transparent" }}>
            <div className="flex h-full w-full">
                {LETTERS.map((ch, i) => (
                    <div
                        key={i}
                        data-col
                        className="h-full flex items-center justify-center"
                        // No initial transform → the columns tile the screen with solid #402f75
                        // from the first paint (SSR included), so the page never shows through.
                        // The box-shadow bleeds 1px left/right to hide sub-pixel gaps between
                        // columns at fractional widths (responsive — desktop and small screens).
                        style={{
                            width: `${100 / LETTERS.length}%`,
                            backgroundColor: "#402f75",
                            boxShadow: "1px 0 0 #402f75, -1px 0 0 #402f75",
                            willChange: "transform",
                        }}
                    >
                        <span
                            data-letter
                            style={{
                                fontFamily: "var(--font-ibm-sans), system-ui, sans-serif",
                                color: letterColor(i),
                                fontSize: "clamp(1.1rem, 7vw, 3rem)",
                                fontWeight: 700,
                                letterSpacing: "0.04em",
                                lineHeight: 1,
                                opacity: 0, // hidden until GSAP fades it in (no flash before JS)
                                marginTop: quick ? "0" : "-6%",
                                willChange: "transform, opacity",
                            }}
                        >
                            {ch}
                        </span>
                    </div>
                ))}
            </div>

            {!quick && (
                <div data-wave className="fixed left-1/2 top-[58%] -translate-x-1/2" style={{ opacity: 0 }}>
                    <svg width="180" height="48" viewBox="0 0 106 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M59.2252 27.6181C57.3443 27.6364 55.5057 27.0645 53.9658 25.9847C52.4259 24.905 51.2637 23.3688 50.6404 21.5943L44.7101 5.3505C44.4095 4.52923 43.8687 3.81613 43.1574 3.30834C42.4461 2.79872 41.5974 2.51824 40.7229 2.49991C39.8485 2.48158 38.9888 2.72905 38.2573 3.20751C37.5259 3.68597 36.9558 4.37525 36.6221 5.18368L29.3517 22.8042C28.7706 24.2139 27.766 25.4109 26.4773 26.2285C25.1886 27.0461 23.6799 27.4439 22.1565 27.3688C20.6332 27.2936 19.1685 26.7492 17.9677 25.8106C16.7652 24.872 15.8834 23.5833 15.4434 22.1222L10.3344 5.18918C10.1217 4.4834 9.73127 3.84363 9.20148 3.3285C8.67169 2.81521 8.02092 2.44491 7.30781 2.25243C6.5947 2.05995 5.84677 2.05261 5.13 2.23043C4.41506 2.40825 3.75511 2.76572 3.21616 3.26984L1.43432 4.93987L0.0722656 3.48616L1.85045 1.82897C2.63688 1.09386 3.59746 0.571407 4.64054 0.309263C5.68545 0.048952 6.77802 0.0581178 7.81743 0.338594C8.85684 0.61907 9.80643 1.15986 10.58 1.90963C11.3518 2.65939 11.9201 3.59431 12.2299 4.62456L17.3408 21.5411C17.6634 22.608 18.3087 23.5503 19.1886 24.2377C20.0685 24.9233 21.1373 25.3211 22.2519 25.3761C23.3664 25.4311 24.47 25.1396 25.4123 24.542C26.3545 23.9444 27.0878 23.07 27.5131 22.0379L34.7834 4.42108C35.2692 3.24234 36.1015 2.2396 37.1684 1.54116C38.2353 0.842717 39.4874 0.485248 40.7633 0.510912C42.0373 0.53841 43.2747 0.949041 44.3105 1.69148C45.3462 2.43391 46.1345 3.47149 46.5726 4.67792L53.6098 20.9123C54.0025 22.3404 55.0345 23.5631 56.271 24.4045C57.5396 25.246 59.0409 25.6657 60.5625 25.5998C62.084 25.5338 63.5432 24.9875 64.7348 24.0397C65.9264 23.092 66.7843 21.7904 67.1894 20.322L70.8484 6.80054C71.9447 2.74372 75.3709 0.18644 79.567 0.289098C83.7631 0.393589 87.0629 3.10852 87.9666 7.21117L90.7182 19.7391C91.6385 23.9316 95.094 25.4201 97.7814 25.4201H97.8016C100.493 25.4201 103.956 23.9096 104.856 19.6988L105.065 18.729L107.004 19.1451L106.795 20.1149C105.721 25.136 101.508 27.3944 97.8053 27.4036H97.7814C94.0894 27.4036 89.8786 25.1708 88.7806 20.1607L86.0271 7.6328C85.1784 3.7703 81.9923 2.33126 79.5212 2.27076C77.0501 2.2121 73.798 3.49716 72.7659 7.31566L69.1069 20.8372C68.6193 22.729 67.5304 24.41 66.0052 25.6309C64.48 26.8518 62.601 27.5429 60.6486 27.6034L60.227 27.6126L59.2252 27.6181Z" fill="#FFBE12" />
                    </svg>
                </div>
            )}
        </div>
    );
}
