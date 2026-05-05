import ComingSoonPage from "@/features/coming-soon/components/ComingSoonPage";
import { makeStaticMetadata } from "@/shared/seo/staticMeta";

export const generateMetadata = makeStaticMetadata("sell", { canonical: "sell" });

export default function SellRoute() {
    return <ComingSoonPage serviceId="sell" />;
}
