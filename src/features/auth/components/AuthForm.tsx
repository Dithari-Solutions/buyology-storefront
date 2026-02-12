"use client";

import Image from "next/image";
import { useState } from "react";
import LockIcon from "@/assets/icons/lock.png";
import EmailIcon from "@/assets/icons/email.png";
import { COLORS } from "@/shared/styles/variables";
import EyeIcon from "@/assets/icons/eye-visible.png";
import ClosedEye from "@/assets/icons/eye-close.png";
import AuthToggler from "@/features/auth/components/AuthToggler";
import SocialButtons from "@/features/auth/components/SocialButtons";

export default function AuthForm() {
    const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
    const [passwordIsVisible, setPasswordIsVisible] = useState(false);
    const [repeatedPasswordIsVisible, setRepeatedPasswordIsVisible] = useState(false);

    return (
        <div className="flex flex-col items-center justify-center bg-white rounded-[40px] py-10 px-5 sm:px-[20px] md:px-[30px] lg:px-[40px] w-full min-w-[100%]">

            {/* Dynamic Heading */}
            <h2 className="text-black-500 font-bold text-[26px] sm:text-[28px] md:text-[30px] lg:text-[32px] mb-2 sm:mb-3 text-center">
                {mode === "signIn" ? "Welcome back!" : "Welcome! Create an account"}
            </h2>

            <p className="mb-2 sm:mb-3 text-[#A0A0A0] text-[14px] sm:text-[15px] text-center">
                {mode === "signIn"
                    ? "Don't have an account?"
                    : "Already have an account?"}{" "}
                <span
                    className={`text-[${COLORS.secondary}] underline cursor-pointer`}
                    onClick={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
                >
                    {mode === "signIn" ? "Sign up" : "Sign in"}
                </span>
            </p>

            {/* Auth Toggler */}
            <div className="mb-5 sm:mb-6 w-full flex items-center justify-center">
                <AuthToggler mode={mode} setMode={setMode} />
            </div>

            {/* Form */}
            <form className="w-full">

                {/* Email */}
                <div className="mb-3 sm:mb-4">
                    <label htmlFor="email" className="text-[14px] sm:text-[15px]">Email address</label>
                    <div className={`
            group flex items-center p-[8px] sm:p-[12px] rounded-[10px] mt-2
            border border-[#F1F1F1]
            transition-all duration-300
            focus-within:border-[${COLORS.secondary}]
            focus-within:shadow-[0_0_0_3px_rgba(251,187,20,0.25)]
            focus-within:animate-breathe
          `}>
                        <Image src={EmailIcon} alt="email" width={20} className="mr-3" />
                        <input type="email" placeholder="Email address" className="border-none outline-none w-full text-[14px] sm:text-[15px]" />
                    </div>
                </div>

                {/* Password */}
                <div className="mb-3 sm:mb-4">
                    <label htmlFor="password" className="text-[14px] sm:text-[15px]">Password</label>
                    <div className={`
            group flex items-center p-[8px] sm:p-[12px] rounded-[10px] mt-2
            border border-[#F1F1F1]
            transition-all duration-300
            focus-within:border-[${COLORS.secondary}]
            focus-within:shadow-[0_0_0_3px_rgba(251,187,20,0.25)]
            focus-within:animate-breathe
          `}>
                        <Image src={LockIcon} alt="password" width={20} className="mr-3" />
                        <input
                            type={passwordIsVisible ? "text" : "password"}
                            placeholder="Password"
                            className="border-none outline-none w-full text-[14px] sm:text-[15px]"
                        />
                        <Image
                            onClick={() => setPasswordIsVisible(!passwordIsVisible)}
                            src={passwordIsVisible ? EyeIcon : ClosedEye}
                            alt="toggle password"
                            width={20}
                            className="mr-3 cursor-pointer"
                        />
                    </div>
                </div>

                {/* Confirm Password ONLY in Sign Up */}
                {mode === "signUp" && (
                    <div className="mb-3 sm:mb-4">
                        <label htmlFor="confirm-password" className="text-[14px] sm:text-[15px]">Confirm password</label>
                        <div className={`
              group flex items-center p-[8px] sm:p-[12px] rounded-[10px] mt-2
              border border-[#F1F1F1]
              transition-all duration-300
              focus-within:border-[${COLORS.secondary}]
              focus-within:shadow-[0_0_0_3px_rgba(251,187,20,0.25)]
              focus-within:animate-breathe
            `}>
                            <Image src={LockIcon} alt="repeat-password" width={20} className="mr-3" />
                            <input
                                type={repeatedPasswordIsVisible ? "text" : "password"}
                                placeholder="Confirm Password"
                                className="border-none outline-none w-full text-[14px] sm:text-[15px]"
                            />
                            <Image
                                onClick={() => setRepeatedPasswordIsVisible(!repeatedPasswordIsVisible)}
                                src={repeatedPasswordIsVisible ? EyeIcon : ClosedEye}
                                alt="toggle confirm password"
                                width={20}
                                className="mr-3 cursor-pointer"
                            />
                        </div>
                    </div>
                )}
                {/* Submit Button */}
                <button className={`mt-[15px] sm:mt-[15px] mb-[20px] w-full py-[10px] rounded-[20px] text-white cursor-pointer bg-[${COLORS.secondary}] text-[15px] sm:text-[16px]`}>
                    {mode === "signIn" ? "Sign in" : "Sign up"}
                </button>
            </form>

            <div className={`flex items-center w-full my-[15px]`}>
                {/* Left Line */}
                <div
                    className="flex-1 h-[1px]"
                    style={{ backgroundColor: "black" }}
                ></div>

                {/* Text */}
                <span
                    className="px-4 text-[14px] sm:text-[15px] font-medium text-black"
                >
                    {mode === "signIn" ? "Or sign in with" : "Or sign up with"}
                </span>

                {/* Right Line */}
                <div
                    className="flex-1 h-[1px]"
                    style={{ backgroundColor: "black" }}
                ></div>
            </div>

            {/* Social Buttons */}
            <SocialButtons />
        </div>
    );
}
