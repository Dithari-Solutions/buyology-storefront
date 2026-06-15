// Instant skeleton for the product detail route. Next.js renders this as the
// Suspense fallback the moment a product card is clicked, so navigation feels
// immediate instead of freezing on the previous page while the server fetches
// the product. Self-contained (no data deps) so it can paint right away.
export default function ProductDetailLoading() {
  return (
    <main className="bg-gray-50 min-h-screen animate-pulse">
      {/* Header placeholder bar (keeps layout from jumping when the real page swaps in) */}
      <div className="h-[64px] bg-white border-b border-gray-100" />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
        {/* Breadcrumb */}
        <div className="h-3 w-48 bg-gray-200 rounded mb-6" />

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Gallery */}
          <div className="w-full lg:w-[48%] flex flex-col gap-4">
            <div className="aspect-square w-full bg-gray-200 rounded-[24px]" />
            <div className="flex gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="w-[68px] h-[68px] bg-gray-200 rounded-[14px]" />
              ))}
            </div>
          </div>

          {/* Info column */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-7 w-3/4 bg-gray-200 rounded" />
            <div className="h-4 w-40 bg-gray-200 rounded" />

            {/* Price */}
            <div className="h-9 w-44 bg-gray-200 rounded mt-2" />

            {/* Spec chips */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded-[12px]" />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-4">
              <div className="h-12 flex-1 bg-gray-200 rounded-[30px]" />
              <div className="h-12 flex-1 bg-gray-200 rounded-[30px]" />
            </div>

            {/* Feature badges */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded-[16px]" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
