import { makeStaticMetadata } from "@/shared/seo/staticMeta";

export const generateMetadata = makeStaticMetadata("shop", { canonical: "shop" });

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
