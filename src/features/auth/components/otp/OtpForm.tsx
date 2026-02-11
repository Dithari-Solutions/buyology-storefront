"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { COLORS } from "@/shared/styles/variables";

export default function OtpForm() {
    const OTP_LENGTH = 6;
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

    const handleChange = (value: string, index: number) => {
        if (!/^\d*$/.test(value)) return; // allow only digits
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        // Move to next input
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

    return (
        <div className="flex flex-col items-center justify-center bg-white rounded-[20px] py-[50px] px-[20px] w-full min-w-[100%]">
            <h2 className="font-bold text-[30px] mb-[10px]">Verification</h2>

            <p className="mb-[10px]">We sent a verification code to your email.</p>

            {/* OTP Inputs */}
            <div className="flex justify-between gap-3 mb-[30px]">
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
                        className={`
              w-[50px] h-[50px] text-center text-[20px] rounded-md bg-[#EDEDED]
              border border-[#EDEDED]
              focus:outline-none
              focus:border-[#FBBB14]
              focus:shadow-[0_0_0_4px_rgba(251,187,20,0.35)]
              focus:animate-breathe
              transition
            `}
                    />
                ))}
            </div>

            <p className="mb-[20px] text-[#A0A0A0] text-[15px]">
                Don't receive the code?{" "}
                <Link href={"/auth/forgot-password/otp"}>
                    <span className={`text-[${COLORS.secondary}] underline cursor-pointer`}>
                        Resend
                    </span>
                </Link>
            </p>
            
            <button
                className={`w-full py-[10px] rounded-[20px] text-white cursor-pointer bg-[${COLORS.secondary}]`}
            >
                Verify
            </button>
        </div>
    );
}
