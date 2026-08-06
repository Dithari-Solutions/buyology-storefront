import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import SellLandingPage from "@/features/sell/components/SellLandingPage";
import { makeStaticMetadata } from "@/shared/seo/staticMeta";

export const generateMetadata = makeStaticMetadata("sell", { canonical: "sell" });

export default function SellRoute() {
    return (
        <>
            <Header />
            <SellLandingPage />
            <Footer />
        </>
    );
}
