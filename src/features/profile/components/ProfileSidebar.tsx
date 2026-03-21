"use client";

import Link from "next/link";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import type { RootState } from "@/store";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";
import StatusPopup from "@/features/auth/components/StatusPopup";
import { logout } from "@/features/auth/services/auth.api";
import { clearTokens } from "@/shared/lib/tokenManager";
import type { UserProfile } from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export type Section = "profile" | "delivery" | "orders" | "settings";

interface Props {
    activeSection: Section;
    onSectionChange: (section: Section) => void;
    profile?: UserProfile | null;
}

const mockUser = {
    membership: "Gold Member",
    orders: 5,
    reviews: 12,
    wishlist: 8,
    points: 2450,
    orderBadge: 5,
};

export default function ProfileSidebar({ activeSection, onSectionChange, profile }: Props) {
    const { t } = useTranslation("profile");
    const lang = useSelector((state: RootState) => state.language.lang) as Lang;
    const router = useRouter();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const cartSlug = PATH_SLUGS["cart"]?.[lang] ?? "cart";
    const favSlug = PATH_SLUGS["favourites"]?.[lang] ?? "favourites";

    const handleLogoutConfirm = async () => {
        setIsLoggingOut(true);
        await logout();
        clearTokens();
        setShowLogoutConfirm(false);
        router.push(`/${lang}/auth`);
    };

    const navItems: { key: Section; label: string; icon: React.ReactNode; badge?: number }[] = [
        {
            key: "profile",
            label: t("sidebar.nav.myProfile"),
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
            ),
        },
        {
            key: "delivery",
            label: t("sidebar.nav.deliveryAddress"),
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                </svg>
            ),
        },
        {
            key: "orders",
            label: t("sidebar.nav.orderHistory"),
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
            ),
            badge: mockUser.orderBadge,
        },
        {
            key: "settings",
            label: t("sidebar.nav.settings"),
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
            ),
        },
    ];

    return (
        <aside className="flex flex-col gap-4 w-full">
            {/* User card */}
            <div className="bg-white rounded-[20px] p-5 flex flex-col items-center text-center shadow-sm">
                <div className="relative w-[80px] h-[80px] rounded-full overflow-hidden bg-[#E5E0F5] mb-3 flex items-center justify-center">
                    {profile?.avatarUrl ? (
                        <img src={`${API_BASE}${profile.avatarUrl}`} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
                            <rect width="80" height="80" fill="#E5E0F5" />
                            <circle cx="40" cy="32" r="16" fill="#402F75" opacity="0.4" />
                            <ellipse cx="40" cy="72" rx="26" ry="18" fill="#402F75" opacity="0.25" />
                        </svg>
                    )}
                </div>

                <h3 className="font-bold text-[16px] text-gray-800">
                    {[profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || "—"}
                </h3>
                <p className="text-gray-400 text-[13px] mb-3">{profile?.email ?? ""}</p>

                <span className="inline-flex items-center gap-1.5 bg-[#FFF8E6] text-[#FBBB14] text-[12px] font-semibold px-3 py-1 rounded-full border border-[#FBBB14]/40">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="#FBBB14">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    {mockUser.membership}
                </span>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-2 mt-4 w-full">
                    {[
                        { value: mockUser.orders, label: t("sidebar.orders") },
                        { value: mockUser.reviews, label: t("sidebar.reviews") },
                        { value: mockUser.wishlist, label: t("sidebar.wishlist") },
                        { value: mockUser.points.toLocaleString(), label: t("sidebar.points") },
                    ].map(({ value, label }) => (
                        <div key={label} className="bg-[#F7F7F7] rounded-[12px] p-3">
                            <p className="font-bold text-[16px] text-gray-800">{value}</p>
                            <p className="text-gray-400 text-[12px]">{label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation */}
            <div className="bg-white rounded-[20px] p-3 shadow-sm">
                <ul className="flex flex-col gap-1">
                    {navItems.map(({ key, label, icon, badge }) => {
                        const isActive = activeSection === key;
                        return (
                            <li key={key}>
                                <button
                                    onClick={() => onSectionChange(key)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] text-[14px] font-medium transition-colors text-start cursor-pointer ${
                                        isActive
                                            ? "bg-[#402F75] text-white"
                                            : "text-gray-600 hover:bg-gray-50"
                                    }`}
                                >
                                    <span className="flex-shrink-0">{icon}</span>
                                    <span className="flex-1">{label}</span>
                                    {badge && (
                                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isActive ? "bg-white text-[#402F75]" : "bg-[#EDE9FF] text-[#402F75]"}`}>
                                            {badge}
                                        </span>
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-[20px] p-4 shadow-sm">
                <p className="text-[11px] font-semibold text-gray-400 tracking-widest mb-3 px-1">
                    {t("sidebar.quickLinks")}
                </p>
                <ul className="flex flex-col gap-1">
                    <li>
                        <Link
                            href={`/${lang}/${cartSlug}`}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[14px] text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="9" cy="21" r="1" />
                                <circle cx="20" cy="21" r="1" />
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 1.93-1.47L23 6H6" />
                            </svg>
                            {t("sidebar.shoppingCart")}
                        </Link>
                    </li>
                    <li>
                        <Link
                            href={`/${lang}/${favSlug}`}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[14px] text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                            {t("sidebar.favourites")}
                        </Link>
                    </li>
                </ul>
            </div>

            {/* Sign Out */}
            <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-[14px] bg-white shadow-sm text-[14px] font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                {t("sidebar.signOut")}
            </button>

            {/* Logout confirmation popup */}
            {showLogoutConfirm && (
                <StatusPopup
                    type="error"
                    title={t("sidebar.logout.confirmTitle")}
                    message={t("sidebar.logout.confirmMessage")}
                    buttonText={isLoggingOut ? "..." : t("sidebar.logout.confirm")}
                    onButtonClick={handleLogoutConfirm}
                    cancelText={t("sidebar.logout.cancel")}
                    onCancel={() => setShowLogoutConfirm(false)}
                />
            )}
        </aside>
    );
}
