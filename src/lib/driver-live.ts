import * as React from "react";

import { supabase } from "@/integrations/supabase/client";
import type { BookingRow, TripGroupMemberRow, TripGroupRow } from "@/lib/live";
import { getCurrentPosition } from "@/lib/live";

/** Yangon fallback coordinates for the demo when geolocation is unavailable. */
const FALLBACK = { lat: 16.8261, lng: 96.1315 };

export function useDriverStatus(driverId: string | null) {
  const [isOnline, setIsOnline] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!driverId) return;
    let active = true;
    void supabase
      .from("driver_status")
      .select("*")
      .eq("driver_id", driverId)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        setIsOnline(Boolean(data?.is_online));
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [driverId]);

  const setOnline = React.useCallback(
    async (next: boolean) => {
      if (!driverId) return;
      setSaving(true);
      const position = next ? ((await getCurrentPosition()) ?? FALLBACK) : null;
      const { error } = await supabase.from("driver_status").upsert(
        {
          driver_id: driverId,
          is_online: next,
          ...(position ? { current_lat: position.lat, current_lng: position.lng } : {}),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "driver_id" },
      );
      setSaving(false);
      if (!error) setIsOnline(next);
    },
    [driverId],
  );

  return { isOnline, loading, saving, setOnline };
}

export type AssignedTrip = {
  group: TripGroupRow;
  members: TripGroupMemberRow[];
  bookings: BookingRow[];
};

/** Live subscription to the groups dispatched to this driver. */
export function useAssignedTrip(driverId: string | null) {
  const [trip, setTrip] = React.useState<AssignedTrip | null>(null);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    if (!driverId) {
      setLoading(false);
      return;
    }
    const { data: groups } = await supabase
      .from("trip_groups")
      .select("*")
      .eq("driver_id", driverId)
      .in("status", ["pending_driver", "accepted", "in_progress"])
      .order("created_at", { ascending: false })
      .limit(1);

    const group = groups?.[0] ?? null;
    if (!group) {
      setTrip(null);
      setLoading(false);
      return;
    }
    const [{ data: members }, { data: bookings }] = await Promise.all([
      supabase.from("trip_group_members").select("*").eq("group_id", group.id).order("drop_order"),
      supabase.from("bookings").select("*").eq("group_id", group.id),
    ]);
    setTrip({ group, members: members ?? [], bookings: bookings ?? [] });
    setLoading(false);
  }, [driverId]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  React.useEffect(() => {
    if (!driverId) return;
    const channel = supabase
      .channel(`driver-live-${driverId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trip_groups", filter: `driver_id=eq.${driverId}` },
        () => void refresh(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [driverId, refresh]);

  return { trip, loading, refresh };
}

/** Accept a dispatched group: records the ETA and flips it to `accepted`. */
export async function acceptTrip(groupId: string, etaMinutes: number) {
  const { error } = await supabase
    .from("trip_groups")
    .update({ status: "accepted", eta_to_pickup: `${etaMinutes} min` })
    .eq("id", groupId);
  if (error) throw new Error(error.message);
}
