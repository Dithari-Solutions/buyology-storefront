import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import SupplierStepIndicator from "@/features/supplier/components/SupplierStepIndicator";
import Step3Operations from "@/features/supplier/components/steps/Step3Operations";

export default function SupplierStep3Page() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">Operations & Verification</h1>
          <p className="text-gray-500 text-sm text-center mb-8">
            Help us understand how you operate and upload your trade license if available.
          </p>
          <SupplierStepIndicator currentStep={3} />
          <Step3Operations />
        </div>
      </main>
      <Footer />
    </>
  );
}
