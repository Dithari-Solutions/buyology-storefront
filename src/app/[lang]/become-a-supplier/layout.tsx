import type { Metadata } from "next";

// Default for child routes (steps, submitted) — they are private flows.
// The main /become-a-supplier page overrides this with its own indexable metadata.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function BecomeASupplierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
