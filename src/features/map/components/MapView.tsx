"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// ── Config ────────────────────────────────────────────────────────────────────
const BASE_HOST = "5.189.132.250";
const OSRM      = `http://${BASE_HOST}:5000`;
const TILES     = `http://${BASE_HOST}:8090`;

// Route endpoints [lng, lat]
const ORIGIN: [number, number] = [49.8671, 40.4093];
const DEST: [number, number]   = [49.851,  40.4236];

// ── Utilities ─────────────────────────────────────────────────────────────────
function decodePolyline(enc: string): [number, number][] {
  const out: [number, number][] = [];
  let i = 0, lat = 0, lng = 0;
  while (i < enc.length) {
    let s = 0, r = 0, b: number;
    do { b = enc.charCodeAt(i++) - 63; r |= (b & 31) << s; s += 5; } while (b >= 32);
    lat += r & 1 ? ~(r >> 1) : r >> 1;
    s = 0; r = 0;
    do { b = enc.charCodeAt(i++) - 63; r |= (b & 31) << s; s += 5; } while (b >= 32);
    lng += r & 1 ? ~(r >> 1) : r >> 1;
    out.push([lng / 1e5, lat / 1e5]); // [lng, lat] for MapLibre
  }
  return out;
}

function computeBearing(a: [number, number], b: [number, number]): number {
  const toR = (d: number) => (d * Math.PI) / 180;
  const y   = Math.sin(toR(b[0] - a[0])) * Math.cos(toR(b[1]));
  const x   =
    Math.cos(toR(a[1])) * Math.sin(toR(b[1])) -
    Math.sin(toR(a[1])) * Math.cos(toR(b[1])) * Math.cos(toR(b[0] - a[0]));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function haversine(a: [number, number], b: [number, number]): number {
  const R   = 6371000;
  const toR = (d: number) => (d * Math.PI) / 180;
  const dLat = toR(b[1] - a[1]);
  const dLng = toR(b[0] - a[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toR(a[1])) * Math.cos(toR(b[1])) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function closestIdx(pos: [number, number], coords: [number, number][]): number {
  let best = 0, bestD = Infinity;
  coords.forEach((c, i) => {
    const d = haversine(pos, c);
    if (d < bestD) { bestD = d; best = i; }
  });
  return best;
}

function fmtTime(s: number) {
  const m = Math.round(s / 60);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`;
}

function fmtDist(m: number) {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
}

// ── Courier Marker CSS ────────────────────────────────────────────────────────
const COURIER_CSS = `
.cr-wrap { position: relative; width: 44px; height: 44px; }
.cr-pulse {
  position: absolute; inset: -10px; border-radius: 50%;
  background: rgba(64,47,117,.35);
  animation: crPulse 1.6s ease-out infinite;
}
.cr-pulse2 {
  position: absolute; inset: -5px; border-radius: 50%;
  background: rgba(64,47,117,.2);
  animation: crPulse 1.6s ease-out 0.6s infinite;
}
.cr-body {
  position: absolute; inset: 0;
  background: #402F75;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 3px 14px rgba(64,47,117,.65);
}
.cr-icon { transform: rotate(45deg); font-size: 18px; line-height: 1; }
@keyframes crPulse {
  0%   { transform: scale(.4); opacity: 1; }
  100% { transform: scale(2.4); opacity: 0; }
}
.dest-pin {
  width: 28px; height: 28px;
  background: #FBBB14;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0,0,0,.35);
}
`;

function makeCourierEl(): HTMLDivElement {
  const el = document.createElement("div");
  el.className = "cr-wrap";
  el.innerHTML = `
    <div class="cr-pulse"></div>
    <div class="cr-pulse2"></div>
    <div class="cr-body"><span class="cr-icon">🚴</span></div>
  `;
  return el;
}

// ── Component ─────────────────────────────────────────────────────────────────
interface RouteInfo { distance: number; duration: number }

export default function MapView() {
  const ctnRef     = useRef<HTMLDivElement>(null);
  const mapRef     = useRef<maplibregl.Map | null>(null);
  const markerRef  = useRef<maplibregl.Marker | null>(null);
  const simTimer   = useRef<ReturnType<typeof setInterval> | null>(null);
  const coordsRef  = useRef<[number, number][]>([]);
  const wsRef      = useRef<WebSocket | null>(null);
  const watchRef   = useRef<number | null>(null);
  const headingRef = useRef(0);

  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [eta, setEta]             = useState<string | null>(null);
  const [tilt, setTilt]           = useState(45);
  const [liveMode, setLiveMode]   = useState(false);
  const [wsOk, setWsOk]           = useState(false);
  const [simMode, setSimMode]     = useState(false);
  const [tileError, setTileError] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  // Inject courier CSS once
  useEffect(() => {
    if (document.getElementById("cr-css")) return;
    const s = document.createElement("style");
    s.id = "cr-css";
    s.textContent = COURIER_CSS;
    document.head.appendChild(s);
  }, []);

  // ── Map init ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!ctnRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: ctnRef.current,
      style: {
        version: 8,
        sources: {
          tiles: {
            type: "raster",
            tiles: [`${TILES}/tile/{z}/{x}/{y}.png`],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [{ id: "tiles", type: "raster", source: "tiles" }],
      },
      center: [(ORIGIN[0] + DEST[0]) / 2, (ORIGIN[1] + DEST[1]) / 2],
      zoom: 13,
      pitch: 45,
      bearing: 0,
    });

    // Fall back to OSM raster if self-hosted tiles error
    map.on("error", (e) => {
      if (
        typeof e.error?.message === "string" &&
        e.error.message.toLowerCase().includes("tile") &&
        !tileError
      ) {
        setTileError(true);
        const src = map.getSource("tiles") as maplibregl.RasterTileSource | undefined;
        if (src) {
          // Swap to OSM
          map.getStyle().layers.forEach((l) => {
            if (l.id === "tiles") map.removeLayer("tiles");
          });
          map.removeSource("tiles");
          map.addSource("tiles-osm", {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          });
          map.addLayer({ id: "tiles-osm", type: "raster", source: "tiles-osm" }, "route-bg");
        }
      }
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
    map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");
    mapRef.current = map;

    map.on("load", () => loadRoute(map));

    return () => {
      map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Load route ──────────────────────────────────────────────────────────────
  const loadRoute = useCallback(async (map: maplibregl.Map) => {
    try {
      const url =
        `${OSRM}/route/v1/driving/` +
        `${ORIGIN[0]},${ORIGIN[1]};${DEST[0]},${DEST[1]}` +
        `?overview=full&geometries=polyline`;

      const data = await fetch(url).then((r) => r.json());
      if (data.code !== "Ok") throw new Error("Route error");

      const route  = data.routes[0];
      const coords = decodePolyline(route.geometry);
      coordsRef.current = coords;
      setRouteInfo({ distance: route.distance, duration: route.duration });
      setEta(fmtTime(route.duration));

      // Route layers
      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: coords },
        },
      });
      map.addLayer({
        id: "route-bg",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#6B4FE8", "line-width": 16, "line-opacity": 0.2 },
      });
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#402F75", "line-width": 6, "line-opacity": 0.95 },
      });

      // Destination pin
      const destEl = document.createElement("div");
      destEl.className = "dest-pin";
      new maplibregl.Marker({ element: destEl }).setLngLat(DEST).addTo(map);

      // Courier marker
      const el     = makeCourierEl();
      const marker = new maplibregl.Marker({ element: el, rotationAlignment: "map" })
        .setLngLat(ORIGIN)
        .addTo(map);
      markerRef.current = marker;

      // Fit bounds with 3D pitch
      const bounds = coords.reduce(
        (b, c) => b.extend(c as maplibregl.LngLatLike),
        new maplibregl.LngLatBounds(coords[0], coords[0])
      );
      map.fitBounds(bounds, { padding: 80, pitch: 45, duration: 1500 });
    } catch {
      setRouteError("OSRM unreachable — verify port 5000 is accessible.");
    }
  }, []);

  // ── Sync tilt & bearing to map ──────────────────────────────────────────────
  useEffect(() => { mapRef.current?.setPitch(tilt); }, [tilt]);

  // ── ETA recalc ──────────────────────────────────────────────────────────────
  const recalcETA = useCallback((pos: [number, number]) => {
    const coords = coordsRef.current;
    if (!coords.length) return;
    const idx      = closestIdx(pos, coords);
    const remaining = coords.slice(idx);
    const dist      = remaining.reduce(
      (acc, c, i) => (i === 0 ? acc : acc + haversine(remaining[i - 1], c)),
      0
    );
    setEta(fmtTime(dist / (30 / 3.6))); // 30 km/h avg speed
  }, []);

  const moveCourier = useCallback(
    (pos: [number, number], hdg: number) => {
      markerRef.current?.setLngLat(pos).setRotation(hdg);
      headingRef.current = hdg;
      recalcETA(pos);
    },
    [recalcETA]
  );

  // ── Simulation fallback ─────────────────────────────────────────────────────
  const stopSim = useCallback(() => {
    if (simTimer.current) { clearInterval(simTimer.current); simTimer.current = null; }
    setSimMode(false);
  }, []);

  const startSim = useCallback(() => {
    if (simTimer.current) return;
    setSimMode(true);
    let idx = 0;
    simTimer.current = setInterval(() => {
      const coords = coordsRef.current;
      if (!coords.length) return;
      if (idx >= coords.length - 1) idx = 0;
      const curr = coords[idx];
      const next = coords[Math.min(idx + 1, coords.length - 1)];
      moveCourier(curr, computeBearing(curr, next));
      idx += 2;
    }, 250);
  }, [moveCourier]);

  // ── Live GPS + device orientation + WebSocket ───────────────────────────────
  useEffect(() => {
    if (!liveMode) {
      stopSim();
      wsRef.current?.close();
      if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
      return;
    }

    // Device orientation → map bearing + marker rotation
    const onOrientation = (e: DeviceOrientationEvent) => {
      const ext = e as DeviceOrientationEvent & { webkitCompassHeading?: number };
      const hdg = ext.webkitCompassHeading ?? (e.alpha !== null ? (360 - e.alpha) % 360 : null);
      if (hdg !== null) {
        mapRef.current?.setBearing(hdg);
        markerRef.current?.setRotation(hdg);
        headingRef.current = hdg;
      }
    };

    const attachOrientation = () => {
      window.addEventListener("deviceorientationabsolute", onOrientation as EventListener);
      window.addEventListener("deviceorientation", onOrientation as EventListener);
    };

    if (typeof DeviceOrientationEvent !== "undefined") {
      const doe = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
        requestPermission?: () => Promise<string>;
      };
      if (typeof doe.requestPermission === "function") {
        doe.requestPermission().then((r) => { if (r === "granted") attachOrientation(); });
      } else {
        attachOrientation();
      }
    }

    // Geolocation watchPosition
    if (navigator.geolocation) {
      watchRef.current = navigator.geolocation.watchPosition(
        ({ coords }) => {
          const pos: [number, number] = [coords.longitude, coords.latitude];
          moveCourier(pos, coords.heading ?? headingRef.current);
          mapRef.current?.easeTo({ center: pos, duration: 600 });
        },
        () => startSim(),
        { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
      );
    } else {
      startSim();
    }

    // WebSocket live GPS feed
    try {
      // Expects JSON: { lng: number, lat: number, heading?: number }
      const ws = new WebSocket(`ws://${BASE_HOST}:5000`);
      ws.onopen    = () => setWsOk(true);
      ws.onmessage = (e) => {
        try {
          const { lng, lat, heading: h } = JSON.parse(e.data as string) as {
            lng: number; lat: number; heading?: number;
          };
          const pos: [number, number] = [lng, lat];
          moveCourier(pos, h ?? headingRef.current);
          mapRef.current?.easeTo({ center: pos, duration: 400 });
          stopSim(); // real data received — stop simulation
        } catch { /* malformed frame */ }
      };
      ws.onerror = () => setWsOk(false);
      ws.onclose = () => setWsOk(false);
      wsRef.current = ws;
    } catch { /* WS not available */ }

    return () => {
      window.removeEventListener("deviceorientationabsolute", onOrientation as EventListener);
      window.removeEventListener("deviceorientation", onOrientation as EventListener);
      if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
      wsRef.current?.close();
      stopSim();
    };
  }, [liveMode, moveCourier, startSim, stopSim]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col w-full" style={{ height: "100%" }}>
      <div className="flex items-center flex-wrap gap-3 px-4 py-3 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm z-10">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#402F75] inline-block" />
          <span className="text-sm font-semibold text-[#402F75]">Delivery Route</span>
        </div>

        {routeInfo && (
          <>
            <span className="text-sm text-gray-600">{fmtDist(routeInfo.distance)}</span>
            <span className="text-gray-300">·</span>
            <span className="text-sm text-gray-600">{fmtTime(routeInfo.duration)}</span>
          </>
        )}

        {eta && (
          <div className="flex items-center gap-1 bg-[#402F75]/10 px-3 py-1 rounded-full">
            <span className="text-xs text-[#402F75] font-medium">ETA</span>
            <span className="text-sm font-bold text-[#402F75] tabular-nums">{eta}</span>
          </div>
        )}

        <div className="ms-auto flex items-center gap-2">
          {tileError && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              OSM fallback
            </span>
          )}
          {wsOk && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
              WS Live
            </span>
          )}
          {simMode && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block" />
              Simulation
            </span>
          )}
          {routeError && (
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
              {routeError}
            </span>
          )}
        </div>
      </div>

      {/* Map + floating controls */}
      <div className="relative" style={{ flex: 1, minHeight: 0 }}>
        <div ref={ctnRef} style={{ position: "absolute", inset: 0 }} />

        {/* Controls panel */}
        <div className="absolute bottom-6 end-4 z-10 flex flex-col gap-2 items-end">
          {/* Live GPS toggle */}
          <button
            onClick={() => setLiveMode((p) => !p)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-lg transition-all ${
              liveMode
                ? "bg-[#402F75] text-white"
                : "bg-white text-[#402F75] border border-[#402F75]/50 hover:border-[#402F75]"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                liveMode ? "bg-white animate-pulse" : "bg-[#402F75]"
              }`}
            />
            {liveMode ? "Live GPS On" : "Start Live GPS"}
          </button>

          {/* Simulate button (when live is on) */}
          {liveMode && !wsOk && !simMode && (
            <button
              onClick={startSim}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-lg bg-[#FBBB14] text-gray-900 hover:bg-[#e6a800] transition-colors"
            >
              Simulate Courier
            </button>
          )}

          {/* 3D Tilt slider */}
          <div className="bg-white/92 backdrop-blur rounded-xl px-3 py-2.5 shadow-lg">
            <label className="text-xs text-gray-500 block mb-1.5 font-medium">
              3D Tilt: {tilt}°
            </label>
            <input
              type="range"
              min={0}
              max={60}
              step={5}
              value={tilt}
              onChange={(e) => setTilt(Number(e.target.value))}
              className="w-32 accent-[#402F75]"
            />
          </div>
        </div>

        {/* Legend */}
        <div className="absolute top-3 start-3 z-10 bg-white/90 backdrop-blur rounded-xl px-3 py-2 shadow text-xs text-gray-600 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-base">🚴</span>
            <span>Courier (pulsing)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FBBB14] border border-white shadow-sm inline-block" />
            <span>Destination</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-1 rounded-full bg-[#402F75] inline-block" />
            <span>Route (OSRM)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
