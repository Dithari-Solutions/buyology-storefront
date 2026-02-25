"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import Logo from "@/../public/logo.png";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import CartIcon from "@/assets/icons/cart.png";
import LanguageSwitcher from "./LanguageSwitcher";
import FavIcon from "@/assets/icons/favourite.png";
import SearchIcon from "@/assets/icons/searchicon.svg";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";

// Maps nav key → canonical route segment (used as fallback when no localized slug exists)
const NAV_CANONICAL: Record<string, string> = {
    home: "",
    shop: "shop",
    catalog: "catalog",
    contactUs: "contact",
    buyobot: "buyobot",
    b2b: "b2b",
};

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const { t } = useTranslation("header");
    const lang = useSelector((state: { language: { lang: Lang } }) => state.language.lang);

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem("accessToken"));
    }, []);

    const navItems = t("nav", { returnObjects: true }) as Record<string, string>;

    function navHref(key: string): string {
        const canonical = NAV_CANONICAL[key];
        if (!canonical) return `/${lang}`;
        const slug = PATH_SLUGS[canonical]?.[lang] ?? canonical;
        return `/${lang}/${slug}`;
    }

    const authSlug = PATH_SLUGS["auth"]?.[lang] ?? "auth";

    return (
        <header className="pt-5 md:pt-[40px] flex items-center justify-center">
            <nav className="flex flex-wrap bg-gradient-to-b from-[#402F75] to-[#5A4589] w-[95%] md:w-[90%] py-[10px] md:py-[15px] px-[15px] md:px-[35px] rounded-[40px] items-center justify-between relative">
                {/* Logo */}
                <div className="cursor-pointer">
                    <Link href={`/${lang}`}>
                        <Image src={Logo} alt={t("logoAlt")} width={80} className="md:w-[100px]" />
                    </Link>
                </div>

                {/* Desktop Nav Links */}
                <div className="hidden lg:block">
                    <ul className="flex text-white gap-6 items-center">
                        {Object.entries(navItems).map(([key, label]) => (
                            <li key={key} className="cursor-pointer font-bold">
                                <Link href={navHref(key)}>{label}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Desktop Right Section */}
                <div className="hidden lg:flex items-center gap-[10px] xl:gap-[20px]">
                    <div className="flex items-center bg-white rounded-[40px] h-[35px] px-[10px]">
                        <Image src={SearchIcon} alt="search" width={20} className="me-[10px]" />
                        <input className="outline-none w-[120px] xl:w-auto" placeholder={t("searchPlaceholder")} type="search" />
                    </div>
                    <LanguageSwitcher />
                    {isLoggedIn ? (
                        <>
                            <div className="flex items-center justify-center bg-white h-[35px] w-[35px] rounded-full cursor-pointer">
                                <Image src={FavIcon} alt="favourite" />
                            </div>
                            <div className="flex items-center justify-center bg-white h-[35px] w-[35px] rounded-full cursor-pointer">
                                <Image src={CartIcon} alt="cart" />
                            </div>
                            <div className="flex items-center justify-center bg-white h-[35px] w-[35px] rounded-full cursor-pointer">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="8" r="4" />
                                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                </svg>
                            </div>
                        </>
                    ) : (
                        <Link href={`/${lang}/${authSlug}`}>
                            <button className="bg-[#FEBF12] rounded-[40px] px-[20px] xl:px-[30px] h-[35px] text-[15px] cursor-pointer font-bold text-white">{t("loginButton")}</button>
                        </Link>
                    )}
                </div>

                {/* Mobile Right: Search + Hamburger */}
                <div className="flex lg:hidden items-center gap-3">
                    {isLoggedIn ? (
                        <>
                            <div className="flex items-center justify-center bg-white h-[32px] w-[32px] rounded-full cursor-pointer">
                                <Image src={FavIcon} alt="favourite" width={18} />
                            </div>
                            <div className="flex items-center justify-center bg-white h-[32px] w-[32px] rounded-full cursor-pointer">
                                <Image src={CartIcon} alt="cart" width={18} />
                            </div>
                            <div className="flex items-center justify-center bg-white h-[32px] w-[32px] rounded-full cursor-pointer">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="8" r="4" />
                                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                </svg>
                            </div>
                        </>
                    ) : (
                        <Link href={`/${lang}/${authSlug}`}>
                            <button className="bg-[#FEBF12] rounded-[40px] px-[20px] h-[32px] text-[12px] cursor-pointer">{t("loginButton")}</button>
                        </Link>
                    )}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="text-white p-1 cursor-pointer"
                        aria-label="Toggle menu"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {menuOpen ? (
                                <path d="M6 6L18 18M6 18L18 6" />
                            ) : (
                                <path d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="lg:hidden w-full mt-3 pb-3">
                        <ul className="flex flex-col text-white gap-3 mb-4">
                            {Object.entries(navItems).map(([key, label]) => (
                                <li key={key} className="cursor-pointer">
                                    <Link href={navHref(key)}>{label}</Link>
                                </li>
                            ))}
                        </ul>
                        <div className="flex items-center bg-white rounded-[40px] h-[35px] px-[10px] w-full mb-3">
                            <Image src={SearchIcon} alt="search" width={20} className="me-[10px]" />
                            <input className="outline-none w-full" placeholder="Search..." type="search" />
                        </div>
                        <div className="flex items-center gap-3">
                            <LanguageSwitcher />
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}
