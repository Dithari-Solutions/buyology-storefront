import type { SpecIconKey, ProductSpec } from "../types";

const SPEC_ICONS: Record<SpecIconKey, React.ReactNode> = {
    processor: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="6" height="6" />
            <rect x="2" y="2" width="20" height="20" rx="3" />
            <path d="M9 2v7M15 2v7M9 15v7M15 15v7M2 9h7M2 15h7M15 9h7M15 15h7" />
        </svg>
    ),
    display: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
    ),
    ram: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="8" width="20" height="8" rx="1" />
            <path d="M6 8V6M10 8V6M14 8V6M18 8V6M6 16v2M10 16v2M14 16v2M18 16v2" />
        </svg>
    ),
    battery: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="6" width="18" height="12" rx="2" />
            <path d="M23 13v-2" strokeWidth="2.5" />
            <path d="M5 10v4M8 10v4M11 10v4" />
        </svg>
    ),
    gpu: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    ),
    connectivity: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.55a11 11 0 0 1 14.08 0" />
            <path d="M1.42 9a16 16 0 0 1 21.16 0" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <circle cx="12" cy="20" r="1" fill="#402F75" />
        </svg>
    ),
};

interface ProductSpecsProps {
    specs: ProductSpec[];
    keyFeatures: string[];
}

export default function ProductSpecs({ specs, keyFeatures }: ProductSpecsProps) {
    const mid = Math.ceil(keyFeatures.length / 2);
    const leftFeatures = keyFeatures.slice(0, mid);
    const rightFeatures = keyFeatures.slice(mid);

    return (
        <div className="flex flex-col gap-8">
            {/* Technical Specifications */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-5">Technical Specifications</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {specs.map((spec) => (
                        <div
                            key={spec.iconKey}
                            className="group flex items-center gap-4 bg-white rounded-2xl border border-gray-100 px-5 py-4 transition-all hover:border-[#402F75]/25 hover:shadow-sm"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#EDE9FF] to-[#F6F4FF] ring-1 ring-[#402F75]/5 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105">
                                {SPEC_ICONS[spec.iconKey]}
                            </div>
                            <div className="flex flex-col gap-0.5 min-w-0">
                                <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">{spec.label}</span>
                                <span className="text-[15px] font-bold text-gray-900 truncate">{spec.value}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Key Features */}
            <div className="border-t border-gray-100 pt-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Key Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
                    <ul className="flex flex-col gap-2.5">
                        {leftFeatures.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                                <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[#FBBB14]/15">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#C8920A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </span>
                                {feature}
                            </li>
                        ))}
                    </ul>
                    <ul className="flex flex-col gap-2.5">
                        {rightFeatures.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                                <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[#FBBB14]/15">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#C8920A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </span>
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
