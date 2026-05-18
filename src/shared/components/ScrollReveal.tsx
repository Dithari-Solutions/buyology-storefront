"use client";

import { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    direction?: "up" | "down" | "left" | "right";
}

/**
 * Lightweight scroll-reveal using IntersectionObserver + CSS transitions.
 * Replaces a framer-motion implementation to eliminate ~9 hydration mount
 * points on the home page (framer-motion was a major TBT contributor).
 */
export default function ScrollReveal({
    children,
    className,
    delay = 0,
    direction = "up",
}: ScrollRevealProps) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        // If the browser doesn't support IntersectionObserver, reveal immediately.
        if (typeof IntersectionObserver === "undefined") {
            setVisible(true);
            return;
        }
        const obs = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setVisible(true);
                        obs.disconnect();
                        break;
                    }
                }
            },
            { rootMargin: "0px 0px -80px 0px", threshold: 0.01 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    const offset = 40;
    const tx =
        direction === "left" ? -offset : direction === "right" ? offset : 0;
    const ty =
        direction === "up" ? offset : direction === "down" ? -offset : 0;

    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translate3d(0,0,0)" : `translate3d(${tx}px, ${ty}px, 0)`,
                transition: `opacity 650ms cubic-bezier(0.22,1,0.36,1) ${delay * 1000}ms, transform 650ms cubic-bezier(0.22,1,0.36,1) ${delay * 1000}ms`,
                willChange: visible ? "auto" : "opacity, transform",
            }}
        >
            {children}
        </div>
    );
}
