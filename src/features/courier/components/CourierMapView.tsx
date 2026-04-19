'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  getCouriersForMap,
  type CourierMapEntry,
  type CourierStatus,
  type VehicleType,
  type CourierMapFilters,
} from '../services/courierMapService';

const TILES = 'http://5.189.132.250:8090';
const POLL_INTERVAL_MS = 10_000;

// Marker color by courier status + availability
function markerColor(c: CourierMapEntry): string {
  if (c.status === 'SUSPENDED') return '#ef4444'; // red
  if (c.status === 'OFFLINE')   return '#9ca3af'; // gray
  if (c.isAvailable)            return '#22c55e'; // green
  return '#f59e0b';                               // amber — active but busy
}

function vehicleIcon(v: VehicleType): string {
  switch (v) {
    case 'BICYCLE': return '🚴';
    case 'FOOT':    return '🚶';
    case 'SCOOTER': return '🛵';
    case 'CAR':     return '🚗';
  }
}

function makeMarkerEl(courier: CourierMapEntry): HTMLDivElement {
  const color = markerColor(courier);
  const el = document.createElement('div');
  el.style.cssText = `
    width:38px;height:38px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);
    background:${color};display:flex;align-items:center;justify-content:center;
    box-shadow:0 2px 8px rgba(0,0,0,.4);cursor:pointer;border:2px solid white;
  `;
  const icon = document.createElement('span');
  icon.style.transform = 'rotate(45deg)';
  icon.style.fontSize = '16px';
  icon.textContent = vehicleIcon(courier.vehicleType);
  el.appendChild(icon);
  return el;
}

function popupHTML(c: CourierMapEntry): string {
  const loc = c.latestLocation;
  const lastSeen = loc
    ? `${new Date(loc.recordedAt).toLocaleTimeString()} · ${loc.speed != null ? `${Number(loc.speed).toFixed(1)} km/h` : '—'}`
    : 'No location data';
  const statusStyle = ({
    ACTIVE:    'background:#dcfce7;color:#15803d',
    OFFLINE:   'background:#f3f4f6;color:#4b5563',
    SUSPENDED: 'background:#fee2e2;color:#b91c1c',
  } as Record<string, string>)[c.status] ?? '';

  return `
    <div style="font-family:sans-serif;min-width:200px;padding:4px 0">
      <div style="font-weight:600;font-size:14px;margin-bottom:6px">
        ${vehicleIcon(c.vehicleType)} ${c.firstName} ${c.lastName}
      </div>
      <div style="font-size:12px;color:#555;margin-bottom:4px">${c.phone}</div>
      <span style="display:inline-block;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;${statusStyle}"
            >${c.status}${c.isAvailable ? ' · Available' : ' · Busy'}</span>
      <div style="margin-top:8px;font-size:11px;color:#777">
        <div>Vehicle: ${c.vehicleType}</div>
        <div>Rating: ${c.rating != null ? Number(c.rating).toFixed(1) + ' ★' : '—'}</div>
        <div>Last ping: ${lastSeen}</div>
      </div>
    </div>
  `;
}

// ── Filters bar ───────────────────────────────────────────────────────────────

function FiltersBar({ filters, onChange }: {
  filters: CourierMapFilters;
  onChange: (f: CourierMapFilters) => void;
}) {
  const statuses: CourierStatus[]  = ['ACTIVE', 'OFFLINE', 'SUSPENDED'];
  const vehicles: VehicleType[]    = ['BICYCLE', 'FOOT', 'SCOOTER', 'CAR'];

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm z-10">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</span>
      {statuses.map(s => (
        <button key={s} onClick={() => onChange({ ...filters, status: filters.status === s ? undefined : s })}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
            filters.status === s ? 'bg-[#402F75] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}>{s}</button>
      ))}
      <span className="ml-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vehicle</span>
      {vehicles.map(v => (
        <button key={v} onClick={() => onChange({ ...filters, vehicleType: filters.vehicleType === v ? undefined : v })}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
            filters.vehicleType === v ? 'bg-[#402F75] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}>{vehicleIcon(v)} {v}</button>
      ))}
      <button onClick={() => onChange({ ...filters, isAvailable: filters.isAvailable == null ? true : undefined })}
        className={`ml-3 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
          filters.isAvailable === true ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}>Available only</button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CourierMapView() {
  const ctnRef    = useRef<HTMLDivElement>(null);
  const mapRef    = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());

  const [couriers, setCouriers]     = useState<CourierMapEntry[]>([]);
  const [filters, setFilters]       = useState<CourierMapFilters>({});
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [error, setError]           = useState<string | null>(null);

  // Fetch and refresh courier data
  const fetchCouriers = useCallback(async () => {
    try {
      const data = await getCouriersForMap(filters);
      setCouriers(data);
      setLastRefresh(new Date());
      setError(null);
    } catch {
      setError('Failed to load courier locations');
    }
  }, [filters]);

  // Init map
  useEffect(() => {
    if (!ctnRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: ctnRef.current,
      style: {
        version: 8,
        sources: { tiles: { type: 'raster', tiles: [`${TILES}/tile/{z}/{x}/{y}.png`], tileSize: 256 } },
        layers: [{ id: 'tiles', type: 'raster', source: 'tiles' }],
      },
      center: [49.8671, 40.4093], // Baku default center
      zoom: 11,
    });
    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Update markers whenever courier data changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const incoming = new Set(couriers.map(c => c.id));

    // Remove markers for couriers no longer in response
    markersRef.current.forEach((marker, id) => {
      if (!incoming.has(id)) { marker.remove(); markersRef.current.delete(id); }
    });

    couriers.forEach(courier => {
      if (!courier.latestLocation) return;
      const { longitude, latitude } = courier.latestLocation;
      const lngLat: [number, number] = [Number(longitude), Number(latitude)];

      if (markersRef.current.has(courier.id)) {
        // Update position
        markersRef.current.get(courier.id)!.setLngLat(lngLat);
      } else {
        // Create new marker
        const el = makeMarkerEl(courier);
        const popup = new maplibregl.Popup({ offset: 25, closeButton: false })
          .setHTML(popupHTML(courier));
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(lngLat)
          .setPopup(popup)
          .addTo(map);
        el.addEventListener('click', () => marker.togglePopup());
        markersRef.current.set(courier.id, marker);
      }
    });
  }, [couriers]);

  // Initial fetch + polling
  useEffect(() => {
    fetchCouriers();
    const timer = setInterval(fetchCouriers, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [fetchCouriers]);

  const withLocation = couriers.filter(c => c.latestLocation).length;

  return (
    <div className="flex flex-col w-full h-full">
      <FiltersBar filters={filters} onChange={f => { setFilters(f); }} />

      {/* Stats bar */}
      <div className="flex items-center gap-4 px-4 py-2 bg-white border-b border-gray-100 text-xs text-gray-600">
        <span><span className="font-semibold text-gray-900">{couriers.length}</span> couriers total</span>
        <span><span className="font-semibold text-gray-900">{withLocation}</span> with location</span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
          Refreshes every 10 s
          {lastRefresh && <span className="text-gray-400">· {lastRefresh.toLocaleTimeString()}</span>}
        </span>
        {error && <span className="text-red-500">{error}</span>}
      </div>

      <div className="relative flex-1 min-h-0">
        <div ref={ctnRef} className="absolute inset-0" />

        {/* Legend — inside relative container so absolute positioning is scoped to the map */}
        <div className="absolute bottom-8 left-4 z-10 bg-white/90 backdrop-blur rounded-xl px-3 py-2 shadow text-xs text-gray-600 space-y-1">
          {[
            { color: '#22c55e', label: 'Active · Available' },
            { color: '#f59e0b', label: 'Active · Busy' },
            { color: '#9ca3af', label: 'Offline' },
            { color: '#ef4444', label: 'Suspended' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full inline-block" style={{ background: color }} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
