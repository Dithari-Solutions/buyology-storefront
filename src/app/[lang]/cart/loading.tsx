// Skeleton fallback for the cart route — line-item list on the left, order summary on
// the right. Self-contained (no data deps) so it paints instantly on navigation.
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

export default function CartLoading() {
  return (
    <div className="min-h-screen animate-pulse">
      <SkeletonHeader />

      <div className="w-[90%] mx-auto py-8 md:py-12">
        <div className="h-8 w-40 bg-gray-200 rounded-full mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
          {/* Line items */}
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4 bg-white border border-gray-100 rounded-[20px] p-4">
                <div className="h-24 w-24 bg-gray-200 rounded-[16px] flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-3 py-1">
                  <div className="h-4 w-2/3 bg-gray-200 rounded-full" />
                  <div className="h-3 w-1/3 bg-gray-100 rounded-full" />
                  <div className="mt-auto flex items-center justify-between">
                    <div className="h-8 w-28 bg-gray-100 rounded-full" />
                    <div className="h-5 w-20 bg-gray-200 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="bg-white border border-gray-100 rounded-[24px] p-6 flex flex-col gap-4">
            <div className="h-6 w-40 bg-gray-200 rounded-full mb-2" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-3 w-24 bg-gray-100 rounded-full" />
                <div className="h-3 w-16 bg-gray-100 rounded-full" />
              </div>
            ))}
            <div className="h-px bg-gray-100 my-2" />
            <div className="flex items-center justify-between">
              <div className="h-5 w-20 bg-gray-200 rounded-full" />
              <div className="h-5 w-24 bg-gray-200 rounded-full" />
            </div>
            <div className="h-12 w-full bg-gray-200 rounded-[30px] mt-2" />
          </div>
        </div>
      </div>
    </div>
  );
}
