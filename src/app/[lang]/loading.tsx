// Skeleton fallback for the home route (and the generic fallback for any [lang] route
// without its own loading.tsx). Next.js renders this while the route loads, so page
// changes show a page-shaped skeleton rather than replaying the branded Buyology intro —
// that intro plays only once, on the first launch of a session (AppIntro).
// Self-contained (no data deps) so it paints instantly.
function SkeletonHeader() {
  return (
    <div className="h-[70px] bg-white border-b border-gray-100 flex items-center justify-between px-6">
      <div className="h-7 w-[130px] bg-gray-200 rounded-full" />
      <div className="hidden md:flex items-center gap-6">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-3 w-16 bg-gray-100 rounded-full" />
        ))}
      </div>
      <div className="flex items-center gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-9 w-9 bg-gray-200 rounded-full" />
        ))}
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="min-h-screen animate-pulse">
      <SkeletonHeader />

      <div className="w-[90%] mx-auto py-6 flex flex-col gap-8">
        {/* Stories row */}
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
              <div className="h-16 w-16 bg-gray-200 rounded-full" />
              <div className="h-2 w-12 bg-gray-100 rounded-full" />
            </div>
          ))}
        </div>

        {/* Hero banner */}
        <div className="h-[220px] md:h-[320px] w-full bg-gray-200 rounded-[24px]" />

        {/* Popular categories */}
        <div className="flex flex-col gap-4">
          <div className="h-6 w-48 bg-gray-200 rounded-full" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[120px] bg-gray-100 rounded-[18px]" />
            ))}
          </div>
        </div>

        {/* Product row */}
        <div className="flex flex-col gap-4">
          <div className="h-6 w-56 bg-gray-200 rounded-full" />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-[20px] p-3">
                <div className="h-[190px] bg-gray-200 rounded-[16px] mb-3" />
                <div className="h-4 w-3/4 bg-gray-200 rounded-full mb-2" />
                <div className="h-3 w-1/2 bg-gray-100 rounded-full mb-4" />
                <div className="flex items-end justify-between">
                  <div className="h-6 w-20 bg-gray-200 rounded-full" />
                  <div className="h-9 w-24 bg-gray-100 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
