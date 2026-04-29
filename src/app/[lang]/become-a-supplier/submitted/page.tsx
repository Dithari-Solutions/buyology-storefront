import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import Link from "next/link";
import { COLORS } from "@/shared/styles/variables";

export default function SupplierSubmittedPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-[#F9FAFB] flex items-center justify-center py-20 px-4 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-purple-50/50 to-transparent pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#FBBB14]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#402F75]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-xl mx-auto relative w-full">
          <div className="bg-white rounded-[40px] shadow-2xl shadow-purple-900/5 border border-gray-100 p-10 sm:p-16 text-center">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-100">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
              Application <span style={{ color: COLORS.primary }}>Submitted!</span>
            </h1>
            
            <p className="text-gray-500 text-[16px] mb-10 leading-relaxed">
              Thank you for applying to become a Buyology supplier. Our team will review your application and
              get back to you via email within <span className="text-[#402F75] font-bold">3–5 business days</span>.
            </p>
            
            <Link
              href="/"
              className="inline-block px-10 py-4 rounded-2xl text-white font-bold text-[16px] transition-all duration-200 shadow-lg shadow-yellow-100 active:scale-[0.98] hover:opacity-90"
              style={{ backgroundColor: COLORS.secondary }}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
