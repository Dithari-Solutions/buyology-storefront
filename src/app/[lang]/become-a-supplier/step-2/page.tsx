import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import SupplierStepIndicator from "@/features/supplier/components/SupplierStepIndicator";
import Step2WhatToSell from "@/features/supplier/components/steps/Step2WhatToSell";

export default function SupplierStep2Page() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">What Will You Sell?</h1>
          <p className="text-gray-500 text-sm text-center mb-8">
            Tell us about the products you plan to offer on Buyology.
          </p>
          <SupplierStepIndicator currentStep={2} />
          <Step2WhatToSell />
        </div>
      </main>
      <Footer />
    </>
  );
}
