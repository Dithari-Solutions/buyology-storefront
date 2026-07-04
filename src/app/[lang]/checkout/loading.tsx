// Skeleton fallback for the checkout route — address/payment form on the left, order
// summary on the right (mirrors the real 1fr/380px layout). Self-contained so it paints
// instantly on navigation.
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

export default function CheckoutLoading() {
  return (
    <div className="min-h-screen animate-pulse">
      <SkeletonHeader />

      <div className="w-[90%] mx-auto py-8 md:py-12">
        <div className="h-8 w-48 bg-gray-200 rounded-full mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-6 items-start">
          {/* Form sections */}
          <div className="flex flex-col gap-6">
            {[0, 1].map((section) => (
              <div key={section} className="bg-white border border-gray-100 rounded-[24px] p-6 flex flex-col gap-4">
                <div className="h-6 w-44 bg-gray-200 rounded-full mb-2" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded-[12px]" />
                  ))}
                </div>
                <div className="h-12 bg-gray-100 rounded-[12px]" />
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="bg-white border border-gray-100 rounded-[24px] p-6 flex flex-col gap-4">
            <div className="h-6 w-40 bg-gray-200 rounded-full mb-2" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex gap-3 items-center">
                <div className="h-14 w-14 bg-gray-200 rounded-[12px] flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-3 w-2/3 bg-gray-100 rounded-full" />
                  <div className="h-3 w-1/3 bg-gray-100 rounded-full" />
                </div>
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
