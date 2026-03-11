import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import MapLoader from "@/features/map/components/MapLoader";

export default function MapPage() {
  return (
    <>
      <Header />
      <main className="flex flex-col min-h-[calc(100vh-160px)]">
        <div className="px-4 py-6 max-w-6xl mx-auto w-full">
          <h1 className="text-2xl font-bold text-[#402F75] mb-4">Route Map</h1>
        </div>
        <div className="flex-1 max-w-6xl mx-auto w-full px-4 pb-10" style={{ height: "600px" }}>
          <div className="w-full h-full rounded-xl overflow-hidden shadow-lg border border-gray-200">
            <MapLoader />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
