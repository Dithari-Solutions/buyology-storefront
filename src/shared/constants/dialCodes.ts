/**
 * Country dial codes for the phone-number field.
 *
 * Why this exists: `normalizePhone` on the backend only trims, and Twilio Verify needs E.164
 * (`+971501234567`). Before this list the phone inputs accepted a bare local number like
 * `0501234567`, which passed client validation, saved fine, and then failed at OTP time with
 * nothing on the form to explain why. Making the country an explicit choice means every number
 * we store already carries its country.
 *
 * `iso2` doubles as the flagcdn.com slug (see CountrySelector), and `appCode` is the alpha-3 the
 * rest of the platform uses (UAE / AZE / SAU — not AE / AZ / SA), so a geo-detected country can be
 * matched to a dial code without a second lookup table.
 */

export interface DialCode {
    /** ISO 3166-1 alpha-2, lowercased — also the flagcdn.com slug. */
    iso2: string;
    /** The platform's alpha-3 country code, when this country is one we trade in. */
    appCode?: string;
    /** E.164 country calling code, including the leading "+". */
    dial: string;
    /** English display name. */
    name: string;
    /**
     * Digits expected after the dial code, used for a length hint only — never to reject.
     * Numbering plans change and a hard rule here would lock out valid customers.
     */
    nsnLength: number[];
}

/**
 * Ordered so the markets we actually trade in come first — a UAE customer should not have to
 * scroll past Afghanistan to find +971. The remainder is alphabetical.
 */
export const DIAL_CODES: DialCode[] = [
    // ── Primary markets ──────────────────────────────────────────────────────
    { iso2: "ae", appCode: "UAE", dial: "+971", name: "United Arab Emirates", nsnLength: [9] },
    { iso2: "az", appCode: "AZE", dial: "+994", name: "Azerbaijan", nsnLength: [9] },
    { iso2: "sa", appCode: "SAU", dial: "+966", name: "Saudi Arabia", nsnLength: [9] },
    { iso2: "kw", appCode: "KWT", dial: "+965", name: "Kuwait", nsnLength: [8] },
    { iso2: "qa", appCode: "QAT", dial: "+974", name: "Qatar", nsnLength: [8] },
    { iso2: "om", appCode: "OMN", dial: "+968", name: "Oman", nsnLength: [8] },
    { iso2: "bh", appCode: "BHR", dial: "+973", name: "Bahrain", nsnLength: [8] },
    { iso2: "eg", appCode: "EGY", dial: "+20", name: "Egypt", nsnLength: [10] },
    { iso2: "jo", appCode: "JOR", dial: "+962", name: "Jordan", nsnLength: [9] },
    { iso2: "lb", appCode: "LBN", dial: "+961", name: "Lebanon", nsnLength: [7, 8] },
    { iso2: "tr", appCode: "TUR", dial: "+90", name: "Türkiye", nsnLength: [10] },
    { iso2: "us", appCode: "USA", dial: "+1", name: "United States", nsnLength: [10] },
    { iso2: "gb", appCode: "GBR", dial: "+44", name: "United Kingdom", nsnLength: [10] },
    { iso2: "de", appCode: "DEU", dial: "+49", name: "Germany", nsnLength: [10, 11] },

    // ── Rest of the world ────────────────────────────────────────────────────
    { iso2: "af", dial: "+93", name: "Afghanistan", nsnLength: [9] },
    { iso2: "al", dial: "+355", name: "Albania", nsnLength: [9] },
    { iso2: "dz", dial: "+213", name: "Algeria", nsnLength: [9] },
    { iso2: "ar", dial: "+54", name: "Argentina", nsnLength: [10] },
    { iso2: "am", dial: "+374", name: "Armenia", nsnLength: [8] },
    { iso2: "au", dial: "+61", name: "Australia", nsnLength: [9] },
    { iso2: "at", dial: "+43", name: "Austria", nsnLength: [10, 11] },
    { iso2: "bd", dial: "+880", name: "Bangladesh", nsnLength: [10] },
    { iso2: "by", dial: "+375", name: "Belarus", nsnLength: [9] },
    { iso2: "be", dial: "+32", name: "Belgium", nsnLength: [9] },
    { iso2: "br", dial: "+55", name: "Brazil", nsnLength: [10, 11] },
    { iso2: "bg", dial: "+359", name: "Bulgaria", nsnLength: [9] },
    { iso2: "ca", dial: "+1", name: "Canada", nsnLength: [10] },
    { iso2: "cn", dial: "+86", name: "China", nsnLength: [11] },
    { iso2: "hr", dial: "+385", name: "Croatia", nsnLength: [9] },
    { iso2: "cy", dial: "+357", name: "Cyprus", nsnLength: [8] },
    { iso2: "cz", dial: "+420", name: "Czechia", nsnLength: [9] },
    { iso2: "dk", dial: "+45", name: "Denmark", nsnLength: [8] },
    { iso2: "et", dial: "+251", name: "Ethiopia", nsnLength: [9] },
    { iso2: "fi", dial: "+358", name: "Finland", nsnLength: [9, 10] },
    { iso2: "fr", dial: "+33", name: "France", nsnLength: [9] },
    { iso2: "ge", dial: "+995", name: "Georgia", nsnLength: [9] },
    { iso2: "gh", dial: "+233", name: "Ghana", nsnLength: [9] },
    { iso2: "gr", dial: "+30", name: "Greece", nsnLength: [10] },
    { iso2: "hk", dial: "+852", name: "Hong Kong", nsnLength: [8] },
    { iso2: "hu", dial: "+36", name: "Hungary", nsnLength: [9] },
    { iso2: "in", dial: "+91", name: "India", nsnLength: [10] },
    { iso2: "id", dial: "+62", name: "Indonesia", nsnLength: [9, 10, 11] },
    { iso2: "iq", dial: "+964", name: "Iraq", nsnLength: [10] },
    { iso2: "ie", dial: "+353", name: "Ireland", nsnLength: [9] },
    { iso2: "il", dial: "+972", name: "Israel", nsnLength: [9] },
    { iso2: "it", dial: "+39", name: "Italy", nsnLength: [9, 10] },
    { iso2: "jp", dial: "+81", name: "Japan", nsnLength: [10] },
    { iso2: "kz", dial: "+7", name: "Kazakhstan", nsnLength: [10] },
    { iso2: "ke", dial: "+254", name: "Kenya", nsnLength: [9] },
    { iso2: "kg", dial: "+996", name: "Kyrgyzstan", nsnLength: [9] },
    { iso2: "lv", dial: "+371", name: "Latvia", nsnLength: [8] },
    { iso2: "ly", dial: "+218", name: "Libya", nsnLength: [9] },
    { iso2: "lt", dial: "+370", name: "Lithuania", nsnLength: [8] },
    { iso2: "my", dial: "+60", name: "Malaysia", nsnLength: [9, 10] },
    { iso2: "mv", dial: "+960", name: "Maldives", nsnLength: [7] },
    { iso2: "mt", dial: "+356", name: "Malta", nsnLength: [8] },
    { iso2: "mx", dial: "+52", name: "Mexico", nsnLength: [10] },
    { iso2: "md", dial: "+373", name: "Moldova", nsnLength: [8] },
    { iso2: "ma", dial: "+212", name: "Morocco", nsnLength: [9] },
    { iso2: "np", dial: "+977", name: "Nepal", nsnLength: [10] },
    { iso2: "nl", dial: "+31", name: "Netherlands", nsnLength: [9] },
    { iso2: "nz", dial: "+64", name: "New Zealand", nsnLength: [8, 9] },
    { iso2: "ng", dial: "+234", name: "Nigeria", nsnLength: [10] },
    { iso2: "no", dial: "+47", name: "Norway", nsnLength: [8] },
    { iso2: "pk", dial: "+92", name: "Pakistan", nsnLength: [10] },
    { iso2: "ps", dial: "+970", name: "Palestine", nsnLength: [9] },
    { iso2: "ph", dial: "+63", name: "Philippines", nsnLength: [10] },
    { iso2: "pl", dial: "+48", name: "Poland", nsnLength: [9] },
    { iso2: "pt", dial: "+351", name: "Portugal", nsnLength: [9] },
    { iso2: "ro", dial: "+40", name: "Romania", nsnLength: [9] },
    { iso2: "ru", dial: "+7", name: "Russia", nsnLength: [10] },
    { iso2: "rs", dial: "+381", name: "Serbia", nsnLength: [8, 9] },
    { iso2: "sg", dial: "+65", name: "Singapore", nsnLength: [8] },
    { iso2: "sk", dial: "+421", name: "Slovakia", nsnLength: [9] },
    { iso2: "si", dial: "+386", name: "Slovenia", nsnLength: [8] },
    { iso2: "za", dial: "+27", name: "South Africa", nsnLength: [9] },
    { iso2: "kr", dial: "+82", name: "South Korea", nsnLength: [9, 10] },
    { iso2: "es", dial: "+34", name: "Spain", nsnLength: [9] },
    { iso2: "lk", dial: "+94", name: "Sri Lanka", nsnLength: [9] },
    { iso2: "sd", dial: "+249", name: "Sudan", nsnLength: [9] },
    { iso2: "se", dial: "+46", name: "Sweden", nsnLength: [9] },
    { iso2: "ch", dial: "+41", name: "Switzerland", nsnLength: [9] },
    { iso2: "sy", dial: "+963", name: "Syria", nsnLength: [9] },
    { iso2: "tw", dial: "+886", name: "Taiwan", nsnLength: [9] },
    { iso2: "tj", dial: "+992", name: "Tajikistan", nsnLength: [9] },
    { iso2: "tz", dial: "+255", name: "Tanzania", nsnLength: [9] },
    { iso2: "th", dial: "+66", name: "Thailand", nsnLength: [9] },
    { iso2: "tn", dial: "+216", name: "Tunisia", nsnLength: [8] },
    { iso2: "tm", dial: "+993", name: "Turkmenistan", nsnLength: [8] },
    { iso2: "ua", dial: "+380", name: "Ukraine", nsnLength: [9] },
    { iso2: "uz", dial: "+998", name: "Uzbekistan", nsnLength: [9] },
    { iso2: "vn", dial: "+84", name: "Vietnam", nsnLength: [9, 10] },
    { iso2: "ye", dial: "+967", name: "Yemen", nsnLength: [9] },
];

/** The fallback when nothing better is known — our home market. */
export const DEFAULT_ISO2 = "ae";

const BY_ISO2 = new Map(DIAL_CODES.map((c) => [c.iso2, c]));

export function findByIso2(iso2: string | null | undefined): DialCode | undefined {
    return iso2 ? BY_ISO2.get(iso2.toLowerCase()) : undefined;
}

/** Resolve the platform's alpha-3 (UAE / AZE / …) or an alpha-2 to a dial code entry. */
export function findByAppCode(code: string | null | undefined): DialCode | undefined {
    if (!code) return undefined;
    const upper = code.toUpperCase();
    return (
        DIAL_CODES.find((c) => c.appCode === upper) ??
        BY_ISO2.get(code.toLowerCase())
    );
}

/**
 * Split a stored number into a country + national part.
 *
 * Longest dial code first, so +971 wins over +9 and +1 doesn't swallow +971. A number with no
 * leading "+" predates the country selector — those are UAE numbers in practice, so we assume
 * UAE and let the customer correct it rather than blanking a field they already filled in.
 */
export function splitPhone(
    stored: string | null | undefined,
    fallbackIso2: string = DEFAULT_ISO2,
): { iso2: string; national: string } {
    const raw = (stored ?? "").trim();
    if (!raw) return { iso2: fallbackIso2, national: "" };

    if (raw.startsWith("+")) {
        const digits = "+" + raw.slice(1).replace(/\D/g, "");
        const match = [...DIAL_CODES]
            .sort((a, b) => b.dial.length - a.dial.length)
            .find((c) => digits.startsWith(c.dial));
        if (match) {
            return { iso2: match.iso2, national: digits.slice(match.dial.length) };
        }
        return { iso2: fallbackIso2, national: digits.slice(1) };
    }

    // Legacy bare number. Drop a national trunk "0" (0501234567 → 501234567) so it doesn't end up
    // as +9710501234567, which Twilio would reject.
    const digits = raw.replace(/\D/g, "").replace(/^0+/, "");
    return { iso2: fallbackIso2, national: digits };
}

/** Compose the E.164 value we send to the API. Returns "" when there is no national part. */
export function toE164(iso2: string, national: string): string {
    const entry = findByIso2(iso2) ?? findByIso2(DEFAULT_ISO2)!;
    const digits = national.replace(/\D/g, "").replace(/^0+/, "");
    return digits ? `${entry.dial}${digits}` : "";
}
