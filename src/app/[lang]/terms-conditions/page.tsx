import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import TermsConditionsPage from "@/features/legal/components/TermsConditionsPage";

export const metadata = {
    title: "Terms & Conditions | Buyology",
    description: "The terms governing purchases made from Buyology FZ Trading LLC.",
};

export default function Page() {
    return (
        <>
            <Header />
            <TermsConditionsPage />
            <Footer />
        </>
    );
}
