import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import SupplierStepIndicator from "@/features/supplier/components/SupplierStepIndicator";
import Step3Operations from "@/features/supplier/components/steps/Step3Operations";
import { COLORS } from "@/shared/styles/variables";

export default function SupplierStep3Page() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-16 px-4 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-purple-50/50 to-transparent pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#FBBB14]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#402F75]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto relative">
          <div className="bg-white rounded-[35px] shadow-2xl shadow-purple-900/5 border border-gray-100 p-8 sm:p-12">
            <div className="text-center mb-10">
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 tracking-tight">
                Store <span style={{ color: COLORS.primary }}>Operations</span>
              </h1>
              <p className="text-gray-500 text-[15px] max-w-md mx-auto leading-relaxed">
                Help us understand how you manage your logistics and inventory.
              </p>
            </div>

            <SupplierStepIndicator currentStep={3} />

            <div className="mt-4">
              <Step3Operations />
            </div>
          </div>

          <p className="text-center mt-8 text-gray-400 text-sm font-medium">
            Need help? Contact our support team at <span className="text-[#402F75] cursor-pointer hover:underline">suppliers@buyology.com</span>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

