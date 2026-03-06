"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

const mockAddress = {
    country: "Azerbaijan",
    streetAddress: "742 Evergreen Terrace, Apt 2C",
    stateRegion: "CA",
    city: "San Francisco",
    postalCode: "94105",
};

type AddressForm = typeof mockAddress;

const countries = [
    { code: "az", name: "Azerbaijan", flag: "🇦🇿" },
    { code: "us", name: "United States", flag: "🇺🇸" },
    { code: "gb", name: "United Kingdom", flag: "🇬🇧" },
    { code: "de", name: "Germany", flag: "🇩🇪" },
    { code: "fr", name: "France", flag: "🇫🇷" },
    { code: "tr", name: "Turkey", flag: "🇹🇷" },
    { code: "ru", name: "Russia", flag: "🇷🇺" },
];

export default function DeliveryAddress() {
    const { t } = useTranslation("profile");
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState<AddressForm>(mockAddress);
    const [saved, setSaved] = useState<AddressForm>(mockAddress);

    function handleSave() {
        setSaved(form);
        setIsEditing(false);
    }

    function handleCancel() {
        setForm(saved);
        setIsEditing(false);
    }

    const selectedFlag = countries.find((c) => c.name === saved.country)?.flag ?? "🌍";

    return (
        <div className="bg-white rounded-[20px] p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                    </svg>
                    <h2 className="font-bold text-[18px] text-gray-800">{t("deliveryAddress.heading")}</h2>
                </div>

                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-[13px] text-gray-600 hover:border-[#402F75] hover:text-[#402F75] transition-colors cursor-pointer"
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        {t("deliveryAddress.editButton")}
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCancel}
                            className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                            {t("deliveryAddress.cancelButton")}
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#402F75] text-white text-[13px] font-semibold hover:bg-[#2e2156] transition-colors cursor-pointer"
                        >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {t("deliveryAddress.saveButton")}
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-col sm:flex-row gap-5">
                {/* Country selector + Map */}
                <div className="flex flex-col gap-3 sm:w-[200px] flex-shrink-0">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[16px] pointer-events-none">
                            {countries.find((c) => c.name === form.country)?.flag ?? "🌍"}
                        </span>
                        <select
                            value={form.country}
                            onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
                            disabled={!isEditing}
                            className="w-full appearance-none border border-gray-200 rounded-[10px] ps-9 pe-8 py-2.5 text-[14px] text-gray-700 bg-white outline-none focus:border-[#402F75] transition-colors cursor-pointer disabled:cursor-default"
                        >
                            {countries.map((c) => (
                                <option key={c.code} value={c.name}>{c.name}</option>
                            ))}
                        </select>
                        <svg className="absolute end-2.5 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </div>

                    {/* Map illustration */}
                    <div className="flex-1 bg-[#F0EDF8] rounded-[14px] flex items-center justify-center min-h-[130px] overflow-hidden">
                        <svg viewBox="0 0 200 120" className="w-full opacity-50" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M25 65 Q35 30 68 28 Q95 18 128 32 Q162 42 155 65 Q145 88 112 82 Q82 90 58 74 Q28 68 25 65Z"
                                fill="#402F75"
                            />
                            <circle cx="98" cy="52" r="6" fill="#FBBB14" />
                            <line x1="98" y1="52" x2="98" y2="38" stroke="#FBBB14" strokeWidth="2" />
                            <circle cx="98" cy="36" r="3" fill="#FBBB14" />
                        </svg>
                    </div>
                </div>

                {/* Address fields */}
                {isEditing ? (
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">{t("deliveryAddress.streetAddress")}</label>
                            <input
                                type="text"
                                value={form.streetAddress}
                                onChange={(e) => setForm((prev) => ({ ...prev, streetAddress: e.target.value }))}
                                placeholder={t("deliveryAddress.placeholderText")}
                                className="w-full border border-gray-200 rounded-[10px] px-4 py-2.5 text-[14px] text-gray-700 outline-none focus:border-[#402F75] transition-colors placeholder:text-gray-300"
                            />
                        </div>
                        <div>
                            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">{t("deliveryAddress.stateRegion")}</label>
                            <input
                                type="text"
                                value={form.stateRegion}
                                onChange={(e) => setForm((prev) => ({ ...prev, stateRegion: e.target.value }))}
                                placeholder={t("deliveryAddress.placeholderText")}
                                className="w-full border border-gray-200 rounded-[10px] px-4 py-2.5 text-[14px] text-gray-700 outline-none focus:border-[#402F75] transition-colors placeholder:text-gray-300"
                            />
                        </div>
                        <div>
                            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">{t("deliveryAddress.city")}</label>
                            <input
                                type="text"
                                value={form.city}
                                onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                                placeholder={t("deliveryAddress.placeholderText")}
                                className="w-full border border-gray-200 rounded-[10px] px-4 py-2.5 text-[14px] text-gray-700 outline-none focus:border-[#402F75] transition-colors placeholder:text-gray-300"
                            />
                        </div>
                        <div>
                            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">{t("deliveryAddress.postalCode")}</label>
                            <input
                                type="text"
                                value={form.postalCode}
                                onChange={(e) => setForm((prev) => ({ ...prev, postalCode: e.target.value }))}
                                placeholder={t("deliveryAddress.placeholderText")}
                                className="w-full border border-gray-200 rounded-[10px] px-4 py-2.5 text-[14px] text-gray-700 outline-none focus:border-[#402F75] transition-colors placeholder:text-gray-300"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
                        <div className="sm:col-span-2">
                            <p className="text-[12px] text-gray-400 mb-1">{t("deliveryAddress.streetAddress")}</p>
                            <p className="text-[15px] font-medium text-gray-800">{saved.streetAddress}</p>
                        </div>
                        <div>
                            <p className="text-[12px] text-gray-400 mb-1">{t("deliveryAddress.stateRegion")}</p>
                            <p className="text-[15px] font-medium text-gray-800">{saved.stateRegion}</p>
                        </div>
                        <div>
                            <p className="text-[12px] text-gray-400 mb-1">{t("deliveryAddress.city")}</p>
                            <p className="text-[15px] font-medium text-gray-800">{saved.city}</p>
                        </div>
                        <div>
                            <p className="text-[12px] text-gray-400 mb-1">{t("deliveryAddress.postalCode")}</p>
                            <div className="flex items-center justify-between">
                                <p className="text-[15px] font-medium text-gray-800">{saved.postalCode}</p>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="w-8 h-8 bg-[#FBBB14] rounded-full flex items-center justify-center hover:bg-[#e6a800] transition-colors cursor-pointer"
                                    aria-label="Add address"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="5" x2="12" y2="19" />
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Privacy note */}
            <div className="mt-6 bg-[#EDE9FF] rounded-[12px] px-4 py-3 flex items-start gap-3">
                <svg className="flex-shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <p className="text-[12px] text-[#402F75]">{t("deliveryAddress.privacyNote")}</p>
            </div>
        </div>
    );
}
