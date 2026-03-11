"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons (webpack issue with Leaflet)
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const OSRM_URL =
  "http://5.189.132.250:5000/route/v1/driving/49.8671,40.4093;49.851,40.4236?overview=full&geometries=polyline";

// Decode Google/OSRM encoded polyline (precision 5)
function decodePolyline(encoded: string): [number, number][] {
  const coords: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coords.push([lat / 1e5, lng / 1e5]);
  }

  return coords;
}

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      map.fitBounds(positions, { padding: [40, 40] });
    }
  }, [map, positions]);
  return null;
}

interface RouteData {
  geometry: string;
  distance: number;
  duration: number;
  waypoints: { location: [number, number]; name: string }[];
}

export default function MapView() {
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(OSRM_URL)
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "Ok") {
          setRouteData({
            geometry: data.routes[0].geometry,
            distance: data.routes[0].distance,
            duration: data.routes[0].duration,
            waypoints: data.waypoints.map((wp: { location: [number, number]; name: string }) => ({
              location: [wp.location[1], wp.location[0]] as [number, number], // flip lon/lat → lat/lon
              name: wp.name || "Waypoint",
            })),
          });
        } else {
          setError("Failed to load route.");
        }
      })
      .catch(() => setError("Network error — could not reach routing server."))
      .finally(() => setLoading(false));
  }, []);

  const routePositions = routeData ? decodePolyline(routeData.geometry) : [];
  const origin = routeData?.waypoints[0];
  const destination = routeData?.waypoints[1];

  const formatDuration = (seconds: number) => {
    const mins = Math.round(seconds / 60);
    return mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}min`;
  };

  const formatDistance = (meters: number) => {
    return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Info bar */}
      <div className="flex items-center gap-4 px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#402F75]" />
          <span className="text-sm font-medium text-gray-700">Route</span>
        </div>
        {routeData && (
          <>
            <span className="text-sm text-gray-500">
              {formatDistance(routeData.distance)}
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-sm text-gray-500">
              {formatDuration(routeData.duration)}
            </span>
          </>
        )}
        {loading && <span className="text-sm text-gray-400">Loading route...</span>}
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={[40.416, 49.858]}
          zoom={13}
          className="w-full h-full"
          style={{ minHeight: "500px" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {routePositions.length > 0 && (
            <>
              <FitBounds positions={routePositions} />
              <Polyline
                positions={routePositions}
                pathOptions={{ color: "#402F75", weight: 5, opacity: 0.85 }}
              />
            </>
          )}

          {origin && (
            <Marker position={origin.location}>
              <Popup>
                <strong>Start</strong>
                {origin.name && <div>{origin.name}</div>}
              </Popup>
            </Marker>
          )}

          {destination && (
            <Marker position={destination.location}>
              <Popup>
                <strong>Destination</strong>
                {destination.name && <div>{destination.name}</div>}
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
