import * as React from "react";

/**
 * Free OpenStreetMap Nominatim geocoding, biased to Yangon.
 * Public instance is rate-limited (~1 req/s) so every call is debounced and
 * cached, and we send a descriptive Referer/User-Agent per their usage policy.
 */

export type GeoPlace = {
  id: string;
  /** Short primary label, e.g. "Hledan Junction". */
  label: string;
  /** Full display address from Nominatim. */
  address: string;
  lat: number;
  lng: number;
};

/** left,top,right,bottom bounding box around Yangon. */
const YANGON_VIEWBOX = "95.95,17.05,96.40,16.65";

const HEADERS: Record<string, string> = {
  // Nominatim usage policy: identify the application making the request.
  "User-Agent": "TuTuNgar/1.0 (shared-rides Yangon; contact: support@tutungar.app)",
  Accept: "application/json",
};

const searchCache = new Map<string, GeoPlace[]>();
const reverseCache = new Map<string, string>();

function toPlace(row: {
  place_id: number | string;
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
}): GeoPlace {
  const address = row.display_name;
  const label = row.name?.trim() || address.split(",")[0]!.trim();
  return {
    id: String(row.place_id),
    label,
    address,
    lat: Number(row.lat),
    lng: Number(row.lon),
  };
}

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<GeoPlace[]> {
  const q = query.trim();
  if (q.length < 3) return [];
  const cached = searchCache.get(q.toLowerCase());
  if (cached) return cached;

  const url =
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}` +
    `&format=json&addressdetails=0&countrycodes=mm&viewbox=${YANGON_VIEWBOX}&bounded=1&limit=5`;

  const res = await fetch(url, signal ? { headers: HEADERS, signal } : { headers: HEADERS });
  if (!res.ok) throw new Error(`Nominatim search failed (${res.status})`);
  const rows = (await res.json()) as Parameters<typeof toPlace>[0][];
  const places = rows.map(toPlace);
  searchCache.set(q.toLowerCase(), places);
  return places;
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
  const cached = reverseCache.get(key);
  if (cached) return cached;

  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=16`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`Nominatim reverse failed (${res.status})`);
  const row = (await res.json()) as { display_name?: string; name?: string };
  const label = row.name?.trim() || row.display_name?.split(",").slice(0, 3).join(", ") || key;
  reverseCache.set(key, label);
  return label;
}

/** Debounced Nominatim search bound to an input value. */
export function usePlaceSearch(query: string, enabled: boolean, delay = 450) {
  const [results, setResults] = React.useState<GeoPlace[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const q = query.trim();
    if (!enabled || q.length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }
    const cached = searchCache.get(q.toLowerCase());
    if (cached) {
      setResults(cached);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(() => {
      searchPlaces(q, controller.signal)
        .then((places) => setResults(places))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, delay);

    return () => {
      clearTimeout(timer);
      controller.abort();
      setLoading(false);
    };
  }, [query, enabled, delay]);

  return { results, loading };
}
