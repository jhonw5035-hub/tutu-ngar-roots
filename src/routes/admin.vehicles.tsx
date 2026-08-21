import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RouteToPickupMap } from "@/components/map/route-to-pickup-map";
import { supabase } from "@/integrations/supabase/client";
import {
  displayName,
  useProfilesByRole,
  type DriverStatusRow,
  type TripGroupRow,
} from "@/lib/admin-data";

export const Route = createFileRoute("/admin/vehicles")({
  head: () => ({
    meta: [
      { title: "Vehicles & Drivers — Tu Tu Ngar Admin" },
      {
        name: "description",
        content:
          "Fleet roster, driver availability and live trip assignment across the Tu Tu Ngar Yangon network.",
      },
      { property: "og:title", content: "Vehicles & Drivers — Tu Tu Ngar Admin" },
      { property: "og:description", content: "Fleet roster, live availability and assignments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VehiclesPage,
});

function VehiclesPage() {
  const { rows: drivers, loading } = useProfilesByRole("driver");
  const [status, setStatus] = React.useState<Record<string, DriverStatusRow>>({});
  const [groups, setGroups] = React.useState<TripGroupRow[]>([]);
  const [routeFor, setRouteFor] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const [s, g] = await Promise.all([
      supabase.from("driver_status").select("*"),
      supabase
        .from("trip_groups")
        .select("*")
        .in("status", ["forming", "pending_driver", "accepted"]),
    ]);
    setStatus(Object.fromEntries((s.data ?? []).map((r) => [r.driver_id, r])));
    setGroups(g.data ?? []);
  }, []);

  React.useEffect(() => {
    void load();
    const channel = supabase
      .channel("admin-fleet")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "driver_status" },
        () => void load(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trip_groups" },
        () => void load(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [load]);

  async function reassign(groupId: string) {
    const { error } = await supabase
      .from("trip_groups")
      .update({ driver_id: null, status: "forming" })
      .eq("id", groupId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Trip returned to the pending-assignment pool");
    void load();
  }

  return (
    <AdminShell>
      <h1 className="text-2xl font-extrabold tracking-tight">Vehicles &amp; Drivers</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Fleet roster with live availability. Every driver account and its vehicle details come
        straight from the live database.
      </p>

      <section className="mt-5 space-y-3">
        {loading ? <p className="text-sm text-muted-foreground">Loading fleet…</p> : null}
        {!loading && drivers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            No driver accounts yet.
          </div>
        ) : null}

        {drivers.map((d) => {
          const s = status[d.id];
          const online = s?.is_online ?? false;
          const trip = groups.find((g) => g.driver_id === d.id) ?? null;
          const hasLocation = s?.current_lat != null && s?.current_lng != null;
          return (
            <article key={d.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold">{displayName(d)}</p>
                <Badge variant="outline">{online ? "🟢 Online" : "⚪ Offline"}</Badge>
                {trip ? <Badge variant="outline">On trip · {trip.status}</Badge> : null}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                🚗 {d.plate_number ?? "No plate on file"} · {d.seat_capacity ?? 4} seats ·{" "}
                {d.phone ?? "No phone"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {trip
                  ? `Current route: ${trip.corridor_label ?? trip.pickup_point_label ?? "Assigned trip"}`
                  : hasLocation
                    ? `Last known position ${Number(s?.current_lat).toFixed(4)}, ${Number(s?.current_lng).toFixed(4)}`
                    : "No live location reported"}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {trip ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRouteFor(routeFor === d.id ? null : d.id)}
                  >
                    View Route
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.message(`Calling ${displayName(d)} (mock)`)}
                >
                  Contact Driver
                </Button>
                {trip ? (
                  <Button size="sm" variant="outline" onClick={() => void reassign(trip.id)}>
                    Reassign
                  </Button>
                ) : null}
              </div>

              {routeFor === d.id && trip ? (
                <div className="mt-3 overflow-hidden rounded-lg border border-border">
                  <RouteToPickupMap
                    className="h-56"
                    vehicle={
                      hasLocation
                        ? ([Number(s?.current_lat), Number(s?.current_lng)] as [number, number])
                        : null
                    }
                    pickup={
                      trip.pickup_lat != null && trip.pickup_lng != null
                        ? ([Number(trip.pickup_lat), Number(trip.pickup_lng)] as [number, number])
                        : null
                    }
                    vehicleLabel={d.plate_number ?? "Driver"}
                  />
                </div>
              ) : null}
            </article>
          );
        })}
      </section>
    </AdminShell>
  );
}
