"use client";

import { motion } from "framer-motion";

interface ScrollRevealProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    direction?: "up" | "down" | "left" | "right";
}

export default function ScrollReveal({
    children,
    className,
    delay = 0,
    direction = "up",
}: ScrollRevealProps) {
    const offset = 40;
    const initial = {
        opacity: 0,
        x: direction === "left" ? -offset : direction === "right" ? offset : 0,
        y: direction === "up" ? offset : direction === "down" ? -offset : 0,
    };

    return (
        <motion.div
            className={className}
            initial={initial}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
                duration: 0.65,
                delay,
                ease: [0.22, 1, 0.36, 1],
            }}
        >
            {children}
        </motion.div>
    );
}
