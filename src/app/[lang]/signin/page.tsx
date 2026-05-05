import { makeStaticMetadata } from "@/shared/seo/staticMeta";

export const generateMetadata = makeStaticMetadata("signin", {
  canonical: "__raw",
  suffix: "/signin",
  noindex: true,
});

export default function page() {
  return <></>;
}
