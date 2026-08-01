"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Logo from "@/../public/logo.png";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import CartIcon from "@/assets/icons/cart.svg";
import LanguageSwitcher from "./LanguageSwitcher";
import CountrySelector from "./CountrySelector";
import FavIcon from "@/assets/icons/favorite.svg";
import ProfileIcon from "@/assets/icons/profile.svg";
import SearchIcon from "@/assets/icons/searchicon.svg";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";
import { selectFavouriteItems } from "@/features/favourites/store/favouritesSlice";
import { selectCartCount } from "@/features/cart/store/cartSlice";
import { fetchB2bQuoteCount, selectB2bQuoteCount, selectB2bIsMember } from "@/features/b2b/store/b2bQuoteSlice";
import type { RootState, AppDispatch } from "@/store";
import ShopNavItem from "./ShopNavItem";
import { getAllCategories, searchProducts, getPrimaryImage, type AllCategory, type ApiProduct } from "@/features/product/services/productService";
import { selectSelectedCountryCode, selectPreferredCurrency } from "@/features/country/store/countrySlice";

const NAV_CANONICAL: Record<string, string> = {
    home: "",
    shop: "shop",
    catalog: "catalog",
    repair: "repair",
    sell: "sell",
    contactUs: "contact",
    buyobot: "buyobot",
    b2b: "b2b",
    games: "games",
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
    "iPhone 16 Pro",
    "MacBook Pro M4",
    "Samsung Galaxy S25",
    "AirPods Pro",
    "iPad Air",
    "Sony WH-1000XM5",
    "PlayStation 5",
    "Xiaomi 14",
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
    // Suggestions tagged with the query they belong to, so we can derive
    // loading/results without synchronous state writes in the fetch effect.
    const [sugg, setSugg] = useState<{ q: string; items: ApiProduct[] }>({ q: "", items: [] });
    const router = useRouter();
    const params = useParams();
    const lang = (params?.lang as Lang) ?? 'en';
    const countryCode = useSelector(selectSelectedCountryCode);
    const currency = useSelector(selectPreferredCurrency);

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

    // Live product suggestions as the user types (debounced). Only writes state
    // from the async callback, so loading/results below are derived, not stored.
    useEffect(() => {
        const q = query.trim();
        if (q.length < 2) return;
        let active = true;
        const handle = setTimeout(() => {
            searchProducts({ query: q, lang, countryCode: countryCode ?? undefined, currency: currency ?? undefined })
                .then((res) => { if (active) setSugg({ q, items: res.slice(0, 6) }); })
                .catch(() => { if (active) setSugg({ q, items: [] }); });
        }, 250);
        return () => { active = false; clearTimeout(handle); };
    }, [query, lang, countryCode, currency]);

    const trimmed = query.trim();
    const showTrending = trimmed.length < 2;
    const hasResultsForQuery = sugg.q === trimmed;
    const suggestions = hasResultsForQuery ? sugg.items : [];
    const loadingSuggest = !showTrending && !hasResultsForQuery;

    const handleSearch = (q: string) => {
        if (!q.trim()) return;
        const shopSlug = PATH_SLUGS["shop"]?.[lang] ?? "shop";
        router.push(`/${lang}/${shopSlug}?q=${encodeURIComponent(q.trim())}`);
        onClose();
    };

    const goToProduct = (p: ApiProduct) => {
        const shopSlug = PATH_SLUGS["shop"]?.[lang] ?? "shop";
        router.push(`/${lang}/${shopSlug}/${p.slug}`);
        onClose();
    };

    const fmtPrice = (amount?: number | null, ccy?: string | null) => {
        if (amount == null) return "";
        try {
            return new Intl.NumberFormat(undefined, { style: "currency", currency: ccy || "USD", maximumFractionDigits: 0 }).format(amount);
        } catch {
            return `${ccy || ""} ${amount}`.trim();
        }
    };

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
                        <form 
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSearch(query);
                            }}
                            className="flex items-center gap-3 bg-white/10 border-2 border-white/20 focus-within:border-[#FBBB14] rounded-2xl px-5 py-4 transition-colors duration-200"
                        >
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
                                        type="button"
                                        onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                                        className="text-white/40 hover:text-white/80 transition-colors cursor-pointer flex-shrink-0"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                            <path d="M18 6L6 18M6 6l12 12" />
                                        </svg>
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </form>

                        {/* Suggestions: trending tags when empty, live product matches when typing */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="mt-6"
                        >
                            {showTrending ? (
                                <>
                                    <div className="flex items-center gap-2 mb-3">
                                        {/* Flame / trending icon */}
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#FBBB14" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 2C12 2 9 6 9 10C9 11.5 9.5 12.9 10.4 14C9.5 13.5 8.8 12.5 8.5 11.5C7 13 6 14.9 6 17C6 20.3 8.7 23 12 23C15.3 23 18 20.3 18 17C18 13.5 15.5 10.5 12 9C12.9 7.8 13 5.9 12 4C12 4 12 2 12 2Z"/>
                                        </svg>
                                        <span className="text-white/40 text-[11px] font-semibold uppercase tracking-widest">
                                            {trendingLabel}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {TRENDING_SEARCHES.map((item) => (
                                            <button
                                                key={item}
                                                onClick={() => handleSearch(item)}
                                                className="flex items-center gap-2 bg-white/8 hover:bg-[#FBBB14]/15 border border-white/12 hover:border-[#FBBB14]/40 rounded-full px-4 py-2 text-white/70 hover:text-white text-[13px] font-medium transition-all duration-200 cursor-pointer group"
                                            >
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40 group-hover:text-[#FBBB14] transition-colors duration-150">
                                                    <circle cx="11" cy="11" r="8" />
                                                    <path d="M21 21l-4.35-4.35" />
                                                </svg>
                                                {item}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col gap-1">
                                    {/* Search-all-results row */}
                                    <button
                                        onClick={() => handleSearch(query)}
                                        className="flex items-center gap-3 w-full text-start rounded-xl px-3 py-2.5 bg-white/8 hover:bg-[#FBBB14]/15 border border-white/12 hover:border-[#FBBB14]/40 text-white/80 hover:text-white transition-all duration-200 cursor-pointer"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-[#FBBB14]">
                                            <circle cx="11" cy="11" r="8" />
                                            <path d="M21 21l-4.35-4.35" />
                                        </svg>
                                        <span className="text-[14px] font-medium truncate">
                                            Search for &ldquo;<span className="font-bold">{trimmed}</span>&rdquo;
                                        </span>
                                    </button>

                                    {loadingSuggest ? (
                                        <p className="text-white/30 text-[13px] px-3 py-2">Searching…</p>
                                    ) : suggestions.length > 0 ? (
                                        suggestions.map((p) => {
                                            const image = getPrimaryImage(p.media);
                                            const price = fmtPrice(p.storePrice ?? p.effectivePrice ?? p.basePrice, p.currency);
                                            return (
                                                <button
                                                    key={p.id}
                                                    onClick={() => goToProduct(p)}
                                                    className="flex items-center gap-3 w-full text-start rounded-xl px-3 py-2 hover:bg-white/10 transition-colors duration-150 cursor-pointer group"
                                                >
                                                    <div className="w-10 h-10 rounded-lg bg-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                        {image && (
                                                            <Image src={image} alt={p.title} width={40} height={40} unoptimized className="object-contain w-full h-full p-1" />
                                                        )}
                                                    </div>
                                                    <span className="flex-1 min-w-0 text-white/85 group-hover:text-white text-[14px] font-medium truncate">
                                                        {p.title}
                                                    </span>
                                                    {price && (
                                                        <span className="text-[#FBBB14] text-[13px] font-bold flex-shrink-0">{price}</span>
                                                    )}
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <p className="text-white/30 text-[13px] px-3 py-2">
                                            No products found for &ldquo;{trimmed}&rdquo;
                                        </p>
                                    )}
                                </div>
                            )}
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
    const dispatch = useDispatch<AppDispatch>();
    const isLoggedIn = useSelector((state: RootState) => state.auth.isAuthenticated);
    const favCount = useSelector(selectFavouriteItems).length;
    // A B2B member's cart IS the B2B quote cart: show its line count, and the cart link
    // (→ /cart) renders the B2B RFQ cart for members. Non-members see the normal cart.
    const b2bIsMember = useSelector(selectB2bIsMember);
    const b2bCount = useSelector(selectB2bQuoteCount);
    const b2cCount = useSelector(selectCartCount);
    const cartCount = b2bIsMember ? b2bCount : b2cCount;

    // One call resolves membership + line count (getQuoteCart 200 = member, 403 = not).
    useEffect(() => {
        if (isLoggedIn) dispatch(fetchB2bQuoteCount());
    }, [isLoggedIn, dispatch]);

    // All categories for the "Shop" hover mega-menu (every category, even empty ones).
    const [categories, setCategories] = useState<AllCategory[]>([]);
    useEffect(() => {
        let active = true;
        getAllCategories(lang)
            .then((c) => { if (active) setCategories(c); })
            .catch(() => { /* menu just shows nothing */ });
        return () => { active = false; };
    }, [lang]);

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

    // Drop the "Win Tokens" (games) entry from the header nav.
    const navItems = Object.fromEntries(
        Object.entries(t("nav", { returnObjects: true }) as Record<string, string>)
            .filter(([key]) => key !== "games")
    ) as Record<string, string>;

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
    const shopSlug    = PATH_SLUGS["shop"]?.      [lang] ?? "shop";

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
                            {Object.entries(navItems).map(([key, label]) =>
                                key === "shop" ? (
                                    <ShopNavItem
                                        key={key}
                                        lang={lang}
                                        label={label}
                                        href={navHref(key)}
                                        shopSlug={shopSlug}
                                        categories={categories}
                                    />
                                ) : (
                                    <li key={key}>
                                        <Link
                                            href={navHref(key)}
                                            className="text-white/80 hover:text-white text-[14px] font-medium px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200"
                                        >
                                            {label}
                                        </Link>
                                    </li>
                                )
                            )}
                        </ul>
                    </div>

                    {/* Desktop right section */}
                    <div className="hidden lg:flex items-center gap-2 xl:gap-3">
                        {/* Search pill — opens overlay on click */}
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 rounded-full h-[36px] px-4 transition-colors duration-200 cursor-pointer group"
                        >
                            <Image src={SearchIcon} alt="search" width={16} className="brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            <span className="text-white/70 text-[13px] group-hover:text-white transition-colors w-[110px] xl:w-[150px] text-start whitespace-nowrap overflow-hidden text-ellipsis">
                                {t("searchPlaceholder")}
                            </span>
                        </button>

                        <LanguageSwitcher />
                        <CountrySelector />

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
                            <Image src={SearchIcon} alt="search" width={20} className="brightness-0 invert opacity-90" />
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
                        ) : null}

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

                    {/* Mobile: full-width login row below the header bar (small screens, logged-out) */}
                    {!isLoggedIn && (
                        <div className="lg:hidden w-full mt-3">
                            <Link href={`/${lang}/${authSlug}`} className="block">
                                <button className="w-full bg-[#FBBB14] hover:bg-[#e5a800] rounded-full h-[40px] text-[13px] font-bold text-[#1a0f40] cursor-pointer transition-colors duration-200 shadow-sm">
                                    {t("loginButton")}
                                </button>
                            </Link>
                        </div>
                    )}

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
                                                {key === "shop" && categories.filter((c) => !c.parentId && (c.status ? c.status.toUpperCase() === "ACTIVE" : true)).length > 0 && (
                                                    <ul className="ml-3 mt-1 mb-1 flex flex-col gap-0.5 border-l border-white/15 pl-3">
                                                        {categories
                                                            .filter((c) => !c.parentId && (c.status ? c.status.toUpperCase() === "ACTIVE" : true))
                                                            .map((c) => (
                                                                <li key={c.id}>
                                                                    <Link
                                                                        href={`/${lang}/${shopSlug}?categoryId=${c.id}&categoryName=${encodeURIComponent(c.name)}`}
                                                                        onClick={() => setMenuOpen(false)}
                                                                        className="block text-white/65 hover:text-white text-[13px] px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all duration-200"
                                                                    >
                                                                        {c.name}
                                                                    </Link>
                                                                </li>
                                                            ))}
                                                    </ul>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="flex items-center gap-[10px] flex-wrap">
                                        <LanguageSwitcher />
                                        <CountrySelector />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </nav>
            </header>
        </>
    );
}
