"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import Logo from "@/../public/logo.png";
import { useTranslation } from "react-i18next";
import SearchIcon from "@/assets/icons/searchicon.svg";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);

    const { t } = useTranslation("header");

    const navItems = t("nav", { returnObjects: true }) as Record<string, string>;

    return (
        <header className="pt-5 md:pt-[40px] flex items-center justify-center">
            <nav className="flex flex-wrap bg-[#402F75] w-[95%] md:w-[90%] py-[10px] md:py-[15px] px-[15px] md:px-[35px] rounded-[40px] items-center justify-between relative">
                {/* Logo */}
                <div className="cursor-pointer">
                    <Link href={"/"}>
                        <Image src={Logo} alt={t("logoAlt")} width={80} className="md:w-[100px]" />
                    </Link>
                </div>

                {/* Desktop Nav Links */}
                <div className="hidden lg:block">
                    <ul className="flex text-white gap-6 items-center">
                        {Object.values(navItems).map((label, index) => (
                            <li key={index} className="cursor-pointer font-bold">{label}</li>
                        ))}
                    </ul>
                </div>

                {/* Desktop Right Section */}
                <div className="hidden lg:flex items-center">
                    <div className="flex items-center bg-white rounded-[40px] h-[35px] px-[10px] mr-[10px] xl:mr-[20px]">
                        <Image src={SearchIcon} alt="search" width={20} className="mr-[10px]" />
                        <input className="outline-none w-[120px] xl:w-auto" placeholder={t("searchPlaceholder")} type="search" />
                    </div>
                    <div className="mr-[10px] xl:mr-[20px]">
                        <LanguageSwitcher />
                    </div>
                    <Link href={"/auth"}>
                        <button className="bg-[#FEBF12] rounded-[40px] px-[20px] xl:px-[30px] h-[35px] text-[15px] cursor-pointer font-bold text-white">{t("loginButton")}</button>
                    </Link>
                </div>

                {/* Mobile Right: Search + Hamburger */}
                <div className="flex lg:hidden items-center gap-3">
                    <Link href={"/auth"}>
                        <button className="bg-[#FEBF12] rounded-[40px] px-[20px] h-[32px] text-[12px] cursor-pointer">{t("loginButton")}</button>
                    </Link>
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
                            {Object.values(navItems).map((label, index) => (
                                <li key={index} className="cursor-pointer">{label}</li>
                            ))}
                        </ul>
                        <div className="flex items-center bg-white rounded-[40px] h-[35px] px-[10px] w-full mb-3">
                            <Image src={SearchIcon} alt="search" width={20} className="mr-[10px]" />
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
