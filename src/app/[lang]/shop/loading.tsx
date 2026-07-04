// Skeleton fallback for the shop listing route — mirrors the filter sidebar + product
// grid so navigation into /shop feels instant instead of freezing on the previous page.
// Self-contained (no data deps) so it paints immediately.
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

export default function ShopLoading() {
  return (
    <div className="min-h-screen animate-pulse">
      <SkeletonHeader />

      <div className="w-[90%] mx-auto py-[40px] flex flex-col md:flex-row items-start gap-[24px]">
        {/* Filter sidebar */}
        <aside className="w-full md:w-[280px] flex-shrink-0 bg-white rounded-[20px] border border-gray-100 p-[14px] flex flex-col gap-[10px]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[44px] rounded-[14px] bg-gray-100" />
          ))}
        </aside>

        {/* Product grid + toolbar */}
        <div className="flex-1 flex flex-col gap-[16px] min-w-0 w-full">
          <div className="h-[54px] bg-white rounded-[16px] border border-gray-100" />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-[16px]">
            {Array.from({ length: 9 }).map((_, i) => (
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
    </div>
  );
}
