"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const STORAGE_KEY = "geolocationRationaleDismissed";

interface Props {
    /** Whether the geolocation request is currently in flight (browser prompt may be visible). */
    visible: boolean;
}

/**
 * Small, non-blocking notice shown alongside the native geolocation prompt
 * so users understand *why* we're asking for their location before they
 * decide to allow or deny. Dismissal is persisted so we don't nag.
 */
export default function GeolocationRationale({ visible }: Props) {
    const { t } = useTranslation("location");
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!visible) return;
        if (typeof window === "undefined") return;
        if (window.localStorage.getItem(STORAGE_KEY) === "1") return;
        // Brief delay so the browser permission UI has a moment to surface
        const id = window.setTimeout(() => setOpen(true), 250);
        return () => window.clearTimeout(id);
    }, [visible]);

    const dismiss = () => {
        setOpen(false);
        if (typeof window !== "undefined") {
            window.localStorage.setItem(STORAGE_KEY, "1");
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    key="geo-rationale"
                    initial={{ opacity: 0, y: 24, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 24, scale: 0.96 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    role="status"
                    aria-live="polite"
                    className="fixed z-[60] bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[420px] rounded-2xl bg-white shadow-2xl border border-gray-200 p-4 md:p-5"
                >
                    <div className="flex items-start gap-3">
                        <div
                            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ background: "rgba(64,47,117,0.10)" }}
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#402F75"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="M12 22s-7-7.5-7-13a7 7 0 0 1 14 0c0 5.5-7 13-7 13z" />
                                <circle cx="12" cy="9" r="2.5" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-[14px] md:text-[15px] font-bold text-[#1a0f40]">
                                {t("rationale.title", {
                                    defaultValue: "Why we ask for your location",
                                })}
                            </h3>
                            <p className="mt-1 text-[12px] md:text-[13px] text-gray-600 leading-relaxed">
                                {t("rationale.body", {
                                    defaultValue:
                                        "We use it only to set the right country and currency, show local delivery options and nearby stores. We never share it — and you can deny the browser prompt; the site will keep working.",
                                })}
                            </p>
                            <div className="mt-3 flex items-center justify-end">
                                <button
                                    type="button"
                                    onClick={dismiss}
                                    className="text-[12px] md:text-[13px] font-semibold px-3 py-1.5 rounded-full bg-[#402F75] text-white hover:bg-[#33245f] transition-colors cursor-pointer"
                                >
                                    {t("rationale.ok", { defaultValue: "Got it" })}
                                </button>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={dismiss}
                            aria-label={t("rationale.close", { defaultValue: "Close" })}
                            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
