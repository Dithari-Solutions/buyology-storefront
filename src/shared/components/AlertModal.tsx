"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type AlertModalSeverity = "error" | "warning" | "info" | "success";

interface AlertModalProps {
    open: boolean;
    onClose: () => void;
    severity?: AlertModalSeverity;
    title?: string;
    message: string;
    primaryAction?: { label: string; onClick: () => void };
    secondaryAction?: { label: string; onClick: () => void };
}

const STYLES: Record<AlertModalSeverity, { ring: string; icon: string; accent: string }> = {
    error:   { ring: "ring-1 ring-gray-100",   icon: "#EF4444", accent: "bg-[#402F75] text-white" },
    warning: { ring: "ring-1 ring-gray-100",   icon: "#F59E0B", accent: "bg-[#402F75] text-white" },
    info:    { ring: "ring-1 ring-gray-100",   icon: "#2563EB", accent: "bg-[#402F75] text-white" },
    success: { ring: "ring-1 ring-gray-100",   icon: "#16A34A", accent: "bg-[#402F75] text-white" },
};

export default function AlertModal({
    open,
    onClose,
    severity = "error",
    title,
    message,
    primaryAction,
    secondaryAction,
}: AlertModalProps) {
    useEffect(() => {
        if (!open) return;
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    const style = STYLES[severity];
    const fallbackTitle =
        severity === "error" ? "Something went wrong" :
        severity === "warning" ? "Heads up" :
        severity === "success" ? "Done" : "Notice";

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
                    onClick={onClose}
                    role="dialog"
                    aria-modal="true"
                >
                    <motion.div
                        initial={{ scale: 0.92, y: 10, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.96, opacity: 0 }}
                        transition={{ type: "spring", duration: 0.3 }}
                        className={`bg-white rounded-2xl shadow-2xl ${style.ring} w-full max-w-sm p-6 text-center`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={style.icon} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="13" />
                                <line x1="12" y1="16.5" x2="12.01" y2="16.5" />
                            </svg>
                        </div>
                        <h3 className="text-[16px] font-bold text-gray-900 mb-1">{title ?? fallbackTitle}</h3>
                        <p className="text-[13px] text-gray-600 leading-relaxed mb-5 whitespace-pre-wrap">{message}</p>
                        <div className="flex flex-col-reverse sm:flex-row gap-2 justify-center">
                            {secondaryAction && (
                                <button
                                    type="button"
                                    onClick={secondaryAction.onClick}
                                    className="px-4 py-2 rounded-full text-[13px] font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 cursor-pointer"
                                >
                                    {secondaryAction.label}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={primaryAction?.onClick ?? onClose}
                                className={`px-5 py-2 rounded-full text-[13px] font-semibold ${style.accent} hover:opacity-90 cursor-pointer`}
                            >
                                {primaryAction?.label ?? "OK"}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
