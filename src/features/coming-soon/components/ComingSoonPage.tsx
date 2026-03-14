"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";

type ServiceId = "rent" | "repair";

interface ComingSoonPageProps {
    serviceId: ServiceId;
}

function RepairIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
        </svg>
    );
}

function RentIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
            <path d="M7 10h2l2-3 2 4 1-1h3" />
        </svg>
    );
}

const SERVICE_ICONS: Record<ServiceId, () => JSX.Element> = {
    repair: RepairIcon,
    rent: RentIcon,
};

function CurveDecoration({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            width="905"
            height="152"
            viewBox="0 0 905 152"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path
                d="M0.896484 31.636C20.0632 34.8026 87.9965 38.536 110.396 106.136C132.796 173.736 224.063 139.969 273.896 114.636C282.063 80.4693 316.296 31.636 363.896 31.636C411.496 31.636 469.23 71.9693 508.396 106.136C525.063 108.469 592.896 103.636 624.896 31.636C656.896 -40.364 721.396 62.5882 786.396 31.636C851.396 0.683779 910.396 99.6359 897.396 145.636"
                stroke="#402F75"
                strokeWidth="11"
            />
        </svg>
    );
}

export default function ComingSoonPage({ serviceId }: ComingSoonPageProps) {
    const { t } = useTranslation("coming-soon");
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const Icon = SERVICE_ICONS[serviceId];
    const name = t(`${serviceId}.name`);
    const tagline = t(`${serviceId}.tagline`);
    const description = t(`${serviceId}.description`);
    const releaseDate = t(`${serviceId}.releaseDate`);
    const steps = t(`${serviceId}.steps`, { returnObjects: true }) as string[];

    function handleNotify(e: React.FormEvent) {
        e.preventDefault();
        if (email.trim()) setSubmitted(true);
    }

    return (
        <>
            <Header />
            <main className="relative w-full min-h-screen overflow-hidden">
                {/* Top curve decoration */}
                <div className="absolute top-0 start-0 w-full pointer-events-none select-none opacity-[0.07]" aria-hidden="true">
                    <CurveDecoration className="w-full" />
                </div>

                <div className="relative z-10 w-[92%] md:w-[88%] lg:w-[82%] mx-auto py-10 md:py-14 flex flex-col gap-6">

                    {/* ── Service header card ── */}
                    <div className="relative bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 overflow-hidden">
                        {/* Subtle bg curve */}
                        <div className="absolute bottom-0 end-0 w-[60%] pointer-events-none select-none opacity-[0.04]" aria-hidden="true">
                            <CurveDecoration className="w-full" />
                        </div>

                        {/* Top row: icon + title + badge */}
                        <div className="flex items-start justify-between gap-4 mb-5">
                            <div className="flex items-center gap-4">
                                <div className="w-[60px] h-[60px] rounded-2xl bg-[#402F75] flex items-center justify-center flex-shrink-0 shadow-md">
                                    <Icon />
                                </div>
                                <div>
                                    <h1 className="text-[20px] md:text-[24px] font-bold text-gray-900 leading-tight">{name}</h1>
                                    <p className="text-gray-500 text-[13px] md:text-[14px] mt-[3px]">{tagline}</p>
                                </div>
                            </div>
                            <span className="inline-flex items-center gap-[6px] bg-[#FBBB14] text-[#1a0f40] text-[11px] font-bold px-3 py-[6px] rounded-full shadow-sm flex-shrink-0 mt-1">
                                <span className="w-[5px] h-[5px] rounded-full bg-[#1a0f40] opacity-50" />
                                {t("badge")}
                            </span>
                        </div>

                        {/* Description */}
                        <p className="text-gray-500 text-[13px] md:text-[14px] leading-relaxed mb-5 max-w-2xl">
                            {description}
                        </p>

                        {/* Expected release chip */}
                        <div className="inline-flex items-center gap-[7px] bg-[#EDE9FF] text-[#402F75] text-[12px] font-semibold px-3 py-[6px] rounded-xl">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            {t("expectedRelease")}
                            <span className="font-bold">{releaseDate}</span>
                        </div>
                    </div>

                    {/* ── What to Expect ── */}
                    <div className="bg-white rounded-3xl border-2 border-dashed border-[#C4B8F0] p-6 md:p-8">
                        <h2 className="text-[18px] md:text-[22px] font-bold text-[#1a0f40] mb-8">{t("whatToExpect")}</h2>

                        <div className="flex flex-col sm:flex-row items-stretch gap-0">
                            {Array.isArray(steps) && steps.map((step, i) => (
                                <div key={i} className="flex flex-row sm:flex-col items-center flex-1 min-w-0">
                                    {/* Card with number badge overflowing top */}
                                    <div className="relative flex-1 w-full">
                                        {/* Number badge — floats above card */}
                                        <div className="flex justify-center mb-[-16px] relative z-10">
                                            <span className="w-8 h-8 rounded-full bg-[#FBBB14] flex items-center justify-center text-[#1a0f40] text-[13px] font-bold shadow-md">
                                                {i + 1}
                                            </span>
                                        </div>
                                        {/* Card body */}
                                        <div className="bg-white border border-gray-200 rounded-2xl pt-7 pb-5 px-4 text-center shadow-sm h-full flex items-center justify-center">
                                            <p className="text-gray-700 text-[12px] md:text-[13px] leading-snug font-medium">{step}</p>
                                        </div>
                                    </div>

                                    {/* Curved arrow connector (not on last) */}
                                    {i < steps.length - 1 && (
                                        <div className="flex-shrink-0 flex items-center justify-center w-10 sm:w-auto sm:h-10 sm:self-center sm:mb-2">
                                            {/* Horizontal connector for sm+ */}
                                            <svg className="hidden sm:block" width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M 2 12 C 8 28 28 28 34 12" stroke="#2D1F5E" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                                                <path d="M 30 8 L 34 12 L 30 16" stroke="#2D1F5E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                                            </svg>
                                            {/* Vertical connector for mobile */}
                                            <svg className="block sm:hidden" width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M 12 2 C 28 8 28 28 12 34" stroke="#2D1F5E" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                                                <path d="M 8 30 L 12 34 L 16 30" stroke="#2D1F5E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Get Notified ── */}
                    <div className="relative bg-[#2D1F5E] rounded-3xl overflow-hidden p-8 md:p-10">
                        {/* Decorative circles */}
                        <div className="absolute -bottom-10 -start-10 w-48 h-48 rounded-full bg-[#402F75] opacity-40" aria-hidden="true" />
                        <div className="absolute -top-8 -end-8 w-36 h-36 rounded-full bg-[#FBBB14] opacity-10" aria-hidden="true" />
                        {/* Bottom curve decoration */}
                        <div className="absolute bottom-0 start-0 w-full pointer-events-none select-none opacity-[0.06]" aria-hidden="true">
                            <CurveDecoration className="w-full" />
                        </div>

                        <div className="relative z-10 flex flex-col items-center text-center max-w-md mx-auto gap-4">
                            {/* Bell icon */}
                            <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-1">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                    <path d="M13.73 21a2 2 0 01-3.46 0" />
                                </svg>
                            </div>

                            <h2 className="text-white text-[20px] md:text-[22px] font-bold leading-tight">
                                {t("getNotified")}
                            </h2>
                            <p className="text-white/60 text-[13px] md:text-[14px] leading-relaxed">
                                {t("notifySubtitle")}
                            </p>

                            {submitted ? (
                                <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-5 py-3 mt-1">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FBBB14" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    <span className="text-white text-[13px] font-medium">You&apos;re on the list!</span>
                                </div>
                            ) : (
                                <form onSubmit={handleNotify} className="flex w-full max-w-sm gap-2 mt-1">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={t("emailPlaceholder")}
                                        required
                                        className="flex-1 bg-white rounded-full px-4 py-[11px] text-[13px] text-gray-700 placeholder-gray-400 outline-none border-2 border-transparent focus:border-[#FBBB14] transition-colors"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-[#FBBB14] hover:bg-[#e5a800] text-[#1a0f40] font-bold text-[13px] px-5 py-[11px] rounded-full whitespace-nowrap transition-colors cursor-pointer"
                                    >
                                        {t("notifyBtn")}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                </div>

                {/* Bottom curve decoration */}
                <div className="absolute bottom-0 start-0 w-full pointer-events-none select-none opacity-[0.06]" aria-hidden="true">
                    <CurveDecoration className="w-full" />
                </div>
            </main>
            <Footer />
        </>
    );
}
