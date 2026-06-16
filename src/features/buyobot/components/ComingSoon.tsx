"use client";

import { useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import type { RootState } from "@/store";
import type { Lang } from "@/config/pathSlugs";
import { subscribeToNewsletter } from "@/features/newsletter/services/newsletter.api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ComingSoon() {
    const { t } = useTranslation("buyobot");
    const lang = (useSelector((s: RootState) => s.language.lang) as Lang) ?? "en";

    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = email.trim();
        if (!trimmed) {
            setEmailError(t("emailRequired", { defaultValue: "Please enter your email address." }));
            return;
        }
        if (!EMAIL_RE.test(trimmed)) {
            setEmailError(t("emailInvalid", { defaultValue: "Please enter a valid email address." }));
            return;
        }
        setEmailError(null);
        if (loading) return;
        setLoading(true);
        try {
            await subscribeToNewsletter(trimmed);
        } catch {
            // silent — show success regardless to avoid email-harvesting signals
        } finally {
            setLoading(false);
            setSubscribed(true);
        }
    };

    return (
        <section className="relative w-full min-h-[calc(100vh-120px)] flex items-center justify-center overflow-hidden px-5 py-16">
            {/* Background gradient + soft blobs */}
            <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                    background:
                        "radial-gradient(1200px 600px at 50% -10%, rgba(64,47,117,0.18), transparent 60%), radial-gradient(800px 500px at 90% 110%, rgba(251,187,20,0.18), transparent 60%), linear-gradient(180deg, #F7F7F7 0%, #ECEAF5 100%)",
                }}
            />
            <motion.div
                aria-hidden="true"
                className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full blur-3xl opacity-40"
                style={{ background: "radial-gradient(circle, #402F75 0%, transparent 70%)" }}
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                aria-hidden="true"
                className="absolute -bottom-32 -right-20 w-[460px] h-[460px] rounded-full blur-3xl opacity-40"
                style={{ background: "radial-gradient(circle, #FBBB14 0%, transparent 70%)" }}
                animate={{ y: [0, -25, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative z-10 flex flex-col items-center text-center max-w-[560px] w-full">
                {/* Badge */}
                <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur border border-[#402F75]/15 text-[#402F75] text-[12px] font-bold tracking-widest uppercase"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-[#FBBB14] opacity-75 animate-ping" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FBBB14]" />
                    </span>
                    {t("badge", { defaultValue: "Coming Soon" })}
                </motion.span>

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.1 }}
                    className="mt-6 text-[30px] sm:text-[40px] md:text-[48px] font-extrabold leading-[1.05] text-[#1a0f40]"
                >
                    {t("title", { defaultValue: "BuyoBot is" })}{" "}
                    <span style={{ color: "#FBBB14" }}>
                        {t("titleAccent", { defaultValue: "almost here" })}
                    </span>
                </motion.h1>

                {/* Chat window */}
                <motion.div
                    initial={{ opacity: 0, y: 18, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.18 }}
                    className="mt-8 w-full rounded-3xl bg-white border border-[#402F75]/10 shadow-2xl shadow-[#402F75]/10 overflow-hidden text-left"
                >
                    {/* Chat header */}
                    <div
                        className="flex items-center gap-3 px-5 py-4"
                        style={{ background: "linear-gradient(135deg, #402F75 0%, #5B3FA8 100%)" }}
                    >
                        <motion.div
                            className="w-11 h-11 rounded-2xl flex items-center justify-center bg-white/10 shrink-0"
                            animate={{ y: [0, -3, 0] }}
                            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FBBB14" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="7" width="18" height="13" rx="3" />
                                <path d="M12 7V3" />
                                <circle cx="12" cy="3" r="1" fill="#FBBB14" />
                                <circle cx="9" cy="13" r="1.4" fill="#FBBB14" stroke="none" />
                                <circle cx="15" cy="13" r="1.4" fill="#FBBB14" stroke="none" />
                                <path d="M9 17h6" />
                            </svg>
                        </motion.div>
                        <div className="min-w-0">
                            <p className="text-white font-bold text-[15px] leading-tight">
                                {t("botName", { defaultValue: "BuyoBot" })}
                            </p>
                            <span className="inline-flex items-center gap-1.5 text-[12px] text-white/70">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full rounded-full bg-[#FBBB14] opacity-75 animate-ping" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FBBB14]" />
                                </span>
                                {t("botStatus", { defaultValue: "Coming soon" })}
                            </span>
                        </div>
                    </div>

                    {/* Chat body */}
                    <div className="px-4 sm:px-5 py-5 space-y-3 bg-[#F8F8FB]">
                        {/* Bot message */}
                        <div className="flex items-end gap-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-[#402F75]">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FBBB14" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="7" width="18" height="13" rx="3" />
                                    <path d="M12 7V3" />
                                    <circle cx="9" cy="13" r="1.4" fill="#FBBB14" stroke="none" />
                                    <circle cx="15" cy="13" r="1.4" fill="#FBBB14" stroke="none" />
                                </svg>
                            </div>
                            <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white border border-gray-100 shadow-sm px-4 py-3">
                                <p className="text-[14px] leading-relaxed text-gray-700">
                                    {t("chatMessage", {
                                        defaultValue:
                                            "Hello, I'm BuyoBot — your AI shopping assistant. I'm not quite ready yet, as our team is putting the finishing touches in place. Subscribe to our newsletter and we'll notify you the moment I'm available to help you find the right device, compare deals, and answer your questions.",
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Success message from bot */}
                        {subscribed && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className="flex items-end gap-2"
                            >
                                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-[#402F75]">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FBBB14" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="7" width="18" height="13" rx="3" />
                                        <path d="M12 7V3" />
                                        <circle cx="9" cy="13" r="1.4" fill="#FBBB14" stroke="none" />
                                        <circle cx="15" cy="13" r="1.4" fill="#FBBB14" stroke="none" />
                                    </svg>
                                </div>
                                <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-[#402F75] shadow-sm px-4 py-3">
                                    <p className="text-[14px] leading-relaxed text-white">
                                        {t("chatSuccess", {
                                            defaultValue:
                                                "Thank you. You're on the list — we'll be in touch as soon as I go live.",
                                        })}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Composer */}
                    <div className="px-4 sm:px-5 py-4 border-t border-gray-100 bg-white">
                        {subscribed ? (
                            <div className="flex items-center justify-center gap-2 text-[14px] font-semibold text-[#402F75]">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                {t("subscribedNote", { defaultValue: "You'll be notified at launch." })}
                            </div>
                        ) : (
                            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setEmailError(null); }}
                                        placeholder={t("emailPlaceholder", { defaultValue: "Enter your email to get notified" })}
                                        className={`flex-1 bg-[#F8F8FB] border rounded-full px-4 py-2.5 text-[14px] text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#402F75]/15 transition-all ${emailError ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-[#402F75]"}`}
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        aria-label={t("notifyBtn", { defaultValue: "Notify me" })}
                                        className="flex items-center justify-center w-10 h-10 rounded-full bg-[#402F75] text-white hover:bg-[#33245f] transition-colors shadow-lg shadow-[#402F75]/25 disabled:opacity-50 shrink-0"
                                    >
                                        {loading ? (
                                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                                                <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                            </svg>
                                        ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="22" y1="2" x2="11" y2="13" />
                                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {emailError && (
                                    <p className="text-red-500 text-[12px] px-1">{emailError}</p>
                                )}
                            </form>
                        )}
                    </div>
                </motion.div>

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.28 }}
                    className="mt-7 flex flex-col sm:flex-row items-center gap-3"
                >
                    <Link
                        href={`/${lang}`}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#402F75] text-white text-[14px] font-bold hover:bg-[#33245f] transition-colors shadow-lg shadow-[#402F75]/25"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        {t("backHome", { defaultValue: "Back to home" })}
                    </Link>
                    <Link
                        href={`/${lang}/shop`}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#FBBB14] text-[#1a0f40] text-[14px] font-bold hover:bg-[#f0b000] transition-colors shadow-lg shadow-[#FBBB14]/25"
                    >
                        {t("browseShop", { defaultValue: "Browse the shop" })}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
