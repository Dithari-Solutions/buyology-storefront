import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import ComingSoon from "@/features/buyobot/components/ComingSoon";

export const metadata = {
    title: "BuyoBot — Coming Soon | Buyology",
    description:
        "BuyoBot is our upcoming AI shopping assistant. It will help you find the right device, compare deals and answer questions in seconds. Stay tuned.",
    robots: { index: false, follow: true },
};

export default function BuyoBotPage() {
    return (
        <>
            <Header />
            <ComingSoon />
            <Footer />
        </>
    );
}
