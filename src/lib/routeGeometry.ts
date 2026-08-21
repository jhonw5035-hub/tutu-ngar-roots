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

import { fetchRoadPath } from "@/lib/road-path";

import {
  pickupPoints as rawPickupPoints,
  routes as rawRoutes,
  type LatLng,
  type PickupPoint,
  type Route,
} from "@/lib/mockData";

async function fetchCorridorGeometry(route: Route): Promise<LatLng[]> {
  // Single shared source of road geometry for the whole app.
  return fetchRoadPath(route.path);
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
        await sleep(120);
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
