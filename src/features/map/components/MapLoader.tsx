"use client";

import dynamic from "next/dynamic";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-50">
      <div className="text-gray-400 text-sm">Loading map...</div>
    </div>
  ),
});

export default function MapLoader() {
  return (
    <div className="w-full h-full">
      <MapView />
    </div>
  );
}
