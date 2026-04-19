'use client';

import dynamic from 'next/dynamic';

// MapLibre GL uses browser APIs — load only on client
const CourierMapView = dynamic(
  () => import('@/features/courier/components/CourierMapView'),
  { ssr: false, loading: () => (
    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
      Loading map…
    </div>
  )}
);

export default function CourierMapPage() {
  return (
    <div className="flex flex-col" style={{ height: '100dvh' }}>
      {/* Page header */}
      <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="w-2 h-2 rounded-full bg-[#402F75]" />
        <h1 className="text-lg font-semibold text-gray-900">Courier Fleet Map</h1>
        <span className="text-xs text-gray-400 ml-auto">Admin dashboard · Live view</span>
      </div>

      {/* Map fills the rest */}
      <div className="flex-1 min-h-0 relative">
        <CourierMapView />
      </div>
    </div>
  );
}
