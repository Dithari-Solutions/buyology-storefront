"use client";

import dynamic from "next/dynamic";
import ScrollReveal from "@/shared/components/ScrollReveal";
import RegionGate from "@/features/location/components/RegionGate";

// Product-bearing home sections. Kept behind the region gate so they neither
// render nor fetch until we've confirmed the visitor's region is served — an
// unserved region sees the notice + country picker instead.
const skel = (h: string) => (
  <div className={`w-[95%] md:w-[90%] ${h} rounded-2xl bg-gray-100 animate-pulse my-3 md:my-4`} />
);

const LimitedStock = dynamic(
  () => import("@/features/home/components/limitedStock/LimitedStock"),
  { loading: () => skel("h-[340px] md:h-[420px]") }
);
const SuperDeals = dynamic(
  () => import("@/features/home/components/superDeals/SuperDeals"),
  { loading: () => skel("h-[480px] md:h-[520px]") }
);

// Pending placeholder reserves the SAME vertical space the resolved sections
// occupy (LimitedStock + SuperDeals). The previous default gate placeholder was
// a single ~320px box, so when the region check resolved, ~500px of content was
// injected and everything below jumped down — a large Cumulative Layout Shift.
function ProductBlockPending() {
  return (
    <div className="w-full flex flex-col items-center">
      {skel("h-[340px] md:h-[420px]")}
      {skel("h-[480px] md:h-[520px]")}
    </div>
  );
}

export default function HomeProductBlock() {
  return (
    <RegionGate variant="inline" pendingFallback={<ProductBlockPending />}>
      <ScrollReveal className="w-full flex justify-center" delay={0.1}>
        <LimitedStock />
      </ScrollReveal>
      <ScrollReveal className="w-full flex justify-center" delay={0.1}>
        <SuperDeals />
      </ScrollReveal>
    </RegionGate>
  );
}
