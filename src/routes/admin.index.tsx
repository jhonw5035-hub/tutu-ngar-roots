import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import { ArrowRight } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

/** Live operations counters, refreshed on every booking/group/driver change. */
function useOpsStats() {
  const [stats, setStats] = React.useState({
    passengers: 0,
    drivers: 0,
    groups: 0,
    pending: 0,
    seatUse: "0%",
    latestGroup: null as { label: string; corridor: string; seats: string } | null,
  });

  const load = React.useCallback(async () => {
    const [bookings, drivers, groups] = await Promise.all([
      supabase.from("bookings").select("id, status, group_id"),
      supabase.from("driver_status").select("driver_id, is_online").eq("is_online", true),
      supabase
        .from("trip_groups")
        .select("id, pickup_point_label, corridor_label, created_at")
        .order("created_at", { ascending: false }),
    ]);
    const rows = bookings.data ?? [];
    const groupRows = groups.data ?? [];
    const grouped = rows.filter((b) => b.group_id).length;
    const capacity = groupRows.length * 4;
    const latest = groupRows[0];
    setStats({
      passengers: rows.length,
      drivers: drivers.data?.length ?? 0,
      groups: groupRows.length,
      pending: rows.filter((b) => b.status === "pending").length,
      seatUse: capacity ? `${Math.round((grouped / capacity) * 100)}%` : "0%",
      latestGroup: latest
        ? {
            label: latest.pickup_point_label ?? "Meeting point",
            corridor: latest.corridor_label ?? "—",
            seats: `${grouped} seats filled`,
          }
        : null,
    });
  }, []);

  React.useEffect(() => {
    void load();
    const channel = supabase
      .channel("admin-ops-stats")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => void load())
      .on("postgres_changes", { event: "*", schema: "public", table: "trip_groups" }, () => void load())
      .on("postgres_changes", { event: "*", schema: "public", table: "driver_status" }, () => void load())
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [load]);

  return stats;
}

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Operations Dashboard — Tu Tu Ngar Admin" },
      {
        name: "description",
        content:
          "Live Tu Tu Ngar operations: passengers, vehicles, optimized groups and seat utilization across Yangon today.",
      },
      { property: "og:title", content: "Operations Dashboard — Tu Tu Ngar Admin" },
      {
        property: "og:description",
        content: "Passengers, vehicles, optimized groups and seat utilization at a glance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const stats = useOpsStats();
  const todayStats = [
    { label: "Passengers", value: String(stats.passengers), icon: "👥" },
    { label: "Online drivers", value: String(stats.drivers), icon: "🚗" },
    { label: "Optimized groups", value: String(stats.groups), icon: "🧩" },
    { label: "Seat utilization", value: stats.seatUse, icon: "⚡" },
  ];
  const pendingTotal = stats.pending;

  return (
    <AdminShell>
      <h1 className="sr-only">Tu Tu Ngar operations dashboard</h1>

      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Today&apos;s operations
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {todayStats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
            <span aria-hidden className="text-base">{stat.icon}</span>
            <p className="mt-2 text-3xl font-extrabold tabular-nums tracking-tight">
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <section className="mt-6 rounded-xl border border-primary/30 bg-card p-5 shadow-sm">
        <h2 className="text-lg font-bold tracking-tight">
          <span aria-hidden>🤖</span> AI Matching Center
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {pendingTotal} passengers waiting for matching
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-3 sm:items-center">
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-center text-sm font-semibold">
            {pendingTotal} passengers waiting
          </div>
          <div className="text-center text-xs font-semibold uppercase tracking-widest text-primary">
            ↓ AI optimization
          </div>
          <div className="rounded-lg border border-primary/40 bg-primary/10 p-3 text-center text-sm font-semibold">
            {stats.groups} optimized groups created
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-border bg-background p-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-sm font-bold">
              {stats.latestGroup ? "Latest group" : "No groups yet"}
            </p>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {stats.latestGroup?.seats ?? "0 seats filled"}
            </span>
          </div>
          <dl className="mt-2 space-y-1 text-sm text-muted-foreground">
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 text-xs uppercase tracking-wide">Pickup</dt>
              <dd className="text-foreground">{stats.latestGroup?.label ?? "—"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 text-xs uppercase tracking-wide">Route</dt>
              <dd className="text-foreground">{stats.latestGroup?.corridor ?? "—"}</dd>
            </div>
          </dl>
        </div>

        <Button asChild className="mt-4 w-full sm:w-auto">
          <Link to="/admin/ai-matching">
            Open AI Matching Center <ArrowRight className="size-4" />
          </Link>
        </Button>
      </section>
    </AdminShell>
  );
}
