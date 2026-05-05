import OrdersPage from "@/features/orders/components/OrdersPage";
import { makeStaticMetadata } from "@/shared/seo/staticMeta";

export const generateMetadata = makeStaticMetadata("orders", {
    canonical: "orders",
    noindex: true,
});

export default function OrdersRoute() {
    return <OrdersPage />;
}
