import { makeStaticMetadata } from "@/shared/seo/staticMeta";

export const generateMetadata = makeStaticMetadata("catalog", { canonical: "catalog" });

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
