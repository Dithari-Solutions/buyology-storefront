"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { forgotPassword, resetPassword } from "@/features/auth/services/auth.api";
import StatusPopup from "@/features/auth/components/StatusPopup";

type PopupState = {
    type: "success" | "error";
    title: string;
    message: string;
    subMessage?: string;
    buttonText: string;
    onButtonClick: () => void;
} | null;

export default function ResetPasswordForm() {
    const OTP_LENGTH = 6;
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const [newPassword, setNewPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [popup, setPopup] = useState<PopupState>(null);
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
    const { t } = useTranslation("auth");
    const lang = usePathname().split("/")[1] || "en";
    const router = useRouter();

    const [email, setEmail] = useState("");

    useEffect(() => {
        const stored = sessionStorage.getItem("reset_password_email");
        if (!stored) {
            // No reset session — send the user back to request a code (NOT sign-in).
            router.replace(`/${lang}/auth/forgot-password`);
            return;
        }
        setEmail(stored);
    }, [lang, router]);

    const handleChange = (value: string, index: number) => {
        if (!/^\d*$/.test(value)) return;
        const next = [...otp];
        next[index] = value.slice(-1);
        setOtp(next);
        if (value && index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
        const next = [...otp];
        pasted.split("").forEach((c, i) => { next[i] = c; });
        setOtp(next);
        inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    };

    const handleReset = async () => {
        setError(null);
        const otpCode = otp.join("");
        if (otpCode.length < OTP_LENGTH) {
            setError(t("resetPassword.otpIncomplete", { defaultValue: "Enter the full 6-digit code." }));
            return;
        }
        if (newPassword.length < 8) {
            setError(t("resetPassword.passwordTooShort", { defaultValue: "Password must be at least 8 characters." }));
            return;
        }
        if (newPassword !== repeatPassword) {
            setError(t("resetPassword.passwordMismatch", { defaultValue: "Passwords do not match." }));
            return;
        }

        setIsLoading(true);
        const res = await resetPassword({ email, otpCode, newPassword, repeatPassword });
        setIsLoading(false);

        if (!res.success) {
            setError(res.message || t("resetPassword.failed", { defaultValue: "Could not reset password." }));
            return;
        }

        sessionStorage.removeItem("reset_password_email");
        setPopup({
            type: "success",
            title: t("resetPassword.successTitle", { defaultValue: "Password updated" }),
            message: t("resetPassword.successMsg", { defaultValue: "You can now sign in with your new password." }),
            buttonText: t("authForm.signIn", { defaultValue: "Sign in" }),
            onButtonClick: () => router.push(`/${lang}/auth`),
        });
    };

    const handleResend = async () => {
        if (!email) return;
        setIsResending(true);
        const res = await forgotPassword(email);
        setIsResending(false);
        setOtp(Array(OTP_LENGTH).fill(""));
        inputsRef.current[0]?.focus();
        setPopup({
            type: res.success ? "success" : "error",
            title: res.success ? t("otp.resentTitle", { defaultValue: "Code resent" }) : t("otp.errorTitle", { defaultValue: "Error" }),
            message: res.message || t("otp.resentMsg", { defaultValue: "A new code has been sent." }),
            buttonText: t("otp.verify", { defaultValue: "OK" }),
            onButtonClick: () => setPopup(null),
        });
    };

    return (
        <>
            {popup && <StatusPopup {...popup} />}

            <div className="flex flex-col items-center bg-white rounded-[30px] py-8 px-6 sm:px-8 w-full shadow-xl">
                <div className="w-14 h-14 rounded-full bg-[#F6F4FF] flex items-center justify-center mb-4">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="11" width="18" height="11" rx="2" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M7 11V7C7 4.24 9.24 2 12 2C14.76 2 17 4.24 17 7V11" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="16" r="1.5" fill="#402F75" />
                    </svg>
                </div>

                <h2 className="font-bold text-[22px] text-gray-900 mb-1">
                    {t("resetPassword.title", { defaultValue: "Reset password" })}
                </h2>
                <p className="text-gray-400 text-[13px] text-center mb-1 max-w-[260px]">
                    {t("resetPassword.desc", { defaultValue: "Enter the code we emailed you and choose a new password." })}
                </p>
                {email && <p className="text-[#402F75] text-[13px] font-semibold mb-5">{email}</p>}

                <div className="flex justify-center gap-[8px] sm:gap-[10px] mb-5" onPaste={handlePaste}>
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            ref={(el) => { inputsRef.current[index] = el; }}
                            onChange={(e) => handleChange(e.target.value, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className="w-[42px] h-[48px] sm:w-[46px] sm:h-[52px] text-center text-[20px] font-bold rounded-[12px] bg-gray-50 border-2 border-gray-200 text-gray-900 transition-all duration-150 focus:outline-none focus:bg-white focus:border-[#FBBB14] focus:shadow-[0_0_0_3px_rgba(251,187,20,0.15)]"
                        />
                    ))}
                </div>

                <div className="w-full flex flex-col gap-3 mb-4">
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={t("resetPassword.newPasswordPlaceholder", { defaultValue: "New password" })}
                        className="w-full px-[14px] py-[11px] rounded-[12px] bg-gray-50 border border-gray-200 text-[14px] text-gray-800 outline-none focus:border-[#FBBB14] focus:bg-white focus:shadow-[0_0_0_3px_rgba(251,187,20,0.15)]"
                    />
                    <input
                        type="password"
                        value={repeatPassword}
                        onChange={(e) => setRepeatPassword(e.target.value)}
                        placeholder={t("resetPassword.repeatPasswordPlaceholder", { defaultValue: "Repeat new password" })}
                        className="w-full px-[14px] py-[11px] rounded-[12px] bg-gray-50 border border-gray-200 text-[14px] text-gray-800 outline-none focus:border-[#FBBB14] focus:bg-white focus:shadow-[0_0_0_3px_rgba(251,187,20,0.15)]"
                    />
                </div>

                {error && <p className="mb-3 text-red-500 text-[12px] text-center max-w-[280px]">{error}</p>}

                <p className="mb-4 text-gray-400 text-[13px] text-center">
                    {t("otp.didntReceive", { defaultValue: "Didn't receive a code?" })}{" "}
                    <button
                        type="button"
                        disabled={isResending}
                        onClick={handleResend}
                        className="text-[#402F75] font-semibold cursor-pointer hover:underline disabled:opacity-50"
                    >
                        {isResending ? "..." : t("otp.resend", { defaultValue: "Resend" })}
                    </button>
                </p>

                <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleReset}
                    className="w-full py-[12px] rounded-[14px] bg-[#FBBB14] text-white font-bold text-[15px] cursor-pointer hover:bg-[#f0b000] active:scale-[0.98] transition-all duration-150 shadow-md shadow-yellow-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {isLoading ? "..." : t("resetPassword.submitBtn", { defaultValue: "Reset password" })}
                </button>

                <Link href={`/${lang}/auth`} className="mt-4 text-[13px] text-gray-400 hover:text-gray-600 transition-colors">
                    {t("backToSignIn", { defaultValue: "Back to sign in" })}
                </Link>
            </div>
        </>
    );
}
