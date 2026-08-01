import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import MySellRequestsPage from "@/features/sell/components/MySellRequestsPage";
import { makeStaticMetadata } from "@/shared/seo/staticMeta";

export const generateMetadata = makeStaticMetadata("sell", {
    canonical: "sell",
    suffix: "/my",
    noindex: true,
});

export default function MySellRequestsRoute() {
    return (
        <>
            <Header />
            <MySellRequestsPage />
            <Footer />
        </>
    );
}
