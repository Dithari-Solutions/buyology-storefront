import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import ComingSoon from "@/features/buyobot/components/ComingSoon";

export const metadata = {
    title: "BuyoBot — Buyology Robotics | Coming Soon",
    description:
        "BuyoBot is Buyology's robotics initiative — intelligent machines engineered to power the future of retail, from automated fulfilment to smarter logistics. Coming soon.",
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
