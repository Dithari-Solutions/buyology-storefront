"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

const mockProfile = {
    firstName: "Alexandra",
    lastName: "Mitchell",
    email: "alex.mitchell@example.com",
    phone: "+1 (415) 555-0184",
    dob: "June 14, 1992",
};

type ProfileForm = typeof mockProfile;

export default function ProfileInfo() {
    const { t } = useTranslation("profile");
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState<ProfileForm>(mockProfile);
    const [saved, setSaved] = useState<ProfileForm>(mockProfile);

    function handleSave() {
        setSaved(form);
        setIsEditing(false);
    }

    function handleCancel() {
        setForm(saved);
        setIsEditing(false);
    }

    const viewFields = [
        {
            key: "firstName" as keyof ProfileForm,
            label: t("personalInfo.firstName"),
            icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
            ),
        },
        {
            key: "lastName" as keyof ProfileForm,
            label: t("personalInfo.lastName"),
            icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
            ),
        },
        {
            key: "email" as keyof ProfileForm,
            label: t("personalInfo.email"),
            icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                </svg>
            ),
        },
        {
            key: "phone" as keyof ProfileForm,
            label: t("personalInfo.phone"),
            icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.23h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6.08 6.08l.97-.97a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
            ),
        },
        {
            key: "dob" as keyof ProfileForm,
            label: t("personalInfo.dob"),
            icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
            ),
        },
    ];

    const editFields: { key: keyof ProfileForm; label: string }[] = [
        { key: "firstName", label: t("personalInfo.firstName") },
        { key: "lastName", label: t("personalInfo.lastName") },
        { key: "email", label: t("personalInfo.email") },
        { key: "phone", label: t("personalInfo.phone") },
        { key: "dob", label: t("personalInfo.dob") },
    ];

    return (
        <>
        <div className="bg-white rounded-[20px] p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                    <h2 className="font-bold text-[18px] text-gray-800">{t("personalInfo.heading")}</h2>
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
                        {t("personalInfo.editButton")}
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
                            {t("personalInfo.cancelButton")}
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#402F75] text-white text-[13px] font-semibold hover:bg-[#2e2156] transition-colors cursor-pointer"
                        >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {t("personalInfo.saveButton")}
                        </button>
                    </div>
                )}
            </div>

            {/* Fields */}
            {isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {editFields.map(({ key, label }) => (
                        <div key={key}>
                            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">{label}</label>
                            <input
                                type="text"
                                value={form[key]}
                                onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                                placeholder={t("personalInfo.placeholder")}
                                className="w-full border border-gray-200 rounded-[10px] px-4 py-2.5 text-[14px] text-gray-700 outline-none focus:border-[#402F75] transition-colors placeholder:text-gray-300"
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-10">
                    {viewFields.map(({ key, label, icon }) => (
                        <div key={key}>
                            <p className="text-[12px] text-gray-400 mb-1.5">{label}</p>
                            <div className="flex items-center gap-2">
                                <span className="flex-shrink-0">{icon}</span>
                                <span className="text-[15px] font-medium text-gray-800">{saved[key]}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Privacy note */}
        </div>
            <div className="mt-6 bg-[#EDE9FF] rounded-[12px] px-4 py-3 flex items-start gap-3">
                <svg className="flex-shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <p className="text-[12px] text-[#402F75]">{t("personalInfo.privacyNote")}</p>
            </div>
            </>
    );
}
