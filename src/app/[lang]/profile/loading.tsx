// Skeleton fallback for the profile route — account menu on the left, profile panels on
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

export default function ProfileLoading() {
  return (
    <div className="min-h-screen animate-pulse">
      <SkeletonHeader />

      <div className="w-[90%] mx-auto py-[40px] flex flex-col md:flex-row items-start gap-[24px]">
        {/* Account menu */}
        <aside className="w-full md:w-[280px] flex-shrink-0 bg-white rounded-[24px] border border-gray-100 p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 bg-gray-200 rounded-full flex-shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-4 w-3/4 bg-gray-200 rounded-full" />
              <div className="h-3 w-1/2 bg-gray-100 rounded-full" />
            </div>
          </div>
          <div className="h-px bg-gray-100 my-1" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[42px] bg-gray-100 rounded-[12px]" />
          ))}
        </aside>

        {/* Content panels */}
        <div className="flex-1 w-full flex flex-col gap-6">
          <div className="bg-white border border-gray-100 rounded-[24px] p-6 flex flex-col gap-4">
            <div className="h-6 w-48 bg-gray-200 rounded-full mb-2" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="h-3 w-24 bg-gray-100 rounded-full" />
                  <div className="h-12 bg-gray-100 rounded-[12px]" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-[24px] p-6 flex flex-col gap-4">
            <div className="h-6 w-40 bg-gray-200 rounded-full mb-2" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-[12px]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
