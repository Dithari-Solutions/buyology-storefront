"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import EmailIcon from "@/assets/icons/email.png";

export default function ForgotPasswordPage() {
    const [sent, setSent] = useState(false);
    const { t } = useTranslation("auth");

    return (
        <div className="w-full max-w-md">
            <div className="flex flex-col items-center bg-white rounded-[30px] py-8 px-6 sm:px-8 w-full shadow-xl">

                {/* Icon */}
                <div className="w-14 h-14 rounded-full bg-[#F6F4FF] flex items-center justify-center mb-4">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="11" width="18" height="11" rx="2" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M7 11V7C7 4.24 9.24 2 12 2C14.76 2 17 4.24 17 7V11" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="16" r="1.5" fill="#402F75" />
                    </svg>
                </div>

                {!sent ? (
                    <>
                        <h2 className="font-bold text-[22px] text-gray-900 mb-1">{t("forgotPassword.title")}</h2>
                        <p className="text-gray-400 text-[13px] text-center mb-6 max-w-[280px]">
                            {t("forgotPassword.desc")}
                        </p>

                        <form className="w-full flex flex-col gap-[14px]" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
                            <div className="flex flex-col gap-[6px]">
                                <label htmlFor="email" className="text-[13px] font-semibold text-gray-700">
                                    {t("authForm.emailLabel")}
                                </label>
                                <div className="flex items-center gap-[10px] px-[12px] py-[11px] rounded-[12px] bg-gray-50 border border-gray-200 transition-all duration-200 focus-within:border-[#FBBB14] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(251,187,20,0.15)]">
                                    <Image src={EmailIcon} alt="email" width={17} height={17} className="flex-shrink-0 opacity-40" />
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder={t("authForm.emailPlaceholder")}
                                        required
                                        className="border-none outline-none w-full text-[14px] bg-transparent text-gray-800 placeholder:text-gray-400"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="mt-1 w-full py-[12px] rounded-[14px] bg-[#FBBB14] text-white font-bold text-[15px] cursor-pointer hover:bg-[#f0b000] active:scale-[0.98] transition-all duration-150 shadow-md shadow-yellow-200"
                            >
                                {t("forgotPassword.sendBtn")}
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        <h2 className="font-bold text-[22px] text-gray-900 mb-1">{t("forgotPassword.emailSentTitle")}</h2>
                        <p className="text-gray-400 text-[13px] text-center mb-6 max-w-[260px]">
                            {t("forgotPassword.emailSentDesc")}
                        </p>
                        <Link href="otp" className="w-full">
                            <button
                                type="button"
                                className="w-full py-[12px] rounded-[14px] bg-[#FBBB14] text-white font-bold text-[15px] cursor-pointer hover:bg-[#f0b000] transition-all duration-150 shadow-md shadow-yellow-200"
                            >
                                {t("forgotPassword.enterCodeBtn")}
                            </button>
                        </Link>
                    </>
                )}

                <Link href="/auth" className="mt-4 text-[13px] text-gray-400 hover:text-gray-600 transition-colors">
                    {t("backToSignIn")}
                </Link>
            </div>
        </div>
    );
}
