export interface ReverseGeocodeResult {
    /** A concise, human-readable address line (street, area, city). */
    line: string;
    city: string | null;
    /** ISO 3166-1 alpha-2, uppercased (e.g. "AE"). */
    countryCode: string | null;
}

/**
 * Turns map coordinates into an address line via OpenStreetMap's Nominatim
 * (the same free service already used for country detection). Best-effort:
 * returns null on any failure so callers can fall back to manual entry.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
        );
        if (!res.ok) return null;
        const data = await res.json();
        const a = (data?.address ?? {}) as Record<string, string | undefined>;

        const city = a.city || a.town || a.village || a.suburb || a.county || null;
        const countryCode = a.country_code ? a.country_code.toUpperCase() : null;

        const street = a.house_number && a.road ? `${a.road} ${a.house_number}` : a.road;
        const parts = [street, a.neighbourhood || a.suburb, city].filter(Boolean) as string[];
        const line = parts.length ? parts.join(", ") : (data?.display_name as string | undefined) ?? "";

        return { line, city, countryCode };
    } catch {
        return null;
    }
}
