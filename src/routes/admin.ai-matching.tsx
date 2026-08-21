import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { BookingRow } from "@/lib/live";
import { runOptimization, type PlannedGroup } from "@/lib/optimizer";
import { optimizationSteps } from "@/lib/adminMockData";

export const Route = createFileRoute("/admin/ai-matching")({
  head: () => ({
    meta: [
      { title: "AI Matching Center — Tu Tu Ngar Admin" },
      {
        name: "description",
        content:
          "Turn individual Yangon bookings into optimized shared trips: clustering, recommended meeting points and vehicle assignment.",
      },
      { property: "og:title", content: "AI Matching Center — Tu Tu Ngar Admin" },
      {
        property: "og:description",
        content:
          "Cluster waiting passengers into optimized shared trips with recommended meeting points.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AiMatchingPage,
});

type ResultGroup = PlannedGroup & { id: string };

function useDriverNames(groups: ResultGroup[]) {
  const [names, setNames] = React.useState<Record<string, string>>({});
  React.useEffect(() => {
    const ids = groups.map((g) => g.driverId).filter((id): id is string => Boolean(id));
    if (!ids.length) return;
    void supabase
      .from("profiles")
      .select("id, full_name, first_name, plate_number")
      .in("id", ids)
      .then(({ data }) => {
        const next: Record<string, string> = {};
        for (const p of data ?? []) {
          next[p.id] = `${p.first_name ?? p.full_name ?? "Driver"}${
            p.plate_number ? ` · ${p.plate_number}` : ""
          }`;
        }
        setNames(next);
      });
  }, [groups]);
  return names;
}

function AiMatchingPage() {
  const [phase, setPhase] = React.useState<"idle" | "running" | "done">("idle");
  const [visibleSteps, setVisibleSteps] = React.useState(0);
  const [pending, setPending] = React.useState<BookingRow[]>([]);
  const [groups, setGroups] = React.useState<ResultGroup[]>([]);
  const [detailGroup, setDetailGroup] = React.useState<string | null>(null);
  const driverNames = useDriverNames(groups);

  const loadPending = React.useCallback(async () => {
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    setPending(data ?? []);
  }, []);

  React.useEffect(() => {
    void loadPending();
    const channel = supabase
      .channel("admin-pending-bookings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => void loadPending(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadPending]);

  // Areas waiting, derived from real pickup labels.
  const pendingAreas = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const b of pending) {
      const key = b.pickup_label ?? "Unknown area";
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return [...map.entries()].map(([area, passengers]) => ({ area, passengers }));
  }, [pending]);

  async function run() {
    setVisibleSteps(0);
    setDetailGroup(null);
    setGroups([]);
    setPhase("running");

    const timers: number[] = [];
    optimizationSteps.forEach((_, i) => {
      timers.push(window.setTimeout(() => setVisibleSteps(i + 1), 350 * (i + 1)));
    });

    try {
      const result = await runOptimization();
      setGroups(result.groups);
      setVisibleSteps(optimizationSteps.length);
      setPhase("done");
      await loadPending();
      if (!result.groups.length) toast.message("No pending bookings with location to group yet");
    } catch (err) {
      setPhase("idle");
      toast.error(err instanceof Error ? err.message : "Optimization failed");
    } finally {
      timers.forEach(window.clearTimeout);
    }
  }

  return (
    <AdminShell>
      <h1 className="text-2xl font-extrabold tracking-tight">AI Matching Center</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Individual bookings become grouped, optimized shared trips. The optimizer clusters real
        pickup coordinates, keeps groups gender-balanced where possible, and assigns the nearest
        online driver.
      </p>

      {/* Pending queue — live */}
      <section className="mt-6 rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold tracking-tight">
            <span aria-hidden>⏳</span> Waiting for AI Matching
          </h2>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
            {pending.length} passengers waiting
          </span>
        </div>
        {pendingAreas.length ? (
          <ul className="mt-3 divide-y divide-border">
            {pendingAreas.map((row) => (
              <li key={row.area} className="flex items-center justify-between py-2 text-sm">
                <span className="font-medium">{row.area}</span>
                <span className="text-muted-foreground">{row.passengers} passengers</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            No pending bookings right now — new passenger bookings appear here instantly.
          </p>
        )}
        <Button
          className="mt-4 w-full sm:w-auto"
          onClick={() => void run()}
          disabled={phase === "running" || !pending.length}
        >
          {phase === "running" ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Optimizing…
            </>
          ) : (
            "Run AI Optimization"
          )}
        </Button>
      </section>

      {/* Optimization trace */}
      {phase !== "idle" ? (
        <section className="mt-4 rounded-xl border border-primary/30 bg-card p-5 font-mono text-sm">
          <p className="text-muted-foreground">Analyzing bookings…</p>
          <ul className="mt-3 space-y-1.5">
            {optimizationSteps.slice(0, visibleSteps).map((step) => (
              <li
                key={step}
                className="flex animate-in fade-in slide-in-from-left-2 items-center gap-2"
              >
                <Check className="size-4 text-emerald-500" />
                {step}
              </li>
            ))}
          </ul>
          {phase === "done" ? (
            <p className="mt-3 font-bold text-primary">Optimization Complete</p>
          ) : null}
        </section>
      ) : null}

      {/* Real groups */}
      {phase === "done" ? (
        <section className="mt-4 space-y-3">
          <h2 className="text-base font-bold tracking-tight">Optimized groups ({groups.length})</h2>
          {groups.map((g, index) => (
            <div key={g.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="size-2.5 rounded-full bg-emerald-500" aria-hidden />
                <p className="font-bold">Group {String.fromCharCode(65 + index)}</p>
                <span className="text-sm text-muted-foreground">
                  {g.bookings.length} passengers · {g.corridorLabel}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                <span aria-hidden>🚗</span>{" "}
                {g.driverId
                  ? `${driverNames[g.driverId] ?? "Assigned driver"} · ${g.driverDistanceKm ?? "—"} km away`
                  : "No online driver available — waiting"}
              </p>
              {g.minorityBookingIds.length ? (
                <p className="mt-1 text-xs text-amber-600">
                  {g.minorityBookingIds.length} passenger flagged as minority gender in this group.
                </p>
              ) : null}
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDetailGroup(detailGroup === g.id ? null : g.id)}
                >
                  View Optimization
                </Button>
              </div>

              {detailGroup === g.id ? (
                <div className="mt-4 space-y-3 rounded-lg border border-border bg-background p-4">
                  <div>
                    <p className="text-sm font-semibold">
                      📍 Optimized meeting point: {g.pickupLabel}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Centroid {g.centroid.lat.toFixed(4)}, {g.centroid.lng.toFixed(4)}
                    </p>
                  </div>
                  <ul className="space-y-1 text-sm">
                    {g.bookings.map((b, i) => (
                      <li key={b.id} className="flex justify-between gap-3">
                        <span>
                          {i + 1}. {b.passenger_name ?? "Passenger"}{" "}
                          <span className="text-muted-foreground">
                            ({b.passenger_gender ?? "n/a"})
                          </span>
                        </span>
                        <span className="text-muted-foreground">
                          → {b.destination_label ?? "Destination"}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">
                    AI reduced {g.bookings.length} individual trips → 1 shared trip.
                  </p>
                </div>
              ) : null}
            </div>
          ))}
        </section>
      ) : null}
    </AdminShell>
  );
}
