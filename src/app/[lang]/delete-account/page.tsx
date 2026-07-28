import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import DeleteAccountPage from "@/features/legal/components/DeleteAccountPage";

export const metadata = {
    title: "Delete Your Account | Buyology",
    description: "How to request deletion of your Buyology account and the personal data associated with it.",
};

export default function Page() {
    return (
        <>
            <Header />
            <DeleteAccountPage />
            <Footer />
        </>
    );
}
