import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import SellRequestForm from "@/features/sell/components/SellRequestForm";
import { makeStaticMetadata } from "@/shared/seo/staticMeta";

export const generateMetadata = makeStaticMetadata("sell", {
    canonical: "sell",
    suffix: "/new",
    noindex: true,
});

export default function SellNewRoute() {
    return (
        <>
            <Header />
            <SellRequestForm />
            <Footer />
        </>
    );
}
