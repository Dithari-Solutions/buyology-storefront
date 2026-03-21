"use client";

import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import type { RootState } from "@/store";
import type { UserProfile } from "../types";
import { updateProfile, uploadAvatar } from "../services/profile.api";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

interface Props {
    profile: UserProfile | null;
    isLoading: boolean;
    onProfileUpdate: (updated: UserProfile) => void;
}

interface EditForm {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    dateOfBirth: string;
}

export default function ProfileInfo({ profile, isLoading, onProfileUpdate }: Props) {
    const { t } = useTranslation("profile");
    const userId = useSelector((state: RootState) => state.auth.userId);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [form, setForm] = useState<EditForm>({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        dateOfBirth: "",
    });

    useEffect(() => {
        if (profile) {
            setForm({
                firstName: profile.firstName ?? "",
                lastName: profile.lastName ?? "",
                phoneNumber: profile.phoneNumber ?? "",
                dateOfBirth: profile.dateOfBirth ?? "",
            });
        }
    }, [profile]);

    function handleEdit() {
        if (profile) {
            setForm({
                firstName: profile.firstName ?? "",
                lastName: profile.lastName ?? "",
                phoneNumber: profile.phoneNumber ?? "",
                dateOfBirth: profile.dateOfBirth ?? "",
            });
        }
        setSaveError(null);
        setIsEditing(true);
    }

    function handleCancel() {
        setIsEditing(false);
        setSaveError(null);
    }

    async function handleSave() {
        if (!userId) return;
        setIsSaving(true);
        setSaveError(null);
        try {
            const updated = await updateProfile(userId, {
                firstName: form.firstName || undefined,
                lastName: form.lastName || undefined,
                phoneNumber: form.phoneNumber || undefined,
                dateOfBirth: form.dateOfBirth || undefined,
            });
            onProfileUpdate(updated);
            setIsEditing(false);
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : "Failed to save changes.");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file || !userId) return;
        setIsUploadingAvatar(true);
        try {
            const updated = await uploadAvatar(userId, file);
            onProfileUpdate(updated);
        } catch {
            // silent — avatar is optional
        } finally {
            setIsUploadingAvatar(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }

    const avatarSrc = profile?.avatarUrl ? `${API_BASE}${profile.avatarUrl}` : null;
    const displayName = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || "—";

    const missingLabels: Record<string, string> = {
        firstName: t("personalInfo.firstName"),
        lastName: t("personalInfo.lastName"),
        phoneNumber: t("personalInfo.phone"),
        deliveryAddress: t("deliveryAddress.heading"),
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-[20px] p-6 shadow-sm flex items-center justify-center min-h-[200px]">
                <div className="w-8 h-8 rounded-full border-2 border-[#402F75] border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <>
            {/* Incomplete profile banner */}
            {profile && !profile.paymentReady && profile.missingFields.length > 0 && (
                <div className="mb-4 bg-amber-50 border border-amber-200 rounded-[14px] px-4 py-3 flex items-start gap-3">
                    <svg className="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <div>
                        <p className="text-[13px] font-semibold text-amber-800">Complete your profile to enable checkout</p>
                        <p className="text-[12px] text-amber-700 mt-0.5">
                            Missing:{" "}
                            {profile.missingFields
                                .map((f) => missingLabels[f] ?? f)
                                .join(", ")}
                        </p>
                    </div>
                </div>
            )}

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
                            onClick={handleEdit}
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
                                disabled={isSaving}
                                className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                            >
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                                {t("personalInfo.cancelButton")}
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#402F75] text-white text-[13px] font-semibold hover:bg-[#2e2156] transition-colors cursor-pointer disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <div className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                ) : (
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                                {t("personalInfo.saveButton")}
                            </button>
                        </div>
                    )}
                </div>

                {/* Avatar + fields layout */}
                <div className="flex flex-col sm:flex-row gap-6">
                    {/* Avatar */}
                    <div className="flex flex-col items-center gap-2 flex-shrink-0">
                        <div className="relative w-[96px] h-[96px]">
                            <div className="w-full h-full rounded-full overflow-hidden bg-[#E5E0F5] flex items-center justify-center">
                                {avatarSrc ? (
                                    <img src={avatarSrc} alt={displayName} className="w-full h-full object-cover" />
                                ) : (
                                    <svg viewBox="0 0 96 96" className="w-full h-full" fill="none">
                                        <rect width="96" height="96" fill="#E5E0F5" />
                                        <circle cx="48" cy="38" r="18" fill="#402F75" opacity="0.4" />
                                        <ellipse cx="48" cy="86" rx="30" ry="20" fill="#402F75" opacity="0.25" />
                                    </svg>
                                )}
                            </div>
                            {/* Upload button */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploadingAvatar}
                                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#FBBB14] flex items-center justify-center shadow-sm hover:bg-[#e6a800] transition-colors cursor-pointer disabled:opacity-50"
                                aria-label="Upload avatar"
                            >
                                {isUploadingAvatar ? (
                                    <div className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                ) : (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="17 8 12 3 7 8" />
                                        <line x1="12" y1="3" x2="12" y2="15" />
                                    </svg>
                                )}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                        </div>
                        <p className="text-[11px] text-gray-400 text-center">Tap to update photo</p>
                    </div>

                    {/* Fields */}
                    <div className="flex-1">
                        {isEditing ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Email — read-only */}
                                <div className="sm:col-span-2">
                                    <label className="block text-[13px] font-medium text-gray-400 mb-1.5">
                                        {t("personalInfo.email")} <span className="text-[11px] text-gray-400">(read-only)</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={profile?.email ?? ""}
                                        disabled
                                        className="w-full border border-gray-100 rounded-[10px] px-4 py-2.5 text-[14px] text-gray-400 bg-gray-50 cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-600 mb-1.5">{t("personalInfo.firstName")}</label>
                                    <input
                                        type="text"
                                        value={form.firstName}
                                        onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                                        placeholder={t("personalInfo.placeholder")}
                                        maxLength={100}
                                        className="w-full border border-gray-200 rounded-[10px] px-4 py-2.5 text-[14px] text-gray-700 outline-none focus:border-[#402F75] transition-colors placeholder:text-gray-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-600 mb-1.5">{t("personalInfo.lastName")}</label>
                                    <input
                                        type="text"
                                        value={form.lastName}
                                        onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                                        placeholder={t("personalInfo.placeholder")}
                                        maxLength={100}
                                        className="w-full border border-gray-200 rounded-[10px] px-4 py-2.5 text-[14px] text-gray-700 outline-none focus:border-[#402F75] transition-colors placeholder:text-gray-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-600 mb-1.5">{t("personalInfo.phone")}</label>
                                    <input
                                        type="tel"
                                        value={form.phoneNumber}
                                        onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                                        placeholder="+971501234567"
                                        className="w-full border border-gray-200 rounded-[10px] px-4 py-2.5 text-[14px] text-gray-700 outline-none focus:border-[#402F75] transition-colors placeholder:text-gray-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-600 mb-1.5">{t("personalInfo.dob")}</label>
                                    <input
                                        type="date"
                                        value={form.dateOfBirth}
                                        onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-[10px] px-4 py-2.5 text-[14px] text-gray-700 outline-none focus:border-[#402F75] transition-colors"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-10">
                                {/* Email — full-width read-only row */}
                                <div className="sm:col-span-2">
                                    <p className="text-[12px] text-gray-400 mb-1.5">{t("personalInfo.email")}</p>
                                    <div className="flex items-center gap-2">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                            <polyline points="22,6 12,13 2,6" />
                                        </svg>
                                        <span className="text-[15px] font-medium text-gray-800">
                                            {profile?.email ?? "—"}
                                        </span>
                                        <span className="text-[11px] text-gray-400 ml-1">(read-only)</span>
                                    </div>
                                </div>
                                {[
                                    {
                                        label: t("personalInfo.firstName"),
                                        value: profile?.firstName ?? "—",
                                        icon: (
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="8" r="4" />
                                                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                            </svg>
                                        ),
                                    },
                                    {
                                        label: t("personalInfo.lastName"),
                                        value: profile?.lastName ?? "—",
                                        icon: (
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="8" r="4" />
                                                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                            </svg>
                                        ),
                                    },
                                    {
                                        label: t("personalInfo.phone"),
                                        value: profile?.phoneNumber ?? "—",
                                        icon: (
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.23h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6.08 6.08l.97-.97a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                            </svg>
                                        ),
                                    },
                                    {
                                        label: t("personalInfo.dob"),
                                        value: profile?.dateOfBirth ?? "—",
                                        icon: (
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                                <line x1="16" y1="2" x2="16" y2="6" />
                                                <line x1="8" y1="2" x2="8" y2="6" />
                                                <line x1="3" y1="10" x2="21" y2="10" />
                                            </svg>
                                        ),
                                    },
                                ].map(({ label, value, icon }) => (
                                    <div key={label}>
                                        <p className="text-[12px] text-gray-400 mb-1.5">{label}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="flex-shrink-0">{icon}</span>
                                            <span className="text-[15px] font-medium text-gray-800">{value}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {saveError && (
                            <p className="mt-3 text-[12px] text-red-500">{saveError}</p>
                        )}
                    </div>
                </div>
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
