"use client";

import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { SLUG_TO_CANONICAL, PATH_SLUGS, type Lang } from "@/config/pathSlugs";

const LANGUAGES: { code: Lang; label: string }[] = [
    { code: "en", label: "English" },
    { code: "az", label: "Azərbaycan" },
    { code: "ar", label: "العربية" },
];

function TranslateIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m5 8 6 6" />
            <path d="m4 14 6-6 2-3" />
            <path d="M2 5h12" />
            <path d="M7 2h1" />
            <path d="m22 22-5-10-5 10" />
            <path d="M14 18h6" />
        </svg>
    );
}

export default function LanguageSwitcher() {
    const router = useRouter();
    const pathname = usePathname();
    const lang = useSelector((state: { language: { lang: Lang } }) => state.language.lang);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];
    const options = LANGUAGES.filter((l) => l.code !== lang);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function select(code: Lang) {
        const segments = pathname.split("/");
        const currentLang = segments[1] as Lang;
        const currentSlug = segments[2];

        // Translate the path segment to the new language
        if (currentSlug) {
            const canonical = SLUG_TO_CANONICAL[currentLang]?.[currentSlug] ?? currentSlug;
            segments[2] = PATH_SLUGS[canonical]?.[code] ?? canonical;
        }

        segments[1] = code;
        router.push(segments.join("/"));
        setOpen(false);
    }

    return (
        <div
            ref={ref}
            className="relative inline-block"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center justify-center gap-1.5 h-[36px] px-3.5 rounded-full text-sm font-medium text-white bg-white/15 hover:bg-white/25 border border-white/20 transition-colors select-none cursor-pointer whitespace-nowrap"
            >
                <TranslateIcon className="w-4 h-4 text-white flex-shrink-0" />
                <span>{current.label}</span>
            </button>

            {/* pt-1.5 bridges the gap so onMouseLeave doesn't fire between button and list */}
            <div className="absolute end-0 top-full pt-1.5 z-50">
                <div
                    className={`w-40 bg-white border border-gray-200 rounded-[20px] shadow-md overflow-hidden origin-top transition-all duration-200 ${open
                        ? "opacity-100 scale-y-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 scale-y-75 -translate-y-1 pointer-events-none"
                        }`}
                >
                    {options.map((l, i) => (
                        <button
                            key={l.code}
                            onClick={() => select(l.code)}
                            className={`w-full text-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap ${i !== 0 ? "border-t border-gray-200" : ""}`}
                        >
                            {l.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
