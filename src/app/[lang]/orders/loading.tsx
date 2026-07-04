// Skeleton fallback for the orders route — a list of order cards. Self-contained (no data
// deps) so it paints instantly on navigation.
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

export default function OrdersLoading() {
  return (
    <div className="min-h-screen animate-pulse">
      <SkeletonHeader />

      <div className="w-[90%] mx-auto py-[40px] flex flex-col gap-[20px]">
        <div className="h-8 w-40 bg-gray-200 rounded-full mb-2" />

        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-[20px] p-5 flex flex-col gap-4">
            {/* Order header row */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <div className="h-4 w-40 bg-gray-200 rounded-full" />
                <div className="h-3 w-24 bg-gray-100 rounded-full" />
              </div>
              <div className="h-7 w-24 bg-gray-100 rounded-full" />
            </div>
            <div className="h-px bg-gray-100" />
            {/* Items preview */}
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                {[0, 1, 2].map((j) => (
                  <div key={j} className="h-14 w-14 bg-gray-200 rounded-[12px]" />
                ))}
              </div>
              <div className="h-5 w-24 bg-gray-200 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
