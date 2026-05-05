"use client";

import type { UserProfile, MembershipTier } from "../types";

function resolveTier(profile?: UserProfile | null): MembershipTier {
    if (!profile) return null;
    if (profile.membership) return profile.membership;
    const roles = profile.roles ?? [];
    if (roles.includes("SUPPLIER")) return "SUPPLIER";
    if (roles.includes("B2B") || roles.includes("B2B_MEMBER")) return "B2B";
    return null;
}

export type BadgeVariant = "ribbon" | "tag";

interface Props {
    profile?: UserProfile | null;
    variant?: BadgeVariant;
    className?: string;
}

export default function MembershipBadge({ profile, variant = "ribbon", className = "" }: Props) {
    const tier = resolveTier(profile);
    if (!tier) return null;

    const config =
        tier === "SUPPLIER"
            ? {
                  label: "Supplier",
                  bg: "linear-gradient(135deg, #402F75 0%, #6c4fc0 100%)",
                  text: "#ffffff",
                  icon: (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 7l9-4 9 4M3 7v10l9 4 9-4V7M3 7l9 4 9-4M12 11v10" />
                      </svg>
                  ),
              }
            : {
                  label: "B2B Member",
                  bg: "linear-gradient(135deg, #FBBB14 0%, #f59e0b 100%)",
                  text: "#3f2a02",
                  icon: (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                  ),
              };

    if (variant === "tag") {
        return (
            <span
                className={`absolute -bottom-1 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md whitespace-nowrap ${className}`}
                style={{ background: config.bg, color: config.text }}
                title={config.label}
            >
                {config.icon}
                {config.label}
            </span>
        );
    }

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold shadow-sm ${className}`}
            style={{ background: config.bg, color: config.text }}
        >
            {config.icon}
            {config.label}
        </span>
    );
}
