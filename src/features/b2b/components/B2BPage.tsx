"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";

// ─── Tier data shape ───────────────────────────────────────────────────────────
interface Tier {
    label: string;
    min: number;
    max: number | null;
    discount: number | null;
    badge: string | null;
}

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

const TIER_COLORS = [
    { bg: "#F7F7F7", border: "#E5E5E5", text: "#666" },
    { bg: "#FFF8EC", border: "#FBBB14", text: "#8B6200" },
    { bg: "#F0FAFA", border: "#22C9C9", text: "#117A7A" },
    { bg: "#F6F4FF", border: "#402F75", text: "#402F75" },
    { bg: "#FFF3FF", border: "#9B59B6", text: "#7D3C98" },
    { bg: "#F0F9FF", border: "#3B82F6", text: "#1D4ED8" },
];

// ─── Savings Calculator ────────────────────────────────────────────────────────
function SavingsCalculator({ tiers, onQuantityChange }: { tiers: Tier[]; onQuantityChange?: (qty: string) => void }) {
    const { t } = useTranslation("b2b");
    const [qty, setQty] = useState("");

    const quantity = parseInt(qty, 10);
    const activeTier = isNaN(quantity) || quantity < 1
        ? null
        : tiers.find((tier) =>
            quantity >= tier.min && (tier.max === null || quantity <= tier.max)
        ) ?? null;

    const isCustom = activeTier?.discount === null;

    return (
        <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-sm border border-gray-100">
            <div className="mb-6">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#402F75] bg-[#EDE9FF] px-3 py-[5px] rounded-full mb-3">
                    📊 {t("calculator.title")}
                </span>
                <p className="text-gray-500 text-[13px]">{t("calculator.subtitle")}</p>
            </div>

            <div className="mb-6">
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                    {t("calculator.label")}
                </label>
                <input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => { setQty(e.target.value); onQuantityChange?.(e.target.value); }}
                    placeholder={t("calculator.placeholder")}
                    className="w-full max-w-[200px] border border-gray-200 rounded-[12px] px-4 py-3 text-[14px] font-semibold text-gray-800 outline-none focus:border-[#402F75] focus:ring-2 focus:ring-[#402F75]/10 transition-all"
                />
            </div>

            <AnimatePresence>
                {activeTier && (
                    <motion.div
                        key={activeTier.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="rounded-[16px] p-5 border-2"
                        style={{
                            backgroundColor: TIER_COLORS[tiers.indexOf(activeTier)]?.bg ?? "#F6F4FF",
                            borderColor: TIER_COLORS[tiers.indexOf(activeTier)]?.border ?? "#402F75",
                        }}
                    >
                        {isCustom ? (
                            <p className="text-[14px] font-semibold text-gray-700">
                                {t("calculator.contactForQuote")}
                            </p>
                        ) : (
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-[11px] text-gray-500 mb-1">{t("calculator.yourTier")}</p>
                                    <p className="text-[18px] font-bold text-gray-900">{activeTier.label}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-gray-500 mb-1">{t("calculator.discount")}</p>
                                    <p className="text-[18px] font-bold text-[#402F75]">{activeTier.discount}%</p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-gray-500 mb-1">{t("calculator.estimatedSaving")}</p>
                                    <p className="text-[14px] font-bold text-[#FBBB14]">
                                        {activeTier.discount}% {t("calculator.perUnit")}
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

const B2B_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Inquiry Form ──────────────────────────────────────────────────────────────
function InquiryForm({ initialQuantity }: { initialQuantity?: string }) {
    const { t } = useTranslation("b2b");
    const [formState, setFormState] = useState<"idle" | "sending" | "success" | "error">("idle");
    const [fields, setFields] = useState({
        company: "", contact: "", email: "", phone: "", quantity: initialQuantity ?? "", message: "",
    });
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // Sync calculator quantity into the form whenever it changes
    useEffect(() => {
        if (initialQuantity !== undefined && initialQuantity !== "") {
            setFields(f => ({ ...f, quantity: initialQuantity }));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialQuantity]);

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
    const [calculatorQty, setCalculatorQty] = useState("");

    const tiers = t("tiers.tiers", { returnObjects: true }) as Tier[];
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
        <main className="w-[90%] mx-auto py-[40px] pb-[80px]">

            {/* ── Hero ──────────────────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="mb-[56px] md:mb-[72px]"
            >
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#402F75] bg-[#EDE9FF] px-3 py-[5px] rounded-full mb-4">
                    {t("badge")}
                </span>
                <h1 className="text-[32px] sm:text-[40px] md:text-[52px] font-bold leading-[1.1] mb-4">
                    {t("hero.title")}{" "}
                    <span className="text-[#402F75]">{t("hero.titleHighlight")}</span>
                </h1>
                <p className="text-gray-500 text-[15px] sm:text-[16px] max-w-[560px] leading-relaxed mb-8">
                    {t("hero.subtitle")}
                </p>
                <div className="flex flex-wrap gap-3">
                    <a
                        href="#inquiry"
                        className="flex items-center gap-2 bg-[#402F75] hover:bg-[#321f5e] text-white font-bold text-[14px] px-8 py-[14px] rounded-full transition-colors shadow-md"
                    >
                        {t("hero.cta")}
                        <IconArrow />
                    </a>
                    <button
                        onClick={handleBrowse}
                        className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 font-bold text-[14px] px-8 py-[14px] rounded-full border border-gray-200 transition-colors"
                    >
                        {t("hero.ctaSecondary")}
                    </button>
                </div>
            </motion.div>

            {/* ── Savings Calculator ───────────────────────────────────────── */}
            <section className="mb-[64px]">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                >
                    <SavingsCalculator tiers={tiers} onQuantityChange={setCalculatorQty} />
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
                        ✨ {t("benefits.title")}
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
                            className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm"
                        >
                            <div className="w-11 h-11 rounded-[12px] bg-[#EDE9FF] text-[#402F75] flex items-center justify-center mb-4">
                                {BENEFIT_ICONS[benefit.icon] ?? <IconCheck />}
                            </div>
                            <h3 className="text-[15px] font-bold text-gray-900 mb-2">{benefit.title}</h3>
                            <p className="text-[13px] text-gray-500 leading-relaxed">{benefit.description}</p>
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
                        🔄 {t("howItWorks.title")}
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
                            className="relative bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm"
                        >
                            <span className="text-[42px] font-extrabold text-[#402F75]/10 leading-none select-none">
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
                            📋 {t("form.title")}
                        </span>
                        <h2 className="text-[24px] sm:text-[28px] font-bold text-gray-900 mb-2">
                            {t("form.title")}
                        </h2>
                        <p className="text-gray-500 text-[14px]">{t("form.subtitle")}</p>
                    </div>
                    <InquiryForm initialQuantity={calculatorQty} />
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
                        ❓ {t("faq.title")}
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
