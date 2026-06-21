"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { reverseGeocode } from "@/features/location/lib/reverseGeocode";

// Open-source CARTO raster basemap (OSM data, no API key for basemaps). HTTPS, so it
// satisfies the site CSP's `upgrade-insecure-requests`. MapLibre round-robins the subdomains.
const CARTO_TILES = [
    "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
    "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
    "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
    "https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
];

// Above this GPS accuracy radius the auto-detected fix is only area/region level, so we
// nudge the user to drop the pin on their exact building.
const COARSE_ACCURACY_M = 60;

export interface ResolvedLocation {
    lat: number;
    lng: number;
    line: string;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    countryCode: string | null;
}

interface LocationPickerProps {
    initialCoords?: { lat: number; lng: number };
    onChange: (coords: { lat: number; lng: number }) => void;
    /** Fired after the pin moves and its address is reverse-geocoded (Use my location / drag / tap). */
    onResolved?: (info: ResolvedLocation) => void;
}

export default function LocationPicker({ initialCoords, onChange, onResolved }: LocationPickerProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);
    const markerRef = useRef<maplibregl.Marker | null>(null);
    const onResolvedRef = useRef(onResolved);
    const onChangeRef = useRef(onChange);
    useEffect(() => { onResolvedRef.current = onResolved; }, [onResolved]);
    useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

    const [mapError, setMapError] = useState(false);
    const [locating, setLocating] = useState(false);
    const [pin, setPin] = useState<{ lat: number; lng: number } | null>(initialCoords ?? null);
    // Accuracy of an auto-detected GPS fix in metres; null once the user places the pin by hand (= exact).
    const [accuracyM, setAccuracyM] = useState<number | null>(null);

    // Reverse-geocode a pin position and bubble the resolved address up.
    async function resolve(lat: number, lng: number) {
        if (!onResolvedRef.current) return;
        setLocating(true);
        const r = await reverseGeocode(lat, lng);
        setLocating(false);
        if (r) onResolvedRef.current({
            lat, lng,
            line: r.line,
            city: r.city,
            state: r.state,
            postalCode: r.postalCode,
            countryCode: r.countryCode,
        });
    }

    // Move the pin to an exact point, sync coords up, and resolve the address.
    function applyPin(lat: number, lng: number, accuracy: number | null, fly: boolean) {
        markerRef.current?.setLngLat([lng, lat]);
        if (fly) mapRef.current?.flyTo({ center: [lng, lat], zoom: 18 });
        setPin({ lat, lng });
        setAccuracyM(accuracy);
        onChangeRef.current({ lat, lng });
        resolve(lat, lng);
    }

    useEffect(() => {
        if (!mapContainerRef.current) return;

        const defaultCenter: [number, number] = initialCoords
            ? [initialCoords.lng, initialCoords.lat]
            : [55.2708, 25.2048]; // Default Dubai

        const map = new maplibregl.Map({
            container: mapContainerRef.current,
            style: {
                version: 8,
                sources: {
                    tiles: {
                        type: "raster",
                        tiles: CARTO_TILES,
                        tileSize: 256,
                        attribution: "© OpenStreetMap contributors, © CARTO",
                    },
                },
                layers: [{ id: "tiles", type: "raster", source: "tiles" }],
            },
            center: defaultCenter,
            zoom: initialCoords ? 17 : 13,
            maxZoom: 20, // allow rooftop-level precision
        });
        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

        map.on("error", () => {
            setMapError(true);
            // Fallback to OSM
            const src = map.getSource("tiles") as maplibregl.RasterTileSource | undefined;
            if (src) {
                map.removeLayer("tiles");
                map.removeSource("tiles");
                map.addSource("tiles-osm", {
                    type: "raster",
                    tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                    tileSize: 256,
                    attribution: "© OpenStreetMap contributors",
                });
                map.addLayer({ id: "tiles-osm", type: "raster", source: "tiles-osm" });
            }
        });

        const marker = new maplibregl.Marker({ draggable: true, color: "#402F75" })
            .setLngLat(defaultCenter)
            .addTo(map);

        // Dragging or tapping the map sets the EXACT point (manual = precise, accuracy cleared).
        marker.on("dragend", () => {
            const { lat, lng } = marker.getLngLat();
            applyPin(lat, lng, null, false);
        });
        map.on("click", (e) => {
            applyPin(e.lngLat.lat, e.lngLat.lng, null, false);
        });

        mapRef.current = map;
        markerRef.current = marker;

        return () => {
            map.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const useMyLocation = () => {
        if (!navigator.geolocation) return;
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                applyPin(coords.latitude, coords.longitude, coords.accuracy ?? null, true);
            },
            () => setLocating(false),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const coarse = accuracyM != null && accuracyM > COARSE_ACCURACY_M;

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <label className="text-[13px] font-medium text-gray-600">Delivery location</label>
                <button
                    type="button"
                    onClick={useMyLocation}
                    disabled={locating}
                    className="text-[12px] font-bold text-[#402F75] hover:underline flex items-center gap-1 disabled:opacity-60"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={locating ? "animate-spin" : ""}>
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                    </svg>
                    {locating ? "Locating…" : "Use my location"}
                </button>
            </div>
            <div className="relative w-full h-[240px] rounded-xl overflow-hidden border border-gray-200">
                <div ref={mapContainerRef} className="w-full h-full" />
                {mapError && (
                    <div className="absolute top-2 left-2 bg-white/80 px-2 py-0.5 rounded text-[10px] text-gray-500">
                        Map fallback active
                    </div>
                )}
            </div>

            {/* Precision status — the courier is routed to this exact pin. */}
            {pin && (
                coarse ? (
                    <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                        <svg className="mt-0.5 flex-shrink-0" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        <p className="text-[11px] text-amber-700 leading-snug">
                            Approximate GPS (~{Math.round(accuracyM!)} m). Drag the pin or tap the map on your exact building so the courier finds you.
                        </p>
                    </div>
                ) : (
                    <p className="text-[11px] text-green-600 flex items-center gap-1.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        Exact spot pinned for the courier ({pin.lat.toFixed(5)}, {pin.lng.toFixed(5)}).
                    </p>
                )
            )}
            <p className="text-[11px] text-gray-400">
                Tap “Use my location”, drag the purple pin, or tap the map to mark your exact spot — we’ll fill in the address.
            </p>
        </div>
    );
}
