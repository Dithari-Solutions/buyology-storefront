import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import RepairRequestForm from "@/features/repair/components/RepairRequestForm";
import { makeStaticMetadata } from "@/shared/seo/staticMeta";

export const generateMetadata = makeStaticMetadata("repair", {
    canonical: "repair",
    suffix: "/new",
    noindex: true,
});

export default function RepairNewRoute() {
    return (
        <>
            <Header />
            <RepairRequestForm />
            <Footer />
        </>
    );
}
