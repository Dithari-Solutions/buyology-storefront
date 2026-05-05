import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import B2BPage from "@/features/b2b/components/B2BPage";
import { makeStaticMetadata } from "@/shared/seo/staticMeta";

export const generateMetadata = makeStaticMetadata("b2b", { canonical: "b2b" });

export default function Page() {
    return (
        <>
            <Header />
            <B2BPage />
            <Footer />
        </>
    );
}
