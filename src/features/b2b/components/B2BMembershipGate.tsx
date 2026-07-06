"use client";

import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import type { RootState } from "@/store";
import type { Lang } from "@/config/pathSlugs";
import { useB2bMembership } from "@/features/b2b/hooks/useB2bMembership";

// ── B2B members-only gate ─────────────────────────────────────────────────────
// Wraps the B2B cart / checkout flow. Only an ACTIVE B2bMembership may see the
// children; non-members are prompted to apply and unauthenticated users to sign
// in. Uses the Foundation `useB2bMembership` hook (membership-card source of truth).

export default function B2BMembershipGate({ children }: { children: React.ReactNode }) {
    const { t } = useTranslation("b2b-rfq");
    const params = useParams();
    const lang = (params?.lang as Lang) ?? "en";
    const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
    const { loading, isActiveMember } = useB2bMembership();

    if (loading) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-24 text-center text-sm text-gray-500">
                {t("gate.checking")}
            </div>
        );
    }

    if (isActiveMember) {
        return <>{children}</>;
    }

    // Not an active member → prompt. Distinguish signed-out vs. not-a-member.
    const signedOut = !isAuthenticated;

    return (
        <div className="mx-auto max-w-xl px-4 py-20">
            <div className="rounded-[24px] border border-gray-100 bg-white p-8 sm:p-10 text-center shadow-sm">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#EDE9FF]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                </div>
                <h1 className="text-[22px] font-bold text-gray-900">
                    {signedOut ? t("gate.membersOnly") : t("gate.membersOnly")}
                </h1>
                <p className="mt-2 text-[14px] leading-relaxed text-gray-500">
                    {signedOut ? t("gate.signInBody") : t("gate.membersOnlyBody")}
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    {signedOut ? (
                        <a
                            href={`/${lang}/auth`}
                            className="inline-flex items-center gap-2 rounded-full bg-[#402F75] px-8 py-[13px] text-[14px] font-bold text-white transition-colors hover:bg-[#321f5e]"
                        >
                            {t("gate.signIn")}
                        </a>
                    ) : (
                        <a
                            href={`/${lang}/b2b/apply`}
                            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FBBB14] to-[#f59e0b] px-8 py-[13px] text-[14px] font-bold text-[#3f2a02] transition-transform hover:scale-[1.03] shadow-lg shadow-[#FBBB14]/30"
                        >
                            {t("gate.apply")}
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
