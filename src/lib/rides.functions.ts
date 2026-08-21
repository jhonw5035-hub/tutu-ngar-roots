import { createServerFn } from "@tanstack/react-start";

export type LiveRider = { id: string; firstName: string; gender: string | null };

export type LiveDeparture = {
  groupId: string;
  corridorId: string;
  /** "HH:MM" local departure time. */
  time: string;
  seatsFilled: number;
  seatsCapacity: number;
  pickupLabel: string;
  destinationLabel: string;
  hasDriver: boolean;
  riders: LiveRider[];
};

/**
 * Live shared departures on one of the 3 demo corridors.
 *
 * Reads with the service role because a passenger's RLS scope only covers
 * their own bookings — but the response is deliberately privacy-safe: seat
 * counts, first names and gender only. Bot-seeded and real bookings are
 * returned identically.
 */
export const getCorridorDepartures = createServerFn({ method: "GET" })
  .inputValidator((input: { corridorId: string }) => {
    if (!input?.corridorId || typeof input.corridorId !== "string") {
      throw new Error("corridorId is required");
    }
    return { corridorId: input.corridorId };
  })
  .handler(async ({ data }): Promise<LiveDeparture[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: groups, error } = await supabaseAdmin
      .from("trip_groups")
      .select("id, corridor_label, pickup_point_label, eta_to_pickup, driver_id, status")
      .eq("corridor_label", data.corridorId)
      .in("status", ["forming", "assigned"]);
    if (error) throw new Error(error.message);
    if (!groups?.length) return [];

    const ids = groups.map((g) => g.id);
    const { data: bookings } = await supabaseAdmin
      .from("bookings")
      .select("id, group_id, passenger_name, passenger_gender, destination_label")
      .in("group_id", ids);

    const seatsCapacity = 4;
    const departures: LiveDeparture[] = groups.map((g) => {
      const rows = (bookings ?? []).filter((b) => b.group_id === g.id);
      return {
        groupId: g.id,
        corridorId: g.corridor_label ?? data.corridorId,
        time: g.eta_to_pickup ?? "08:00",
        seatsFilled: Math.min(rows.length, seatsCapacity),
        seatsCapacity,
        pickupLabel: g.pickup_point_label ?? "Pickup point",
        destinationLabel: rows[rows.length - 1]?.destination_label ?? "Destination",
        hasDriver: Boolean(g.driver_id),
        riders: rows.slice(0, seatsCapacity).map((r) => ({
          id: r.id,
          firstName: r.passenger_name ?? "Rider",
          gender: r.passenger_gender ?? null,
        })),
      };
    });

    return departures.sort((a, b) => a.time.localeCompare(b.time));
  });
