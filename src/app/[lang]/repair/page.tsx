import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import RepairLandingPage from "@/features/repair/components/RepairLandingPage";
import { makeStaticMetadata } from "@/shared/seo/staticMeta";

export const generateMetadata = makeStaticMetadata("repair", { canonical: "repair" });

export default function RepairRoute() {
    return (
        <>
            <Header />
            <RepairLandingPage />
            <Footer />
        </>
    );
}
