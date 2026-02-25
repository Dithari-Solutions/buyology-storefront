"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import LockIcon from "@/assets/icons/lock.png";
import EmailIcon from "@/assets/icons/email.png";
import EyeIcon from "@/assets/icons/eye-visible.png";
import ClosedEye from "@/assets/icons/eye-close.png";
import AuthToggler from "@/features/auth/components/AuthToggler";
import SocialButtons from "@/features/auth/components/SocialButtons";
import { signup, signin } from "@/features/auth/services/auth.api";

export default function AuthForm() {
    const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
    // Ref keeps the latest mode available inside the async handler,
    // preventing stale closure issues when setIsLoading triggers a re-render.
    const modeRef = useRef(mode);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeatedPassword, setRepeatedPassword] = useState("");
    const [passwordIsVisible, setPasswordIsVisible] = useState(false);
    const [repeatedPasswordIsVisible, setRepeatedPasswordIsVisible] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useTranslation("auth");
    const lang = usePathname().split("/")[1] || "en";
    const router = useRouter();

    const handleSetMode = (m: "signIn" | "signUp") => {
        modeRef.current = m;
        setMode(m);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        // Read from ref so the async function always sees the latest mode
        if (modeRef.current === "signUp") {
            setIsLoading(true);
            const res = await signup({ email, password, repeatedPassword });
            setIsLoading(false);

            if (!res.success) {
                setError(res.message);
                return;
            }

            // Store signup payload so OtpForm can resend if needed
            sessionStorage.setItem("signup_payload", JSON.stringify({ email, password, repeatedPassword }));
            router.push(`/${lang}/auth/otp`);
            return;
        }

        // Sign in
        setIsLoading(true);
        const res = await signin({ email, password });
        setIsLoading(false);

        if (!res.success) {
            setError(res.message);
            return;
        }

        localStorage.setItem("accessToken", res.data!.accessToken);
        localStorage.setItem("refreshToken", res.data!.refreshToken);
        router.push(`/${lang}`);
    };

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
                    onClick={() => { handleSetMode(mode === "signIn" ? "signUp" : "signIn"); setError(null); }}
                >
                    {mode === "signIn" ? t("authForm.signUp") : t("authForm.signIn")}
                </span>
            </p>

            {/* Auth Toggler */}
            <div className="mb-6 w-full flex items-center justify-center">
                <AuthToggler mode={mode} setMode={handleSetMode} />
            </div>

            {/* Form */}
            <form className="w-full flex flex-col gap-[14px]" onSubmit={handleSubmit}>

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
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t("authForm.emailPlaceholder")}
                            className="border-none outline-none w-full text-[14px] bg-transparent text-gray-800 placeholder:text-gray-400"
                            required
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
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t("authForm.passwordPlaceholder")}
                            className="border-none outline-none w-full text-[14px] bg-transparent text-gray-800 placeholder:text-gray-400"
                            required
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
                                value={repeatedPassword}
                                onChange={(e) => setRepeatedPassword(e.target.value)}
                                placeholder={t("authForm.confirmPasswordPlaceholder")}
                                className="border-none outline-none w-full text-[14px] bg-transparent text-gray-800 placeholder:text-gray-400"
                                required
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

                {/* Error message */}
                {error && (
                    <p className="text-red-500 text-[13px] text-center -mt-1">{error}</p>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-2 w-full py-[12px] rounded-[14px] bg-[#FBBB14] text-white font-bold text-[15px] cursor-pointer hover:bg-[#f0b000] active:scale-[0.98] transition-all duration-150 shadow-md shadow-yellow-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {isLoading
                        ? "..."
                        : mode === "signIn" ? t("authForm.signIn") : t("authForm.createAccountBtn")}
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
