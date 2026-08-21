/**
 * Road-snapped corridor geometry.
 *
 * Corridor paths in mockData are hand-placed guesses that cut across blocks.
 * Here we ask OSRM to route between each corridor's real endpoints and use the
 * returned GeoJSON geometry as the Leaflet polyline, so the line follows the
 * actual street.
 *
 * NOTE: router.project-osrm.org is OSRM's *public demo* instance. It is rate
 * limited and intended for light/demo use only — perfect for this hackathon
 * prototype, but not for production traffic. Results are cached in memory and
 * in sessionStorage so each corridor is fetched at most once per session.
 */
import { useEffect, useState } from "react";

import {
  pickupPoints as rawPickupPoints,
  routes as rawRoutes,
  type LatLng,
  type PickupPoint,
  type Route,
} from "@/lib/mockData";

const OSRM = "https://router.project-osrm.org/route/v1/driving";
const memoryCache = new Map<string, LatLng[]>();

function storageKey(id: string) {
  return `ttn:osrm:${id}`;
}

function readSession(id: string): LatLng[] | null {
  try {
    const raw = sessionStorage.getItem(storageKey(id));
    return raw ? (JSON.parse(raw) as LatLng[]) : null;
  } catch {
    return null;
  }
}

function writeSession(id: string, path: LatLng[]) {
  try {
    sessionStorage.setItem(storageKey(id), JSON.stringify(path));
  } catch {
    /* quota / private mode — cache in memory only */
  }
}

async function fetchCorridorGeometry(route: Route): Promise<LatLng[]> {
  const cached = memoryCache.get(route.id) ?? readSession(route.id);
  if (cached?.length) {
    memoryCache.set(route.id, cached);
    return cached;
  }

  const start = route.path[0]!;
  const end = route.path[route.path.length - 1]!;
  // Include the hand-placed mid points as via-waypoints so OSRM keeps the line
  // on the intended corridor rather than picking a faster parallel road.
  const coords = route.path.map((p) => `${p[1]},${p[0]}`).join(";");
  const url = `${OSRM}/${coords}?overview=full&geometries=geojson`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`OSRM ${res.status}`);
  const data = (await res.json()) as {
    routes?: { geometry?: { coordinates?: [number, number][] } }[];
  };
  const line = data.routes?.[0]?.geometry?.coordinates;
  if (!line?.length) throw new Error("OSRM returned no geometry");

  const path: LatLng[] = line.map(([lng, lat]) => [lat, lng] as LatLng);
  void start;
  void end;
  memoryCache.set(route.id, path);
  writeSession(route.id, path);
  return path;
}

/** Nearest point on a polyline, so markers sit exactly on the drawn road. */
export function snapToPath(point: LatLng, path: LatLng[]): LatLng {
  if (path.length < 2) return point;
  let best = path[0]!;
  let bestDist = Infinity;

  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i]!;
    const b = path[i + 1]!;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = dx * dx + dy * dy;
    const t =
      len === 0
        ? 0
        : Math.max(0, Math.min(1, ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / len));
    const proj: LatLng = [a[0] + dx * t, a[1] + dy * t];
    const d = (proj[0] - point[0]) ** 2 + (proj[1] - point[1]) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = proj;
    }
  }
  return best;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function useSnappedCorridors() {
  const [routes, setRoutes] = useState<Route[]>(rawRoutes);
  const [points, setPoints] = useState<PickupPoint[]>(rawPickupPoints);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const nextRoutes: Route[] = [];
      for (const route of rawRoutes) {
        try {
          const path = await fetchCorridorGeometry(route);
          nextRoutes.push({ ...route, path });
        } catch {
          nextRoutes.push(route); // fall back to the hand-placed path
        }
        // be a good citizen with the free demo server
        if (!memoryCache.has(route.id)) await sleep(350);
      }
      if (cancelled) return;

      const byId = new Map(nextRoutes.map((r) => [r.id, r]));
      const nextPoints = rawPickupPoints.map((p) => {
        const path = byId.get(p.routeId)?.path;
        if (!path) return p;
        const [lat, lng] = snapToPath([p.lat, p.lng], path);
        return { ...p, lat, lng };
      });

      setRoutes(nextRoutes);
      setPoints(nextPoints);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { routes, points, loading };
}
