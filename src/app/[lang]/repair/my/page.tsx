import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import MyRepairsPage from "@/features/repair/components/MyRepairsPage";
import { makeStaticMetadata } from "@/shared/seo/staticMeta";

export const generateMetadata = makeStaticMetadata("repair", {
    canonical: "repair",
    suffix: "/my",
    noindex: true,
});

export default function MyRepairsRoute() {
    return (
        <>
            <Header />
            <MyRepairsPage />
            <Footer />
        </>
    );
}
