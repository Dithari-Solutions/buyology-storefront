"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import ProfileSidebar, { type Section } from "./ProfileSidebar";
import ProfileInfo from "./ProfileInfo";
import DeliveryAddress from "./DeliveryAddress";

export default function ProfilePage() {
    const { t } = useTranslation("profile");
    const [activeSection, setActiveSection] = useState<Section>("profile");

    const sectionMeta: Record<Section, { title: string; subtitle: string }> = {
        profile: { title: t("title"), subtitle: t("subtitle") },
        delivery: { title: t("deliveryAddress.title"), subtitle: t("deliveryAddress.subtitle") },
        orders: { title: t("orderHistory.title"), subtitle: t("orderHistory.subtitle") },
        settings: { title: t("settings.title"), subtitle: t("settings.subtitle") },
    };

    return (
        <>
            <Header />
            <main className="w-[90%] mx-auto py-8 md:py-12">
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
                    />

                    <div>
                        {activeSection === "profile" && <ProfileInfo />}
                        {activeSection === "delivery" && <DeliveryAddress />}
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
            <Footer />
        </>
    );
}
