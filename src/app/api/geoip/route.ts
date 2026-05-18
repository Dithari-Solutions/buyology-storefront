import { NextRequest, NextResponse } from "next/server";

// Server-side IP geolocation. Calls ipapi.co from the server (not the browser)
// so we don't expose the call to per-IP rate limits and can cache aggressively
// at the edge. The response is JSON: { countryCode: string | null }.

export const runtime = "edge";
// Cache the rendered route for a day; ipapi swaps per-IP under the hood but
// we forward x-forwarded-for so each unique IP gets its own cached entry via
// Cache-Control "private".

function pickIp(req: NextRequest): string | null {
    const xff = req.headers.get("x-forwarded-for");
    if (xff) return xff.split(",")[0].trim();
    const real = req.headers.get("x-real-ip");
    if (real) return real;
    return null;
}

export async function GET(req: NextRequest) {
    const ip = pickIp(req);
    const target = ip
        ? `https://ipapi.co/${encodeURIComponent(ip)}/json/`
        : "https://ipapi.co/json/";

    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(target, {
            signal: controller.signal,
            // Cache upstream responses for 24 h regardless of CDN config.
            next: { revalidate: 60 * 60 * 24 },
        });
        clearTimeout(timer);

        if (!res.ok) {
            return NextResponse.json(
                { countryCode: null },
                { headers: { "Cache-Control": "private, max-age=300" } }
            );
        }
        const data = (await res.json()) as { country_code?: string };
        const countryCode = data?.country_code?.toUpperCase() ?? null;
        return NextResponse.json(
            { countryCode },
            {
                headers: {
                    "Cache-Control": "private, max-age=86400",
                },
            }
        );
    } catch {
        return NextResponse.json(
            { countryCode: null },
            { headers: { "Cache-Control": "private, max-age=60" } }
        );
    }
}
