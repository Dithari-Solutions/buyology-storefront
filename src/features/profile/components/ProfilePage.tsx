"use client";

import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useRouter, useSearchParams } from "next/navigation";
import type { RootState } from "@/store";
import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import GuestPrompt from "@/shared/components/GuestPrompt";
import ProfileSidebar, { type Section } from "./ProfileSidebar";
import ProfileInfo from "./ProfileInfo";
import DeliveryAddress from "./DeliveryAddress";
import MembershipDashboard from "@/features/membership/components/MembershipDashboard";
import ProfileRepairs from "./ProfileRepairs";
import ProfileSellRequests from "./ProfileSellRequests";
import type { UserProfile } from "../types";
import { getProfile } from "../services/profile.api";

const MISSING_LABELS: Record<string, string> = {
    firstName: "first name",
    lastName: "surname",
    phoneNumber: "phone number",
    phoneVerification: "phone verification",
    deliveryAddress: "a delivery address",
};

export default function ProfilePage() {
    const { t } = useTranslation("profile");
    const userId = useSelector((state: RootState) => state.auth.userId);
    const authRestored = useSelector((state: RootState) => state.auth.isRestored);
    const lang = useSelector((state: RootState) => state.language.lang) as string;
    const router = useRouter();
    const searchParams = useSearchParams();
    // Came here from checkout to finish a required field — show a "return to checkout" prompt.
    const returnToCheckout = searchParams.get("returnTo") === "checkout";
    const [activeSection, setActiveSection] = useState<Section>("profile");

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);

    const refreshProfile = useCallback(() => {
        if (!userId) return;
        getProfile(userId).then(setProfile).catch(() => {});
    }, [userId]);

    useEffect(() => {
        if (!userId) return;
        setProfileLoading(true);
        getProfile(userId)
            .then(setProfile)
            .catch(() => setProfile(null))
            .finally(() => setProfileLoading(false));
    }, [userId]);

    const sectionMeta: Record<Section, { title: string; subtitle: string }> = {
        profile: { title: t("title"), subtitle: t("subtitle") },
        delivery: { title: t("deliveryAddress.title"), subtitle: t("deliveryAddress.subtitle") },
        orders: { title: t("orderHistory.title"), subtitle: t("orderHistory.subtitle") },
        repairs: {
            title: t("repairs.title", { defaultValue: "Repairs" }),
            subtitle: t("repairs.subtitle", {
                defaultValue: "Track your device repair requests, or start a new one.",
            }),
        },
        sell: {
            title: t("sell.title", { defaultValue: "Sell" }),
            subtitle: t("sell.subtitle", {
                defaultValue: "Track the devices you're selling to us, or offer us another one.",
            }),
        },
        settings: { title: t("settings.title"), subtitle: t("settings.subtitle") },
        membership: { title: "B2B Membership", subtitle: "Manage your B2B membership, wallet, and digital card" },
    };

    // Not signed in → prompt to sign in / create account.
    if (authRestored && !userId) {
        return (
            <>
                <Header />
                <main className="w-[90%] mx-auto min-h-[60vh] flex flex-col py-8 md:py-12">
                    <GuestPrompt
                        icon={
                            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        }
                        title={t("guest.title", { defaultValue: "Log in to access your profile" })}
                        subtitle={t("guest.subtitle", { defaultValue: "Log in or create an account to manage your profile, addresses, and orders." })}
                    />
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main className={`w-[90%] mx-auto py-8 md:py-12 ${returnToCheckout ? "pb-28" : ""}`}>
                <div className="mb-6">
                    <h1 className="text-[24px] md:text-[28px] font-bold text-gray-800">
                        {sectionMeta[activeSection].title}
                    </h1>
                    <p className="text-gray-400 text-[14px]">
                        {sectionMeta[activeSection].subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr] gap-6 items-start">
                    <ProfileSidebar
                        activeSection={activeSection}
                        onSectionChange={setActiveSection}
                        profile={profile}
                    />

                    <div>
                        {activeSection === "profile" && (
                            <ProfileInfo
                                profile={profile}
                                isLoading={profileLoading}
                                onProfileUpdate={setProfile}
                            />
                        )}
                        {activeSection === "delivery" && <DeliveryAddress onChanged={refreshProfile} />}
                        {activeSection === "orders" && (
                            <div className="bg-white rounded-[20px] p-12 shadow-sm flex flex-col items-center justify-center gap-4 text-center">
                                <div className="w-16 h-16 rounded-full bg-[#EDE9FF] flex items-center justify-center">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                        <line x1="3" y1="6" x2="21" y2="6" />
                                        <path d="M16 10a4 4 0 0 1-8 0" />
                                    </svg>
                                </div>
                                <p className="text-gray-400 text-[14px]">{t("orderHistory.comingSoon")}</p>
                            </div>
                        )}
                        {activeSection === "repairs" && <ProfileRepairs />}
                        {activeSection === "sell" && <ProfileSellRequests />}
                        {activeSection === "membership" && <MembershipDashboard />}
                        {activeSection === "settings" && (
                            <div className="bg-white rounded-[20px] p-12 shadow-sm flex flex-col items-center justify-center gap-4 text-center">
                                <div className="w-16 h-16 rounded-full bg-[#EDE9FF] flex items-center justify-center">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="3" />
                                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                    </svg>
                                </div>
                                <p className="text-gray-400 text-[14px]">{t("settings.comingSoon")}</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Came from checkout: guide them back once the profile is order-ready. */}
            {returnToCheckout && profile && (
                <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur px-4 py-3 shadow-[0_-6px_20px_-12px_rgba(0,0,0,0.25)]">
                    <div className="mx-auto flex w-[90%] max-w-3xl items-center justify-between gap-3">
                        {profile.paymentReady ? (
                            <>
                                <p className="text-[13px] font-semibold text-gray-800">
                                    {t("returnToCheckout.ready", { defaultValue: "You're all set — back to your order." })}
                                </p>
                                <button
                                    onClick={() => router.push(`/${lang}/checkout`)}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-[#FBBB14] px-5 py-2.5 text-[13px] font-bold text-gray-900 hover:bg-[#f0b000] transition-colors cursor-pointer"
                                >
                                    {t("returnToCheckout.button", { defaultValue: "Return to checkout" })}
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rtl:rotate-180"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                </button>
                            </>
                        ) : (
                            <>
                                <p className="text-[12px] text-gray-600">
                                    {t("returnToCheckout.pending", { defaultValue: "Finish these to continue your order:" })}{" "}
                                    <span className="font-semibold text-gray-800">
                                        {(profile.missingFields ?? []).map((f) => MISSING_LABELS[f] ?? f).join(", ")}
                                    </span>
                                </p>
                                <button
                                    onClick={() => router.push(`/${lang}/checkout`)}
                                    className="text-[12px] font-semibold text-[#402F75] hover:underline whitespace-nowrap cursor-pointer"
                                >
                                    {t("returnToCheckout.back", { defaultValue: "Back to checkout" })}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
            <Footer />
        </>
    );
}
