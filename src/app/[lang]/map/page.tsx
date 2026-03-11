import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import MapLoader from "@/features/map/components/MapLoader";

export default function MapPage() {
  return (
    <>
      <Header />
      <main className="flex flex-col" style={{ minHeight: "calc(100vh - 160px)" }}>
        <div className="px-4 py-4 max-w-6xl mx-auto w-full">
          <h1 className="text-2xl font-bold text-[#402F75]">Route Map</h1>
        </div>
        <div className="px-4 pb-8 max-w-6xl mx-auto w-full" style={{ height: "600px" }}>
          <div className="w-full h-full rounded-xl overflow-hidden shadow-lg border border-gray-200">
            <MapLoader />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
