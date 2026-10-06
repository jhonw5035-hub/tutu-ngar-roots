import { haversineKm } from "@/lib/fare-geo";

/**
 * Zone-based fixed pricing. Every pickup / drop-off resolves to its nearest
 * zone; everyone travelling between the same two zones pays the same flat
 * fare (MMK), regardless of exact point inside the zone.
 */
export type Zone = { id: string; name: string; lat: number; lng: number };

export const zones: Zone[] = [
  { id: "z-nokk", name: "North Okkalapa", lat: 16.9006, lng: 96.172 },
  { id: "z-sokk", name: "South Okkalapa", lat: 16.8495, lng: 96.1785 },
  { id: "z-yankin", name: "Yankin / Thingangyun", lat: 16.8382, lng: 96.1596 },
  { id: "z-insein", name: "Insein", lat: 16.889, lng: 96.1, lng2: 0 } as Zone,
  { id: "z-kamayut", name: "Kamayut / Hledan", lat: 16.8236, lng: 96.13 },
  { id: "z-inya", name: "Inya Road", lat: 16.8285, lng: 96.1435 },
  { id: "z-sanchaung", name: "Sanchaung", lat: 16.8045, lng: 96.1325 },
  { id: "z-downtown", name: "Downtown (Sule)", lat: 16.7765, lng: 96.1585 },
];

/** zone_from, zone_to, fixed_fare — symmetric. */
export const fareMatrix: { zone_from: string; zone_to: string; fixed_fare: number }[] = [
  { zone_from: "z-nokk", zone_to: "z-downtown", fixed_fare: 3500 },
  { zone_from: "z-nokk", zone_to: "z-sokk", fixed_fare: 2000 },
  { zone_from: "z-nokk", zone_to: "z-yankin", fixed_fare: 2500 },
  { zone_from: "z-nokk", zone_to: "z-kamayut", fixed_fare: 3500 },
  { zone_from: "z-nokk", zone_to: "z-sanchaung", fixed_fare: 4000 },
  { zone_from: "z-nokk", zone_to: "z-inya", fixed_fare: 3000 },
  { zone_from: "z-insein", zone_to: "z-downtown", fixed_fare: 4000 },
  { zone_from: "z-insein", zone_to: "z-kamayut", fixed_fare: 3000 },
  { zone_from: "z-insein", zone_to: "z-sanchaung", fixed_fare: 3500 },
  { zone_from: "z-sokk", zone_to: "z-downtown", fixed_fare: 3000 },
  { zone_from: "z-sokk", zone_to: "z-kamayut", fixed_fare: 3000 },
  { zone_from: "z-yankin", zone_to: "z-downtown", fixed_fare: 2500 },
  { zone_from: "z-yankin", zone_to: "z-kamayut", fixed_fare: 2500 },
  { zone_from: "z-inya", zone_to: "z-sanchaung", fixed_fare: 2000 },
  { zone_from: "z-inya", zone_to: "z-downtown", fixed_fare: 2500 },
  { zone_from: "z-kamayut", zone_to: "z-downtown", fixed_fare: 2500 },
  { zone_from: "z-kamayut", zone_to: "z-sanchaung", fixed_fare: 1500 },
  { zone_from: "z-sanchaung", zone_to: "z-downtown", fixed_fare: 2000 },
];

export function zoneOf(lat: number, lng: number): Zone {
  let best = zones[0]!;
  let bestD = Infinity;
  for (const z of zones) {
    const d = haversineKm([lat, lng], [z.lat, z.lng]);
    if (d < bestD) {
      bestD = d;
      best = z;
    }
  }
  return best;
}

export type FareQuote = { from: Zone; to: Zone; fare: number };

export function quoteFare(
  pickup: { lat: number; lng: number } | null,
  destination: { lat: number; lng: number } | null,
): FareQuote | null {
  if (!pickup || !destination) return null;
  const from = zoneOf(pickup.lat, pickup.lng);
  const to = zoneOf(destination.lat, destination.lng);
  if (from.id === to.id) return { from, to, fare: 1500 };
  const row = fareMatrix.find(
    (r) =>
      (r.zone_from === from.id && r.zone_to === to.id) ||
      (r.zone_from === to.id && r.zone_to === from.id),
  );
  // Unlisted pairs: flat band by zone-centre distance, rounded to 500 MMK.
  const fare =
    row?.fixed_fare ??
    Math.max(2000, Math.round((1000 + haversineKm([from.lat, from.lng], [to.lat, to.lng]) * 300) / 500) * 500);
  return { from, to, fare };
}

export const formatMMK = (n: number) => `${n.toLocaleString()} MMK`;

export const paymentMethods = ["Cash", "KPay", "Wave Pay", "AYA Pay"] as const;
export type PaymentMethod = (typeof paymentMethods)[number];

export const popularPlaces = [
  { id: "sule", name: "Sule Square", lat: 16.7745, lng: 96.1597 },
  { id: "mmplaza", name: "MM Plaza", lat: 16.7798, lng: 96.1572 },
  { id: "junctioncity", name: "Junction City", lat: 16.7795, lng: 96.1543 },
  { id: "junctionsquare", name: "Junction Square / Time City", lat: 16.8183, lng: 96.1319 },
  { id: "hledan", name: "Hledan Center", lat: 16.8236, lng: 96.13 },
];
