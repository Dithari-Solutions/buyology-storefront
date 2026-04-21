"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import ScrollReveal from "@/shared/components/ScrollReveal";

// ─── types ─────────────────────────────────────────────────────────────────
type CountryId = "uae" | "sa" | "qa" | "om" | "az" | "bh";

interface Country {
    id: CountryId;
    nameKey: string;
    flagEmoji: string;
    /** Position on 320×320 globe as percentage */
    gx: number;
    gy: number;
    email: string;
    phone: string;
    address: string;
}

// ─── country data ───────────────────────────────────────────────────────────
const COUNTRIES: Country[] = [
    {
        id: "uae",
        nameKey: "countries.uae",
        flagEmoji: "🇦🇪",
        gx: 55.6,
        gy: 55.6,
        email: "support.ae@buyology.com",
        phone: "+971 4 352 7800",
        address: "Business Bay, Dubai, UAE",
    },
    {
        id: "sa",
        nameKey: "countries.sa",
        flagEmoji: "🇸🇦",
        gx: 43.5,
        gy: 54.5,
        email: "support.sa@buyology.com",
        phone: "+966 11 460 0900",
        address: "King Fahd Rd, Riyadh, KSA",
    },
    {
        id: "qa",
        nameKey: "countries.qa",
        flagEmoji: "🇶🇦",
        gx: 51.8,
        gy: 52.8,
        email: "support.qa@buyology.com",
        phone: "+974 4 422 3200",
        address: "West Bay, Doha, Qatar",
    },
    {
        id: "om",
        nameKey: "countries.om",
        flagEmoji: "🇴🇲",
        gx: 59.5,
        gy: 58.2,
        email: "support.om@buyology.com",
        phone: "+968 2 456 0020",
        address: "Muscat, Oman",
    },
    {
        id: "az",
        nameKey: "countries.az",
        flagEmoji: "🇦🇿",
        gx: 47.0,
        gy: 35.0,
        email: "support.az@buyology.com",
        phone: "+994 12 480 0100",
        address: "Nizami St, Baku, Azerbaijan",
    },
    {
        id: "bh",
        nameKey: "countries.bh",
        flagEmoji: "🇧🇭",
        gx: 50.5,
        gy: 52.2,
        email: "support.bh@buyology.com",
        phone: "+973 1 757 2222",
        address: "Manama, Bahrain",
    },
];

// ─── simplified country SVG shapes (viewBox 0 0 110 110) ─────────────────────
const COUNTRY_SHAPES: Record<CountryId, string> = {
    uae: "M 22 48 L 28 30 L 48 20 L 70 22 L 84 34 L 88 50 L 82 60 L 90 72 L 78 84 L 64 76 L 50 65 L 32 65 Z",
    sa:  "M 14 25 L 54 16 L 86 22 L 93 46 L 90 66 L 76 86 L 58 93 L 38 88 L 18 72 L 9 48 L 11 34 Z",
    qa:  "M 38 16 L 64 18 L 70 40 L 65 62 L 55 82 L 45 82 L 35 62 L 32 38 Z",
    om:  "M 18 16 L 52 10 L 72 20 L 84 32 L 90 52 L 92 74 L 78 90 L 56 96 L 36 86 L 26 70 L 14 54 L 10 36 Z",
    az:  "M 10 46 L 30 26 L 58 20 L 84 28 L 92 46 L 88 60 L 70 68 L 44 70 L 18 60 Z",
    bh:  "M 36 18 L 64 20 L 78 44 L 72 70 L 55 86 L 36 80 L 22 58 L 28 34 Z",
};

// ─── Globe3D ────────────────────────────────────────────────────────────────
function Globe3D({
    selectedId,
    onSelect,
}: {
    selectedId: CountryId;
    onSelect: (id: CountryId) => void;
}) {
    const { t } = useTranslation("contact");

    return (
        <motion.div
            className="relative mx-auto"
            style={{ width: 320, height: 320 }}
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
            {/* drop shadow */}
            <div
                className="absolute"
                style={{
                    bottom: -18,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "62%",
                    height: 22,
                    background:
                        "radial-gradient(ellipse, rgba(64,47,117,0.32) 0%, transparent 70%)",
                    borderRadius: "50%",
                    filter: "blur(8px)",
                }}
            />

            {/* sphere */}
            <div
                className="absolute inset-0 rounded-full overflow-hidden"
                style={{
                    background:
                        "radial-gradient(circle at 35% 30%, #5B4A9C 0%, #2E1F6A 45%, #0F0828 100%)",
                }}
            >
                {/* scrolling longitude grid — creates rotation illusion */}
                <motion.div
                    className="absolute h-full"
                    style={{ width: "200%", top: 0, left: 0 }}
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                >
                    <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 640 320"
                        preserveAspectRatio="none"
                    >
                        {/* longitude verticals — two full repetitions */}
                        {[0, 1].flatMap((rep) =>
                            [0, 53, 107, 160, 213, 267, 320].map((x, i) => (
                                <line
                                    key={`v-${rep}-${i}`}
                                    x1={x + rep * 320}
                                    y1={0}
                                    x2={x + rep * 320}
                                    y2={320}
                                    stroke="#FBBB14"
                                    strokeOpacity="0.10"
                                    strokeWidth="0.6"
                                />
                            ))
                        )}
                        {/* latitude horizontals */}
                        {[26, 53, 80, 107, 133, 160, 187, 213, 240, 267, 294].map(
                            (y, i) => (
                                <line
                                    key={`h-${i}`}
                                    x1={0}
                                    y1={y}
                                    x2={640}
                                    y2={y}
                                    stroke="#FBBB14"
                                    strokeOpacity="0.08"
                                    strokeWidth="0.6"
                                />
                            )
                        )}
                    </svg>
                </motion.div>

                {/* latitude ellipses for spherical perspective */}
                <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 320 320"
                >
                    {/* equator */}
                    <ellipse
                        cx="160" cy="160" rx="160" ry="5"
                        stroke="#FBBB14" strokeOpacity="0.18" fill="none" strokeWidth="0.8"
                    />
                    {/* 30 °N */}
                    <ellipse
                        cx="160" cy="107" rx="139" ry="4"
                        stroke="#FBBB14" strokeOpacity="0.13" fill="none" strokeWidth="0.7"
                    />
                    {/* 30 °S */}
                    <ellipse
                        cx="160" cy="213" rx="139" ry="4"
                        stroke="#FBBB14" strokeOpacity="0.13" fill="none" strokeWidth="0.7"
                    />
                    {/* 60 °N */}
                    <ellipse
                        cx="160" cy="54" rx="80" ry="3"
                        stroke="#FBBB14" strokeOpacity="0.08" fill="none" strokeWidth="0.6"
                    />
                    {/* 60 °S */}
                    <ellipse
                        cx="160" cy="266" rx="80" ry="3"
                        stroke="#FBBB14" strokeOpacity="0.08" fill="none" strokeWidth="0.6"
                    />
                    {/* central longitude */}
                    <ellipse
                        cx="160" cy="160" rx="2" ry="160"
                        stroke="#FBBB14" strokeOpacity="0.12" fill="none" strokeWidth="0.7"
                    />
                    <ellipse
                        cx="160" cy="160" rx="80" ry="160"
                        stroke="#FBBB14" strokeOpacity="0.09" fill="none" strokeWidth="0.7"
                    />
                    <ellipse
                        cx="160" cy="160" rx="139" ry="160"
                        stroke="#FBBB14" strokeOpacity="0.07" fill="none" strokeWidth="0.7"
                    />
                </svg>

                {/* country markers */}
                {COUNTRIES.map((c) => {
                    const active = c.id === selectedId;
                    return (
                        <motion.button
                            key={c.id}
                            onClick={() => onSelect(c.id)}
                            title={c.nameKey}
                            style={{
                                position: "absolute",
                                left: `${c.gx}%`,
                                top: `${c.gy}%`,
                                transform: "translate(-50%, -50%)",
                                zIndex: 10,
                            }}
                            whileHover={{ scale: 1.4 }}
                            className="cursor-pointer"
                        >
                            {/* outer pulse */}
                            {active && (
                                <motion.span
                                    className="absolute rounded-full border-2 border-[#FBBB14]"
                                    style={{
                                        width: 26,
                                        height: 26,
                                        top: "50%",
                                        left: "50%",
                                        x: "-50%",
                                        y: "-50%",
                                    }}
                                    animate={{ scale: [1, 2.6], opacity: [0.6, 0] }}
                                    transition={{ duration: 1.6, repeat: Infinity }}
                                />
                            )}
                            {/* inner pulse */}
                            {active && (
                                <motion.span
                                    className="absolute rounded-full border border-[#FBBB14]/60"
                                    style={{
                                        width: 18,
                                        height: 18,
                                        top: "50%",
                                        left: "50%",
                                        x: "-50%",
                                        y: "-50%",
                                    }}
                                    animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                                    transition={{
                                        duration: 1.6,
                                        repeat: Infinity,
                                        delay: 0.35,
                                    }}
                                />
                            )}
                            {/* dot */}
                            <motion.span
                                className="block rounded-full"
                                animate={active ? { scale: [1, 1.25, 1] } : {}}
                                transition={{ duration: 1.8, repeat: Infinity }}
                                style={{
                                    width: active ? 13 : 7,
                                    height: active ? 13 : 7,
                                    backgroundColor: "#FBBB14",
                                    boxShadow: active
                                        ? "0 0 18px #FBBB14, 0 0 6px rgba(251,187,20,0.8)"
                                        : "0 0 5px rgba(251,187,20,0.55)",
                                    transition: "width 0.3s, height 0.3s, box-shadow 0.3s",
                                }}
                            />
                        </motion.button>
                    );
                })}

                {/* highlight shine */}
                <div
                    className="absolute inset-0 pointer-events-none rounded-full"
                    style={{
                        background:
                            "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.14) 0%, transparent 58%)",
                    }}
                />
                {/* edge darkening */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ boxShadow: "inset 0 0 90px rgba(0,0,0,0.55)" }}
                />
            </div>
        </motion.div>
    );
}

// ─── CountryShape ────────────────────────────────────────────────────────────
function CountryShape({ countryId }: { countryId: CountryId }) {
    return (
        <svg
            viewBox="0 0 110 110"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* mini-globe background */}
            <circle cx="55" cy="55" r="52" fill="#1A0F40" />
            <circle cx="55" cy="55" r="52" fill="none" stroke="#402F75" strokeWidth="1.5" />
            {/* latitude lines */}
            {[27, 41, 55, 69, 83].map((y) => (
                <line key={y} x1="3" y1={y} x2="107" y2={y} stroke="#FBBB14" strokeOpacity="0.1" strokeWidth="0.5" />
            ))}
            {/* longitude ellipses */}
            <ellipse cx="55" cy="55" rx="52" ry="8" stroke="#FBBB14" strokeOpacity="0.1" fill="none" strokeWidth="0.5" />
            <ellipse cx="55" cy="55" rx="30" ry="52" stroke="#FBBB14" strokeOpacity="0.1" fill="none" strokeWidth="0.5" />
            {/* country shape */}
            <path d={COUNTRY_SHAPES[countryId]} fill="#FBBB14" fillOpacity="0.85" />
        </svg>
    );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s\-().]{7,20}$/;

interface ContactFormErrors {
    fullName?: string;
    email?: string;
    phone?: string;
    inquiryType?: string;
    message?: string;
}

// ─── ContactForm ─────────────────────────────────────────────────────────────
function ContactForm() {
    const { t } = useTranslation("contact");
    const [form, setForm] = useState({
        fullName: "",
        email: "",
        phone: "",
        inquiryType: "",
        message: "",
    });
    const [errors, setErrors] = useState<ContactFormErrors>({});
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name as keyof ContactFormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    function validate(): boolean {
        const e: ContactFormErrors = {};
        if (!form.fullName.trim()) e.fullName = "Full name is required.";
        else if (form.fullName.trim().length < 2) e.fullName = "Name must be at least 2 characters.";
        if (!form.email.trim()) e.email = "Email is required.";
        else if (!EMAIL_RE.test(form.email.trim())) e.email = "Enter a valid email address.";
        if (!form.phone.trim()) e.phone = "Phone number is required.";
        else if (!PHONE_RE.test(form.phone.trim())) e.phone = "Enter a valid phone number.";
        if (!form.inquiryType) e.inquiryType = "Please select an inquiry type.";
        if (!form.message.trim()) e.message = "Message is required.";
        else if (form.message.trim().length < 10) e.message = "Message must be at least 10 characters.";
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
        }, 1200);
    };

    const inputClass = (hasErr: boolean) =>
        `w-full bg-white border rounded-2xl px-5 py-3 text-[14px] text-gray-800 placeholder-gray-400 outline-none focus:ring-2 transition-all ${
            hasErr
                ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                : "border-gray-200 focus:border-[#402F75] focus:ring-[#402F75]/12"
        }`;

    return (
        <section className="w-full flex justify-center mt-[40px] md:mt-[60px]">
            <div
                className="w-[95%] md:w-[90%] rounded-3xl overflow-hidden"
                style={{ backgroundColor: "#fff" }}
            >
                <div className="flex flex-col lg:flex-row">
                    {/* left — help panel */}
                    <div
                        className="lg:w-[38%] flex flex-col justify-between p-8 md:p-12 rounded-3xl"
                        style={{
                            background:
                                "linear-gradient(145deg, #f5f3ff 0%, #ede9ff 100%)",
                        }}
                    >
                        <div>
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#402F75] bg-[#402F75]/10 px-3 py-[5px] rounded-full mb-5">
                                <span className="w-[5px] h-[5px] rounded-full bg-[#402F75]" />
                                {t("hero.label")}
                            </span>
                            <h3
                                className="text-[26px] md:text-[32px] font-extrabold leading-tight mb-4"
                                style={{ color: "#402F75" }}
                            >
                                {t("form.sectionLabel")}
                            </h3>
                            <p className="text-gray-500 text-[14px] md:text-[15px] leading-relaxed">
                                {t("form.description")}
                            </p>
                        </div>

                        {/* social icons */}
                        <div className="flex items-center gap-3 mt-10">
                            {[
                                {
                                    label: "Facebook",
                                    icon: (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#402F75">
                                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                                        </svg>
                                    ),
                                },
                                {
                                    label: "X",
                                    icon: (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#402F75">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                        </svg>
                                    ),
                                },
                                {
                                    label: "Instagram",
                                    icon: (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                            <circle cx="12" cy="12" r="4" />
                                            <circle cx="17.5" cy="6.5" r="1" fill="#402F75" stroke="none" />
                                        </svg>
                                    ),
                                },
                                {
                                    label: "LinkedIn",
                                    icon: (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#402F75">
                                            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                                            <rect x="2" y="9" width="4" height="12" />
                                            <circle cx="4" cy="4" r="2" />
                                        </svg>
                                    ),
                                },
                                {
                                    label: "YouTube",
                                    icon: (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#402F75">
                                            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                                            <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
                                        </svg>
                                    ),
                                },
                            ].map(({ label, icon }) => (
                                <a
                                    key={label}
                                    href="#"
                                    aria-label={label}
                                    className="p-[9px] rounded-full bg-white hover:bg-[#402F75]/10 transition-colors flex items-center justify-center shadow-sm"
                                >
                                    {icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* right — form */}
                    <div className="flex-1 p-8 md:p-12">
                        <h4 className="text-[20px] font-bold text-gray-900 mb-6">
                            {t("form.title")}
                        </h4>

                        <AnimatePresence mode="wait">
                            {submitted ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center h-64 text-center"
                                >
                                    <motion.div
                                        className="flex items-center justify-center w-16 h-16 rounded-full mb-4"
                                        style={{ backgroundColor: "#402F75" }}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="white"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="w-8 h-8"
                                        >
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </motion.div>
                                    <h5 className="text-[20px] font-bold text-gray-900 mb-2">
                                        {t("form.successTitle")}
                                    </h5>
                                    <p className="text-gray-500 text-[14px]">
                                        {t("form.successMessage")}
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.form
                                    key="form"
                                    onSubmit={handleSubmit}
                                    noValidate
                                    className="flex flex-col gap-4"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                                                {t("form.fullName")} <span className="text-[#402F75]">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                placeholder={t("form.fullNamePlaceholder")}
                                                value={form.fullName}
                                                onChange={handleChange}
                                                className={inputClass(!!errors.fullName)}
                                            />
                                            {errors.fullName && <p className="text-[11px] text-red-500 mt-1">{errors.fullName}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                                                {t("form.email")} <span className="text-[#402F75]">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                placeholder={t("form.emailPlaceholder")}
                                                value={form.email}
                                                onChange={handleChange}
                                                className={inputClass(!!errors.email)}
                                            />
                                            {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                                                {t("form.phone")} <span className="text-[#402F75]">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                maxLength={13}
                                                placeholder={t("form.phonePlaceholder")}
                                                value={form.phone}
                                                onChange={(e) => { const cleaned = e.target.value.replace(/[^\d+\s\-().]/g, "").slice(0, 13); setForm((p) => ({ ...p, phone: cleaned })); if (errors.phone) setErrors((p) => ({ ...p, phone: undefined })); }}
                                                className={inputClass(!!errors.phone)}
                                            />
                                            {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                                                {t("form.inquiryType")} <span className="text-[#402F75]">*</span>
                                            </label>
                                            <select
                                                name="inquiryType"
                                                value={form.inquiryType}
                                                onChange={handleChange}
                                                className={inputClass(!!errors.inquiryType)}
                                            >
                                                <option value="">— {t("form.inquiryType")} —</option>
                                                <option value="general">{t("form.inquiryTypes.general")}</option>
                                                <option value="support">{t("form.inquiryTypes.support")}</option>
                                                <option value="b2b">{t("form.inquiryTypes.b2b")}</option>
                                                <option value="other">{t("form.inquiryTypes.other")}</option>
                                            </select>
                                            {errors.inquiryType && <p className="text-[11px] text-red-500 mt-1">{errors.inquiryType}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                                            {t("form.message")} <span className="text-[#402F75]">*</span>
                                        </label>
                                        <textarea
                                            name="message"
                                            rows={4}
                                            placeholder={t("form.messagePlaceholder")}
                                            value={form.message}
                                            onChange={handleChange}
                                            className={`${inputClass(!!errors.message)} resize-none`}
                                        />
                                        {errors.message && <p className="text-[11px] text-red-500 mt-1">{errors.message}</p>}
                                    </div>

                                    <motion.button
                                        type="submit"
                                        disabled={loading}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-[15px] font-semibold text-white transition-all disabled:opacity-70"
                                        style={{ backgroundColor: "#FBBB14" }}
                                    >
                                        {loading ? (
                                            <motion.span
                                                className="block w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                            />
                                        ) : (
                                            <>
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="w-4 h-4"
                                                >
                                                    <line x1="22" y1="2" x2="11" y2="13" />
                                                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                                </svg>
                                                {t("form.submit")}
                                            </>
                                        )}
                                    </motion.button>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── ContactPage (default export) ──────────────────────────────────────────
export default function ContactPage() {
    const { t } = useTranslation("contact");
    const [selectedId, setSelectedId] = useState<CountryId>("az");
    const activeCountry = COUNTRIES.find((c) => c.id === selectedId)!;

    return (
        <main className="flex flex-col items-center justify-center pb-10 md:pb-16">
            {/* ── hero ─────────────────────────────────────────────────────── */}
            <section className="relative w-full flex flex-col items-center justify-center text-center pt-12 md:pt-20 pb-4 overflow-hidden">
                {/* large ghost title behind the globe */}
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="absolute top-0 inset-x-0 text-[clamp(40px,10vw,100px)] font-black tracking-widest select-none pointer-events-none"
                    style={{ color: "rgba(64,47,117,0.06)", lineHeight: 1 }}
                >
                    {t("hero.title").toUpperCase()}
                </motion.h1>

                <ScrollReveal delay={0.05}>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#402F75] bg-[#402F75]/10 px-3 py-[5px] rounded-full mb-4">
                        <span className="w-[5px] h-[5px] rounded-full bg-[#402F75]" />
                        {t("hero.label")}
                    </span>
                </ScrollReveal>

                <ScrollReveal delay={0.1}>
                    <p className="text-gray-500 text-[14px] md:text-[16px] max-w-sm mt-2">
                        {t("hero.subtitle")}
                    </p>
                </ScrollReveal>
            </section>

            {/* ── globe + country selector ─────────────────────────────────── */}
            <section className="w-full flex flex-col items-center mt-4 md:mt-8">
                <div className="w-[95%] md:w-[90%] flex flex-col items-center">
                    {/* top row: dropdown ←  globe  → tagline */}
                    <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
                        {/* country dropdown */}
                        <ScrollReveal direction="left" delay={0.1}>
                            <div className="relative">
                                <select
                                    value={selectedId}
                                    onChange={(e) => setSelectedId(e.target.value as CountryId)}
                                    className="appearance-none bg-white border border-gray-200 rounded-2xl ps-4 pe-10 py-3 text-[14px] font-semibold text-gray-800 outline-none focus:border-[#402F75] focus:ring-2 focus:ring-[#402F75]/12 transition-all shadow-sm cursor-pointer"
                                >
                                    {COUNTRIES.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.flagEmoji}  {t(c.nameKey)}
                                        </option>
                                    ))}
                                </select>
                                <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </span>
                            </div>
                        </ScrollReveal>

                        {/* tagline */}
                        <ScrollReveal direction="right" delay={0.1}>
                            <div className="flex items-center gap-2 text-[13px] text-gray-400 font-medium">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FBBB14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="2" y1="12" x2="22" y2="12" />
                                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                </svg>
                                {t("globe.chooseYourSide")}
                            </div>
                        </ScrollReveal>
                    </div>

                    {/* globe */}
                    <ScrollReveal delay={0.15}>
                        <Globe3D selectedId={selectedId} onSelect={setSelectedId} />
                    </ScrollReveal>
                </div>
            </section>

            {/* ── country info ─────────────────────────────────────────────── */}
            <section className="w-full flex justify-center mt-[40px] md:mt-[60px]">
                <div className="w-[95%] md:w-[90%]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4 }}
                            className="flex flex-col md:flex-row items-center gap-8 md:gap-12 bg-white rounded-3xl p-8 md:p-12 shadow-sm"
                        >
                            {/* info */}
                            <div className="flex-1">
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#402F75] bg-[#402F75]/10 px-3 py-[5px] rounded-full mb-4">
                                    {activeCountry.flagEmoji} {t(activeCountry.nameKey)}
                                </span>
                                <h2 className="text-[28px] md:text-[36px] font-extrabold text-gray-900 mb-6">
                                    {t(activeCountry.nameKey)}
                                </h2>

                                <div className="flex flex-col gap-4">
                                    {/* Email */}
                                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#f5f3ff]">
                                        <span
                                            className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
                                            style={{ backgroundColor: "#402F75" }}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                                <polyline points="22,6 12,13 2,6" />
                                            </svg>
                                        </span>
                                        <div>
                                            <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">
                                                {t("info.email")}
                                            </p>
                                            <p className="text-[15px] font-semibold text-[#402F75] mt-0.5">
                                                {activeCountry.email}
                                            </p>
                                            <p className="text-[12px] text-gray-400 mt-0.5">
                                                {t("info.emailNote")}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#f5f3ff]">
                                        <span
                                            className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
                                            style={{ backgroundColor: "#402F75" }}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                                            </svg>
                                        </span>
                                        <div>
                                            <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">
                                                {t("info.call")}
                                            </p>
                                            <p className="text-[15px] font-semibold text-[#402F75] mt-0.5">
                                                {activeCountry.phone}
                                            </p>
                                            <p className="text-[12px] text-gray-400 mt-0.5">
                                                {t("info.callNote")}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#f5f3ff]">
                                        <span
                                            className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
                                            style={{ backgroundColor: "#402F75" }}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                <circle cx="12" cy="10" r="3" />
                                            </svg>
                                        </span>
                                        <div>
                                            <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">
                                                {t("info.address")}
                                            </p>
                                            <p className="text-[15px] font-semibold text-[#402F75] mt-0.5">
                                                {activeCountry.address}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* country mini-globe */}
                            <motion.div
                                key={`shape-${selectedId}`}
                                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                className="flex-shrink-0 w-40 h-40 md:w-52 md:h-52"
                            >
                                <CountryShape countryId={selectedId} />
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>

                    {/* country quick-select pills */}
                    <div className="flex flex-wrap gap-2 mt-4 justify-center">
                        {COUNTRIES.map((c) => (
                            <motion.button
                                key={c.id}
                                onClick={() => setSelectedId(c.id)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-all ${
                                    c.id === selectedId
                                        ? "text-white shadow-md"
                                        : "bg-white text-gray-600 hover:bg-gray-50 shadow-sm"
                                }`}
                                style={
                                    c.id === selectedId
                                        ? { backgroundColor: "#402F75" }
                                        : {}
                                }
                            >
                                <span>{c.flagEmoji}</span>
                                <span>{t(c.nameKey)}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── contact form ─────────────────────────────────────────────── */}
            <ScrollReveal className="w-full flex justify-center" delay={0.05}>
                <ContactForm />
            </ScrollReveal>
        </main>
    );
}
