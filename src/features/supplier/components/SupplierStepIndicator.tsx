"use client";

import { COLORS } from "@/shared/styles/variables";

interface Props {
  currentStep: 1 | 2 | 3 | 4;
}

const STEPS = ["About You", "What You Sell", "Operations", "Final Step"];

export default function SupplierStepIndicator({ currentStep }: Props) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((label, idx) => {
        const step = (idx + 1) as 1 | 2 | 3 | 4;
        const done = step < currentStep;
        const active = step === currentStep;
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                  done
                    ? "bg-green-500 border-green-500 text-white shadow-md shadow-green-100"
                    : active
                    ? "border-[#402F75] text-[#402F75] bg-white shadow-lg shadow-purple-50"
                    : "bg-white border-gray-200 text-gray-300"
                }`}
                style={active ? { borderColor: COLORS.primary, color: COLORS.primary } : {}}
              >
                {done ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step
                )}
              </div>
              <span 
                className={`mt-2 text-[11px] uppercase tracking-wider font-bold transition-colors duration-300 ${
                  active ? "text-[#402F75]" : done ? "text-green-500" : "text-gray-300"
                }`}
                style={active ? { color: COLORS.primary } : {}}
              >
                {label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className="flex items-center h-10">
                <div className={`w-12 sm:w-20 h-0.5 mx-2 rounded-full transition-colors duration-500 ${done ? "bg-green-500" : "bg-gray-100"}`} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
