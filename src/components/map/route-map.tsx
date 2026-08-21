import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { YANGON_CENTER, type LatLng, type PickupPoint, type Route } from "@/lib/mockData";

const BRAND = "#F75514";
const MUTED = "#94a3b8";

function pinIcon(opts: { color: string; size: number; label?: string; pulse?: boolean }) {
  const { color, size, label = "", pulse = false } = opts;
  return L.divIcon({
    className: "ttn-marker",
    html: `<span style="
      display:flex;align-items:center;justify-content:center;
      width:${size}px;height:${size}px;border-radius:9999px;
      background:${color};color:#fff;font:700 11px/1 Inter,sans-serif;
      border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);
      ${pulse ? "animation: ttn-pin-pulse 1.6s ease-out infinite;" : ""}
    ">${label}</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function FitBounds({ positions }: { positions: LatLng[] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length === 0) return;
    map.fitBounds(L.latLngBounds(positions.map((p) => L.latLng(p[0], p[1]))), {
      padding: [36, 36],
      maxZoom: 15,
    });
  }, [map, positions]);
  return null;
}

/** Free-form pin, used by the location-search preview map. */
export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  color?: string;
  size?: number;
  pulse?: boolean;
  title?: string;
};

export type RouteMapProps = {
  routes: Route[];
  selectedRouteId?: string | null;
  onSelectRoute?: (id: string) => void;
  points?: PickupPoint[];
  pickupId?: string | null;
  destinationId?: string | null;
  onSelectPoint?: (id: string) => void;
  vehicle?: LatLng | null;
  /** Passenger's approximate location (real geolocation, when granted). */
  userLocation?: LatLng | null;
  /** Optional label bubble rendered next to the vehicle marker. */
  vehicleLabel?: string | undefined;
  fitTo?: LatLng[];
  locateNonce?: number;
  /** Per-route polyline colour override (used for the simulated traffic view). */
  routeColors?: Record<string, string>;
  /** Ad-hoc pins (search suggestions, pickup/drop preview). */
  markers?: MapMarker[] | undefined;
  /** Straight connector drawn between arbitrary coordinates. */
  line?: LatLng[] | undefined;
};

/** Mock "locate me" — recentres on a Yangon location instead of real GPS. */
const MOCK_USER_LOCATION: LatLng = [16.8261, 96.1385];

function LocateHandler({ nonce }: { nonce: number }) {
  const map = useMap();
  useEffect(() => {
    if (!nonce) return;
    map.flyTo(MOCK_USER_LOCATION, 14, { duration: 0.8 });
  }, [map, nonce]);
  return null;
}

export default function RouteMap({
  routes,
  selectedRouteId = null,
  onSelectRoute,
  points = [],
  pickupId = null,
  destinationId = null,
  onSelectPoint,
  vehicle = null,
  userLocation = null,
  vehicleLabel,
  fitTo,
  locateNonce = 0,
  routeColors,
  markers = [],
  line,
}: RouteMapProps) {
  const bounds = useMemo<LatLng[]>(() => {
    if (fitTo?.length) return fitTo;
    if (markers.length) return markers.map((m) => [m.lat, m.lng] as LatLng);
    const active = routes.find((r) => r.id === selectedRouteId);
    return active ? active.path : routes.flatMap((r) => r.path);
  }, [fitTo, markers, routes, selectedRouteId]);

  return (
    <MapContainer
      center={YANGON_CENTER}
      zoom={12}
      scrollWheelZoom={false}
      className="h-full w-full"
      attributionControl
    >
      {/* CARTO Positron: free, no API key, muted base so the brand-orange
          route line and markers stay legible on small mobile maps. */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        subdomains={["a", "b", "c", "d"]}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      <FitBounds positions={bounds} />
      <LocateHandler nonce={locateNonce} />
      {locateNonce ? (
        <Marker
          position={MOCK_USER_LOCATION}
          icon={pinIcon({ color: "#2563eb", size: 18, pulse: true })}
          title="You are here"
        />
      ) : null}
      {userLocation ? (
        <Marker
          position={userLocation}
          icon={pinIcon({ color: "#2563eb", size: 18, pulse: true })}
          title="Your location"
        />
      ) : null}

      {routes.map((route) => {
        const active = route.id === selectedRouteId;
        return (
          <Polyline
            key={route.id}
            positions={route.path}
            pathOptions={{
              color: routeColors?.[route.id] ?? (active ? BRAND : MUTED),
              weight: routeColors ? 5 : active ? 6 : 4,
              opacity: routeColors ? 0.9 : active ? 1 : 0.55,
            }}
            eventHandlers={{ click: () => onSelectRoute?.(route.id) }}
          />
        );
      })}

      {line && line.length > 1 ? (
        <Polyline
          positions={line}
          pathOptions={{ color: BRAND, weight: 4, opacity: 0.8, dashArray: "8 8" }}
        />
      ) : null}

      {markers.map((m) => (
        <Marker
          key={m.id}
          position={[m.lat, m.lng]}
          icon={pinIcon({
            color: m.color ?? MUTED,
            size: m.size ?? 22,
            label: m.label ?? "",
            pulse: m.pulse ?? false,
          })}
          title={m.title ?? m.label ?? ""}
        />
      ))}


      {points.map((p) => {
        const isPickup = p.id === pickupId;
        const isDest = p.id === destinationId;
        const selected = isPickup || isDest;
        return (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={pinIcon({
              color: selected ? BRAND : "#334155",
              size: selected ? 28 : 20,
              label: String(p.sequence),
              pulse: selected,
            })}
            title={p.name}
            eventHandlers={{ click: () => onSelectPoint?.(p.id) }}
          />
        );
      })}

      {vehicle ? (
        <Marker
          position={vehicle}
          icon={
            vehicleLabel
              ? L.divIcon({
                  className: "ttn-marker",
                  html: `<span style="display:flex;align-items:center;gap:6px;white-space:nowrap;
                    padding:5px 10px 5px 6px;border-radius:9999px;background:#0f172a;color:#fff;
                    font:600 11px/1 Inter,sans-serif;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.4)">
                    <span style="font-size:12px">▲</span>${vehicleLabel}</span>`,
                  iconSize: [10, 10],
                  iconAnchor: [12, 12],
                })
              : pinIcon({ color: "#0f172a", size: 26, label: "▲" })
          }
          title="Your vehicle"
        />
      ) : null}
    </MapContainer>
  );
}