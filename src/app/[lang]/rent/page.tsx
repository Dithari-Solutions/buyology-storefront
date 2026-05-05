import ComingSoonPage from "@/features/coming-soon/components/ComingSoonPage";
import { makeStaticMetadata } from "@/shared/seo/staticMeta";

export const generateMetadata = makeStaticMetadata("rent", { canonical: "rent" });

export default function RentRoute() {
    return <ComingSoonPage serviceId="rent" />;
}
