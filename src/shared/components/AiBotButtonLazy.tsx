"use client";

import dynamic from "next/dynamic";

const AiBotButton = dynamic(() => import("./AiBotButton"), { ssr: false });

export default function AiBotButtonLazy() {
    return <AiBotButton />;
}
