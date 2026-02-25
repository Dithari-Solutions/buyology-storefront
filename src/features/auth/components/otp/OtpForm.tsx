"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { verifyOtp, signup } from "@/features/auth/services/auth.api";
import type { SignUpRequest } from "@/features/auth/types";

export default function OtpForm() {
    const OTP_LENGTH = 6;
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendMessage, setResendMessage] = useState<string | null>(null);
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
    const { t } = useTranslation("auth");
    const lang = usePathname().split("/")[1] || "en";
    const router = useRouter();

    const [email, setEmail] = useState("");

    useEffect(() => {
        const raw = sessionStorage.getItem("signup_payload");
        if (!raw) {
            router.replace(`/${lang}/auth`);
            return;
        }
        const parsed: SignUpRequest = JSON.parse(raw);
        setEmail(parsed.email);
    }, [lang, router]);

    const handleChange = (value: string, index: number) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < OTP_LENGTH - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === "Backspace") {
            if (!otp[index] && index > 0) {
                inputsRef.current[index - 1]?.focus();
            }
            const newOtp = [...otp];
            newOtp[index] = "";
            setOtp(newOtp);
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
        const newOtp = [...otp];
        pasted.split("").forEach((char, i) => { newOtp[i] = char; });
        setOtp(newOtp);
        inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    };

    const handleVerify = async () => {
        const otpCode = otp.join("");
        if (otpCode.length < OTP_LENGTH) {
            setError("Please enter the full 6-digit code.");
            return;
        }

        setError(null);
        setIsLoading(true);
        const res = await verifyOtp({ email, otpCode });
        setIsLoading(false);

        if (!res.success) {
            setError(res.message);
            // Clear inputs on expired / max attempts so user can request a new code
            if (res.message.toLowerCase().includes("expired") || res.message.toLowerCase().includes("sign up again")) {
                setOtp(Array(OTP_LENGTH).fill(""));
                inputsRef.current[0]?.focus();
            }
            return;
        }

        localStorage.setItem("accessToken", res.data!.accessToken);
        localStorage.setItem("refreshToken", res.data!.refreshToken);
        sessionStorage.removeItem("signup_payload");
        router.push(`/${lang}`);
    };

    const handleResend = async () => {
        const raw = sessionStorage.getItem("signup_payload");
        if (!raw) {
            router.replace(`/${lang}/auth`);
            return;
        }

        setResendMessage(null);
        setError(null);
        setIsResending(true);
        const payload: SignUpRequest = JSON.parse(raw);
        const res = await signup(payload);
        setIsResending(false);

        if (!res.success) {
            setError(res.message);
            return;
        }

        setOtp(Array(OTP_LENGTH).fill(""));
        inputsRef.current[0]?.focus();
        setResendMessage(res.message);
    };

    return (
        <div className="flex flex-col items-center bg-white rounded-[30px] py-8 px-6 sm:px-8 w-full shadow-xl">

            {/* Icon */}
            <div className="w-14 h-14 rounded-full bg-[#F6F4FF] flex items-center justify-center mb-4">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4Z" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M22 6L12 13L2 6" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>

            <h2 className="font-bold text-[22px] text-gray-900 mb-1">{t("otp.title")}</h2>
            <p className="text-gray-400 text-[13px] text-center mb-1 max-w-[260px]">
                {t("otp.desc")}
            </p>
            {email && (
                <p className="text-[#402F75] text-[13px] font-semibold mb-6">{email}</p>
            )}

            {/* OTP Inputs */}
            <div className="flex justify-center gap-[8px] sm:gap-[10px] mb-6" onPaste={handlePaste}>
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
                        className="w-[42px] h-[48px] sm:w-[46px] sm:h-[52px] text-center text-[20px] font-bold rounded-[12px] bg-gray-50 border-2 border-gray-200 text-gray-900 transition-all duration-150 focus:outline-none focus:border-[#FBBB14] focus:bg-white focus:shadow-[0_0_0_3px_rgba(251,187,20,0.15)]"
                    />
                ))}
            </div>

            {/* Error */}
            {error && (
                <p className="mb-4 text-red-500 text-[13px] text-center">{error}</p>
            )}

            {/* Resend success */}
            {resendMessage && !error && (
                <p className="mb-4 text-green-600 text-[13px] text-center">{resendMessage}</p>
            )}

            {/* Resend */}
            <p className="mb-5 text-gray-400 text-[13px] text-center">
                {t("otp.didntReceive")}{" "}
                <button
                    type="button"
                    disabled={isResending}
                    onClick={handleResend}
                    className="text-[#402F75] font-semibold cursor-pointer hover:underline disabled:opacity-50"
                >
                    {isResending ? "..." : t("otp.resend")}
                </button>
            </p>

            {/* Verify Button */}
            <button
                type="button"
                disabled={isLoading}
                onClick={handleVerify}
                className="w-full py-[12px] rounded-[14px] bg-[#FBBB14] text-white font-bold text-[15px] cursor-pointer hover:bg-[#f0b000] active:scale-[0.98] transition-all duration-150 shadow-md shadow-yellow-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {isLoading ? "..." : t("otp.verify")}
            </button>

            {/* Back */}
            <Link href={`/${lang}/auth`} className="mt-4 text-[13px] text-gray-400 hover:text-gray-600 transition-colors">
                {t("backToSignIn")}
            </Link>
        </div>
    );
}
