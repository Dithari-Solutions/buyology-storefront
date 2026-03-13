"use client";

interface StatusPopupProps {
    type: "success" | "error";
    title: string;
    message: string;
    subMessage?: string;
    buttonText: string;
    onButtonClick: () => void;
    cancelText?: string;
    onCancel?: () => void;
}

export default function StatusPopup({
    type,
    title,
    message,
    subMessage,
    buttonText,
    onButtonClick,
    cancelText,
    onCancel,
}: StatusPopupProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="flex flex-col items-center bg-white rounded-[30px] py-10 px-8 w-full max-w-sm shadow-2xl">

                {/* Icon */}
                <div
                    className={`w-14 h-14 rounded-[16px] flex items-center justify-center mb-5 ${
                        type === "success" ? "bg-[#402F75]" : "bg-red-500"
                    }`}
                >
                    {type === "success" ? (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M20 6L9 17L4 12"
                                stroke="white"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    ) : (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M18 6L6 18M6 6L18 18"
                                stroke="white"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    )}
                </div>

                <h2 className="font-bold text-[22px] text-gray-900 mb-2 text-center">{title}</h2>
                <p className="text-gray-500 text-[13px] text-center mb-1 max-w-[260px]">{message}</p>
                {subMessage && (
                    <p className="text-gray-400 text-[12px] text-center mb-6 max-w-[260px]">{subMessage}</p>
                )}
                <div className={subMessage ? "" : "mb-5"} />

                <div className="w-full flex flex-col gap-2">
                    <button
                        type="button"
                        onClick={onButtonClick}
                        className="w-full py-[12px] rounded-[14px] bg-[#FBBB14] text-white font-bold text-[15px] cursor-pointer hover:bg-[#f0b000] active:scale-[0.98] transition-all duration-150 shadow-md shadow-yellow-200"
                    >
                        {buttonText}
                    </button>
                    {cancelText && onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="w-full py-[12px] rounded-[14px] bg-gray-100 text-gray-600 font-semibold text-[15px] cursor-pointer hover:bg-gray-200 active:scale-[0.98] transition-all duration-150"
                        >
                            {cancelText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
