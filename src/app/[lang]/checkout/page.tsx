import { Suspense } from "react";
import CheckoutPage from "@/features/checkout/components/CheckoutPage";
import { makeStaticMetadata } from "@/shared/seo/staticMeta";

export const generateMetadata = makeStaticMetadata("checkout", {
    canonical: "checkout",
    noindex: true,
});

export default function CheckoutRoute() {
    // CheckoutPage reads useSearchParams (?buyNow=1) — must be inside Suspense.
    return (
        <Suspense fallback={null}>
            <CheckoutPage />
        </Suspense>
    );
}
