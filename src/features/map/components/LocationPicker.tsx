"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// Open-source CARTO raster basemap (OSM data, no API key for basemaps). HTTPS, so it
// satisfies the site CSP's `upgrade-insecure-requests`. MapLibre round-robins the subdomains.
const CARTO_TILES = [
    "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
    "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
    "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
    "https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
];

interface LocationPickerProps {
    initialCoords?: { lat: number; lng: number };
    onChange: (coords: { lat: number; lng: number }) => void;
}

export default function LocationPicker({ initialCoords, onChange }: LocationPickerProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);
    const markerRef = useRef<maplibregl.Marker | null>(null);
    const [mapError, setMapError] = useState(false);

    useEffect(() => {
        if (!mapContainerRef.current) return;

        const defaultCenter: [number, number] = initialCoords 
            ? [initialCoords.lng, initialCoords.lat] 
            : [49.8671, 40.4093]; // Default Baku

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
            zoom: 13,
        });

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

        const marker = new maplibregl.Marker({
            draggable: true,
            color: "#402F75"
        })
            .setLngLat(defaultCenter)
            .addTo(map);

        marker.on("dragend", () => {
            const lngLat = marker.getLngLat();
            onChange({ lat: lngLat.lat, lng: lngLat.lng });
        });

        mapRef.current = map;
        markerRef.current = marker;

        return () => {
            map.remove();
        };
    }, []);

    const useMyLocation = () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(({ coords }) => {
            const newPos: [number, number] = [coords.longitude, coords.latitude];
            mapRef.current?.flyTo({ center: newPos, zoom: 16 });
            markerRef.current?.setLngLat(newPos);
            onChange({ lat: coords.latitude, lng: coords.longitude });
        });
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <label className="text-[13px] font-medium text-gray-600">Pin on Map (Required for Express)</label>
                <button
                    type="button"
                    onClick={useMyLocation}
                    className="text-[12px] font-bold text-[#402F75] hover:underline flex items-center gap-1"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                    </svg>
                    Use my location
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
            <p className="text-[11px] text-gray-400">
                Drag the purple pin to your exact delivery location.
            </p>
        </div>
    );
}
