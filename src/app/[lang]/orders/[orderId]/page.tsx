import type { Metadata } from "next";
import OrderDetailPage from "@/features/orders/components/OrderDetailPage";

export const metadata: Metadata = {
    title: "Order Details",
    robots: { index: false, follow: false },
};

export default async function OrderDetailRoute({
    params,
}: {
    params: Promise<{ orderId: string }>;
}) {
    const { orderId } = await params;
    return <OrderDetailPage orderId={orderId} />;
}
