import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import PrivacyPolicyPage from "@/features/legal/components/PrivacyPolicyPage";

export const metadata = {
    title: "Privacy Policy | Buyology",
    description: "How Buyology collects, uses, discloses, and safeguards your personal data.",
};

export default function Page() {
    return (
        <>
            <Header />
            <PrivacyPolicyPage />
            <Footer />
        </>
    );
}
