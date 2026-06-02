"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import type { RootState } from "@/store";
import { type Lang } from "@/config/pathSlugs";
import { getUidFromAccessToken } from "@/shared/lib/tokenManager";
import {
    getMembershipCard,
    getMyApplication,
    getWallet,
    getWalletTransactions,
} from "../services/membership.api";
import type {
    ApplicationStatus,
    MembershipApplicationResponse,
    MembershipCard,
    WalletInfo,
    WalletTransaction,
} from "../types";
import DigitalMembershipCard from "./DigitalMembershipCard";

type View = "overview" | "card" | "wallet";

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; bg: string }> = {
    PENDING: { label: "Under Review", color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200" },
    APPROVED: { label: "Approved", color: "text-green-700", bg: "bg-green-50 border-green-200" },
    REJECTED: { label: "Rejected", color: "text-red-700", bg: "bg-red-50 border-red-200" },
    UNDER_REVIEW: { label: "Under Review", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
};

const TX_COLOR: Record<string, string> = {
    CREDIT: "text-green-600",
    DEBIT: "text-red-600",
    REFUND: "text-green-600",
    ADJUSTMENT: "text-blue-600",
};

export default function MembershipDashboard() {
    const userId = useSelector((s: RootState) => s.auth.userId);
    const lang = useSelector((s: RootState) => s.language.lang) as Lang;
    const { t } = useTranslation("profile");

    const [view, setView] = useState<View>("overview");
    const [loading, setLoading] = useState(true);
    const [card, setCard] = useState<MembershipCard | null>(null);
    const [application, setApplication] = useState<MembershipApplicationResponse | null>(null);
    const [wallet, setWallet] = useState<WalletInfo | null>(null);
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [txLoading, setTxLoading] = useState(false);

    useEffect(() => {
        if (!userId) { setLoading(false); return; }
        setLoading(true);

        // /api/membership/* endpoints key by users.id (uid claim), not auth_credentials.id (sub).
        // Redux's `userId` is the JWT sub — fall back to it only if uid isn't available.
        const membershipUid = getUidFromAccessToken() ?? userId;

        Promise.allSettled([
            getMembershipCard(membershipUid).then(setCard),
            getMyApplication(membershipUid).then(setApplication),
            getWallet(membershipUid).then(setWallet),
        ]).finally(() => setLoading(false));
    }, [userId]);

    const loadTransactions = async () => {
        const membershipUid = getUidFromAccessToken() ?? userId;
        if (!membershipUid) return;
        setTxLoading(true);
        try {
            const txs = await getWalletTransactions(membershipUid);
            setTransactions(txs);
        } catch { } finally { setTxLoading(false); }
    };

    const handleViewChange = (v: View) => {
        setView(v);
        if (v === "wallet" && transactions.length === 0) loadTransactions();
    };

    if (loading) {
        return (
            <div className="bg-white rounded-[20px] p-8 shadow-sm flex items-center justify-center min-h-[200px]">
                <div className="w-8 h-8 border-2 border-[#402F75] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // No application yet
    if (!application && !card) {
        return <NoMembershipState lang={lang} />;
    }

    return (
        <div className="space-y-4">
            {/* Status banner */}
            {application && !card && (
                <StatusBanner application={application} lang={lang} />
            )}

            {/* Active membership */}
            {card && (
                <>
                    {/* Sub-nav */}
                    <div className="bg-white rounded-[20px] p-2 shadow-sm flex gap-1">
                        {(["overview", "card", "wallet"] as View[]).map((v) => (
                            <button
                                key={v}
                                onClick={() => handleViewChange(v)}
                                className={`flex-1 rounded-[12px] py-2.5 text-[13px] font-medium transition-colors capitalize ${
                                    view === v ? "bg-[#402F75] text-white" : "text-gray-500 hover:bg-gray-50"
                                }`}
                            >
                                {v === "overview" ? "Overview" : v === "card" ? "My Card" : "Wallet"}
                            </button>
                        ))}
                    </div>

                    {view === "overview" && <OverviewPanel card={card} wallet={wallet} />}
                    {view === "card" && (
                        <div className="bg-white rounded-[20px] p-6 shadow-sm">
                            <h3 className="text-[15px] font-semibold text-gray-800 mb-4">Digital Membership Card</h3>
                            <DigitalMembershipCard card={card} />
                            <p className="text-[12px] text-gray-400 text-center mt-4">
                                Present this card to access B2B services and benefits.
                            </p>
                        </div>
                    )}
                    {view === "wallet" && (
                        <WalletPanel wallet={wallet} transactions={transactions} loading={txLoading} />
                    )}
                </>
            )}
        </div>
    );
}

function NoMembershipState({ lang }: { lang: string }) {
    const perks = [
        { label: "AED 5,000 wallet credit" },
        { label: "Priority support" },
        { label: "Exclusive B2B pricing" },
    ];
    return (
        <div className="relative overflow-hidden rounded-[20px] border border-gray-100 bg-gradient-to-b from-[#F8F6FF] to-white p-8 sm:p-10 shadow-sm flex flex-col items-center text-center gap-5">
            <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-[260px] h-[260px] rounded-full bg-[#402F75]/[0.06] blur-3xl" />

            <div className="relative w-[78px] h-[78px] rounded-[22px] bg-white shadow-sm ring-1 ring-[#402F75]/10 flex items-center justify-center">
                <div className="absolute inset-0 rounded-[22px] bg-gradient-to-br from-[#EDE9FF] to-[#F6F4FF]" />
                <svg className="relative" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#FBBB14] ring-2 ring-white flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </span>
            </div>

            <div className="relative">
                <h3 className="text-[17px] font-bold text-gray-900 mb-1">Unlock B2B Premium</h3>
                <p className="text-gray-500 text-[13px] max-w-xs mx-auto">
                    Apply for B2B Premium Membership and start enjoying members-only perks.
                </p>
            </div>

            <div className="relative flex flex-wrap items-center justify-center gap-2">
                {perks.map((perk) => (
                    <span key={perk.label} className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[12px] font-medium text-gray-600">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FBBB14" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {perk.label}
                    </span>
                ))}
            </div>

            <Link
                href={`/${lang}/b2b/apply`}
                className="relative rounded-[14px] bg-[#402F75] px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#352565] transition-colors"
            >
                Apply Now
            </Link>
        </div>
    );
}

function StatusBanner({ application, lang }: { application: MembershipApplicationResponse; lang: string }) {
    const cfg = STATUS_CONFIG[application.status];
    return (
        <div className={`rounded-[20px] border p-5 ${cfg.bg}`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className={`text-[13px] font-semibold ${cfg.color} mb-1`}>Application Status: {cfg.label}</p>
                    <p className="text-[12px] text-gray-500">
                        Submitted {new Date(application.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                    {application.status === "REJECTED" && application.rejectionReason && (
                        <p className="text-[12px] text-red-600 mt-2">Reason: {application.rejectionReason}</p>
                    )}
                </div>
                {application.status === "REJECTED" && (
                    <Link
                        href={`/${lang}/b2b/apply`}
                        className="rounded-[10px] bg-[#402F75] px-4 py-2 text-xs font-semibold text-white hover:bg-[#352565] transition-colors whitespace-nowrap"
                    >
                        Re-apply
                    </Link>
                )}
            </div>
        </div>
    );
}

function OverviewPanel({ card, wallet }: { card: MembershipCard; wallet: WalletInfo | null }) {
    return (
        <div className="bg-white rounded-[20px] p-6 shadow-sm space-y-5">
            <h3 className="text-[15px] font-semibold text-gray-800">Membership Overview</h3>
            <div className="grid grid-cols-2 gap-3">
                {[
                    { label: "Member Since", value: new Date(card.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short" }) },
                    { label: "Tier", value: card.tier },
                    { label: "Status", value: card.status },
                    { label: "Wallet Balance", value: `${wallet?.currency ?? "AED"} ${(wallet?.balance ?? 0).toFixed(2)}` },
                ].map(({ label, value }) => (
                    <div key={label} className="bg-[#F7F7F7] rounded-[14px] p-4">
                        <p className="text-[11px] text-gray-400 mb-1">{label}</p>
                        <p className="text-[14px] font-bold text-gray-800">{value}</p>
                    </div>
                ))}
            </div>
            <div className="border-t border-gray-100 pt-4">
                <p className="text-[12px] text-gray-400 mb-2">Membership ID</p>
                <p className="font-mono text-[13px] font-semibold text-gray-700 bg-[#F7F7F7] rounded-[10px] px-3 py-2">
                    {card.membershipId}
                </p>
            </div>
        </div>
    );
}

function WalletPanel({ wallet, transactions, loading }: {
    wallet: WalletInfo | null;
    transactions: WalletTransaction[];
    loading: boolean;
}) {
    return (
        <div className="space-y-4">
            {/* Balance card */}
            <div className="bg-gradient-to-r from-[#402F75] to-[#6B4EAD] rounded-[20px] p-6 text-white">
                <p className="text-[11px] uppercase tracking-widest text-white/60 mb-2">Available Balance</p>
                <p className="text-[32px] font-extrabold">
                    {wallet?.currency ?? "AED"} {(wallet?.balance ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-white/50 mt-2">Usable for all purchases on Buyology</p>
            </div>

            {/* Transactions */}
            <div className="bg-white rounded-[20px] p-6 shadow-sm">
                <h3 className="text-[15px] font-semibold text-gray-800 mb-4">Transaction History</h3>
                {loading ? (
                    <div className="flex justify-center py-6">
                        <div className="w-6 h-6 border-2 border-[#402F75] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-8 text-center">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F4F2FB] text-[#402F75]">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 7h16M4 12h16M4 17h10" />
                            </svg>
                        </span>
                        <p className="text-[13px] font-medium text-gray-500">No transactions yet</p>
                        <p className="text-[12px] text-gray-400">Your wallet activity will show up here.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {transactions.map((tx) => (
                            <li key={tx.id} className="flex items-center justify-between py-3">
                                <div>
                                    <p className={`text-[12px] font-bold uppercase ${TX_COLOR[tx.type] ?? "text-gray-600"}`}>{tx.type}</p>
                                    <p className="text-[13px] text-gray-700">{tx.description ?? "Transaction"}</p>
                                    <p className="text-[11px] text-gray-400">{new Date(tx.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-[15px] font-bold ${tx.type === "DEBIT" ? "text-red-600" : "text-green-600"}`}>
                                        {tx.type === "DEBIT" ? "−" : "+"}{tx.amount.toFixed(2)}
                                    </p>
                                    <p className="text-[11px] text-gray-400">Bal: {tx.balanceAfter.toFixed(2)}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
