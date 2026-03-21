"use client";

import { useTranslation } from "react-i18next";

interface PaymentIframeProps {
    iframeUrl: string;
    onClose: () => void;
}

export default function PaymentIframe({ iframeUrl, onClose }: PaymentIframeProps) {
    const { t } = useTranslation("checkout");

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-sm">
            {/* Header bar */}
            <div className="flex items-center justify-between bg-white px-4 py-3 shadow-sm flex-shrink-0">
                <div className="flex items-center gap-2">
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#402F75"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    <span className="text-[13px] font-bold text-gray-800">
                        {t("payment.iframe.title", { defaultValue: "Secure Payment" })}
                    </span>
                    <span className="text-[11px] text-gray-400 ml-1">
                        {t("payment.iframe.poweredBy", { defaultValue: "powered by Paymob" })}
                    </span>
                </div>
                <button
                    onClick={onClose}
                    className="flex items-center gap-1.5 text-[13px] font-bold text-[#402F75] hover:text-[#2e2156] transition-colors cursor-pointer"
                >
                    {t("payment.iframe.done", { defaultValue: "Done" })}
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </button>
            </div>

            {/* Iframe */}
            <div className="flex-1 overflow-hidden">
                <iframe
                    src={iframeUrl}
                    className="w-full h-full border-0"
                    title="Paymob Payment"
                    allow="payment"
                />
            </div>

            {/* Footer note */}
            <div className="bg-white px-4 py-2 flex items-center justify-center gap-1.5 text-[11px] text-gray-400 flex-shrink-0">
                <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                {t("payment.iframe.secureNote", {
                    defaultValue: "Your card details are encrypted and never stored on our servers.",
                })}
            </div>
        </div>
    );
}
