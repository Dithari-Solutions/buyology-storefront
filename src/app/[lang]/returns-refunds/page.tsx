import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import ReturnsRefundB2cPage from "@/features/legal/components/ReturnsRefundB2cPage";

export const metadata = {
    title: "Return & Refund Policy | Buyology",
    description: "Return and refund policy for retail (B2C) customers.",
};

export default function Page() {
    return (
        <>
            <Header />
            <ReturnsRefundB2cPage />
            <Footer />
        </>
    );
}
