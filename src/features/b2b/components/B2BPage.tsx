"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";

// ─── Icon components ───────────────────────────────────────────────────────────
function IconTag() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
    );
}
function IconHeadset() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
            <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        </svg>
    );
}
function IconTruck() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <rect x="1" y="3" width="15" height="13" rx="1" />
            <path d="M16 8h4l3 3v5h-7V8z" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
    );
}
function IconShield() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    );
}
function IconChevron({ open }: { open: boolean }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 flex-shrink-0 transition-transform duration-300"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );
}
function IconCheck() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 flex-shrink-0">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}
function IconArrow() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
    );
}

const BENEFIT_ICONS: Record<string, React.ReactNode> = {
    tag: <IconTag />,
    headset: <IconHeadset />,
    truck: <IconTruck />,
    shield: <IconShield />,
};

const B2B_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Inquiry Form ──────────────────────────────────────────────────────────────
function InquiryForm() {
    const { t } = useTranslation("b2b");
    const [formState, setFormState] = useState<"idle" | "sending" | "success" | "error">("idle");
    const [fields, setFields] = useState({
        company: "", contact: "", email: "", phone: "", quantity: "", message: "",
    });
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setFieldErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }

    function validate(): boolean {
        const errors: Record<string, string> = {};
        if (!fields.company.trim()) errors.company = "Company name is required.";
        if (!fields.contact.trim()) errors.contact = "Contact person is required.";
        if (!fields.email.trim()) errors.email = "Email is required.";
        else if (!B2B_EMAIL_RE.test(fields.email.trim())) errors.email = "Enter a valid email address.";
        if (!fields.quantity || parseInt(fields.quantity, 10) < 1) errors.quantity = "Enter a valid quantity (min 1).";
        if (Object.keys(errors).length > 0) { setFieldErrors(errors); return false; }
        return true;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!validate()) return;
        setFormState("sending");
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/b2b/inquiries`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    company: fields.company,
                    contactPerson: fields.contact,
                    email: fields.email,
                    phone: fields.phone || undefined,
                    quantity: parseInt(fields.quantity, 10),
                    message: fields.message || undefined,
                }),
            });
            if (!res.ok) throw new Error('failed');
            setFormState("success");
        } catch {
            setFormState("error");
        }
    }

    if (formState === "success") {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center py-16 gap-5"
            >
                <div className="w-16 h-16 rounded-full bg-[#EDE9FF] flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-[22px] font-bold text-gray-900 mb-2">{t("form.successTitle")}</h3>
                    <p className="text-gray-500 text-[14px]">{t("form.successSubtext")}</p>
                </div>
            </motion.div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Company */}
            <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-gray-700">{t("form.company")}</label>
                <input
                    name="company"
                    value={fields.company}
                    onChange={handleChange}
                    placeholder={t("form.companyPlaceholder")}
                    className={`border rounded-[12px] px-4 py-3 text-[14px] text-gray-800 outline-none focus:border-[#402F75] focus:ring-2 focus:ring-[#402F75]/10 transition-all ${fieldErrors.company ? "border-red-400" : "border-gray-200"}`}
                />
                {fieldErrors.company && <p className="text-[11px] text-red-500">{fieldErrors.company}</p>}
            </div>
            {/* Contact person */}
            <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-gray-700">{t("form.contact")}</label>
                <input
                    name="contact"
                    value={fields.contact}
                    onChange={handleChange}
                    placeholder={t("form.contactPlaceholder")}
                    className={`border rounded-[12px] px-4 py-3 text-[14px] text-gray-800 outline-none focus:border-[#402F75] focus:ring-2 focus:ring-[#402F75]/10 transition-all ${fieldErrors.contact ? "border-red-400" : "border-gray-200"}`}
                />
                {fieldErrors.contact && <p className="text-[11px] text-red-500">{fieldErrors.contact}</p>}
            </div>
            {/* Email */}
            <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-gray-700">{t("form.email")}</label>
                <input
                    name="email"
                    type="email"
                    value={fields.email}
                    onChange={handleChange}
                    placeholder={t("form.emailPlaceholder")}
                    className={`border rounded-[12px] px-4 py-3 text-[14px] text-gray-800 outline-none focus:border-[#402F75] focus:ring-2 focus:ring-[#402F75]/10 transition-all ${fieldErrors.email ? "border-red-400" : "border-gray-200"}`}
                />
                {fieldErrors.email && <p className="text-[11px] text-red-500">{fieldErrors.email}</p>}
            </div>
            {/* Phone */}
            <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-gray-700">{t("form.phone")}</label>
                <input
                    name="phone"
                    type="tel"
                    maxLength={13}
                    value={fields.phone}
                    onChange={(e) => { const cleaned = e.target.value.replace(/[^\d+\s\-().]/g, "").slice(0, 13); setFields((p) => ({ ...p, phone: cleaned })); setFieldErrors((p) => ({ ...p, phone: "" })); }}
                    placeholder={t("form.phonePlaceholder")}
                    className="border border-gray-200 rounded-[12px] px-4 py-3 text-[14px] text-gray-800 outline-none focus:border-[#402F75] focus:ring-2 focus:ring-[#402F75]/10 transition-all"
                />
            </div>
            {/* Quantity */}
            <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-gray-700">{t("form.quantity")}</label>
                <input
                    name="quantity"
                    type="number"
                    min="1"
                    value={fields.quantity}
                    onChange={handleChange}
                    placeholder={t("form.quantityPlaceholder")}
                    className={`border rounded-[12px] px-4 py-3 text-[14px] text-gray-800 outline-none focus:border-[#402F75] focus:ring-2 focus:ring-[#402F75]/10 transition-all ${fieldErrors.quantity ? "border-red-400" : "border-gray-200"}`}
                />
                {fieldErrors.quantity && <p className="text-[11px] text-red-500">{fieldErrors.quantity}</p>}
            </div>
            {/* Message — spans 2 cols */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-[13px] font-semibold text-gray-700">{t("form.message")}</label>
                <textarea
                    name="message"
                    rows={4}
                    value={fields.message}
                    onChange={handleChange}
                    placeholder={t("form.messagePlaceholder")}
                    className="border border-gray-200 rounded-[12px] px-4 py-3 text-[14px] text-gray-800 outline-none focus:border-[#402F75] focus:ring-2 focus:ring-[#402F75]/10 transition-all resize-none"
                />
            </div>

            {formState === "error" && (
                <p className="sm:col-span-2 text-red-500 text-[13px]">{t("form.errorMessage")}</p>
            )}

            <div className="sm:col-span-2">
                <button
                    type="submit"
                    disabled={formState === "sending"}
                    className="flex items-center gap-2 bg-[#402F75] hover:bg-[#321f5e] disabled:opacity-60 text-white font-bold text-[14px] px-8 py-[14px] rounded-full transition-colors shadow-md"
                >
                    {formState === "sending" ? t("form.sending") : t("form.submit")}
                    {formState !== "sending" && <IconArrow />}
                </button>
            </div>
        </form>
    );
}

// ─── FAQ Item ──────────────────────────────────────────────────────────────────
function FaqItem({ question, answer }: { question: string; answer: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-gray-100 rounded-[16px] bg-white overflow-hidden">
            <button
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
            >
                <span className="text-[14px] font-semibold text-gray-800">{question}</span>
                <IconChevron open={open} />
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="faq-body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                    >
                        <p className="px-5 pb-4 text-[13px] text-gray-500 leading-relaxed">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function B2BPage() {
    const { t } = useTranslation("b2b");
    const params = useParams();
    const router = useRouter();
    const lang = (params?.lang as Lang) ?? "en";

    const benefits = t("benefits.items", { returnObjects: true }) as {
        icon: string; title: string; description: string;
    }[];
    const steps = t("howItWorks.steps", { returnObjects: true }) as {
        number: string; title: string; description: string;
    }[];
    const faqs = t("faq.items", { returnObjects: true }) as {
        question: string; answer: string;
    }[];

    function handleBrowse() {
        router.push(`/${lang}/${PATH_SLUGS.shop[lang] ?? "shop"}`);
    }

    return (
        <main className="relative w-[90%] mx-auto py-[40px] pb-[80px]">
            {/* Decorative page background mesh */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-[#402F75]/10 blur-3xl" />
                <div className="absolute top-[10%] -right-40 w-[420px] h-[420px] rounded-full bg-[#FBBB14]/10 blur-3xl" />
                <div className="absolute bottom-0 left-[20%] w-[380px] h-[380px] rounded-full bg-[#6B4EAD]/10 blur-3xl" />
            </div>

            {/* ── Hero ──────────────────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-white via-[#FAF8FF] to-[#EDE9FF] border border-white/60 shadow-xl shadow-[#402F75]/5 p-8 sm:p-12 md:p-16 mb-[40px]"
            >
                <div className="pointer-events-none absolute -top-24 -right-20 w-72 h-72 rounded-full bg-[#FBBB14]/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-12 w-72 h-72 rounded-full bg-[#402F75]/15 blur-3xl" />
                <div className="relative">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#402F75] bg-white/80 backdrop-blur px-3 py-[5px] rounded-full mb-4 shadow-sm">
                        {t("badge")}
                    </span>
                    <h1 className="text-[32px] sm:text-[40px] md:text-[52px] font-bold leading-[1.1] mb-4">
                        {t("hero.title")}{" "}
                        <span className="bg-gradient-to-r from-[#402F75] via-[#6B4EAD] to-[#FBBB14] bg-clip-text text-transparent">
                            {t("hero.titleHighlight")}
                        </span>
                    </h1>
                    <p className="text-gray-600 text-[15px] sm:text-[16px] max-w-[560px] leading-relaxed mb-8">
                        {t("hero.subtitle")}
                    </p>
                    <div className="flex flex-wrap gap-3 mb-8">
                        <a
                            href={`/${lang}/b2b/apply`}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FBBB14] to-[#f59e0b] text-[#3f2a02] font-bold text-[14px] px-8 py-[14px] rounded-full transition-transform hover:scale-[1.03] shadow-lg shadow-[#FBBB14]/30"
                        >
                            Apply for Membership
                            <IconArrow />
                        </a>
                        <a
                            href="#inquiry"
                            className="inline-flex items-center gap-2 bg-[#402F75] hover:bg-[#321f5e] text-white font-bold text-[14px] px-8 py-[14px] rounded-full transition-colors shadow-md"
                        >
                            {t("hero.cta")}
                            <IconArrow />
                        </a>
                        <button
                            onClick={handleBrowse}
                            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 font-bold text-[14px] px-8 py-[14px] rounded-full border border-gray-200 transition-colors"
                        >
                            {t("hero.ctaSecondary")}
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                        {[
                            "AED 5,000 Wallet Credit",
                            "Digital Membership Card",
                            "Priority Support",
                            "Exclusive B2B Pricing",
                        ].map((label) => (
                            <span key={label} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur border border-white text-[12px] font-semibold text-[#402F75] shadow-sm">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FBBB14" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                {label}
                            </span>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* ── B2B Premium Membership CTA (moved above the fold) ───────── */}
            <section className="mb-[64px]">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                    className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#2D1F5E] via-[#402F75] to-[#6B4EAD] p-8 sm:p-12 text-white shadow-xl shadow-[#402F75]/30"
                >
                    <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5" />
                    <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-white/5" />
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, rgba(251,187,20,0.4), transparent 45%)" }} />
                    <div className="relative grid md:grid-cols-[1fr_auto] items-center gap-8">
                        <div>
                            <span className="inline-block rounded-full bg-yellow-400 text-black text-[11px] font-extrabold px-4 py-1.5 mb-4 uppercase tracking-wider shadow">
                                Premium Membership
                            </span>
                            <h2 className="text-[26px] sm:text-[34px] font-bold mb-3 leading-tight">
                                Become a Buyology<br />B2B Premium Member
                            </h2>
                            <p className="text-white/75 text-[15px] max-w-lg mb-6 leading-relaxed">
                                Get your digital membership card, AED 5,000 wallet credit on approval, dedicated business support, and exclusive B2B pricing — all in one account.
                            </p>
                            <div className="flex flex-wrap gap-2.5 mb-6">
                                {["AED 5,000 Wallet Credit", "Digital Membership Card", "Priority Support", "Exclusive B2B Pricing"].map((benefit) => (
                                    <span key={benefit} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-[12px] font-medium backdrop-blur-sm">
                                        <span className="text-yellow-400">✓</span> {benefit}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <a
                            href={`/${lang}/b2b/apply`}
                            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold text-[14px] px-8 py-[14px] hover:scale-[1.03] transition-transform shadow-lg justify-self-start md:justify-self-end whitespace-nowrap"
                        >
                            Apply for Membership
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </a>
                    </div>
                </motion.div>
            </section>

            {/* ── Benefits ─────────────────────────────────────────────────── */}
            <section className="mb-[64px]">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-8"
                >
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#402F75] bg-[#EDE9FF] px-3 py-[5px] rounded-full mb-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FBBB14]" /> {t("benefits.title")}
                    </span>
                    <h2 className="text-[24px] sm:text-[28px] font-bold text-gray-900 mb-2">
                        {t("benefits.title")}
                    </h2>
                    <p className="text-gray-500 text-[14px]">{t("benefits.subtitle")}</p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    {benefits.map((benefit, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                            className="group relative bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#402F75]/30 transition-all duration-300 overflow-hidden"
                        >
                            <div className="pointer-events-none absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#FBBB14]/0 group-hover:bg-[#FBBB14]/15 transition-colors duration-500 blur-2xl" />
                            <div className="relative">
                                <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-[#EDE9FF] to-[#D7CCFF] text-[#402F75] flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                    {BENEFIT_ICONS[benefit.icon] ?? <IconCheck />}
                                </div>
                                <h3 className="text-[15px] font-bold text-gray-900 mb-2">{benefit.title}</h3>
                                <p className="text-[13px] text-gray-500 leading-relaxed">{benefit.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── How It Works ─────────────────────────────────────────────── */}
            <section className="mb-[64px]">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-8"
                >
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#402F75] bg-[#EDE9FF] px-3 py-[5px] rounded-full mb-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FBBB14]" /> {t("howItWorks.title")}
                    </span>
                    <h2 className="text-[24px] sm:text-[28px] font-bold text-gray-900 mb-2">
                        {t("howItWorks.title")}
                    </h2>
                    <p className="text-gray-500 text-[14px]">{t("howItWorks.subtitle")}</p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                            className="group relative bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#FBBB14]/40 transition-all duration-300 overflow-hidden"
                        >
                            <div className="pointer-events-none absolute -top-10 -right-10 w-28 h-28 rounded-full bg-[#402F75]/0 group-hover:bg-[#402F75]/10 transition-colors duration-500 blur-2xl" />
                            <span className="relative text-[48px] font-extrabold bg-gradient-to-br from-[#402F75]/30 to-[#FBBB14]/30 bg-clip-text text-transparent leading-none select-none">
                                {step.number}
                            </span>
                            <h3 className="text-[15px] font-bold text-gray-900 mt-2 mb-2">{step.title}</h3>
                            <p className="text-[13px] text-gray-500 leading-relaxed">{step.description}</p>
                            {i < steps.length - 1 && (
                                <div className="hidden xl:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-[#EDE9FF] items-center justify-center text-[#402F75]">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── Inquiry Form ─────────────────────────────────────────────── */}
            <section id="inquiry" className="mb-[64px]">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-white rounded-[24px] p-6 sm:p-10 border border-gray-100 shadow-sm"
                >
                    <div className="mb-8">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#402F75] bg-[#EDE9FF] px-3 py-[5px] rounded-full mb-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FBBB14]" /> {t("form.title")}
                        </span>
                        <h2 className="text-[24px] sm:text-[28px] font-bold text-gray-900 mb-2">
                            {t("form.title")}
                        </h2>
                        <p className="text-gray-500 text-[14px]">{t("form.subtitle")}</p>
                    </div>
                    <InquiryForm />
                </motion.div>
            </section>

            {/* ── FAQ ──────────────────────────────────────────────────────── */}
            <section>
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-6"
                >
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#402F75] bg-[#EDE9FF] px-3 py-[5px] rounded-full mb-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FBBB14]" /> {t("faq.title")}
                    </span>
                    <h2 className="text-[24px] sm:text-[28px] font-bold text-gray-900">
                        {t("faq.title")}
                    </h2>
                </motion.div>

                <div className="flex flex-col gap-3 max-w-[800px]">
                    {faqs.map((faq, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <FaqItem question={faq.question} answer={faq.answer} />
                        </motion.div>
                    ))}
                </div>
            </section>
        </main>
    );
}
