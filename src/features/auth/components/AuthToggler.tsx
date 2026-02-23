"use client";

import { useTranslation } from "react-i18next";
import { COLORS } from "@/shared/styles/variables";

type Props = {
    mode: "signIn" | "signUp";
    setMode: (m: "signIn" | "signUp") => void;
};

export default function AuthToggler({ mode, setMode }: Props) {
    const { t } = useTranslation("auth");

    return (
        <div className="w-[300px] p-[2px] rounded-[30px] border border-gray-200 relative overflow-hidden">
            <div
                className="absolute top-[2px] h-[36px] w-1/2 rounded-[20px] transition-all duration-300"
                style={{
                    background: COLORS.secondary,
                    insetInlineStart: mode === "signIn" ? "3px" : "49%",
                }}
            />

            <div className="relative flex text-sm font-medium text-center">
                <button
                    onClick={() => setMode("signIn")}
                    className={`flex-1 py-2 z-10 cursor-pointer ${mode === "signIn" ? "text-white" : "text-gray-400"}`}
                >
                    {t("authForm.signIn")}
                </button>
                <button
                    onClick={() => setMode("signUp")}
                    className={`flex-1 py-2 z-10 cursor-pointer ${mode === "signUp" ? "text-white" : "text-gray-400"}`}
                >
                    {t("authForm.signUp")}
                </button>
            </div>
        </div>
    );
}
