"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Logo from "@/../public/logo.png";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import CartIcon from "@/assets/icons/cart.svg";
import LanguageSwitcher from "./LanguageSwitcher";
import FavIcon from "@/assets/icons/favorite.svg";
import ProfileIcon from "@/assets/icons/profile.svg";
import SearchIcon from "@/assets/icons/searchicon.svg";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";
import { selectFavouriteItems } from "@/features/favourites/store/favouritesSlice";
import { selectCartCount } from "@/features/cart/store/cartSlice";
import type { RootState } from "@/store";

const NAV_CANONICAL: Record<string, string> = {
    home: "",
    shop: "shop",
    catalog: "catalog",
    contactUs: "contact",
    buyobot: "buyobot",
    b2b: "b2b",
};

/* ── Icon button wrapper ── */
function IconBtn({ href, children, badge }: { href: string; children: React.ReactNode; badge?: number }) {
    return (
        <Link href={href}>
            <div className="relative flex items-center justify-center cursor-pointer opacity-80 hover:opacity-100 transition-opacity duration-200">
                {children}
                <AnimatePresence>
                    {badge != null && badge > 0 && (
                        <motion.span
                            key={badge}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 20 }}
                            className="absolute -top-[5px] -right-[5px] min-w-[17px] h-[17px] bg-[#FBBB14] text-[#1a0f40] text-[10px] font-bold rounded-full flex items-center justify-center px-[3px] shadow"
                        >
                            {badge > 99 ? "99+" : badge}
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>
        </Link>
    );
}

/* ── Mobile icon button ── */
function MobileIconBtn({ href, children, badge }: { href: string; children: React.ReactNode; badge?: number }) {
    return (
        <Link href={href}>
            <div className="relative flex items-center justify-center cursor-pointer opacity-80 hover:opacity-100 transition-opacity duration-200">
                {children}
                <AnimatePresence>
                    {badge != null && badge > 0 && (
                        <motion.span
                            key={badge}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 20 }}
                            className="absolute -top-[5px] -right-[5px] min-w-[17px] h-[17px] bg-[#FBBB14] text-[#1a0f40] text-[10px] font-bold rounded-full flex items-center justify-center px-[3px] shadow"
                        >
                            {badge > 99 ? "99+" : badge}
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>
        </Link>
    );
}

const TRENDING_SEARCHES = [
    { label: "iPhone 16 Pro", icon: "📱" },
    { label: "MacBook Pro M4", icon: "💻" },
    { label: "Samsung Galaxy S25", icon: "📱" },
    { label: "AirPods Pro", icon: "🎧" },
    { label: "iPad Air", icon: "📲" },
    { label: "Sony WH-1000XM5", icon: "🎧" },
    { label: "PlayStation 5", icon: "🎮" },
    { label: "Xiaomi 14", icon: "📱" },
];

/* ── Full-screen search overlay ── */
function SearchOverlay({ open, onClose, placeholder, trendingLabel }: {
    open: boolean;
    onClose: () => void;
    placeholder: string;
    trendingLabel: string;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState("");

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 120);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
            setQuery("");
        }
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const filtered = query.trim()
        ? TRENDING_SEARCHES.filter(s => s.label.toLowerCase().includes(query.toLowerCase()))
        : TRENDING_SEARCHES;

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    key="search-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-start pt-[10vh]"
                    style={{ backgroundColor: "rgba(20, 12, 50, 0.93)", backdropFilter: "blur(20px)" }}
                    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
                >
                    {/* Decorative curve top */}
                    <div className="absolute top-0 left-0 w-full opacity-10 pointer-events-none select-none" aria-hidden="true">
                        <svg width="100%" viewBox="0 0 905 152" fill="none" preserveAspectRatio="none">
                            <path d="M0.896484 31.636C20.0632 34.8026 87.9965 38.536 110.396 106.136C132.796 173.736 224.063 139.969 273.896 114.636C282.063 80.4693 316.296 31.636 363.896 31.636C411.496 31.636 469.23 71.9693 508.396 106.136C525.063 108.469 592.896 103.636 624.896 31.636C656.896 -40.364 721.396 62.5882 786.396 31.636C851.396 0.683779 910.396 99.6359 897.396 145.636" stroke="#FBBB14" strokeWidth="8"/>
                        </svg>
                    </div>
                    {/* Decorative curve bottom */}
                    <div className="absolute bottom-0 left-0 w-full opacity-[0.06] pointer-events-none select-none rotate-180" aria-hidden="true">
                        <svg width="100%" viewBox="0 0 905 152" fill="none" preserveAspectRatio="none">
                            <path d="M0.896484 31.636C20.0632 34.8026 87.9965 38.536 110.396 106.136C132.796 173.736 224.063 139.969 273.896 114.636C282.063 80.4693 316.296 31.636 363.896 31.636C411.496 31.636 469.23 71.9693 508.396 106.136C525.063 108.469 592.896 103.636 624.896 31.636C656.896 -40.364 721.396 62.5882 786.396 31.636C851.396 0.683779 910.396 99.6359 897.396 145.636" stroke="#402F75" strokeWidth="11"/>
                        </svg>
                    </div>

                    {/* Close button */}
                    <motion.button
                        initial={{ opacity: 0, rotate: -90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 90 }}
                        transition={{ delay: 0.1, duration: 0.2 }}
                        onClick={onClose}
                        className="absolute top-5 right-5 md:top-7 md:right-8 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer"
                        aria-label="Close search"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </motion.button>

                    {/* Search card */}
                    <motion.div
                        initial={{ opacity: 0, y: 32, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 300, damping: 28, delay: 0.05 }}
                        className="w-[92%] max-w-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Input row */}
                        <div className="flex items-center gap-3 bg-white/10 border-2 border-white/20 focus-within:border-[#FBBB14] rounded-2xl px-5 py-4 transition-colors duration-200">
                            <Image src={SearchIcon} alt="search" width={22} className="opacity-50 flex-shrink-0" />
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={placeholder}
                                className="flex-1 bg-transparent text-white placeholder-white/30 text-[18px] md:text-[22px] font-medium outline-none"
                            />
                            <AnimatePresence>
                                {query && (
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0.7 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.7 }}
                                        onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                                        className="text-white/40 hover:text-white/80 transition-colors cursor-pointer flex-shrink-0"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                            <path d="M18 6L6 18M6 6l12 12" />
                                        </svg>
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Trending / filtered suggestions */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="mt-6"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                {/* Flame / trending icon */}
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="#FBBB14" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2C12 2 9 6 9 10C9 11.5 9.5 12.9 10.4 14C9.5 13.5 8.8 12.5 8.5 11.5C7 13 6 14.9 6 17C6 20.3 8.7 23 12 23C15.3 23 18 20.3 18 17C18 13.5 15.5 10.5 12 9C12.9 7.8 13 5.9 12 4C12 4 12 2 12 2Z"/>
                                </svg>
                                <span className="text-white/40 text-[11px] font-semibold uppercase tracking-widest">
                                    {trendingLabel}
                                </span>
                            </div>

                            <AnimatePresence mode="popLayout">
                                {filtered.length > 0 ? (
                                    <motion.div className="flex flex-wrap gap-2">
                                        {filtered.map((item, i) => (
                                            <motion.button
                                                key={item.label}
                                                initial={{ opacity: 0, scale: 0.85, y: 8 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.85 }}
                                                transition={{ delay: i * 0.04, type: "spring", stiffness: 400, damping: 25 }}
                                                onClick={() => { setQuery(item.label); inputRef.current?.focus(); }}
                                                className="flex items-center gap-2 bg-white/8 hover:bg-[#FBBB14]/15 border border-white/12 hover:border-[#FBBB14]/40 rounded-full px-4 py-2 text-white/70 hover:text-white text-[13px] font-medium transition-all duration-200 cursor-pointer group"
                                            >
                                                <span className="text-[14px] group-hover:scale-110 transition-transform duration-150">{item.icon}</span>
                                                {item.label}
                                            </motion.button>
                                        ))}
                                    </motion.div>
                                ) : (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-white/30 text-[13px]"
                                    >
                                        No suggestions for &ldquo;{query}&rdquo;
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Hint */}
                        <p className="text-white/20 text-[11px] mt-6 text-center">
                            Press <kbd className="bg-white/10 border border-white/15 rounded px-1.5 py-0.5 text-white/40 font-mono text-[10px]">Esc</kbd> to close
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [isSticky, setIsSticky] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);

    const { t } = useTranslation("header");
    const lang = useSelector((state: { language: { lang: Lang } }) => state.language.lang);
    const isLoggedIn = useSelector((state: RootState) => state.auth.isAuthenticated);
    const favCount = useSelector(selectFavouriteItems).length;
    const cartCount = useSelector(selectCartCount);

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

    const authSlug    = PATH_SLUGS["auth"]?.      [lang] ?? "auth";
    const cartSlug    = PATH_SLUGS["cart"]?.      [lang] ?? "cart";
    const favSlug     = PATH_SLUGS["favourites"]?.[lang] ?? "favourites";
    const profileSlug = PATH_SLUGS["profile"]?.   [lang] ?? "profile";

    return (
        <>
            <div ref={sentinelRef} className="h-px" aria-hidden="true" />

            <SearchOverlay
                open={searchOpen}
                onClose={() => setSearchOpen(false)}
                placeholder={t("searchPlaceholder")}
                trendingLabel={t("searchTrending")}
            />

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
                        flex flex-wrap
                        bg-gradient-to-br from-[#402F75] via-[#4d3888] to-[#5A4589]
                        w-[95%] md:w-[90%] py-[10px] md:py-[12px] px-[15px] md:px-[30px]
                        rounded-[40px] items-center justify-between relative
                        transition-all duration-300
                        ${isSticky
                            ? "shadow-[0_8px_40px_rgba(64,47,117,0.5)]"
                            : "shadow-[0_4px_20px_rgba(64,47,117,0.25)]"
                        }
                    `}
                >
                    {/* Logo */}
                    <Link href={`/${lang}`} className="flex-shrink-0">
                        <Image src={Logo} alt={t("logoAlt")} width={80} className="md:w-[95px]" />
                    </Link>

                    {/* Desktop nav links */}
                    <div className="hidden lg:block">
                        <ul className="flex items-center gap-1">
                            {Object.entries(navItems).map(([key, label]) => (
                                <li key={key}>
                                    <Link
                                        href={navHref(key)}
                                        className="text-white/80 hover:text-white text-[14px] font-medium px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200"
                                    >
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Desktop right section */}
                    <div className="hidden lg:flex items-center gap-2 xl:gap-3">
                        {/* Search pill — opens overlay on click */}
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 rounded-full h-[36px] px-4 transition-colors duration-200 cursor-pointer group"
                        >
                            <Image src={SearchIcon} alt="search" width={15} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                            <span className="text-white/50 text-[13px] group-hover:text-white/70 transition-colors w-[100px] xl:w-[130px] text-start">
                                {t("searchPlaceholder")}
                            </span>
                        </button>

                        <LanguageSwitcher />

                        {/* Thin divider */}
                        <div className="w-px h-5 bg-white/20 mx-1" />

                        {isLoggedIn ? (
                            <div className="flex items-center gap-4">
                                <IconBtn href={`/${lang}/${favSlug}`} badge={favCount}>
                                    <Image src={FavIcon} alt="favourites" width={24} />
                                </IconBtn>
                                <IconBtn href={`/${lang}/${cartSlug}`} badge={cartCount}>
                                    <Image src={CartIcon} alt="cart" width={24} />
                                </IconBtn>
                                <IconBtn href={`/${lang}/${profileSlug}`}>
                                    <Image src={ProfileIcon} alt="profile" width={24} />
                                </IconBtn>
                            </div>
                        ) : (
                            <Link href={`/${lang}/${authSlug}`}>
                                <button className="bg-[#FBBB14] hover:bg-[#e5a800] rounded-full px-5 xl:px-6 h-[36px] text-[13px] font-bold text-[#1a0f40] cursor-pointer transition-colors duration-200 shadow-sm">
                                    {t("loginButton")}
                                </button>
                            </Link>
                        )}
                    </div>

                    {/* Mobile: search icon + icons + hamburger */}
                    <div className="flex lg:hidden items-center gap-3">
                        {/* Mobile search icon */}
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                            aria-label="Open search"
                        >
                            <Image src={SearchIcon} alt="search" width={20} />
                        </button>

                        {isLoggedIn ? (
                            <>
                                <MobileIconBtn href={`/${lang}/${favSlug}`} badge={favCount}>
                                    <Image src={FavIcon} alt="favourites" width={20} />
                                </MobileIconBtn>
                                <MobileIconBtn href={`/${lang}/${cartSlug}`} badge={cartCount}>
                                    <Image src={CartIcon} alt="cart" width={20} />
                                </MobileIconBtn>
                                <MobileIconBtn href={`/${lang}/${profileSlug}`}>
                                    <Image src={ProfileIcon} alt="profile" width={20} />
                                </MobileIconBtn>
                            </>
                        ) : (
                            <Link href={`/${lang}/${authSlug}`}>
                                <button className="bg-[#FBBB14] hover:bg-[#e5a800] rounded-full px-4 h-[32px] text-[12px] font-bold text-[#1a0f40] cursor-pointer transition-colors duration-200">
                                    {t("loginButton")}
                                </button>
                            </Link>
                        )}

                        {/* Hamburger → X */}
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

                    {/* Mobile dropdown menu */}
                    <AnimatePresence>
                        {menuOpen && (
                            <motion.div
                                key="mobile-menu"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                className="lg:hidden w-full overflow-hidden"
                            >
                                <div className="pt-3 pb-2 border-t border-white/15 mt-2">
                                    <ul className="flex flex-col gap-1 mb-4">
                                        {Object.entries(navItems).map(([key, label]) => (
                                            <li key={key}>
                                                <Link
                                                    href={navHref(key)}
                                                    onClick={() => setMenuOpen(false)}
                                                    className="block text-white/80 hover:text-white text-[14px] font-medium px-3 py-2 rounded-xl hover:bg-white/10 transition-all duration-200"
                                                >
                                                    {label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                    <LanguageSwitcher />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </nav>
            </header>
        </>
    );
}
