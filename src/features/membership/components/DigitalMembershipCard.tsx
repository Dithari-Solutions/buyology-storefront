"use client";

import type { MembershipCard } from "../types";

interface Props {
    card: MembershipCard;
}

export default function DigitalMembershipCard({ card }: Props) {
    const isActive = card.status === "ACTIVE";

    return (
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#2D1F5E] via-[#402F75] to-[#6B4EAD] p-6 text-white shadow-2xl select-none">
            {/* Background decoration */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />

            {/* Header row */}
            <div className="relative flex items-start justify-between mb-6">
                <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 mb-1">Buyology</p>
                    <p className="text-[11px] uppercase tracking-widest text-white/60">B2B Membership</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="rounded-full bg-yellow-400 text-black text-[10px] font-extrabold px-3 py-1 uppercase tracking-wider">
                        {card.tier}
                    </span>
                    <span className={`rounded-full text-[9px] font-bold px-2 py-0.5 uppercase ${
                        isActive ? "bg-green-400/20 text-green-300 border border-green-400/30" : "bg-red-400/20 text-red-300 border border-red-400/30"
                    }`}>
                        {card.status}
                    </span>
                </div>
            </div>

            {/* Company & Member */}
            <div className="relative mb-6">
                <p className="text-[22px] font-bold leading-tight">{card.companyName}</p>
                <p className="text-white/70 text-sm mt-1">{card.memberName}</p>
            </div>

            {/* Wallet Balance */}
            <div className="relative mb-6 rounded-[14px] bg-white/10 backdrop-blur-sm px-4 py-3 inline-block">
                <p className="text-[10px] uppercase tracking-wider text-white/50 mb-0.5">Wallet Balance</p>
                <p className="text-[20px] font-extrabold">
                    {card.walletCurrency ?? "AED"} {(card.walletBalance ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
            </div>

            {/* Footer row */}
            <div className="relative flex items-end justify-between">
                <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Member ID</p>
                    <p className="font-mono text-sm font-bold tracking-widest">{card.membershipId}</p>
                    {card.validUntil && (
                        <p className="text-[10px] text-white/40 mt-1">
                            Valid until: {new Date(card.validUntil).toLocaleDateString("en-US", { year: "numeric", month: "short" })}
                        </p>
                    )}
                </div>
                {/* QR Placeholder */}
                <div className="w-12 h-12 rounded-[8px] bg-white/15 flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <path d="M14 14h1v1h-1z M17 14h1v1h-1z M20 14h1v1h-1z M14 17h1v1h-1z M17 17h4v4h-4z" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
