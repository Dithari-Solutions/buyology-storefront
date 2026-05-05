import CartPage from "@/features/cart/components/CartPage";
import { makeStaticMetadata } from "@/shared/seo/staticMeta";

export const generateMetadata = makeStaticMetadata("cart", {
    canonical: "cart",
    noindex: true,
});

export default function CartRoute() {
    return <CartPage />;
}
