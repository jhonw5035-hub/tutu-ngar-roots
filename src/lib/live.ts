import * as React from "react";

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type BookingRow = Tables<"bookings">;
export type TripGroupRow = Tables<"trip_groups">;
export type TripGroupMemberRow = Tables<"trip_group_members">;
export type DriverStatusRow = Tables<"driver_status">;

/** Real device coordinates, captured only when a booking is confirmed. */
export function getCurrentPosition(timeout = 8000): Promise<{ lat: number; lng: number } | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return Promise.resolve(null);
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout, maximumAge: 60000, enableHighAccuracy: true },
    );
  });
}

export type CreateBookingInput = {
  passengerId: string;
  passengerName?: string | null;
  passengerGender?: string | null;
  pickupLabel: string;
  destinationLabel: string;
  requestedTime?: string | null;
  pickup: { lat: number; lng: number } | null;
  destination?: { lat: number; lng: number } | null;
};

export async function createBooking(input: CreateBookingInput): Promise<BookingRow> {
  const gender =
    input.passengerGender === "male" ||
    input.passengerGender === "female" ||
    input.passengerGender === "other"
      ? input.passengerGender
      : null;

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      passenger_id: input.passengerId,
      passenger_name: input.passengerName ?? null,
      passenger_gender: gender,
      pickup_label: input.pickupLabel,
      destination_label: input.destinationLabel,
      pickup_lat: input.pickup?.lat ?? null,
      pickup_lng: input.pickup?.lng ?? null,
      destination_lat: input.destination?.lat ?? null,
      destination_lng: input.destination?.lng ?? null,
      requested_time: input.requestedTime ?? null,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * The passenger's most recent active booking, kept live: when the admin
 * optimizer flips it to `grouped`, this refreshes and pulls in the group,
 * its driver and the co-riders.
 */
export function useMyLiveBooking(passengerId: string | null, bookingId?: string | null) {
  const [booking, setBooking] = React.useState<BookingRow | null>(null);
  const [group, setGroup] = React.useState<TripGroupRow | null>(null);
  const [members, setMembers] = React.useState<TripGroupMemberRow[]>([]);
  const [driver, setDriver] = React.useState<Tables<"profiles"> | null>(null);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    if (!passengerId) {
      setLoading(false);
      return;
    }
    let query = supabase
      .from("bookings")
      .select("*")
      .eq("passenger_id", passengerId)
      .order("created_at", { ascending: false })
      .limit(1);
    if (bookingId) query = supabase.from("bookings").select("*").eq("id", bookingId).limit(1);

    const { data } = await query;
    const row = data?.[0] ?? null;
    setBooking(row);

    if (row?.group_id) {
      const [{ data: g }, { data: m }] = await Promise.all([
        supabase.from("trip_groups").select("*").eq("id", row.group_id).maybeSingle(),
        supabase.from("trip_group_members").select("*").eq("group_id", row.group_id),
      ]);
      setGroup(g ?? null);
      setMembers(m ?? []);
      if (g?.driver_id) {
        const { data: p } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", g.driver_id)
          .maybeSingle();
        setDriver(p ?? null);
      }
    } else {
      setGroup(null);
      setMembers([]);
      setDriver(null);
    }
    setLoading(false);
  }, [passengerId, bookingId]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  React.useEffect(() => {
    if (!passengerId) return;
    const channel = supabase
      .channel(`passenger-live-${passengerId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings", filter: `passenger_id=eq.${passengerId}` },
        () => void refresh(),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "trip_groups" }, () =>
        void refresh(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [passengerId, refresh]);

  return { booking, group, members, driver, loading, refresh };
}
