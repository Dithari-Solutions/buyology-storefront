"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Logo from "@/../public/logo.png";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import CartIcon from "@/assets/icons/cart.png";
import LanguageSwitcher from "./LanguageSwitcher";
import FavIcon from "@/assets/icons/favourite.png";
import SearchIcon from "@/assets/icons/searchicon.svg";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";

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
    const [isSticky, setIsSticky] = useState(false);

    const sentinelRef = useRef<HTMLDivElement>(null);

    const { t } = useTranslation("header");
    const lang = useSelector((state: { language: { lang: Lang } }) => state.language.lang);

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem("accessToken"));
    }, []);

    // Detect when the sentinel (placed above the header) leaves the viewport.
    // That's the moment the header "becomes sticky" — trigger the slide animation.
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsSticky(!entry.isIntersecting);
                if (entry.isIntersecting) setMenuOpen(false);
            },
            { threshold: 0 }
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, []);

    const navItems = t("nav", { returnObjects: true }) as Record<string, string>;

    function navHref(key: string): string {
        const canonical = NAV_CANONICAL[key];
        if (!canonical) return `/${lang}`;
        const slug = PATH_SLUGS[canonical]?.[lang] ?? canonical;
        return `/${lang}/${slug}`;
    }

    const authSlug = PATH_SLUGS["auth"]?.[lang] ?? "auth";
    const cartSlug = PATH_SLUGS["cart"]?.[lang] ?? "cart";

    return (
        <>
            {/* Sentinel — sits above the header; when it scrolls off-screen the sticky animation fires */}
            <div ref={sentinelRef} className="h-px" aria-hidden="true" />

            <header
                className={`
                    sticky top-0 z-50
                    flex items-center justify-center
                    transition-all duration-300 ease-out
                    ${isSticky ? "py-2 md:py-3" : "pt-5 md:pt-[20px] pb-1"}
                `}
            >
                <nav
                    className={`
                        flex flex-wrap bg-gradient-to-b from-[#402F75] to-[#5A4589]
                        w-[95%] md:w-[90%] py-[10px] md:py-[12px] px-[15px] md:px-[35px]
                        rounded-[40px] items-center justify-between relative
                        transition-all duration-300
                        ${isSticky
                            ? "translate-y-0 shadow-[0_8px_32px_rgba(64,47,117,0.45)]"
                            : "translate-y-0"
                        }
                    `}
                    style={
                        isSticky
                            ? { animation: "slideDown 0.3s ease-out" }
                            : undefined
                    }
                >
                    {/* Logo */}
                    <div className="cursor-pointer">
                        <Link href={`/${lang}`}>
                            <Image src={Logo} alt={t("logoAlt")} width={80} className="md:w-[100px]" />
                        </Link>
                    </div>

                    {/* Desktop nav links */}
                    <div className="hidden lg:block">
                        <ul className="flex text-white gap-6 items-center">
                            {Object.entries(navItems).map(([key, label]) => (
                                <li key={key} className="cursor-pointer font-bold">
                                    <Link href={navHref(key)}>{label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Desktop right section */}
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
                                <Link href={`/${lang}/${cartSlug}`}>
                                    <div className="flex items-center justify-center bg-white h-[35px] w-[35px] rounded-full cursor-pointer">
                                        <Image src={CartIcon} alt="cart" />
                                    </div>
                                </Link>
                                <div className="flex items-center justify-center bg-white h-[35px] w-[35px] rounded-full cursor-pointer">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="8" r="4" />
                                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                    </svg>
                                </div>
                            </>
                        ) : (
                            <Link href={`/${lang}/${authSlug}`}>
                                <button className="bg-[#FEBF12] rounded-[40px] px-[20px] xl:px-[30px] h-[35px] text-[15px] cursor-pointer font-bold text-white">
                                    {t("loginButton")}
                                </button>
                            </Link>
                        )}
                    </div>

                    {/* Mobile: icons + animated hamburger */}
                    <div className="flex lg:hidden items-center gap-3">
                        {isLoggedIn ? (
                            <>
                                <div className="flex items-center justify-center bg-white h-[32px] w-[32px] rounded-full cursor-pointer">
                                    <Image src={FavIcon} alt="favourite" width={18} />
                                </div>
                                <Link href={`/${lang}/${cartSlug}`}>
                                    <div className="flex items-center justify-center bg-white h-[32px] w-[32px] rounded-full cursor-pointer">
                                        <Image src={CartIcon} alt="cart" width={18} />
                                    </div>
                                </Link>
                                <div className="flex items-center justify-center bg-white h-[32px] w-[32px] rounded-full cursor-pointer">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="8" r="4" />
                                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                    </svg>
                                </div>
                            </>
                        ) : (
                            <Link href={`/${lang}/${authSlug}`}>
                                <button className="bg-[#FEBF12] rounded-[40px] px-[20px] h-[32px] text-[12px] cursor-pointer">
                                    {t("loginButton")}
                                </button>
                            </Link>
                        )}

                        {/* Hamburger → X animation */}
                        <button
                            onClick={() => setMenuOpen((prev) => !prev)}
                            className="p-1 cursor-pointer"
                            aria-label="Toggle menu"
                        >
                            <div className="flex flex-col gap-[5px] w-5">
                                <span className={`block h-[2px] bg-white rounded-full transition-all duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
                                <span className={`block h-[2px] bg-white rounded-full transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""}`} />
                                <span className={`block h-[2px] bg-white rounded-full transition-all duration-300 origin-center ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
                            </div>
                        </button>
                    </div>

                    {/* Mobile menu — slides open/closed */}
                    <div
                        className={`
                            lg:hidden w-full overflow-hidden
                            transition-all duration-300 ease-in-out
                            ${menuOpen ? "max-h-[400px] opacity-100 mt-3 pb-3" : "max-h-0 opacity-0"}
                        `}
                    >
                        <ul className="flex flex-col text-white gap-3 mb-4">
                            {Object.entries(navItems).map(([key, label]) => (
                                <li key={key} className="cursor-pointer">
                                    <Link href={navHref(key)} onClick={() => setMenuOpen(false)}>
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <div className="flex items-center bg-white rounded-[40px] h-[35px] px-[10px] w-full mb-3">
                            <Image src={SearchIcon} alt="search" width={20} className="me-[10px]" />
                            <input className="outline-none w-full" placeholder={t("searchPlaceholder")} type="search" />
                        </div>
                        <div className="flex items-center gap-3">
                            <LanguageSwitcher />
                        </div>
                    </div>
                </nav>

                {/* Keyframe for slide-in animation when sticky kicks in */}
                <style>{`
                    @keyframes slideDown {
                        from { transform: translateY(-100%); opacity: 0; }
                        to   { transform: translateY(0);     opacity: 1; }
                    }
                `}</style>
            </header>
        </>
    );
}
