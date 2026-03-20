"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ShippingFormData } from "../types";

const COUNTRIES = [
    { code: "AZ", name: "Azerbaijan" },
    { code: "AE", name: "United Arab Emirates" },
    { code: "SA", name: "Saudi Arabia" },
    { code: "EG", name: "Egypt" },
    { code: "TR", name: "Turkey" },
    { code: "DE", name: "Germany" },
    { code: "FR", name: "France" },
    { code: "GB", name: "United Kingdom" },
    { code: "US", name: "United States" },
    { code: "RU", name: "Russia" },
];

const EMPTY_FORM: ShippingFormData = {
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    streetAddress: "",
    apartment: "",
    country: "AZ",
    city: "",
    postalCode: "",
    saveInfo: false,
};

interface ShippingStepProps {
    onContinue: (data: ShippingFormData) => void;
    initialData?: ShippingFormData;
}

export default function ShippingStep({ onContinue, initialData }: ShippingStepProps) {
    const { t } = useTranslation("checkout");
    const [form, setForm] = useState<ShippingFormData>(initialData ?? EMPTY_FORM);
    const [errors, setErrors] = useState<Partial<Record<keyof ShippingFormData, string>>>({});

    function setField<K extends keyof ShippingFormData>(key: K, value: ShippingFormData[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    }

    function validate(): boolean {
        const newErrors: Partial<Record<keyof ShippingFormData, string>> = {};
        if (!form.email.trim()) newErrors.email = t("validation.required");
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = t("validation.invalidEmail");
        if (!form.firstName.trim()) newErrors.firstName = t("validation.required");
        if (!form.lastName.trim()) newErrors.lastName = t("validation.required");
        if (!form.streetAddress.trim()) newErrors.streetAddress = t("validation.required");
        if (!form.city.trim()) newErrors.city = t("validation.required");
        if (!form.postalCode.trim()) newErrors.postalCode = t("validation.required");
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (validate()) onContinue(form);
    }

    const inputBase = "border rounded-xl px-3.5 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 outline-none focus:ring-2 transition-all";
    const inputNormal = `${inputBase} border-gray-200 focus:border-[#402F75] focus:ring-[#402F75]/10`;
    const inputError = `${inputBase} border-red-400 focus:border-red-400 focus:ring-red-100`;

    return (
        <form onSubmit={handleSubmit} noValidate>
            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
                <h2 className="text-[16px] font-bold text-gray-900 mb-5">{t("contact.heading")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="email" className="text-[13px] font-semibold text-gray-700">
                            {t("contact.email")}<span className="text-red-400 ml-0.5">*</span>
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder={t("contact.emailPlaceholder")}
                            value={form.email}
                            onChange={(e) => setField("email", e.target.value)}
                            className={errors.email ? inputError : inputNormal}
                        />
                        {errors.email && <p className="text-[11px] text-red-500 mt-0.5">{errors.email}</p>}
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="phone" className="text-[13px] font-semibold text-gray-700">
                            {t("contact.phone")}
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            placeholder={t("contact.phonePlaceholder")}
                            value={form.phone}
                            onChange={(e) => setField("phone", e.target.value)}
                            className={inputNormal}
                        />
                    </div>
                </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
                <h2 className="text-[16px] font-bold text-gray-900 mb-5">{t("address.heading")}</h2>
                <div className="flex flex-col gap-4">
                    {/* Name row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="firstName" className="text-[13px] font-semibold text-gray-700">
                                {t("address.firstName")}<span className="text-red-400 ml-0.5">*</span>
                            </label>
                            <input
                                id="firstName"
                                placeholder={t("address.placeholder")}
                                value={form.firstName}
                                onChange={(e) => setField("firstName", e.target.value)}
                                className={errors.firstName ? inputError : inputNormal}
                            />
                            {errors.firstName && <p className="text-[11px] text-red-500 mt-0.5">{errors.firstName}</p>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="lastName" className="text-[13px] font-semibold text-gray-700">
                                {t("address.lastName")}<span className="text-red-400 ml-0.5">*</span>
                            </label>
                            <input
                                id="lastName"
                                placeholder={t("address.placeholder")}
                                value={form.lastName}
                                onChange={(e) => setField("lastName", e.target.value)}
                                className={errors.lastName ? inputError : inputNormal}
                            />
                            {errors.lastName && <p className="text-[11px] text-red-500 mt-0.5">{errors.lastName}</p>}
                        </div>
                    </div>

                    {/* Street address */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="streetAddress" className="text-[13px] font-semibold text-gray-700">
                            {t("address.street")}<span className="text-red-400 ml-0.5">*</span>
                        </label>
                        <input
                            id="streetAddress"
                            placeholder={t("address.placeholder")}
                            value={form.streetAddress}
                            onChange={(e) => setField("streetAddress", e.target.value)}
                            className={errors.streetAddress ? inputError : inputNormal}
                        />
                        {errors.streetAddress && <p className="text-[11px] text-red-500 mt-0.5">{errors.streetAddress}</p>}
                    </div>

                    {/* Apartment */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="apartment" className="text-[13px] font-semibold text-gray-700">
                            {t("address.apartment")}
                        </label>
                        <input
                            id="apartment"
                            placeholder={t("address.placeholder")}
                            value={form.apartment}
                            onChange={(e) => setField("apartment", e.target.value)}
                            className={inputNormal}
                        />
                    </div>

                    {/* Country / City / Postal */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Country */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="country" className="text-[13px] font-semibold text-gray-700">
                                {t("address.country")}<span className="text-red-400 ml-0.5">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    id="country"
                                    value={form.country}
                                    onChange={(e) => setField("country", e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] text-gray-800 outline-none focus:border-[#402F75] focus:ring-2 focus:ring-[#402F75]/10 transition-all appearance-none bg-white cursor-pointer pr-9"
                                >
                                    {COUNTRIES.map((c) => (
                                        <option key={c.code} value={c.code}>{c.name}</option>
                                    ))}
                                </select>
                                <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </div>
                        </div>

                        {/* City */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="city" className="text-[13px] font-semibold text-gray-700">
                                {t("address.city")}<span className="text-red-400 ml-0.5">*</span>
                            </label>
                            <input
                                id="city"
                                placeholder={t("address.placeholder")}
                                value={form.city}
                                onChange={(e) => setField("city", e.target.value)}
                                className={errors.city ? inputError : inputNormal}
                            />
                            {errors.city && <p className="text-[11px] text-red-500 mt-0.5">{errors.city}</p>}
                        </div>

                        {/* Postal */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="postalCode" className="text-[13px] font-semibold text-gray-700">
                                {t("address.postalCode")}<span className="text-red-400 ml-0.5">*</span>
                            </label>
                            <input
                                id="postalCode"
                                placeholder={t("address.placeholder")}
                                value={form.postalCode}
                                onChange={(e) => setField("postalCode", e.target.value)}
                                className={errors.postalCode ? inputError : inputNormal}
                            />
                            {errors.postalCode && <p className="text-[11px] text-red-500 mt-0.5">{errors.postalCode}</p>}
                        </div>
                    </div>

                    {/* Save info */}
                    <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.saveInfo}
                            onChange={(e) => setField("saveInfo", e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 accent-[#402F75] cursor-pointer"
                        />
                        <span className="text-[13px] text-gray-600">{t("address.saveInfo")}</span>
                    </label>
                </div>
            </div>

            {/* CTA */}
            <button
                type="submit"
                className="w-full bg-[#FBBB14] hover:bg-[#f0b000] active:scale-[0.98] transition-all py-[14px] rounded-xl font-bold text-[15px] text-gray-900 flex items-center justify-center gap-2 cursor-pointer"
            >
                {t("cta.continueToPayment")}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
            </button>
        </form>
    );
}
