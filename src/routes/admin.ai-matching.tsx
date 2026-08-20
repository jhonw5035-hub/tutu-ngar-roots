import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { Check, Loader2 } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  beforeAi,
  optimizationSteps,
  optimizedDrops,
  optimizedGroups,
  optimizedPickup,
  pendingPassengers,
  pendingTotal,
  routeSequence,
  routeStats,
  vehicleOptions,
  vehicleRecommendation,
  whyThisRoute,
} from "@/lib/adminMockData";

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
        content: "Cluster waiting passengers into optimized shared trips with recommended meeting points.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AiMatchingPage,
});

const toneClass: Record<string, string> = {
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  blue: "bg-sky-500",
};

function AiMatchingPage() {
  const [phase, setPhase] = React.useState<"idle" | "running" | "done">("idle");
  const [visibleSteps, setVisibleSteps] = React.useState(0);
  const [detailGroup, setDetailGroup] = React.useState<string | null>(null);
  const [assignGroup, setAssignGroup] = React.useState<string | null>(null);
  const [showWhy, setShowWhy] = React.useState(false);

  React.useEffect(() => {
    if (phase !== "running") return;
    const timers: number[] = [];
    optimizationSteps.forEach((_, i) => {
      timers.push(
        window.setTimeout(() => setVisibleSteps(i + 1), 400 * (i + 1)),
      );
    });
    timers.push(
      window.setTimeout(() => setPhase("done"), 400 * (optimizationSteps.length + 1)),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [phase]);

  function run() {
    setVisibleSteps(0);
    setDetailGroup(null);
    setAssignGroup(null);
    setPhase("running");
  }

  return (
    <AdminShell>
      <h1 className="text-2xl font-extrabold tracking-tight">AI Matching Center</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Individual bookings become grouped, optimized shared trips. The optimizer recommends a
        meeting and drop-off point within an acceptable walking distance while minimizing route
        deviation — it does not claim a single exact pickup location per passenger.
      </p>

      {/* Section 1 — pending queue */}
      <section className="mt-6 rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold tracking-tight">
            <span aria-hidden>⏳</span> Waiting for AI Matching
          </h2>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
            {pendingTotal} passengers waiting
          </span>
        </div>
        <ul className="mt-3 divide-y divide-border">
          {pendingPassengers.map((row) => (
            <li key={row.area} className="flex items-center justify-between py-2 text-sm">
              <span className="font-medium">{row.area}</span>
              <span className="text-muted-foreground">{row.passengers} passengers</span>
            </li>
          ))}
        </ul>
        <Button className="mt-4 w-full sm:w-auto" onClick={run} disabled={phase === "running"}>
          {phase === "running" ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Optimizing…
            </>
          ) : (
            "Run AI Optimization"
          )}
        </Button>
      </section>

      {/* Section 2 — animation */}
      {phase !== "idle" ? (
        <section className="mt-4 rounded-xl border border-primary/30 bg-card p-5 font-mono text-sm">
          <p className="text-muted-foreground">Analyzing {pendingTotal} passengers…</p>
          <ul className="mt-3 space-y-1.5">
            {optimizationSteps.slice(0, visibleSteps).map((step) => (
              <li key={step} className="flex animate-in fade-in slide-in-from-left-2 items-center gap-2">
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

      {/* Section 3 — groups */}
      {phase === "done" ? (
        <section className="mt-4 space-y-3">
          <h2 className="text-base font-bold tracking-tight">Optimized groups</h2>
          {optimizedGroups.map((g) => (
            <div key={g.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("size-2.5 rounded-full", toneClass[g.tone])} aria-hidden />
                <p className="font-bold">{g.name}</p>
                <span className="text-sm text-muted-foreground">
                  {g.passengers} passengers · {g.corridor}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                <span aria-hidden>🚗</span> {g.vehicle} · {g.seats}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDetailGroup(detailGroup === g.id ? null : g.id)}
                >
                  View Optimization
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAssignGroup(assignGroup === g.id ? null : g.id)}
                >
                  Assign Driver
                </Button>
              </div>

              {/* Section 4 — clustering breakdown */}
              {detailGroup === g.id ? (
                <div className="mt-4 space-y-4 rounded-lg border border-border bg-background p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Before AI
                      </p>
                      <ul className="mt-2 space-y-1 font-mono text-sm">
                        {beforeAi.map((r) => (
                          <li key={r.rider}>🚗 → {r.rider} → {r.drop}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        After AI
                      </p>
                      <div className="mt-2 space-y-1 font-mono text-sm">
                        <p>P1 P2 P3 P4</p>
                        <p className="text-primary">↓ converge</p>
                        <p>📍 {optimizedPickup.name}</p>
                        <p className="text-primary">↓ diverge</p>
                        <p>📍 {optimizedDrops[0]?.name} · 📍 {optimizedDrops[1]?.name}</p>
                        <p className="font-bold">🚗 ONE VEHICLE · 4 PASSENGERS</p>
                      </div>
                    </div>
                  </div>

                  <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">
                    AI reduced 4 individual trips → 1 shared trip.
                  </p>

                  <div>
                    <p className="text-sm font-semibold">
                      📍 Optimized pickup point: {optimizedPickup.name}
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-1 text-sm text-muted-foreground sm:grid-cols-4">
                      {optimizedPickup.walks.map((w) => (
                        <span key={w.rider}>{w.rider} — {w.meters}m away</span>
                      ))}
                    </div>
                  </div>

                  {optimizedDrops.map((d) => (
                    <div key={d.name}>
                      <p className="text-sm font-semibold">📍 Optimized drop point: {d.name}</p>
                      <div className="mt-1 flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {d.walks.map((w) => (
                          <span key={w.rider}>{w.rider} — {w.meters}m away</span>
                        ))}
                      </div>
                    </div>
                  ))}

                  <Button variant="outline" size="sm" onClick={() => setShowWhy((v) => !v)}>
                    Why this route?
                  </Button>
                  {showWhy ? (
                    <div className="rounded-lg border border-border bg-muted/40 p-3">
                      <p className="text-sm font-semibold">AI optimization explanation</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        {whyThisRoute.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {/* Section 5 + 6 — vehicle assignment & route builder */}
              {assignGroup === g.id ? (
                <div className="mt-4 space-y-4 rounded-lg border border-border bg-background p-4">
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="py-1 font-medium">Vehicle</th>
                        <th className="py-1 font-medium">Capacity</th>
                        <th className="py-1 font-medium">Distance</th>
                        <th className="py-1 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {vehicleOptions.map((v) => (
                        <tr key={v.plate}>
                          <td className="py-1.5 font-mono">{v.plate}</td>
                          <td className="py-1.5">{v.capacity}</td>
                          <td className="py-1.5">{v.distanceKm} km</td>
                          <td className="py-1.5 text-muted-foreground">{v.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="rounded-lg bg-primary/10 p-3 text-sm">
                    <p className="font-semibold text-primary">
                      AI recommendation: 🚗 {vehicleRecommendation.plate}
                    </p>
                    <p className="text-muted-foreground">Reason: {vehicleRecommendation.reason}</p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold">Optimized route</p>
                    <ol className="mt-2 space-y-1 font-mono text-sm">
                      {routeSequence.map((stop, i) => (
                        <li key={stop}>
                          {stop}
                          {i < routeSequence.length - 1 ? (
                            <span className="block text-primary">↓</span>
                          ) : null}
                        </li>
                      ))}
                    </ol>
                    <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                      {routeStats.map((s) => (
                        <div key={s.label} className="rounded-lg border border-border p-2">
                          <dt className="text-xs text-muted-foreground">{s.label}</dt>
                          <dd className="font-semibold">{s.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              ) : null}
            </div>
          ))}

          {/* Section 7 — overflow */}
          <div className="rounded-xl border border-dashed border-border bg-card p-4">
            <h3 className="text-sm font-bold">Seat overflow handling</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Group B matched 5 passengers against a 4-seat vehicle.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-3 text-sm">
                🚗 TGN-017 · 4/4 seats — P1 P2 P3 P4
              </div>
              <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
                P5 → moved to the next departure (8:30 AM) or TGN-031
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </AdminShell>
  );
}
