"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { Topology } from "topojson-specification";

const ReactGlobe = dynamic(() => import("react-globe.gl"), { ssr: false });

export type CountryId = "uae" | "sa" | "qa" | "om" | "az" | "bh";

export interface CountryGeo {
    id: CountryId;
    iso2: string;
    iso3: string;
    lat: number;
    lng: number;
}

export const COUNTRY_GEO: Record<CountryId, CountryGeo> = {
    uae: { id: "uae", iso2: "AE", iso3: "ARE", lat: 23.4241, lng: 53.8478 },
    sa: { id: "sa", iso2: "SA", iso3: "SAU", lat: 23.8859, lng: 45.0792 },
    qa: { id: "qa", iso2: "QA", iso3: "QAT", lat: 25.3548, lng: 51.1839 },
    om: { id: "om", iso2: "OM", iso3: "OMN", lat: 21.5126, lng: 55.9233 },
    az: { id: "az", iso2: "AZ", iso3: "AZE", lat: 40.1431, lng: 47.5769 },
    bh: { id: "bh", iso2: "BH", iso3: "BHR", lat: 26.0667, lng: 50.5577 },
};

interface CountryProperties {
    name?: string;
    [key: string]: unknown;
}

type CountryFeature = Feature<Geometry, CountryProperties> & {
    id?: string | number;
};

const TOPOJSON_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

let cachedFeatures: CountryFeature[] | null = null;

async function loadCountries(): Promise<CountryFeature[]> {
    if (cachedFeatures) return cachedFeatures;
    const res = await fetch(TOPOJSON_URL);
    const topology = (await res.json()) as Topology;
    const collection = feature(topology, topology.objects.countries) as FeatureCollection<Geometry, CountryProperties>;
    cachedFeatures = collection.features as CountryFeature[];
    return cachedFeatures;
}

// Numeric (M49) ISO codes used by world-atlas as the feature id
const ISO_NUMERIC_BY_ID: Record<CountryId, string> = {
    uae: "784",
    sa: "682",
    qa: "634",
    om: "512",
    az: "031",
    bh: "048",
};

function isCountrySelected(feat: CountryFeature, id: CountryId): boolean {
    const target = ISO_NUMERIC_BY_ID[id];
    return String(feat.id) === target;
}

interface Props {
    selectedId: CountryId;
    onSelect: (id: CountryId) => void;
    size?: number;
}

// Responsive globe size: scales with the viewport, capped so it stays
// proportionate on very large screens. Falls back to a sensible default on SSR.
function computeGlobeSize(): number {
    if (typeof window === "undefined") return 520;
    const vw = window.innerWidth;
    if (vw < 480) return Math.min(vw - 48, 360);
    if (vw < 768) return 440;
    if (vw < 1280) return 520;
    return 600;
}

export default function Globe3D({ selectedId, onSelect, size }: Props) {
    const [features, setFeatures] = useState<CountryFeature[] | null>(null);
    const [autoSize, setAutoSize] = useState<number>(() => computeGlobeSize());

    // Recompute on resize when no explicit size is provided
    useEffect(() => {
        if (size) return;
        const onResize = () => setAutoSize(computeGlobeSize());
        onResize();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [size]);

    const globeSize = size ?? autoSize;
    const globeRef = useRef<{ pointOfView: (coords: { lat: number; lng: number; altitude: number }, ms: number) => void; controls: () => { autoRotate: boolean; autoRotateSpeed: number; enableZoom: boolean } } | null>(null);

    useEffect(() => {
        let cancelled = false;
        loadCountries()
            .then((fts) => {
                if (!cancelled) setFeatures(fts);
            })
            .catch(() => {
                if (!cancelled) setFeatures([]);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    // Configure controls once globe mounts
    useEffect(() => {
        if (!globeRef.current) return;
        const controls = globeRef.current.controls();
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.6;
        controls.enableZoom = false;
    }, [features]);

    // Animate camera to selected country
    useEffect(() => {
        if (!globeRef.current || !features) return;
        const target = COUNTRY_GEO[selectedId];
        try {
            globeRef.current.pointOfView({ lat: target.lat, lng: target.lng, altitude: 1.8 }, 1200);
            const controls = globeRef.current.controls();
            controls.autoRotate = false;
        } catch {
            // ignore
        }
    }, [selectedId, features]);

    const polygonsData = useMemo(() => features ?? [], [features]);

    return (
        <div className="relative" style={{ width: globeSize, height: globeSize }}>
            {/* Soft glow shadow */}
            <div
                aria-hidden
                className="absolute"
                style={{
                    bottom: -16,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "62%",
                    height: 22,
                    background: "radial-gradient(ellipse, rgba(64,47,117,0.35) 0%, transparent 70%)",
                    borderRadius: "50%",
                    filter: "blur(8px)",
                }}
            />

            {!features ? (
                <div
                    className="w-full h-full rounded-full flex items-center justify-center"
                    style={{ background: "radial-gradient(circle at 35% 30%, #5B4A9C 0%, #2E1F6A 45%, #0F0828 100%)" }}
                >
                    <div className="w-8 h-8 rounded-full border-2 border-[#FBBB14] border-t-transparent animate-spin" />
                </div>
            ) : (
                <ReactGlobe
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ref={globeRef as any}
                    width={globeSize}
                    height={globeSize}
                    backgroundColor="rgba(0,0,0,0)"
                    showAtmosphere
                    atmosphereColor="#FBBB14"
                    atmosphereAltitude={0.18}
                    globeImageUrl={undefined}
                    showGlobe
                    polygonsData={polygonsData as object[]}
                    polygonAltitude={(d: object) =>
                        isCountrySelected(d as CountryFeature, selectedId) ? 0.06 : 0.01
                    }
                    polygonCapColor={(d: object) =>
                        isCountrySelected(d as CountryFeature, selectedId)
                            ? "rgba(251, 187, 20, 0.95)"
                            : "rgba(108, 79, 192, 0.55)"
                    }
                    polygonSideColor={() => "rgba(64, 47, 117, 0.4)"}
                    polygonStrokeColor={() => "rgba(255,255,255,0.25)"}
                    polygonLabel={(d: object) => {
                        const f = d as CountryFeature;
                        return `<div style="background:rgba(20,12,40,0.9);color:#fff;padding:4px 8px;border-radius:8px;font-size:11px;font-weight:600;">${f.properties?.name ?? ""}</div>`;
                    }}
                    onPolygonClick={(d: object) => {
                        const f = d as CountryFeature;
                        const match = (Object.keys(ISO_NUMERIC_BY_ID) as CountryId[]).find(
                            (k) => ISO_NUMERIC_BY_ID[k] === String(f.id)
                        );
                        if (match) onSelect(match);
                    }}
                />
            )}
        </div>
    );
}

export { loadCountries, ISO_NUMERIC_BY_ID };
export type { CountryFeature };
