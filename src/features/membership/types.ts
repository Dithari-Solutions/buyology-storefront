export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED" | "UNDER_REVIEW";
export type MembershipTier = "PREMIUM";
export type MembershipStatus = "ACTIVE" | "SUSPENDED" | "EXPIRED";
export type WalletTransactionType = "CREDIT" | "DEBIT" | "REFUND" | "ADJUSTMENT";

export const BUSINESS_NEEDS_OPTIONS = [
    "Buying devices",
    "Repairs",
    "IT asset disposal",
    "Bulk procurement",
    "Managed IT services",
    "Other",
] as const;

export interface MembershipApplicationRequest {
    companyName: string;
    tradeLicenseNumber: string;
    industryType: string;
    numberOfEmployees: number;
    country: string;
    city: string;
    website?: string;
    contactFullName: string;
    contactDesignation: string;
    contactEmail: string;
    contactMobile: string;
    businessNeeds: string[];
    termsAccepted: boolean;
}

export interface MembershipApplicationResponse {
    id: string;
    userId: string | null;
    companyName: string;
    tradeLicenseNumber: string;
    industryType: string;
    numberOfEmployees: number;
    country: string;
    city: string;
    website?: string;
    contactFullName: string;
    contactDesignation: string;
    contactEmail: string;
    contactMobile: string;
    businessNeeds?: string[];
    tradeLicenseFileUrl?: string;
    vatCertificateFileUrl?: string;
    termsAccepted: boolean;
    status: ApplicationStatus;
    rejectionReason?: string;
    rejectedBy?: string;
    rejectedAt?: string;
    approvedBy?: string;
    approvedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface MembershipCard {
    id: string;
    membershipId: string;
    userId: string;
    companyName: string;
    memberName: string;
    status: MembershipStatus;
    tier: MembershipTier;
    walletBalance?: number;
    walletCurrency?: string;
    validUntil?: string;
    createdAt: string;
    qrCodePlaceholder?: string;
}

export interface WalletInfo {
    id: string;
    userId: string;
    balance: number;
    currency: string;
    createdAt: string;
    updatedAt: string;
}

export interface WalletTransaction {
    id: string;
    walletId: string;
    userId: string;
    type: WalletTransactionType;
    amount: number;
    balanceAfter: number;
    description?: string;
    referenceId?: string;
    performedBy?: string;
    createdAt: string;
}
