import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import RepairDetailPage from "@/features/repair/components/RepairDetailPage";
import { makeStaticMetadata } from "@/shared/seo/staticMeta";

export const generateMetadata = makeStaticMetadata("repair", {
    canonical: "repair",
    suffix: "/details",
    noindex: true,
});

export default function RepairDetailRoute() {
    return (
        <>
            <Header />
            <RepairDetailPage />
            <Footer />
        </>
    );
}
