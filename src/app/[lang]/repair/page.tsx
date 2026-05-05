import ComingSoonPage from "@/features/coming-soon/components/ComingSoonPage";
import { makeStaticMetadata } from "@/shared/seo/staticMeta";

export const generateMetadata = makeStaticMetadata("repair", { canonical: "repair" });

export default function RepairRoute() {
    return <ComingSoonPage serviceId="repair" />;
}
