"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function Newsletter() {
    const { t } = useTranslation("home");
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim()) {
            setSubmitted(true);
        }
    };

    return (
        <section className="w-full flex items-center justify-center mt-[30px] md:mt-[50px]">
            <div className="w-[95%] md:w-[90%] relative overflow-hidden rounded-3xl">
                {/* Background */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: "linear-gradient(135deg, #FFF8E6 0%, #FFF3CC 40%, #FFFBE8 100%)",
                    }}
                />

                {/* Decorative circles */}
                <div className="absolute -top-16 -end-16 w-52 h-52 rounded-full opacity-20" style={{ backgroundColor: "#FBBB14" }} />
                <div className="absolute -bottom-10 -start-10 w-40 h-40 rounded-full opacity-15" style={{ backgroundColor: "#402F75" }} />
                <div className="absolute top-1/2 end-1/4 -translate-y-1/2 w-24 h-24 rounded-full opacity-10" style={{ backgroundColor: "#FBBB14" }} />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center text-center px-6 sm:px-10 md:px-16 py-12 md:py-16">
                    <span className="inline-flex items-center text-[11px] font-semibold text-[#402F75] bg-[#402F75]/10 px-3 py-[5px] rounded-full mb-4">
                        {t("newsletter.label")}
                    </span>
                    <h2 className="text-[24px] sm:text-[30px] md:text-[36px] font-extrabold text-gray-900 leading-tight max-w-xl mb-3">
                        {t("newsletter.titlePre")}{" "}
                        <span style={{ color: "#402F75" }}>{t("newsletter.titleMid")}</span>{" "}
                        {t("newsletter.titlePost")}
                    </h2>
                    <p className="text-gray-500 text-[14px] md:text-[15px] max-w-md mb-8">
                        {t("newsletter.subtitle")}
                    </p>

                    {submitted ? (
                        <div className="flex items-center gap-3 bg-white rounded-2xl px-6 py-4 shadow-sm">
                            <div
                                className="flex items-center justify-center w-9 h-9 rounded-full"
                                style={{ backgroundColor: "#402F75" }}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <p className="font-semibold text-gray-800 text-[15px]">
                                {t("newsletter.successMessage")}
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                            <input
                                type="email"
                                placeholder={t("newsletter.placeholder")}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="flex-1 bg-white border border-gray-200 rounded-full px-5 py-3 text-[14px] text-gray-800 placeholder-gray-400 outline-none focus:border-[#402F75] focus:ring-2 focus:ring-[#402F75]/15 transition-all"
                            />
                            <button
                                type="submit"
                                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full text-[14px] font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg whitespace-nowrap"
                                style={{ backgroundColor: "#402F75" }}
                            >
                                {t("newsletter.subscribe")}
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                            </button>
                        </form>
                    )}

                    <p className="text-gray-400 text-[12px] mt-4">
                        {t("newsletter.privacyNote")}
                    </p>
                </div>
            </div>
        </section>
    );
}
