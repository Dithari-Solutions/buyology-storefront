"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { useStoreServiceStatus } from "@/features/location/hooks/useStoreServiceStatus";
import RegionUnavailable from "./RegionUnavailable";

// Returns false during SSR + the first (hydration) render, true thereafter —
// without setState-in-effect. Lets preserveSSR surfaces keep the server markup
// until the client takes over.
const noopSubscribe = () => () => {};
function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

interface Props {
  children: ReactNode;
  /** Sizing of the pending/unserved fallbacks. */
  variant?: "inline" | "page";
  /** Custom placeholder while the region is still being determined. */
  pendingFallback?: ReactNode;
  /**
   * Keep server-rendered children mounted until the client hydrates, then apply
   * the gate. Use on SSR pages (product detail) so crawlers still receive the
   * product markup. Client-only pages leave this off, so products never render
   * before detection resolves.
   */
  preserveSSR?: boolean;
}

function PendingPlaceholder({ variant }: { variant: "inline" | "page" }) {
  if (variant === "inline") {
    return (
      <div className="w-[95%] md:w-[90%] mx-auto my-6 h-[320px] md:h-[400px] rounded-2xl bg-gray-100 animate-pulse" />
    );
  }
  return (
    <div className="w-full min-h-[50vh] flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-[3px] border-gray-200 border-t-[#402F75] animate-spin" />
    </div>
  );
}

/**
 * Gates product-bearing UI on store availability for the visitor's region.
 * Products stay hidden until we've confirmed the region is served (see
 * useStoreServiceStatus); unserved regions get a notice + country picker.
 */
export default function RegionGate({
  children,
  variant = "page",
  pendingFallback,
  preserveSSR = false,
}: Props) {
  const status = useStoreServiceStatus();
  const hydrated = useHydrated();

  // SSR-preserving surfaces render children until the client takes over, so the
  // server HTML (and crawlers) still get the product markup.
  if (preserveSSR && !hydrated) return <>{children}</>;

  if (status === "pending") {
    return <>{pendingFallback ?? <PendingPlaceholder variant={variant} />}</>;
  }
  if (status === "unserved") {
    return <RegionUnavailable variant={variant} />;
  }
  return <>{children}</>;
}
