export type AddressLabel = "HOME" | "WORK" | "OTHER";

export type MembershipTier = "B2B" | "SUPPLIER" | null;

export interface UserProfile {
    userId: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
    phoneVerified: boolean;
    dateOfBirth: string | null;
    avatarUrl: string | null;
    paymentReady: boolean;
    missingFields: string[];
    selectedCountryCode: string | null;
    preferredCurrency: string | null;
    preferredLanguage: string | null;
    membership?: MembershipTier;
    roles?: string[];
    createdAt: string;
    updatedAt: string;
    /** True when the account is scheduled for deletion (within the 30-day grace window). */
    pendingDeletion?: boolean;
    /** ISO timestamp when the account will be permanently deleted. */
    deletionScheduledAt?: string | null;
}

export interface Address {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    phoneVerified: boolean;
    label: AddressLabel;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string | null;
    country: string;
    postalCode: string | null;
    formattedAddress: string | null;
    latitude: number | null;
    longitude: number | null;
    addressVerified: boolean;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAddressPayload {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    label?: AddressLabel;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;
    isDefault?: boolean;
    latitude?: number | null;
    longitude?: number | null;
}

export interface UpdateProfilePayload {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    selectedCountryCode?: string;
    preferredCurrency?: string;
    preferredLanguage?: string;
}
