import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import B2BMembershipGate from "@/features/b2b/components/B2BMembershipGate";
import B2BCartPage from "@/features/b2b/components/B2BCartPage";
import { makeStaticMetadata } from "@/shared/seo/staticMeta";

export const generateMetadata = makeStaticMetadata("b2b-cart", {
    canonical: "b2b",
    suffix: "/cart",
    noindex: true,
});

export default function Page() {
    return (
        <>
            <Header />
            <B2BMembershipGate>
                <B2BCartPage />
            </B2BMembershipGate>
            <Footer />
        </>
    );
}
