import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import ReturnsRefundB2bPage from "@/features/legal/components/ReturnsRefundB2bPage";

export const metadata = {
    title: "Return & Refund Policy (B2B) | Buyology",
    description: "Return and refund policy for business (B2B) customers.",
};

export default function Page() {
    return (
        <>
            <Header />
            <ReturnsRefundB2bPage />
            <Footer />
        </>
    );
}
