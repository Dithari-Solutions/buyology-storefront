"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef } from "react";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import LockIcon from "@/assets/icons/lock.png";
import EmailIcon from "@/assets/icons/email.png";
import EyeIcon from "@/assets/icons/eye-visible.png";
import ClosedEye from "@/assets/icons/eye-close.png";
import AuthToggler from "@/features/auth/components/AuthToggler";
import SocialButtons from "@/features/auth/components/SocialButtons";
import { signup, signin } from "@/features/auth/services/auth.api";
import { setTokens } from "@/shared/lib/tokenManager";
import {
    validateEmail,
    validateSignInPassword,
    validateSignUpPassword,
    validateConfirmPassword,
    isSuspicious,
} from "@/features/auth/validation";

type FieldErrors = {
    email?: string;
    password?: string;
    repeatedPassword?: string;
};

const SHAKE = { x: [0, -9, 9, -6, 6, -3, 3, 0], transition: { duration: 0.45 } };

export default function AuthForm() {
    const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
    const modeRef = useRef(mode);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeatedPassword, setRepeatedPassword] = useState("");
    const [passwordIsVisible, setPasswordIsVisible] = useState(false);
    const [repeatedPasswordIsVisible, setRepeatedPasswordIsVisible] = useState(false);

    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [apiError, setApiError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const emailAnim = useAnimation();
    const passwordAnim = useAnimation();
    const repeatAnim = useAnimation();

    const { t } = useTranslation("auth");
    const lang = usePathname().split("/")[1] || "en";
    const router = useRouter();

    const handleSetMode = (m: "signIn" | "signUp") => {
        modeRef.current = m;
        setMode(m);
        setFieldErrors({});
        setApiError(null);
    };

    const clearError = (field: keyof FieldErrors) => {
        if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const validate = async (): Promise<boolean> => {
        const isSignUp = modeRef.current === "signUp";

        const emailErr = validateEmail(email);
        const passwordErr = isSignUp
            ? validateSignUpPassword(password)
            : validateSignInPassword(password);
        const repeatErr = isSignUp ? validateConfirmPassword(password, repeatedPassword) : null;

        const errors: FieldErrors = {};
        const toShake: ReturnType<typeof useAnimation>[] = [];

        if (emailErr) { errors.email = emailErr; toShake.push(emailAnim); }
        if (passwordErr) { errors.password = passwordErr; toShake.push(passwordAnim); }
        if (repeatErr) { errors.repeatedPassword = repeatErr; toShake.push(repeatAnim); }

        if (toShake.length) {
            setFieldErrors(errors);
            await Promise.all(toShake.map((ctrl) => ctrl.start(SHAKE)));
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setApiError(null);

        const valid = await validate();
        if (!valid) return;

        if (modeRef.current === "signUp") {
            setIsLoading(true);
            const res = await signup({ email, password, repeatedPassword });
            setIsLoading(false);
            if (!res.success) { setApiError(res.message); return; }
            sessionStorage.setItem("signup_payload", JSON.stringify({ email, password, repeatedPassword }));
            router.push(`/${lang}/auth/otp`);
            return;
        }

        setIsLoading(true);
        const res = await signin({ email, password });
        setIsLoading(false);
        if (!res.success) { setApiError(res.message); return; }
        setTokens(res.data!.accessToken, res.data!.expiresIn);
        router.push(`/${lang}`);
    };

    const inputWrapperClass = (hasError: boolean) =>
        `flex items-center gap-[10px] px-[12px] py-[11px] rounded-[12px] border transition-all duration-200 ${
            hasError
                ? "border-red-400 bg-red-50"
                : "bg-gray-50 border-gray-200 focus-within:border-[#FBBB14] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(251,187,20,0.15)]"
        }`;

    return (
        <div className="flex flex-col items-center bg-white rounded-[30px] py-8 px-6 sm:px-8 w-full shadow-xl">

            <h2 className="text-gray-900 font-bold text-[24px] sm:text-[26px] mb-1 text-center">
                {mode === "signIn" ? t("authForm.welcomeBack") : t("authForm.createYourAccount")}
            </h2>
            <p className="mb-5 text-gray-400 text-[13px] text-center">
                {mode === "signIn" ? t("authForm.noAccount") : t("authForm.haveAccount")}{" "}
                <span
                    className="text-[#FBBB14] font-semibold cursor-pointer hover:underline"
                    onClick={() => handleSetMode(mode === "signIn" ? "signUp" : "signIn")}
                >
                    {mode === "signIn" ? t("authForm.signUp") : t("authForm.signIn")}
                </span>
            </p>

            <div className="mb-6 w-full flex items-center justify-center">
                <AuthToggler mode={mode} setMode={handleSetMode} />
            </div>

            <form className="w-full flex flex-col gap-[14px]" onSubmit={handleSubmit}>

                {/* Email */}
                <div className="flex flex-col gap-[6px]">
                    <label htmlFor="email" className="text-[13px] font-semibold text-gray-700">
                        {t("authForm.emailLabel")}
                    </label>
                    <motion.div animate={emailAnim} className={inputWrapperClass(!!fieldErrors.email)}>
                        <Image src={EmailIcon} alt="email" width={17} height={17} className="flex-shrink-0 opacity-40" />
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
                            placeholder={t("authForm.emailPlaceholder")}
                            className="border-none outline-none w-full text-[14px] bg-transparent text-gray-800 placeholder:text-gray-400"
                        />
                    </motion.div>
                    {fieldErrors.email && (
                        <p className="text-red-500 text-[12px]">{t(`authForm.errors.${fieldErrors.email}`)}</p>
                    )}
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
                    <motion.div animate={passwordAnim} className={inputWrapperClass(!!fieldErrors.password)}>
                        <Image src={LockIcon} alt="password" width={17} height={17} className="flex-shrink-0 opacity-40" />
                        <input
                            id="password"
                            type={passwordIsVisible ? "text" : "password"}
                            value={password}
                            onChange={(e) => {
                                const v = e.target.value;
                                setPassword(v);
                                if (modeRef.current === "signUp" && isSuspicious(v)) {
                                    setFieldErrors((prev) => ({ ...prev, password: "suspicious" }));
                                } else {
                                    clearError("password");
                                }
                            }}
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
                    </motion.div>
                    {fieldErrors.password && (
                        <p className="text-red-500 text-[12px]">{t(`authForm.errors.${fieldErrors.password}`)}</p>
                    )}

                    {/* Live password requirements — Sign Up only */}
                    <AnimatePresence initial={false}>
                        {mode === "signUp" && (
                            <motion.ul
                                key="pw-requirements"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                style={{ overflow: "hidden" }}
                                className="flex flex-col gap-[5px] pt-[2px]"
                            >
                                {([
                                    { key: "minLength",  met: password.length >= 8,      label: t("authForm.requirements.minLength") },
                                    { key: "uppercase",  met: /[A-Z]/.test(password),    label: t("authForm.requirements.uppercase") },
                                    { key: "number",     met: /[0-9]/.test(password),    label: t("authForm.requirements.number") },
                                    { key: "safe",       met: password.length > 0 && !isSuspicious(password), label: t("authForm.requirements.safe") },
                                ] as { key: string; met: boolean; label: string }[]).map(({ key, met, label }) => (
                                    <li key={key} className={`flex items-center gap-[6px] text-[12px] transition-colors duration-200 ${met ? "text-green-500" : "text-gray-400"}`}>
                                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                            {met ? (
                                                <>
                                                    <circle cx="6.5" cy="6.5" r="6.5" fill="#22c55e" />
                                                    <path d="M3.5 6.5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </>
                                            ) : (
                                                <circle cx="6.5" cy="6.5" r="6" stroke="#d1d5db" strokeWidth="1" />
                                            )}
                                        </svg>
                                        {label}
                                    </li>
                                ))}
                            </motion.ul>
                        )}
                    </AnimatePresence>
                </div>

                {/* Confirm Password — Sign Up only */}
                <AnimatePresence initial={false}>
                    {mode === "signUp" && (
                        <motion.div
                            key="confirm-password"
                            initial={{ opacity: 0, height: 0, marginTop: -8 }}
                            animate={{ opacity: 1, height: "auto", marginTop: 0 }}
                            exit={{ opacity: 0, height: 0, marginTop: -8 }}
                            transition={{ duration: 0.28, ease: "easeInOut" }}
                            style={{ overflow: "hidden" }}
                            className="flex flex-col gap-[6px]"
                        >
                            <label htmlFor="confirm-password" className="text-[13px] font-semibold text-gray-700">
                                {t("authForm.confirmPasswordLabel")}
                            </label>
                            <motion.div animate={repeatAnim} className={inputWrapperClass(!!fieldErrors.repeatedPassword)}>
                                <Image src={LockIcon} alt="password" width={17} height={17} className="flex-shrink-0 opacity-40" />
                                <input
                                    id="confirm-password"
                                    type={repeatedPasswordIsVisible ? "text" : "password"}
                                    value={repeatedPassword}
                                    onChange={(e) => { setRepeatedPassword(e.target.value); clearError("repeatedPassword"); }}
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
                            </motion.div>
                            {fieldErrors.repeatedPassword && (
                                <p className="text-red-500 text-[12px]">{t(`authForm.errors.${fieldErrors.repeatedPassword}`)}</p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* API error (wrong credentials, server error, etc.) */}
                {apiError && (
                    <p className="text-red-500 text-[13px] text-center -mt-1">{apiError}</p>
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

            <div className="flex items-center w-full my-5 gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-[12px] font-medium text-gray-400 whitespace-nowrap">
                    {mode === "signIn" ? t("authForm.orSignInWith") : t("authForm.orSignUpWith")}
                </span>
                <div className="flex-1 h-px bg-gray-200" />
            </div>

            <SocialButtons />
        </div>
    );
}
