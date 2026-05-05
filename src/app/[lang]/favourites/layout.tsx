import { makeStaticMetadata } from "@/shared/seo/staticMeta";

export const generateMetadata = makeStaticMetadata("favourites", {
  canonical: "favourites",
  noindex: true,
});

export default function FavouritesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
