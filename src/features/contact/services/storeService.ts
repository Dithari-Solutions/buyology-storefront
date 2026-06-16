import { apiClient } from "@/shared/lib/apiClient";

export interface PublicOperatingHours {
    dayOfWeek: string; // "MONDAY" … "SUNDAY"
    openTime: string | null; // "09:00:00"
    closeTime: string | null;
    isClosed: boolean;
}

export interface PublicStoreLocation {
    id: string;
    branchName?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    isPrimary?: boolean | null;
    operatingHours?: PublicOperatingHours[] | null;
}

export interface PublicStore {
    id: string;
    name: string;
    countryName?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    locations: PublicStoreLocation[];
}

/** Active stores with locations + weekly operating hours — public, for the contact page. */
export async function getPublicStores(): Promise<PublicStore[]> {
    const { data } = await apiClient.get<{ data: PublicStore[] }>("/api/stores/public");
    return data.data ?? [];
}
