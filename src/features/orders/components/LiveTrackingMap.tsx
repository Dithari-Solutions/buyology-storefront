"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getAccessToken } from "@/shared/lib/tokenManager";
import type { OrderDetail } from "../types";

// ── Courier Marker CSS ────────────────────────────────────────────────────────
const MAP_CSS = `
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

.marker-pin {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}
.store-pin { background: #3B82F6; }
.delivery-pin { background: #10B981; }
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

function makePinEl(type: "store" | "delivery"): HTMLDivElement {
    const el = document.createElement("div");
    el.className = `marker-pin ${type}-pin`;
    el.innerHTML = type === "store" ? "S" : "D";
    return el;
}

interface CourierLocation {
    courierId: string;
    latitude: number;
    longitude: number;
    heading: number;
    speed: number;
    recordedAt: string;
}

interface LiveTrackingMapProps {
    order: OrderDetail;
    onClose: () => void;
}

export default function LiveTrackingMap({ order, onClose }: LiveTrackingMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const courierMarker = useRef<maplibregl.Marker | null>(null);
    const clientRef = useRef<Client | null>(null);

    const [courierLocation, setCourierLocation] = useState<CourierLocation | null>(null);
    const [connected, setConnected] = useState(false);

    // Inject CSS
    useEffect(() => {
        if (document.getElementById("live-track-css")) return;
        const s = document.createElement("style");
        s.id = "live-track-css";
        s.textContent = MAP_CSS;
        document.head.appendChild(s);
    }, []);

    // Initialize Map
    useEffect(() => {
        if (!mapContainer.current) return;

        const m = new maplibregl.Map({
            container: mapContainer.current,
            style: {
                version: 8,
                sources: {
                    osm: {
                        type: "raster",
                        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                        tileSize: 256,
                        attribution: "© OpenStreetMap contributors",
                    },
                },
                layers: [
                    {
                        id: "osm",
                        type: "raster",
                        source: "osm",
                    },
                ],
            },
            center: [
                order.deliveryLongitude || 0,
                order.deliveryLatitude || 0
            ],
            zoom: 13,
        });

        // Use custom style for raster tiles if needed
        m.on("load", () => {
            // Store Marker
            if (order.storeLatitude && order.storeLongitude) {
                new maplibregl.Marker({ element: makePinEl("store") })
                    .setLngLat([order.storeLongitude, order.storeLatitude])
                    .setPopup(new maplibregl.Popup().setHTML("<b>Store</b>"))
                    .addTo(m);
            }

            // Delivery Marker
            if (order.deliveryLatitude && order.deliveryLongitude) {
                new maplibregl.Marker({ element: makePinEl("delivery") })
                    .setLngLat([order.deliveryLongitude, order.deliveryLatitude])
                    .setPopup(new maplibregl.Popup().setHTML("<b>Delivery Address</b>"))
                    .addTo(m);
            }

            // Initial Courier Position (from latest tracking event)
            const latestCourierEvent = [...order.trackingHistory]
                .filter(e => e.actorRole === "COURIER" && e.latitude != null && e.longitude != null)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

            if (latestCourierEvent) {
                const marker = new maplibregl.Marker({ element: makeCourierEl(), rotationAlignment: "map" })
                    .setLngLat([latestCourierEvent.longitude!, latestCourierEvent.latitude!])
                    .addTo(m);
                courierMarker.current = marker;
            }

            // Fit bounds
            const bounds = new maplibregl.LngLatBounds();
            if (order.storeLatitude && order.storeLongitude) bounds.extend([order.storeLongitude, order.storeLatitude]);
            if (order.deliveryLatitude && order.deliveryLongitude) bounds.extend([order.deliveryLongitude, order.deliveryLatitude]);
            if (latestCourierEvent) bounds.extend([latestCourierEvent.longitude!, latestCourierEvent.latitude!]);
            
            if (!bounds.isEmpty()) {
                m.fitBounds(bounds, { padding: 80 });
            }
        });

        m.addControl(new maplibregl.NavigationControl(), "top-right");
        map.current = m;

        return () => m.remove();
    }, [order]);

    // WebSocket for live location
    useEffect(() => {
        const token = getAccessToken();
        if (!token) return;

        const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
        const wsUrl = `${baseURL.replace(/^http/, "ws")}/ws`;

        const client = new Client({
            webSocketFactory: () => new SockJS(wsUrl),
            connectHeaders: {
                Authorization: `Bearer ${token}`,
                "X-Client-Type": "WEB",
            },
            onConnect: () => {
                setConnected(true);
                client.subscribe(`/topic/orders/${order.id}/location`, (message) => {
                    const loc = JSON.parse(message.body) as CourierLocation;
                    setCourierLocation(loc);
                    
                    if (map.current) {
                        if (!courierMarker.current) {
                            courierMarker.current = new maplibregl.Marker({ element: makeCourierEl(), rotationAlignment: "map" })
                                .setLngLat([loc.longitude, loc.latitude])
                                .addTo(map.current);
                        } else {
                            courierMarker.current.setLngLat([loc.longitude, loc.latitude]);
                            if (loc.heading) courierMarker.current.setRotation(loc.heading);
                        }
                        
                        // Optionally ease to courier location
                        // map.current.easeTo({ center: [loc.longitude, loc.latitude], duration: 1000 });
                    }
                });
            },
            onDisconnect: () => setConnected(false),
            onStompError: () => setConnected(false),
            reconnectDelay: 5000,
        });

        client.activate();
        clientRef.current = client;

        return () => {
            client.deactivate();
        };
    }, [order.id]);

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white/95 backdrop-blur shadow-sm">
                <div>
                    <h2 className="text-[16px] font-bold text-gray-900">Track Your Order</h2>
                    <p className="text-[12px] text-gray-500">#{order.id.slice(-8).toUpperCase()} • Live Tracking</p>
                </div>
                <div className="flex items-center gap-4">
                    {connected ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-100">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[11px] font-bold text-green-600">Connected</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-50 border border-yellow-100">
                            <span className="w-2 h-2 rounded-full bg-yellow-500" />
                            <span className="text-[11px] font-bold text-yellow-600">Reconnecting...</span>
                        </div>
                    )}
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Map Container */}
            <div ref={mapContainer} className="flex-1 w-full h-full relative" />

            {/* Bottom Info Card */}
            {courierLocation && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] bg-white rounded-2xl shadow-xl border border-gray-100 p-5 flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="w-12 h-12 rounded-full bg-[#402F75] flex items-center justify-center text-white font-bold text-xl">
                        {order.courierName?.charAt(0).toUpperCase() || "C"}
                    </div>
                    <div className="flex-1">
                        <p className="text-[14px] font-bold text-gray-900">{order.courierName || "Courier"}</p>
                        <p className="text-[12px] text-gray-500">
                            Speed: {Math.round(courierLocation.speed)} km/h • Updated just now
                        </p>
                    </div>
                    {order.courierPhone && (
                        <a 
                            href={`tel:${order.courierPhone}`}
                            className="p-3 rounded-full bg-gray-50 text-[#402F75] hover:bg-gray-100 transition-colors"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                            </svg>
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}
