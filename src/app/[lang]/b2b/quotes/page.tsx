import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import B2BMembershipGate from "@/features/b2b/components/B2BMembershipGate";
import B2BQuotesPage from "@/features/b2b/components/B2BQuotesPage";
import { makeStaticMetadata } from "@/shared/seo/staticMeta";

export const generateMetadata = makeStaticMetadata("b2b-quotes", {
    canonical: "b2b",
    suffix: "/quotes",
    noindex: true,
});

export default function Page() {
    return (
        <>
            <Header />
            <B2BMembershipGate>
                <B2BQuotesPage />
            </B2BMembershipGate>
            <Footer />
        </>
    );
}
