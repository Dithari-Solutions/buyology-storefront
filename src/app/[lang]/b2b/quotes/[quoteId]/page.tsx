import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import B2BMembershipGate from "@/features/b2b/components/B2BMembershipGate";
import B2BQuoteDetailPage from "@/features/b2b/components/B2BQuoteDetailPage";
import { makeStaticMetadata } from "@/shared/seo/staticMeta";

export const generateMetadata = makeStaticMetadata("b2b-quote-detail", {
    canonical: "b2b",
    suffix: "/quotes",
    noindex: true,
});

export default function Page() {
    return (
        <>
            <Header />
            <B2BMembershipGate>
                <B2BQuoteDetailPage />
            </B2BMembershipGate>
            <Footer />
        </>
    );
}
