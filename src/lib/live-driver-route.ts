/**
 * Live Mode driver approach route. Never draws or animates a straight line:
 * the driver start is snapped to a real road (OSRM nearest), the approach is
 * an OSRM driving route, and if routing fails/times out we use a pre-traced
 * road-following path that ends at the pickup.
 */
import { useEffect, useRef, useState } from "react";

import type { LatLng } from "@/lib/mockData";

const OSRM = "https://router.project-osrm.org";
const TIMEOUT_MS = 4000;
const ANIM_MS = 30_000;
const cache = new Map<string, LatLng[]>();

/** Pre-traced along Kaba Aye Pagoda Road (southbound), used only if OSRM fails. */
const FALLBACK_TRACE: LatLng[] = [
  [16.8605, 96.1590], [16.8580, 96.1588], [16.8552, 96.1584], [16.8527, 96.1579],
  [16.8500, 96.1573], [16.8474, 96.1566], [16.8449, 96.1558], [16.8423, 96.1549],
  [16.8398, 96.1539], [16.8372, 96.1529], [16.8346, 96.1518], [16.8321, 96.1507],
  [16.8297, 96.1497], [16.8272, 96.1487], [16.8248, 96.1478], [16.8223, 96.1470],
  [16.8199, 96.1463],
];

async function fetchJson(url: string) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(String(res.status));
    return await res.json();
  } finally {
    clearTimeout(id);
  }
}

function fallbackFor(pickup: LatLng): LatLng[] {
  const end = FALLBACK_TRACE[FALLBACK_TRACE.length - 1]!;
  const dLat = pickup[0] - end[0];
  const dLng = pickup[1] - end[1];
  return FALLBACK_TRACE.map(([a, b]) => [a + dLat, b + dLng] as LatLng);
}

export async function resolveDriverRoute(pickup: LatLng): Promise<LatLng[]> {
  const key = `${pickup[0].toFixed(5)},${pickup[1].toFixed(5)}`;
  const hit = cache.get(key);
  if (hit) return hit;
  try {
    // ~2 km north-east of pickup, snapped onto the nearest drivable road.
    const guess: LatLng = [pickup[0] + 0.013, pickup[1] + 0.011];
    const near = await fetchJson(`${OSRM}/nearest/v1/driving/${guess[1]},${guess[0]}`);
    const loc = near?.waypoints?.[0]?.location as [number, number] | undefined;
    const start: [number, number] = loc ?? [guess[1], guess[0]];
    const data = await fetchJson(
      `${OSRM}/route/v1/driving/${start[0]},${start[1]};${pickup[1]},${pickup[0]}?overview=full&geometries=geojson`,
    );
    const coords = data?.routes?.[0]?.geometry?.coordinates as [number, number][] | undefined;
    if (!coords || coords.length < 2) throw new Error("no geometry");
    const path = coords.map(([lng, lat]) => [lat, lng] as LatLng);
    cache.set(key, path);
    return path;
  } catch {
    return fallbackFor(pickup);
  }
}

function km(a: LatLng, b: LatLng) {
  const r = Math.PI / 180;
  const x = (b[1] - a[1]) * r * Math.cos(((a[0] + b[0]) / 2) * r);
  const y = (b[0] - a[0]) * r;
  return Math.hypot(x, y) * 6371;
}

export function useLiveDriverRoute(pickup: LatLng | null) {
  const [path, setPath] = useState<LatLng[] | null>(null);
  const [state, setState] = useState<{ pos: LatLng; heading: number; remainingKm: number } | null>(null);
  const raf = useRef(0);
  const key = pickup ? `${pickup[0]},${pickup[1]}` : null;

  useEffect(() => {
    setPath(null);
    setState(null);
    if (!pickup) return;
    let cancelled = false;
    void resolveDriverRoute(pickup).then((p) => !cancelled && setPath(p));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!path || path.length < 2) return;
    const seg = path.slice(1).map((p, i) => km(path[i]!, p));
    const total = seg.reduce((s, d) => s + d, 0) || 1;
    const t0 = performance.now();
    const tick = (now: number) => {
      const f = Math.min(1, (now - t0) / ANIM_MS);
      let target = f * total;
      let i = 0;
      while (i < seg.length - 1 && target > seg[i]!) target -= seg[i++]!;
      const a = path[i]!;
      const b = path[i + 1]!;
      const g = seg[i] ? Math.min(1, target / seg[i]!) : 1;
      const pos: LatLng = [a[0] + (b[0] - a[0]) * g, a[1] + (b[1] - a[1]) * g];
      const heading =
        (Math.atan2((b[1] - a[1]) * Math.cos((a[0] * Math.PI) / 180), b[0] - a[0]) * 180) / Math.PI;
      setState({ pos, heading, remainingKm: total * (1 - f) });
      if (f < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [path]);

  return {
    ready: !!path,
    path,
    position: state?.pos ?? null,
    heading: state?.heading ?? 0,
    etaMin: state ? Math.max(0, Math.ceil((state.remainingKm / 20) * 60)) : null,
  };
}
