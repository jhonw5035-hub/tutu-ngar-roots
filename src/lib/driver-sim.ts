import * as React from "react";

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

/**
 * DEMO ONLY — simulated driver movement.
 *
 * Passenger locations used by the AI grouping are genuine device geolocation
 * (see `getCurrentPosition` in src/lib/live.ts). Only the DRIVER's position is
 * simulated here, so the presentation demo is reliable and repeatable: the
 * driver starts in North Okkalapa and is stepped toward the group's pickup
 * point by an operator-controlled control on the driver screen. Each step
 * writes real coordinates to `driver_status`, which passengers read live.
 */

/** Presentation start point: driver is "coming from North Okkalapa". */
export const NORTH_OKKALAPA: { lat: number; lng: number } = { lat: 16.9105, lng: 96.1725 };

export async function writeDriverLocation(
  driverId: string,
  pos: { lat: number; lng: number },
) {
  const { error } = await supabase.from("driver_status").upsert(
    {
      driver_id: driverId,
      is_online: true,
      current_lat: pos.lat,
      current_lng: pos.lng,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "driver_id" },
  );
  if (error) throw new Error(error.message);
}

export type DriverSim = {
  position: { lat: number; lng: number } | null;
  progress: number;
  running: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
  step: () => void;
};

/**
 * Steps the driver marker along a straight path from North Okkalapa to the
 * pickup point over roughly `etaMinutes`, writing each step to Supabase.
 */
export function useDriverSimulation(
  driverId: string | null,
  target: { lat: number; lng: number } | null,
  etaMinutes = 8,
  start: { lat: number; lng: number } = NORTH_OKKALAPA,
): DriverSim {
  const STEPS = 20;
  const intervalMs = Math.max(800, (etaMinutes * 60 * 1000) / STEPS);

  const [progress, setProgress] = React.useState(0);
  const [running, setRunning] = React.useState(false);

  const position = React.useMemo(() => {
    if (!target) return null;
    const t = Math.min(1, progress / STEPS);
    return {
      lat: start.lat + (target.lat - start.lat) * t,
      lng: start.lng + (target.lng - start.lng) * t,
    };
  }, [progress, target, start.lat, start.lng]);

  // Push every simulated position to driver_status so passengers see it live.
  React.useEffect(() => {
    if (!driverId || !position) return;
    void writeDriverLocation(driverId, position).catch(() => undefined);
  }, [driverId, position?.lat, position?.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setProgress((p) => {
        if (p >= STEPS) {
          setRunning(false);
          return p;
        }
        return p + 1;
      });
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [running, intervalMs]);

  return {
    position,
    progress: Math.min(1, progress / STEPS),
    running,
    start: () => setRunning(true),
    stop: () => setRunning(false),
    reset: () => {
      setRunning(false);
      setProgress(0);
    },
    step: () => setProgress((p) => Math.min(STEPS, p + 1)),
  };
}

/** Passenger side: live driver position from Realtime on `driver_status`. */
export function useDriverLocation(driverId: string | null) {
  const [status, setStatus] = React.useState<Tables<"driver_status"> | null>(null);

  React.useEffect(() => {
    if (!driverId) {
      setStatus(null);
      return;
    }
    let active = true;
    void supabase
      .from("driver_status")
      .select("*")
      .eq("driver_id", driverId)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setStatus(data ?? null);
      });

    const channel = supabase
      .channel(`driver-status-${driverId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "driver_status",
          filter: `driver_id=eq.${driverId}`,
        },
        (payload) => setStatus(payload.new as Tables<"driver_status">),
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [driverId]);

  const position =
    status?.current_lat != null && status?.current_lng != null
      ? { lat: Number(status.current_lat), lng: Number(status.current_lng) }
      : null;

  return { status, position };
}
