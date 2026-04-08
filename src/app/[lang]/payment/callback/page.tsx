import PaymentCallbackPage from "@/features/checkout/components/PaymentCallbackPage";

export default async function PaymentCallbackRoute({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    return <PaymentCallbackPage lang={lang} />;
}
