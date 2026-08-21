/**
 * Shared road-snapped route geometry.
 *
 * Single source of truth for every map line in the app. Any screen that wants
 * to draw a route between two or more coordinates must go through this module
 * so the polyline follows the real street grid (OSRM) instead of being a
 * straight line between raw coordinates.
 *
 * Results are cached in memory + sessionStorage keyed by the waypoints, so a
 * corridor is fetched at most once per session.
 */
import { useEffect, useState } from "react";

import type { LatLng } from "@/lib/mockData";

const OSRM = "https://router.project-osrm.org/route/v1/driving";
const memoryCache = new Map<string, LatLng[]>();
const inflight = new Map<string, Promise<LatLng[]>>();

function keyFor(waypoints: LatLng[]) {
  return waypoints.map(([lat, lng]) => `${lat.toFixed(5)},${lng.toFixed(5)}`).join("|");
}

function readSession(key: string): LatLng[] | null {
  try {
    const raw = sessionStorage.getItem(`ttn:road:${key}`);
    return raw ? (JSON.parse(raw) as LatLng[]) : null;
  } catch {
    return null;
  }
}

function writeSession(key: string, path: LatLng[]) {
  try {
    sessionStorage.setItem(`ttn:road:${key}`, JSON.stringify(path));
  } catch {
    /* quota / private mode — memory cache only */
  }
}

/** Road-snapped polyline through the given waypoints (falls back to input). */
export async function fetchRoadPath(waypoints: LatLng[]): Promise<LatLng[]> {
  if (waypoints.length < 2) return waypoints;
  const key = keyFor(waypoints);

  const cached = memoryCache.get(key) ?? readSession(key);
  if (cached?.length) {
    memoryCache.set(key, cached);
    return cached;
  }
  const pending = inflight.get(key);
  if (pending) return pending;

  const coords = waypoints.map((p) => `${p[1]},${p[0]}`).join(";");
  const request = (async () => {
    try {
      const res = await fetch(`${OSRM}/${coords}?overview=full&geometries=geojson`);
      if (!res.ok) throw new Error(`OSRM ${res.status}`);
      const data = (await res.json()) as {
        routes?: { geometry?: { coordinates?: [number, number][] } }[];
      };
      const line = data.routes?.[0]?.geometry?.coordinates;
      if (!line?.length) throw new Error("OSRM returned no geometry");
      const path = line.map(([lng, lat]) => [lat, lng] as LatLng);
      memoryCache.set(key, path);
      writeSession(key, path);
      return path;
    } catch {
      return waypoints; // graceful fallback: straight line beats no line
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, request);
  return request;
}

/**
 * React hook form. Returns the snapped path once available, and the raw
 * waypoints in the meantime so the map is never empty.
 */
export function useRoadPath(waypoints: LatLng[] | null | undefined): LatLng[] | undefined {
  const key = waypoints && waypoints.length > 1 ? keyFor(waypoints) : null;
  const [path, setPath] = useState<LatLng[] | undefined>(() =>
    key ? (memoryCache.get(key) ?? waypoints ?? undefined) : undefined,
  );

  useEffect(() => {
    if (!key || !waypoints) {
      setPath(undefined);
      return;
    }
    const cached = memoryCache.get(key);
    setPath(cached ?? waypoints);
    if (cached) return;

    let cancelled = false;
    void fetchRoadPath(waypoints).then((p) => {
      if (!cancelled) setPath(p);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return path;
}

/** Index of the point on `path` closest to `point`. */
export function nearestIndex(path: LatLng[], point: LatLng): number {
  let best = 0;
  let bestD = Infinity;
  path.forEach((p, i) => {
    const d = (p[0] - point[0]) ** 2 + (p[1] - point[1]) ** 2;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  });
  return best;
}

/** Sub-section of a road-snapped path between two arbitrary coordinates. */
export function slicePath(path: LatLng[], from: LatLng, to: LatLng): LatLng[] {
  if (path.length < 2) return [from, to];
  const a = nearestIndex(path, from);
  const b = nearestIndex(path, to);
  const seg = a <= b ? path.slice(a, b + 1) : path.slice(b, a + 1).reverse();
  return seg.length > 1 ? seg : [from, to];
}

/** Point at fraction `t` (0..1) along a polyline, by cumulative distance. */
export function pointAlongPath(path: LatLng[], t: number): LatLng | null {
  if (!path.length) return null;
  if (path.length === 1) return path[0]!;
  const segs: number[] = [];
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i]!;
    const b = path[i + 1]!;
    const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
    segs.push(d);
    total += d;
  }
  if (total === 0) return path[0]!;
  let target = Math.max(0, Math.min(1, t)) * total;
  for (let i = 0; i < segs.length; i++) {
    const d = segs[i]!;
    if (target <= d || i === segs.length - 1) {
      const f = d === 0 ? 0 : target / d;
      const a = path[i]!;
      const b = path[i + 1]!;
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
    }
    target -= d;
  }
  return path[path.length - 1]!;
}
