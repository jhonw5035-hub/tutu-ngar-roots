import * as React from "react";

/**
 * Free OpenStreetMap Nominatim geocoding, biased to Yangon.
 *
 * Usage policy: the public instance allows ~1 request/second, so every call
 * here is debounced (450ms) and de-duplicated through an in-memory cache.
 * Browsers forbid setting a custom `User-Agent` header from fetch(), so we
 * identify the app the supported way instead: the `email` contact parameter
 * plus the automatic `Referer` of the deployed origin, as Nominatim's usage
 * policy allows for browser apps.
 */

const NOMINATIM = "https://nominatim.openstreetmap.org";
const CONTACT = "support@tutungar.app";
/** Yangon bounding box: left,top,right,bottom */
const YANGON_VIEWBOX = "95.95,17.10,96.45,16.60";

export type Suggestion = {
  id: string;
  label: string;
  /** Short primary line, e.g. "Hledan Junction". */
  primary: string;
  /** Remainder of the address. */
  secondary: string;
  lat: number;
  lng: number;
};

const searchCache = new Map<string, Suggestion[]>();
const reverseCache = new Map<string, string>();

type NominatimPlace = {
  place_id: number | string;
  display_name: string;
  lat: string;
  lon: string;
};

function toSuggestion(place: NominatimPlace): Suggestion {
  const parts = place.display_name.split(",").map((p) => p.trim());
  return {
    id: String(place.place_id),
    label: place.display_name,
    primary: parts[0] ?? place.display_name,
    secondary: parts.slice(1, 4).join(", "),
    lat: Number(place.lat),
    lng: Number(place.lon),
  };
}

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<Suggestion[]> {
  const q = query.trim();
  if (q.length < 3) return [];
  const cached = searchCache.get(q.toLowerCase());
  if (cached) return cached;

  const url =
    `${NOMINATIM}/search?q=${encodeURIComponent(q)}&format=json&countrycodes=mm` +
    `&viewbox=${YANGON_VIEWBOX}&bounded=1&limit=5&addressdetails=0` +
    `&accept-language=en&email=${encodeURIComponent(CONTACT)}`;

  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Nominatim search failed (${res.status})`);
  const json = (await res.json()) as NominatimPlace[];
  const results = json.map(toSuggestion);
  searchCache.set(q.toLowerCase(), results);
  return results;
}

/** Coordinates → readable area label (never raw numbers in the UI). */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  const cached = reverseCache.get(key);
  if (cached) return cached;

  const url =
    `${NOMINATIM}/reverse?lat=${lat}&lon=${lng}&format=json&zoom=16` +
    `&accept-language=en&email=${encodeURIComponent(CONTACT)}`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const json = (await res.json()) as { display_name?: string };
    if (!json.display_name) return null;
    const label = json.display_name.split(",").slice(0, 3).join(", ").trim();
    reverseCache.set(key, label);
    return label;
  } catch {
    return null;
  }
}

/** Debounced, cached place search for search-as-you-type fields. */
export function usePlaceSearch(query: string, enabled = true, delay = 450) {
  const [results, setResults] = React.useState<Suggestion[]>([]);
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
        .then((r) => setResults(r))
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

/** Real device coordinates + a readable label, or null when denied. */
export async function locateAndLabel(): Promise<{ lat: number; lng: number; label: string } | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return null;
  const pos = await new Promise<GeolocationPosition | null>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (p) => resolve(p),
      () => resolve(null),
      { timeout: 8000, maximumAge: 60000, enableHighAccuracy: true },
    );
  });
  if (!pos) return null;
  const { latitude, longitude } = pos.coords;
  const label = await reverseGeocode(latitude, longitude);
  return { lat: latitude, lng: longitude, label: label ?? "Current location" };
}

/** Whether the browser will likely allow geolocation (used to hide the option). */
export function useGeolocationAvailable() {
  const [available, setAvailable] = React.useState(false);
  React.useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    setAvailable(true);
    if (!navigator.permissions?.query) return;
    navigator.permissions
      .query({ name: "geolocation" as PermissionName })
      .then((status) => {
        setAvailable(status.state !== "denied");
        status.onchange = () => setAvailable(status.state !== "denied");
      })
      .catch(() => undefined);
  }, []);
  return available;
}
