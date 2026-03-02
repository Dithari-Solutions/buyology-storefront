import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Static imports — available synchronously on both server and client,
// which eliminates SSR/hydration mismatches caused by async HTTP loading.
import enAuth   from "../../../public/locales/en/auth.json";
import enBanner from "../../../public/locales/en/banner.json";
import enCart   from "../../../public/locales/en/cart.json";
import enFooter from "../../../public/locales/en/footer.json";
import enHeader from "../../../public/locales/en/header.json";
import enHome   from "../../../public/locales/en/home.json";

import azAuth   from "../../../public/locales/az/auth.json";
import azBanner from "../../../public/locales/az/banner.json";
import azCart   from "../../../public/locales/az/cart.json";
import azFooter from "../../../public/locales/az/footer.json";
import azHeader from "../../../public/locales/az/header.json";
import azHome   from "../../../public/locales/az/home.json";

import arAuth   from "../../../public/locales/ar/auth.json";
import arBanner from "../../../public/locales/ar/banner.json";
import arCart   from "../../../public/locales/ar/cart.json";
import arFooter from "../../../public/locales/ar/footer.json";
import arHeader from "../../../public/locales/ar/header.json";
import arHome   from "../../../public/locales/ar/home.json";

if (!i18n.isInitialized) {
    i18n
        .use(LanguageDetector)
        .use(initReactI18next)
        .init({
            fallbackLng: "en",
            debug: false,
            supportedLngs: ["en", "az", "ar"],
            ns: ["auth", "banner", "cart", "footer", "header", "home"],
            defaultNS: "home",
            interpolation: {
                escapeValue: false,
            },
            resources: {
                en: {
                    auth:   enAuth,
                    banner: enBanner,
                    cart:   enCart,
                    footer: enFooter,
                    header: enHeader,
                    home:   enHome,
                },
                az: {
                    auth:   azAuth,
                    banner: azBanner,
                    cart:   azCart,
                    footer: azFooter,
                    header: azHeader,
                    home:   azHome,
                },
                ar: {
                    auth:   arAuth,
                    banner: arBanner,
                    cart:   arCart,
                    footer: arFooter,
                    header: arHeader,
                    home:   arHome,
                },
            },
            react: {
                useSuspense: false,
            },
        });
}

export default i18n;
