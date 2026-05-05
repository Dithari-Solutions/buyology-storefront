import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import QuickDeliveryPage from "@/features/quickDelivery/components/QuickDeliveryPage";
import { makeStaticMetadata } from "@/shared/seo/staticMeta";

export const generateMetadata = makeStaticMetadata("quick-delivery", {
  canonical: "quick-delivery",
});

export default function Page() {
    return (
        <>
            <Header />
            <QuickDeliveryPage />
            <Footer />
        </>
    );
}
