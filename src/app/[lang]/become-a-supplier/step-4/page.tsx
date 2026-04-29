import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import SupplierStepIndicator from "@/features/supplier/components/SupplierStepIndicator";
import Step4Final from "@/features/supplier/components/steps/Step4Final";

export default function SupplierStep4Page() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">Almost There!</h1>
          <p className="text-gray-500 text-sm text-center mb-8">
            Tell us why you want to join Buyology and review our seller declaration.
          </p>
          <SupplierStepIndicator currentStep={4} />
          <Step4Final />
        </div>
      </main>
      <Footer />
    </>
  );
}
