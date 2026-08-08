"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { selectSelectedCountryCode } from "@/features/country/store/countrySlice";
import {
    DIAL_CODES,
    DEFAULT_ISO2,
    findByAppCode,
    findByIso2,
    splitPhone,
    toE164,
    type DialCode,
} from "@/shared/constants/dialCodes";

/**
 * Phone input with a required country-code selector.
 *
 * Emits E.164 (`+971501234567`) through `onChange`, so callers keep storing a single string and
 * nothing downstream has to change. `value` may be E.164 or a legacy bare number — `splitPhone`
 * handles both, assuming UAE for the latter rather than blanking a field the customer already
 * filled in.
 *
 * The country defaults to the geo-detected country from the country slice (the same source the
 * header's CountrySelector uses) and falls back to UAE.
 */

interface Props {
    value: string;
    onChange: (e164: string) => void;
    /** Rendered on the input; the trigger and list are always LTR. */
    placeholder?: string;
    name?: string;
    id?: string;
    disabled?: boolean;
    hasError?: boolean;
    /** Classes for the outer control, so each form can pass its own inputClass(). */
    className?: string;
    onBlur?: () => void;
    autoComplete?: string;
    ariaLabel?: string;
}

function Flag({ iso2 }: { iso2: string }) {
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={`https://flagcdn.com/w40/${iso2}.png`}
            alt=""
            width={20}
            height={15}
            loading="lazy"
            className="rounded-[2px] object-cover"
            style={{ minWidth: 20 }}
        />
    );
}

export default function PhoneField({
    value,
    onChange,
    placeholder,
    name,
    id,
    disabled,
    hasError,
    className,
    onBlur,
    autoComplete = "tel",
    ariaLabel,
}: Props) {
    const detected = useSelector(selectSelectedCountryCode);
    const detectedIso2 = findByAppCode(detected)?.iso2 ?? DEFAULT_ISO2;

    // Derive from `value` on every render so a parent reset (or a profile load that arrives after
    // mount) is reflected, instead of the field silently keeping stale local state.
    const parsed = useMemo(() => splitPhone(value, detectedIso2), [value, detectedIso2]);

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const wrapRef = useRef<HTMLDivElement | null>(null);
    const searchRef = useRef<HTMLInputElement | null>(null);

    const selected: DialCode = findByIso2(parsed.iso2) ?? findByIso2(DEFAULT_ISO2)!;

    // A legacy bare number reaches us without a "+". Normalise it to E.164 once, so what the user
    // sees (the UAE flag) matches what a submit would actually send.
    useEffect(() => {
        if (value && !value.trim().startsWith("+") && parsed.national) {
            onChange(toE164(parsed.iso2, parsed.national));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    useEffect(() => {
        if (!open) return;
        const onDocClick = (e: MouseEvent) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
        };
        const onEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", onDocClick);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", onDocClick);
            document.removeEventListener("keydown", onEsc);
        };
    }, [open]);

    useEffect(() => {
        if (open) searchRef.current?.focus();
        else setQuery("");
    }, [open]);

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return DIAL_CODES;
        const digits = q.replace(/[^\d]/g, "");
        return DIAL_CODES.filter(
            (c) =>
                c.name.toLowerCase().includes(q) ||
                c.iso2.includes(q) ||
                (!!digits && c.dial.includes(digits)),
        );
    }, [query]);

    const pick = (c: DialCode) => {
        setOpen(false);
        onChange(toE164(c.iso2, parsed.national));
    };

    const onNationalChange = (raw: string) => {
        // Typing a full international number (pasted, or habit) should re-detect the country
        // rather than being appended to the current dial code.
        if (raw.trim().startsWith("+")) {
            const re = splitPhone(raw, parsed.iso2);
            onChange(toE164(re.iso2, re.national));
            return;
        }
        onChange(toE164(parsed.iso2, raw.replace(/\D/g, "")));
    };

    const expected = selected.nsnLength;
    const maxLen = Math.max(...expected) + 2; // a little slack; never a hard reject

    return (
        <div ref={wrapRef} className="relative">
            <div
                dir="ltr"
                className={
                    className ??
                    `flex items-stretch w-full bg-white border rounded-2xl overflow-hidden transition-all ${
                        hasError
                            ? "border-red-400 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100"
                            : "border-gray-200 focus-within:border-[#402F75] focus-within:ring-2 focus-within:ring-[#402F75]/12"
                    }`
                }
            >
                <button
                    type="button"
                    onClick={() => !disabled && setOpen((o) => !o)}
                    disabled={disabled}
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    aria-label={`Country code: ${selected.name} ${selected.dial}`}
                    className="flex items-center gap-2 pl-4 pr-3 py-3 shrink-0 border-r border-gray-200 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <Flag iso2={selected.iso2} />
                    <span className="text-[14px] text-gray-800 tabular-nums">{selected.dial}</span>
                    <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden className="text-gray-400">
                        <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    </svg>
                </button>

                <input
                    type="tel"
                    inputMode="numeric"
                    dir="ltr"
                    id={id}
                    name={name}
                    autoComplete={autoComplete}
                    aria-label={ariaLabel}
                    disabled={disabled}
                    maxLength={maxLen}
                    placeholder={placeholder ?? "50 123 4567"}
                    value={parsed.national}
                    onChange={(e) => onNationalChange(e.target.value)}
                    onBlur={onBlur}
                    className="flex-1 min-w-0 bg-transparent px-4 py-3 text-[14px] text-gray-800 placeholder-gray-400 outline-none disabled:cursor-not-allowed"
                />
            </div>

            {open && (
                <div
                    dir="ltr"
                    role="listbox"
                    className="absolute z-50 mt-1 w-full max-w-[340px] bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden"
                >
                    <div className="p-2 border-b border-gray-100">
                        <input
                            ref={searchRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search country or code"
                            className="w-full bg-gray-50 rounded-xl px-3 py-2 text-[13px] outline-none focus:bg-white focus:ring-2 focus:ring-[#402F75]/12"
                        />
                    </div>
                    <ul className="max-h-[260px] overflow-y-auto py-1">
                        {results.length === 0 && (
                            <li className="px-4 py-3 text-[13px] text-gray-400">No match</li>
                        )}
                        {results.map((c) => (
                            <li key={`${c.iso2}-${c.dial}`}>
                                <button
                                    type="button"
                                    role="option"
                                    aria-selected={c.iso2 === selected.iso2}
                                    onClick={() => pick(c)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 ${
                                        c.iso2 === selected.iso2 ? "bg-[#402F75]/6" : ""
                                    }`}
                                >
                                    <Flag iso2={c.iso2} />
                                    <span className="flex-1 text-[13px] text-gray-800 truncate">{c.name}</span>
                                    <span className="text-[13px] text-gray-500 tabular-nums">{c.dial}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

/**
 * Shared validator so every form rejects the same numbers. Length is checked against the selected
 * country's numbering plan as a hint only — the hard requirement is a country code plus a
 * plausible national part, because numbering plans change and a strict rule would lock out valid
 * customers faster than it would catch typos.
 */
export function validatePhone(e164: string, required = true): string | undefined {
    const v = (e164 ?? "").trim();
    if (!v) return required ? "Phone number is required." : undefined;
    if (!v.startsWith("+")) return "Select your country code.";

    const { iso2, national } = splitPhone(v);
    if (!national) return "Enter your phone number.";
    if (national.length < 6 || national.length > 14) return "Enter a valid phone number.";

    const entry = findByIso2(iso2);
    if (entry && !entry.nsnLength.includes(national.length)) {
        const expected = entry.nsnLength.join(" or ");
        return `A ${entry.name} number should be ${expected} digits after ${entry.dial}.`;
    }
    return undefined;
}
