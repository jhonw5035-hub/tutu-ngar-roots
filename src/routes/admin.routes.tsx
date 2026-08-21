import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { MapView } from "@/components/map/map-view";
import { supabase } from "@/integrations/supabase/client";
import { routes as corridors } from "@/lib/mockData";
import type { BookingRow, TripGroupRow } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/routes")({
  head: () => ({
    meta: [
      { title: "Routes — Tu Tu Ngar Admin" },
      {
        name: "description",
        content:
          "Corridor map with simulated traffic levels plus live booking counts and occupancy for Yangon shared rides.",
      },
      { property: "og:title", content: "Routes — Tu Tu Ngar Admin" },
      { property: "og:description", content: "Corridor traffic view, bookings and occupancy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RoutesPage,
});

type Traffic = "light" | "moderate" | "heavy";

const trafficColor: Record<Traffic, string> = {
  light: "#16a34a",
  moderate: "#eab308",
  heavy: "#dc2626",
};

const levels: Traffic[] = ["light", "moderate", "heavy"];

function shift(level: Traffic): Traffic {
  const i = levels.indexOf(level);
  const delta = Math.random() < 0.5 ? -1 : 1;
  return levels[Math.min(levels.length - 1, Math.max(0, i + delta))]!;
}

function RoutesPage() {
  const [traffic, setTraffic] = React.useState<Record<string, Traffic>>(() =>
    Object.fromEntries(corridors.map((r) => [r.id, levels[Math.floor(Math.random() * 3)]!])),
  );
  const [bookings, setBookings] = React.useState<BookingRow[]>([]);
  const [groups, setGroups] = React.useState<TripGroupRow[]>([]);

  // Simulated traffic: shifts one level every ~20s so the demo feels alive.
  React.useEffect(() => {
    const id = window.setInterval(() => {
      setTraffic((prev) => {
        const next = { ...prev };
        for (const r of corridors) if (Math.random() < 0.6) next[r.id] = shift(prev[r.id] ?? "light");
        return next;
      });
    }, 20000);
    return () => window.clearInterval(id);
  }, []);

  const load = React.useCallback(async () => {
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    const [b, g] = await Promise.all([
      supabase.from("bookings").select("*").gte("created_at", since.toISOString()),
      supabase.from("trip_groups").select("*").gte("created_at", since.toISOString()),
    ]);
    setBookings(b.data ?? []);
    setGroups(g.data ?? []);
  }, []);

  React.useEffect(() => {
    void load();
    const channel = supabase
      .channel("admin-routes")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => void load())
      .on("postgres_changes", { event: "*", schema: "public", table: "trip_groups" }, () => void load())
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [load]);

  const stats = corridors.map((r) => {
    const term = r.name.split(/[→-]/)[0]?.trim().toLowerCase() ?? "";
    const todays = bookings.filter((b) =>
      `${b.pickup_label ?? ""} ${b.destination_label ?? ""}`.toLowerCase().includes(term),
    );
    const corridorGroups = groups.filter((g) =>
      (g.corridor_label ?? "").toLowerCase().includes(term),
    );
    const seats = corridorGroups.length * 4;
    const filled = todays.filter((b) => b.status === "grouped").length;
    const occupancy = seats ? Math.min(100, Math.round((filled / seats) * 100)) : 0;
    return { route: r, bookings: todays.length, occupancy };
  });

  const colors = Object.fromEntries(
    corridors.map((r) => [r.id, trafficColor[traffic[r.id] ?? "light"]]),
  );

  return (
    <AdminShell>
      <h1 className="text-2xl font-extrabold tracking-tight">Routes</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Corridor definitions and today&rsquo;s live load. Traffic shading is simulated for the demo —
        it is not real traffic data.
      </p>

      <section className="mt-5 overflow-hidden rounded-xl border border-border bg-card">
        <MapView className="h-80" routes={corridors} routeColors={colors} />
        <div className="flex flex-wrap items-center gap-3 border-t border-border px-4 py-3 text-xs">
          <span className="font-semibold text-muted-foreground">Simulated traffic</span>
          {levels.map((l) => (
            <span key={l} className="inline-flex items-center gap-1.5 capitalize">
              <span
                className="inline-block h-1.5 w-6 rounded-full"
                style={{ background: trafficColor[l] }}
                aria-hidden
              />
              {l}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-4 space-y-2">
        <h2 className="text-base font-bold tracking-tight">Route overview (today)</h2>
        {stats.map(({ route, bookings: count, occupancy }) => (
          <div
            key={route.id}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4"
          >
            <span
              className="size-2.5 rounded-full"
              style={{ background: trafficColor[traffic[route.id] ?? "light"] }}
              aria-hidden
            />
            <p className="font-semibold">{route.name}</p>
            <Badge variant="outline" className="capitalize">
              {traffic[route.id] ?? "light"} traffic
            </Badge>
            <span className="ml-auto text-sm text-muted-foreground">
              {count} bookings · {occupancy}% occupancy
            </span>
          </div>
        ))}
      </section>
    </AdminShell>
  );
}
