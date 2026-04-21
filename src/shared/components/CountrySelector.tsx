"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  selectCountries,
  selectSelectedCountryCode,
  selectSelectedCountry,
  setCountryThunk,
} from "@/features/country/store/countrySlice";
import type { AppDispatch, RootState } from "@/store";

// Maps app country codes (as stored in DB) → ISO 3166-1 alpha-2 lowercase for flagcdn.com
// Includes both 2-letter and 3-letter variants since the DB may use either format.
const APP_TO_ISO2: Record<string, string> = {
  // UAE / United Arab Emirates
  UAE: "ae", AE: "ae",
  // Azerbaijan
  AZE: "az", AZ: "az",
  // Saudi Arabia
  SAU: "sa", SA: "sa",
  // Kuwait
  KWT: "kw", KW: "kw",
  // Qatar
  QAT: "qa", QA: "qa",
  // Oman
  OMN: "om", OM: "om",
  // Bahrain
  BHR: "bh", BH: "bh",
  // Egypt
  EGY: "eg", EG: "eg",
  // Jordan
  JOR: "jo", JO: "jo",
  // Lebanon
  LBN: "lb", LB: "lb",
  // Turkey
  TUR: "tr", TR: "tr",
  // USA
  USA: "us", US: "us",
  // UK
  GBR: "gb", GB: "gb",
  // Germany
  DEU: "de", DE: "de",
};

function FlagImg({ code, size = 24 }: { code: string; size?: number }) {
  const iso2 = APP_TO_ISO2[code];
  if (!iso2) return <span className="text-[16px] leading-none">🌍</span>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w40/${iso2}.png`}
      alt={code}
      width={size}
      height={size * 0.75}
      className="rounded-sm object-cover"
      style={{ minWidth: size }}
    />
  );
}

export default function CountrySelector() {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const countries = useSelector(selectCountries);
  const selectedCode = useSelector(selectSelectedCountryCode);
  const selectedCountry = useSelector(selectSelectedCountry);
  const userId = useSelector((state: RootState) => state.auth.userId);

  const currency = selectedCountry?.currency ?? "AED";

  function handleSelect(code: string) {
    dispatch(setCountryThunk({ countryCode: code, userId }));
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-[6px] bg-white/15 hover:bg-white/25 border border-white/20 rounded-full h-[36px] px-[12px] transition-all duration-200 cursor-pointer"
        title="Select country"
      >
        <FlagImg code={selectedCode} size={20} />
        <span className="hidden xl:inline text-[13px] font-medium text-white/80">{selectedCode}</span>
        <span className="text-white/40 text-[11px] hidden xl:inline">· {currency}</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="cs-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              key="cs-modal"
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 10 }}
              transition={{ type: "spring", stiffness: 360, damping: 28 }}
              className="fixed z-[201] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[420px] bg-white rounded-[24px] shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-br from-[#402F75] to-[#5A4589] px-[24px] py-[20px] flex items-start justify-between">
                <div>
                  <h2 className="text-white font-bold text-[18px]">Select Country</h2>
                  <p className="text-white/60 text-[13px] mt-[2px]">
                    Products and prices are tailored to your location
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="mt-[2px] w-[28px] h-[28px] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
                  aria-label="Close"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Countries list */}
              <div className="p-[16px] max-h-[55vh] overflow-y-auto">
                {countries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-[32px] gap-[10px]">
                    <div className="w-[40px] h-[40px] rounded-full border-[3px] border-[#402F75]/20 border-t-[#402F75] animate-spin" />
                    <p className="text-gray-400 text-[13px]">Loading countries…</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-[8px]">
                    {countries.map((country) => {
                      const isSelected = country.code === selectedCode;
                      return (
                        <button
                          key={country.id}
                          onClick={() => handleSelect(country.code)}
                          className={`flex items-center justify-between w-full px-[16px] py-[12px] rounded-[14px] border transition-all duration-200 cursor-pointer text-start ${
                            isSelected
                              ? "bg-[#F6F4FF] border-[#402F75]"
                              : "bg-gray-50 border-gray-100 hover:border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          <div className="flex items-center gap-[12px]">
                            <FlagImg code={country.code} size={28} />
                            <div>
                              <p className={`text-[14px] font-semibold ${isSelected ? "text-[#402F75]" : "text-gray-800"}`}>
                                {country.name}
                              </p>
                              <p className="text-[12px] text-gray-400">{country.currency}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
