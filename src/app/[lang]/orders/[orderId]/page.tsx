import OrderDetailPage from "@/features/orders/components/OrderDetailPage";

export default async function OrderDetailRoute({
    params,
}: {
    params: Promise<{ orderId: string }>;
}) {
    const { orderId } = await params;
    return <OrderDetailPage orderId={orderId} />;
}
