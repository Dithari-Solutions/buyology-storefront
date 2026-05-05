import CheckoutPage from "@/features/checkout/components/CheckoutPage";
import { makeStaticMetadata } from "@/shared/seo/staticMeta";

export const generateMetadata = makeStaticMetadata("checkout", {
    canonical: "checkout",
    noindex: true,
});

export default function CheckoutRoute() {
    return <CheckoutPage />;
}
