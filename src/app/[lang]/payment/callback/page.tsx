import PaymentCallbackPage from "@/features/checkout/components/PaymentCallbackPage";
import { makeStaticMetadata } from "@/shared/seo/staticMeta";

export const generateMetadata = makeStaticMetadata("payment-callback", {
    canonical: "__raw",
    suffix: "/payment/callback",
    noindex: true,
});

export default async function PaymentCallbackRoute({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    return <PaymentCallbackPage lang={lang} />;
}
