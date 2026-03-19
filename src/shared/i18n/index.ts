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
import enHome        from "../../../public/locales/en/home.json";
import enFavourites  from "../../../public/locales/en/favourites.json";
import enNotFound    from "../../../public/locales/en/notFound.json";
import enProfile    from "../../../public/locales/en/profile.json";
import enComingSoon  from "../../../public/locales/en/coming-soon.json";
import enProduct    from "../../../public/locales/en/product.json";

import azAuth   from "../../../public/locales/az/auth.json";
import azBanner from "../../../public/locales/az/banner.json";
import azCart   from "../../../public/locales/az/cart.json";
import azFooter from "../../../public/locales/az/footer.json";
import azHeader from "../../../public/locales/az/header.json";
import azHome        from "../../../public/locales/az/home.json";
import azFavourites  from "../../../public/locales/az/favourites.json";
import azNotFound    from "../../../public/locales/az/notFound.json";
import azProfile    from "../../../public/locales/az/profile.json";
import azComingSoon  from "../../../public/locales/az/coming-soon.json";
import azProduct    from "../../../public/locales/az/product.json";

import arAuth   from "../../../public/locales/ar/auth.json";
import arBanner from "../../../public/locales/ar/banner.json";
import arCart   from "../../../public/locales/ar/cart.json";
import arFooter from "../../../public/locales/ar/footer.json";
import arHeader from "../../../public/locales/ar/header.json";
import arHome        from "../../../public/locales/ar/home.json";
import arFavourites  from "../../../public/locales/ar/favourites.json";
import arNotFound    from "../../../public/locales/ar/notFound.json";
import arProfile    from "../../../public/locales/ar/profile.json";
import arComingSoon  from "../../../public/locales/ar/coming-soon.json";
import arProduct    from "../../../public/locales/ar/product.json";

if (!i18n.isInitialized) {
    i18n
        .use(LanguageDetector)
        .use(initReactI18next)
        .init({
            fallbackLng: "en",
            debug: false,
            supportedLngs: ["en", "az", "ar"],
            ns: ["auth", "banner", "cart", "coming-soon", "favourites", "footer", "header", "home", "notFound", "product", "profile"],
            defaultNS: "home",
            interpolation: {
                escapeValue: false,
            },
            resources: {
                en: {
                    auth:        enAuth,
                    banner:      enBanner,
                    cart:        enCart,
                    "coming-soon": enComingSoon,
                    favourites:  enFavourites,
                    footer:      enFooter,
                    header:      enHeader,
                    home:        enHome,
                    notFound:    enNotFound,
                    product:     enProduct,
                    profile:     enProfile,
                },
                az: {
                    auth:        azAuth,
                    banner:      azBanner,
                    cart:        azCart,
                    "coming-soon": azComingSoon,
                    favourites:  azFavourites,
                    footer:      azFooter,
                    header:      azHeader,
                    home:        azHome,
                    notFound:    azNotFound,
                    product:     azProduct,
                    profile:     azProfile,
                },
                ar: {
                    auth:        arAuth,
                    banner:      arBanner,
                    cart:        arCart,
                    "coming-soon": arComingSoon,
                    favourites:  arFavourites,
                    footer:      arFooter,
                    header:      arHeader,
                    home:        arHome,
                    notFound:    arNotFound,
                    product:     arProduct,
                    profile:     arProfile,
                },
            },
            react: {
                useSuspense: false,
            },
        });
}

export default i18n;
