"use client";

import { useEffect, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { loadCountries, ISO_NUMERIC_BY_ID, type CountryFeature, type CountryId } from "./Globe3D";

interface Props {
    countryId: CountryId;
}

export default function CountryShape({ countryId }: Props) {
    const [feature, setFeature] = useState<CountryFeature | null>(null);

    useEffect(() => {
        let cancelled = false;
        loadCountries()
            .then((features) => {
                if (cancelled) return;
                const target = ISO_NUMERIC_BY_ID[countryId];
                const f = features.find((x) => String(x.id) === target) ?? null;
                setFeature(f);
            })
            .catch(() => {
                if (!cancelled) setFeature(null);
            });
        return () => {
            cancelled = true;
        };
    }, [countryId]);

    if (!feature) {
        return (
            <svg viewBox="0 0 110 110" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <circle cx="55" cy="55" r="52" fill="#1A0F40" />
                <circle cx="55" cy="55" r="52" fill="none" stroke="#402F75" strokeWidth="1.5" />
            </svg>
        );
    }

    const projection = geoMercator().fitSize([90, 90], feature);
    const pathGen = geoPath(projection);
    const d = pathGen(feature) ?? "";

    return (
        <svg viewBox="0 0 110 110" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            {/* mini-globe background */}
            <circle cx="55" cy="55" r="52" fill="#1A0F40" />
            <circle cx="55" cy="55" r="52" fill="none" stroke="#402F75" strokeWidth="1.5" />
            {/* latitude grid */}
            {[27, 41, 55, 69, 83].map((y) => (
                <line key={y} x1="3" y1={y} x2="107" y2={y} stroke="#FBBB14" strokeOpacity="0.1" strokeWidth="0.5" />
            ))}
            <ellipse cx="55" cy="55" rx="52" ry="8" stroke="#FBBB14" strokeOpacity="0.1" fill="none" strokeWidth="0.5" />
            <ellipse cx="55" cy="55" rx="30" ry="52" stroke="#FBBB14" strokeOpacity="0.1" fill="none" strokeWidth="0.5" />
            {/* country path */}
            <g transform="translate(10, 10)">
                <path d={d} fill="#FBBB14" fillOpacity="0.9" stroke="#FBBB14" strokeWidth="0.6" />
            </g>
        </svg>
    );
}
