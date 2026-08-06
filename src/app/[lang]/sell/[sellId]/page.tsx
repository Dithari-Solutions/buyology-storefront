import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import SellDetailPage from "@/features/sell/components/SellDetailPage";
import { makeStaticMetadata } from "@/shared/seo/staticMeta";

export const generateMetadata = makeStaticMetadata("sell", {
    canonical: "sell",
    suffix: "/details",
    noindex: true,
});

export default function SellDetailRoute() {
    return (
        <>
            <Header />
            <SellDetailPage />
            <Footer />
        </>
    );
}
