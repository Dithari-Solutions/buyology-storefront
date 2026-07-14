import i18n, { type Resource, type ResourceLanguage } from "i18next";
import { initReactI18next } from "react-i18next";

// IMPORTANT: don't statically import every locale. That ships ~240 KB of JSON
// for every page and parses it during hydration (a major TBT contributor).
// Instead we detect the language from the URL on first load and import only
// that locale's resources synchronously; other locales are lazy-loaded via
// dynamic import when the user switches languages.

type Lang = "en" | "az" | "ar";
const SUPPORTED: readonly Lang[] = ["en", "az", "ar"] as const;
const NAMESPACES = [
    "auth",
    "b2b",
    "b2b-rfq",
    "banner",
    "cart",
    "checkout",
    "coming-soon",
    "contact",
    "favourites",
    "footer",
    "header",
    "home",
    "notFound",
    "product",
    "profile",
    "quick-delivery",
    "games",
    "refund",
    "repair",
];

// Always boot with English so server and client agree on the very first
// render (preventing React hydration error #418). LangSync then switches to
// the URL's language via `switchLanguage`, lazy-loading its bundle.
function detectInitialLang(): Lang {
    return "en";
}

async function importResources(lang: Lang) {
    switch (lang) {
        case "az":
            return (await import("./resources/az")).default;
        case "ar":
            return (await import("./resources/ar")).default;
        default:
            return (await import("./resources/en")).default;
    }
}

const initialLang = detectInitialLang();

// Synchronously import the initial language so the first render has strings.
// (The async dynamic-import path is used only for language switches.)
let initialResources: ResourceLanguage = {};
if (initialLang === "en") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    initialResources = require("./resources/en").default as ResourceLanguage;
} else if (initialLang === "az") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    initialResources = require("./resources/az").default as ResourceLanguage;
} else if (initialLang === "ar") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    initialResources = require("./resources/ar").default as ResourceLanguage;
}

const initResources: Resource = {
    [initialLang]: initialResources,
};

if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
        lng: initialLang,
        fallbackLng: "en",
        debug: false,
        supportedLngs: SUPPORTED as unknown as string[],
        ns: NAMESPACES,
        defaultNS: "home",
        interpolation: { escapeValue: false },
        resources: initResources,
        react: { useSuspense: false },
        // We swap whole resource bundles ourselves, no missing-key fallback noise.
        saveMissing: false,
    });
}

/**
 * Lazy-load a language's resources and add them to i18next. Idempotent.
 * Returns once the bundle is registered and `changeLanguage` can succeed.
 */
export async function ensureLanguageLoaded(lang: Lang): Promise<void> {
    if (i18n.hasResourceBundle(lang, "home")) return;
    const resources = (await importResources(lang)) as ResourceLanguage;
    for (const ns of Object.keys(resources)) {
        i18n.addResourceBundle(lang, ns, resources[ns], true, true);
    }
}

/**
 * Convenience wrapper used by the language switcher.
 */
export async function switchLanguage(lang: Lang): Promise<void> {
    await ensureLanguageLoaded(lang);
    await i18n.changeLanguage(lang);
}

export default i18n;
