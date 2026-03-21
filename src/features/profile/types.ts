export type AddressLabel = "HOME" | "WORK" | "OTHER";

export interface UserProfile {
    userId: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
    dateOfBirth: string | null;
    avatarUrl: string | null;
    paymentReady: boolean;
    missingFields: string[];
    createdAt: string;
    updatedAt: string;
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
}

export interface UpdateProfilePayload {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
}
