"use client";

import { useSelector } from "react-redux";
import {
  selectSelectedCountryCode,
  selectSelectedCountry,
} from "@/features/country/store/countrySlice";

const APP_TO_ISO2: Record<string, string> = {
  UAE: "ae", AE: "ae",
  AZE: "az", AZ: "az",
  SAU: "sa", SA: "sa",
  KWT: "kw", KW: "kw",
  QAT: "qa", QA: "qa",
  OMN: "om", OM: "om",
  BHR: "bh", BH: "bh",
  EGY: "eg", EG: "eg",
  JOR: "jo", JO: "jo",
  LBN: "lb", LB: "lb",
  TUR: "tr", TR: "tr",
  USA: "us", US: "us",
  GBR: "gb", GB: "gb",
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
  const selectedCode = useSelector(selectSelectedCountryCode);
  const selectedCountry = useSelector(selectSelectedCountry);
  const currency = selectedCountry?.currency ?? "AED";

  return (
    <div
      className="flex items-center gap-[6px] bg-white/15 border border-white/20 rounded-full h-[36px] px-[12px]"
      title="Detected from your location"
    >
      <FlagImg code={selectedCode} size={20} />
      <span className="hidden xl:inline text-[13px] font-medium text-white/80">{selectedCode}</span>
      <span className="text-white/40 text-[11px] hidden xl:inline">· {currency}</span>
    </div>
  );
}
