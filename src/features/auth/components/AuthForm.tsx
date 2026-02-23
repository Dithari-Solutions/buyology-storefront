"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import LockIcon from "@/assets/icons/lock.png";
import EmailIcon from "@/assets/icons/email.png";
import EyeIcon from "@/assets/icons/eye-visible.png";
import ClosedEye from "@/assets/icons/eye-close.png";
import AuthToggler from "@/features/auth/components/AuthToggler";
import SocialButtons from "@/features/auth/components/SocialButtons";

export default function AuthForm() {
    const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
    const [passwordIsVisible, setPasswordIsVisible] = useState(false);
    const [repeatedPasswordIsVisible, setRepeatedPasswordIsVisible] = useState(false);
    const { t } = useTranslation("auth");
    const lang = usePathname().split("/")[1] || "en";

    return (
        <div className="flex flex-col items-center bg-white rounded-[30px] py-8 px-6 sm:px-8 w-full shadow-xl">

            {/* Heading */}
            <h2 className="text-gray-900 font-bold text-[24px] sm:text-[26px] mb-1 text-center">
                {mode === "signIn" ? t("authForm.welcomeBack") : t("authForm.createYourAccount")}
            </h2>
            <p className="mb-5 text-gray-400 text-[13px] text-center">
                {mode === "signIn" ? t("authForm.noAccount") : t("authForm.haveAccount")}{" "}
                <span
                    className="text-[#FBBB14] font-semibold cursor-pointer hover:underline"
                    onClick={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
                >
                    {mode === "signIn" ? t("authForm.signUp") : t("authForm.signIn")}
                </span>
            </p>

            {/* Auth Toggler */}
            <div className="mb-6 w-full flex items-center justify-center">
                <AuthToggler mode={mode} setMode={setMode} />
            </div>

            {/* Form */}
            <form className="w-full flex flex-col gap-[14px]">

                {/* Email */}
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
                            className="border-none outline-none w-full text-[14px] bg-transparent text-gray-800 placeholder:text-gray-400"
                        />
                    </div>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-[6px]">
                    <div className="flex items-center justify-between">
                        <label htmlFor="password" className="text-[13px] font-semibold text-gray-700">
                            {t("authForm.passwordLabel")}
                        </label>
                        {mode === "signIn" && (
                            <Link href={`/${lang}/auth/forgot-password`} className="text-[12px] text-[#402F75] font-medium hover:underline">
                                {t("authForm.forgotPassword")}
                            </Link>
                        )}
                    </div>
                    <div className="flex items-center gap-[10px] px-[12px] py-[11px] rounded-[12px] bg-gray-50 border border-gray-200 transition-all duration-200 focus-within:border-[#FBBB14] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(251,187,20,0.15)]">
                        <Image src={LockIcon} alt="password" width={17} height={17} className="flex-shrink-0 opacity-40" />
                        <input
                            id="password"
                            type={passwordIsVisible ? "text" : "password"}
                            placeholder={t("authForm.passwordPlaceholder")}
                            className="border-none outline-none w-full text-[14px] bg-transparent text-gray-800 placeholder:text-gray-400"
                        />
                        <button
                            type="button"
                            onClick={() => setPasswordIsVisible(!passwordIsVisible)}
                            className="flex-shrink-0 opacity-40 hover:opacity-70 transition-opacity"
                        >
                            <Image src={passwordIsVisible ? EyeIcon : ClosedEye} alt="toggle password" width={17} height={17} />
                        </button>
                    </div>
                </div>

                {/* Confirm Password — Sign Up only */}
                {mode === "signUp" && (
                    <div className="flex flex-col gap-[6px]">
                        <label htmlFor="confirm-password" className="text-[13px] font-semibold text-gray-700">
                            {t("authForm.confirmPasswordLabel")}
                        </label>
                        <div className="flex items-center gap-[10px] px-[12px] py-[11px] rounded-[12px] bg-gray-50 border border-gray-200 transition-all duration-200 focus-within:border-[#FBBB14] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(251,187,20,0.15)]">
                            <Image src={LockIcon} alt="password" width={17} height={17} className="flex-shrink-0 opacity-40" />
                            <input
                                id="confirm-password"
                                type={repeatedPasswordIsVisible ? "text" : "password"}
                                placeholder={t("authForm.confirmPasswordPlaceholder")}
                                className="border-none outline-none w-full text-[14px] bg-transparent text-gray-800 placeholder:text-gray-400"
                            />
                            <button
                                type="button"
                                onClick={() => setRepeatedPasswordIsVisible(!repeatedPasswordIsVisible)}
                                className="flex-shrink-0 opacity-40 hover:opacity-70 transition-opacity"
                            >
                                <Image src={repeatedPasswordIsVisible ? EyeIcon : ClosedEye} alt="toggle confirm password" width={17} height={17} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    className="mt-2 w-full py-[12px] rounded-[14px] bg-[#FBBB14] text-white font-bold text-[15px] cursor-pointer hover:bg-[#f0b000] active:scale-[0.98] transition-all duration-150 shadow-md shadow-yellow-200"
                >
                    {mode === "signIn" ? t("authForm.signIn") : t("authForm.createAccountBtn")}
                </button>
            </form>

            {/* Divider */}
            <div className="flex items-center w-full my-5 gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-[12px] font-medium text-gray-400 whitespace-nowrap">
                    {mode === "signIn" ? t("authForm.orSignInWith") : t("authForm.orSignUpWith")}
                </span>
                <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Social Buttons */}
            <SocialButtons />
        </div>
    );
}
