"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter, useParams } from "next/navigation";
import type { Lang } from "@/config/pathSlugs";

/**
 * Shown when a B2B member whose application is still awaiting approval attempts
 * an action that is reserved for approved members. Browsing is unaffected — this
 * only appears on a blocked action.
 */
export default function B2bApprovalPendingModal({
    status,
    onClose,
}: {
    status?: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | null;
    onClose: () => void;
}) {
    const router = useRouter();
    const params = useParams();
    const lang = (params?.lang as Lang) ?? "en";

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    // Only ever rendered in response to a user action, so the DOM is available.
    // The guard keeps it safe if it is ever evaluated during SSR.
    if (typeof document === "undefined") return null;

    const rejected = status === "REJECTED";

    return createPortal(
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="w-full max-w-md rounded-[20px] bg-white p-7 shadow-xl">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#F7F5FF]">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 2" />
                    </svg>
                </div>

                <h2 className="text-center text-[17px] font-bold text-gray-900 mb-2.5">
                    {rejected ? "Your B2B application was not approved" : "Your B2B membership is awaiting approval"}
                </h2>

                <p className="text-center text-[13.5px] leading-relaxed text-gray-500">
                    {rejected ? (
                        <>
                            This action is reserved for approved B2B members. Your application was
                            not approved in its current form. Please review the reason provided and
                            re-submit your application from your profile.
                        </>
                    ) : (
                        <>
                            Thank you for registering. Our team is currently reviewing your business
                            details. Until your application has been approved, this action is not
                            available on your account. You may continue to browse in the meantime,
                            and you can follow the progress of your application at any time from your
                            profile.
                        </>
                    )}
                </p>

                <div className="mt-6 flex flex-col gap-2.5">
                    <button
                        type="button"
                        onClick={() => {
                            onClose();
                            router.push(`/${lang}/profile`);
                        }}
                        className="w-full rounded-[14px] bg-[#402F75] py-3 text-sm font-semibold text-white hover:bg-[#352565] transition-colors"
                    >
                        {rejected ? "Review and re-submit" : "View application status"}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full rounded-[14px] border border-gray-200 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        Continue browsing
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}
