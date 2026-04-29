import type { Metadata } from "next";
import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import B2BMembershipApply from "@/features/membership/components/B2BMembershipApply";

export const metadata: Metadata = {
    title: "Become a B2B Member | Buyology",
    description: "Apply for B2B Premium Membership and unlock exclusive benefits, wallet credits, and dedicated business support.",
};

export default function B2BApplyPage() {
    return (
        <>
            <Header />
            <main className="w-[90%] mx-auto py-10 md:py-16">
                <div className="text-center mb-10">
                    <span className="inline-block rounded-full bg-[#EDE9FF] text-[#402F75] text-xs font-semibold px-4 py-1.5 mb-4 tracking-wide uppercase">
                        B2B Premium Membership
                    </span>
                    <h1 className="text-[28px] md:text-[36px] font-bold text-gray-800 mb-3">
                        Apply for B2B Membership
                    </h1>
                    <p className="text-gray-500 max-w-xl mx-auto text-[15px]">
                        Join Buyology's exclusive B2B program. Get AED 5,000 wallet credit, priority support, and a dedicated digital membership card.
                    </p>
                </div>
                <B2BMembershipApply />
            </main>
            <Footer />
        </>
    );
}
