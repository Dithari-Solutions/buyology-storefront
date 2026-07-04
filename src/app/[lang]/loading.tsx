// Skeleton fallback for client-side navigation between pages. Next.js renders this the
// moment a [lang] route starts loading, so page changes show a neutral skeleton rather
// than replaying the branded Buyology intro — that intro plays only once, on the initial
// page open (AppIntro). Self-contained (no data deps) so it paints instantly.
export default function Loading() {
  return (
    <div className="min-h-screen animate-pulse">
      {/* Header bar */}
      <div className="h-[64px] bg-white border-b border-gray-100 flex items-center justify-between px-6">
        <div className="h-6 w-[120px] bg-gray-200 rounded-full" />
        <div className="hidden md:flex items-center gap-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-3 w-16 bg-gray-100 rounded-full" />
          ))}
        </div>
        <div className="h-8 w-8 bg-gray-200 rounded-full" />
      </div>

      <div className="w-[90%] max-w-[1200px] mx-auto py-8">
        {/* Hero / banner */}
        <div className="h-[180px] md:h-[220px] w-full bg-gray-200 rounded-[20px] mb-8" />

        {/* Section title */}
        <div className="h-6 w-52 bg-gray-200 rounded-full mb-6" />

        {/* Card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-[20px] p-3">
              <div className="h-[200px] bg-gray-200 rounded-[16px] mb-3" />
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
  );
}
