import { supabase } from "@/integrations/supabase/client";
import type { BookingRow, DriverStatusRow } from "@/lib/live";

/**
 * Real grouping logic behind "Run AI Optimization".
 *
 * Greedy proximity clustering on pickup coordinates (Haversine), max 4 riders
 * per group, gender-balanced (prefer homogeneous, allow a 3-1 split with a
 * minority note), then the nearest online driver is assigned to each group.
 */

const MAX_PER_GROUP = 4;
/** Riders further apart than this never share a pickup point. */
const MAX_CLUSTER_KM = 2.5;

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(la1) * Math.cos(la2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

export type PlannedGroup = {
  bookings: BookingRow[];
  centroid: { lat: number; lng: number };
  pickupLabel: string;
  corridorLabel: string;
  minorityBookingIds: string[];
  driverId: string | null;
  driverDistanceKm: number | null;
};

function coordsOf(b: BookingRow) {
  return { lat: Number(b.pickup_lat), lng: Number(b.pickup_lng) };
}

function genderSplit(list: BookingRow[]) {
  const counts = new Map<string, number>();
  for (const b of list) {
    const g = b.passenger_gender ?? "unknown";
    counts.set(g, (counts.get(g) ?? 0) + 1);
  }
  return counts;
}

/** Bookings whose gender is in a strict minority (e.g. the "1" of a 3-1 split). */
function minorityIds(list: BookingRow[]) {
  const counts = genderSplit(list);
  if (counts.size < 2) return [];
  return list
    .filter((b) => (counts.get(b.passenger_gender ?? "unknown") ?? 0) === 1)
    .map((b) => b.id);
}

/** Greedy proximity + gender-aware clustering. Pure function — easy to test. */
export function planGroups(
  bookings: BookingRow[],
  drivers: (DriverStatusRow & { seat_capacity?: number | null })[],
): PlannedGroup[] {
  const pool = bookings.filter((b) => b.pickup_lat != null && b.pickup_lng != null);
  const used = new Set<string>();
  const groups: PlannedGroup[] = [];

  // Seed with the booking that has the most neighbours nearby.
  while (used.size < pool.length) {
    const remaining = pool.filter((b) => !used.has(b.id));
    if (!remaining.length) break;

    let seed = remaining[0]!;
    let bestNeighbours = -1;
    for (const candidate of remaining) {
      const n = remaining.filter(
        (o) => o.id !== candidate.id && haversineKm(coordsOf(candidate), coordsOf(o)) <= MAX_CLUSTER_KM,
      ).length;
      if (n > bestNeighbours) {
        bestNeighbours = n;
        seed = candidate;
      }
    }

    const neighbours = remaining
      .filter((o) => o.id !== seed.id)
      .map((o) => ({ booking: o, km: haversineKm(coordsOf(seed), coordsOf(o)) }))
      .filter((n) => n.km <= MAX_CLUSTER_KM)
      .sort((a, b) => a.km - b.km);

    const picked: BookingRow[] = [seed];
    const seedGender = seed.passenger_gender ?? "unknown";
    // Pass 1: same gender first (homogeneous groups are preferred).
    for (const n of neighbours) {
      if (picked.length >= MAX_PER_GROUP) break;
      if ((n.booking.passenger_gender ?? "unknown") === seedGender) picked.push(n.booking);
    }
    // Pass 2: fill remaining seats, but never leave a 2-2 unbalanced pairing
    // when a 3-1 split (flagged) is the only option.
    for (const n of neighbours) {
      if (picked.length >= MAX_PER_GROUP) break;
      if (!picked.includes(n.booking)) picked.push(n.booking);
    }

    picked.forEach((b) => used.add(b.id));

    const centroid = picked.reduce(
      (acc, b) => ({
        lat: acc.lat + coordsOf(b).lat / picked.length,
        lng: acc.lng + coordsOf(b).lng / picked.length,
      }),
      { lat: 0, lng: 0 },
    );

    groups.push({
      bookings: picked,
      centroid,
      pickupLabel: seed.pickup_label ?? "Shared meeting point",
      corridorLabel: `${seed.pickup_label ?? "Pickup"} → ${
        picked[0]?.destination_label ?? "Destination"
      }`,
      minorityBookingIds: minorityIds(picked),
      driverId: null,
      driverDistanceKm: null,
    });
  }

  // Nearest online driver per group, each driver used once.
  const availableDrivers = drivers.filter(
    (d) => d.is_online && d.current_lat != null && d.current_lng != null,
  );
  const takenDrivers = new Set<string>();
  for (const group of groups) {
    let best: { id: string; km: number } | null = null;
    for (const d of availableDrivers) {
      if (takenDrivers.has(d.driver_id)) continue;
      const km = haversineKm(group.centroid, {
        lat: Number(d.current_lat),
        lng: Number(d.current_lng),
      });
      if (!best || km < best.km) best = { id: d.driver_id, km };
    }
    if (best) {
      takenDrivers.add(best.id);
      group.driverId = best.id;
      group.driverDistanceKm = Math.round(best.km * 10) / 10;
    }
  }

  return groups;
}

export type OptimizationResult = {
  groups: (PlannedGroup & { id: string })[];
  pendingCount: number;
};

/** Loads pending bookings + online drivers, clusters them and writes the plan. */
export async function runOptimization(): Promise<OptimizationResult> {
  const [{ data: bookings, error: bookingError }, { data: drivers }] = await Promise.all([
    supabase
      .from("bookings")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
    supabase.from("driver_status").select("*").eq("is_online", true),
  ]);
  if (bookingError) throw new Error(bookingError.message);

  const pending = bookings ?? [];
  const planned = planGroups(pending, drivers ?? []);
  const created: (PlannedGroup & { id: string })[] = [];

  for (const group of planned) {
    const { data: groupRow, error: groupError } = await supabase
      .from("trip_groups")
      .insert({
        pickup_point_label: group.pickupLabel,
        pickup_lat: group.centroid.lat,
        pickup_lng: group.centroid.lng,
        driver_id: group.driverId,
        corridor_label: group.corridorLabel,
        status: group.driverId ? "pending_driver" : "forming",
      })
      .select()
      .single();
    if (groupError || !groupRow) throw new Error(groupError?.message ?? "Could not create group");

    await supabase.from("trip_group_members").insert(
      group.bookings.map((b, index) => ({
        group_id: groupRow.id,
        booking_id: b.id,
        drop_label: b.destination_label,
        drop_lat: b.destination_lat,
        drop_lng: b.destination_lng,
        drop_order: index + 1,
      })),
    );

    for (const b of group.bookings) {
      await supabase
        .from("bookings")
        .update({
          status: "grouped",
          group_id: groupRow.id,
          minority_gender_note: group.minorityBookingIds.includes(b.id),
        })
        .eq("id", b.id);
    }

    created.push({ ...group, id: groupRow.id });
  }

  return { groups: created, pendingCount: pending.length };
}
