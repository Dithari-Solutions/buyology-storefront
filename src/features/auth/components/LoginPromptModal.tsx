"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import LoginModalIcon from "@/assets/icons/login-modal.svg";

interface LoginPromptModalProps {
  onSignIn: () => void;
  onCreateAccount: () => void;
  onClose: () => void;
}

export default function LoginPromptModal({ onSignIn, onCreateAccount, onClose }: LoginPromptModalProps) {
  const { t } = useTranslation("auth");

  return createPortal(
    <div
      className="fixed inset-0 z-[99998] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[28px] py-10 px-8 w-full max-w-sm shadow-2xl flex flex-col items-center"
        onClick={e => e.stopPropagation()}
      >
        {/* Illustration */}
        <div className="mb-6">
          <Image src={LoginModalIcon} alt="login" width={160} height={160} />
        </div>

        <h2 className="font-bold text-[22px] text-gray-900 mb-3 text-center leading-snug">
          {t("loginPrompt.title")}
        </h2>
        <p className="text-gray-500 text-[13px] text-center mb-7 max-w-[260px] leading-relaxed">
          {t("loginPrompt.desc")}
        </p>

        <div className="w-full flex gap-3">
          <button
            type="button"
            onClick={onSignIn}
            className="w-full py-[13px] rounded-[30px] bg-[#402F75] text-white font-bold text-[15px] flex items-center justify-center gap-2 cursor-pointer hover:bg-[#352566] active:scale-[0.98] transition-all duration-150"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            {t("loginPrompt.signIn")}
          </button>
          <button
            type="button"
            onClick={onCreateAccount}
            className="w-full py-[13px] rounded-[30px] bg-[#FBBB14] text-white font-bold text-[15px] cursor-pointer hover:bg-[#f0b000] active:scale-[0.98] transition-all duration-150"
          >
            {t("loginPrompt.createAccount")}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
