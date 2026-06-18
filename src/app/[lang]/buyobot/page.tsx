import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import ComingSoon from "@/features/buyobot/components/ComingSoon";

export const metadata = {
    title: "BuyoBot — Buyology Robotics | Coming Soon",
    description:
        "BuyoBot is Buyology's robotics — a new range of smart robots coming soon to shop on Buyology, from home helpers to next-gen companions. Subscribe to be the first to know.",
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
