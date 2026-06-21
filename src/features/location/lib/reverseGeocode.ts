export interface ReverseGeocodeResult {
    /** Precise street line for address line 1 (house number + road, or the nearest feature). */
    line: string;
    road: string | null;
    houseNumber: string | null;
    neighbourhood: string | null;
    city: string | null;
    /** Province / region / emirate / state. */
    state: string | null;
    postalCode: string | null;
    /** ISO 3166-1 alpha-2, uppercased (e.g. "AE"). */
    countryCode: string | null;
}

/**
 * Turns map coordinates into a precise, structured address via OpenStreetMap's Nominatim
 * (the same free service already used for country detection). `zoom=18` asks for
 * building/house-level detail so we get the exact street rather than just the city.
 * Best-effort: returns null on any failure so callers can fall back to manual entry.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&addressdetails=1&zoom=18`,
            { headers: { "Accept-Language": "en" } }
        );
        if (!res.ok) return null;
        const data = await res.json();
        const a = (data?.address ?? {}) as Record<string, string | undefined>;

        const road = a.road || a.pedestrian || a.footway || a.residential || null;
        const houseNumber = a.house_number || null;
        const neighbourhood = a.neighbourhood || a.suburb || a.quarter || null;
        const city = a.city || a.town || a.village || a.municipality || a.county || null;
        const state = a.state || a.region || a.province || a.state_district || null;
        const postalCode = a.postcode || null;
        const countryCode = a.country_code ? a.country_code.toUpperCase() : null;

        // Precise line: "house road", else road, else the nearest named feature, else display_name.
        const street = houseNumber && road ? `${houseNumber} ${road}` : road;
        const named = (data?.name as string | undefined) || null;
        const line =
            [street, neighbourhood].filter(Boolean).join(", ") ||
            named ||
            (data?.display_name as string | undefined) ||
            "";

        return { line, road, houseNumber, neighbourhood, city, state, postalCode, countryCode };
    } catch {
        return null;
    }
}
