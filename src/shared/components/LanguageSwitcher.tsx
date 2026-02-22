"use client";

import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";

type Lang = "en" | "az" | "ar";

const LANGUAGES: { code: Lang; label: string }[] = [
    { code: "en", label: "EN" },
    { code: "az", label: "AZ" },
    { code: "ar", label: "AR" },
];

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
                className="flex items-center justify-center gap-1.5 bg-white px-3 py-1.5 rounded-[30px] text-sm font-medium text-gray-700 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors select-none cursor-pointer"
            >
                <span>{current.label}</span>
                <svg
                    className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="2 4 6 8 10 4" />
                </svg>
            </button>

            {/* pt-1.5 bridges the gap so onMouseLeave doesn't fire between button and list */}
            <div className="absolute right-0 top-full pt-1.5 z-50">
                <div
                    className={`w-20 bg-white border border-gray-200 rounded-[20px] shadow-md overflow-hidden origin-top transition-all duration-200 ${open
                        ? "opacity-100 scale-y-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 scale-y-75 -translate-y-1 pointer-events-none"
                        }`}
                >
                    {options.map((l, i) => (
                        <button
                            key={l.code}
                            onClick={() => select(l.code)}
                            className={`w-full text-center px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer ${i !== 0 ? "border-t border-gray-200" : ""}`}
                        >
                            {l.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
