import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Clock, MapPin, Search, Users } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { usePassengerNav } from "@/components/layout/passenger-nav";
import { SeatBar } from "@/components/booking/seat-bar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useBooking } from "@/lib/booking-store";
import { getPointsForRoute, routeSummaries, type TimeBand } from "@/lib/mockData";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Find a Route — Tu Tu Ngar Yangon" },
      {
        name: "description",
        content:
          "Browse Yangon shared-ride corridors by pickup point, price and departure window, then pick the seat that fits your morning.",
      },
      { property: "og:title", content: "Find a Route — Tu Tu Ngar" },
      {
        property: "og:description",
        content: "Search Yangon corridors by pickup point, price and departure time.",
      },
    ],
  }),
  component: RouteDiscovery,
});

type Chip = "available" | Exclude<TimeBand, "any">;

const chips: { id: Chip; label: string }[] = [
  { id: "available", label: "Available" },
  { id: "morning", label: "Morning" },
  { id: "afternoon", label: "Afternoon" },
  { id: "evening", label: "Evening" },
];

function RouteDiscovery() {
  const navItems = usePassengerNav("trips");
  const navigate = useNavigate();
  const booking = useBooking();

  const active = new Set<Chip>([
    ...(booking.band !== "any" ? [booking.band as Chip] : []),
  ]);

  const toggle = (chip: Chip) => {
    if (chip === "available") {
      booking.set({ query: booking.query });
      return;
    }
    booking.set({ band: booking.band === chip ? "any" : chip });
  };

  const q = booking.query.trim().toLowerCase();
  const summaries = routeSummaries().filter((s) => {
    const matchesQuery =
      !q ||
      s.route.name.toLowerCase().includes(q) ||
      s.label.toLowerCase().includes(q) ||
      s.route.roadName.toLowerCase().includes(q) ||
      getPointsForRoute(s.route.id).some((p) => p.name.toLowerCase().includes(q));
    const matchesBand =
      booking.band === "any" || s.nextDeparture?.band === booking.band;
    return matchesQuery && matchesBand;
  });

  return (
    <AppShell portal="passenger" navItems={navItems}>
      <div className="relative">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search routes or pickup points"
          aria-label="Search routes or pickup points"
          value={booking.query}
          onChange={(e) => booking.set({ query: e.target.value })}
        />
      </div>

      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {chips.map((c) => {
          const on = c.id === "available" ? true : active.has(c.id);
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(c.id)}
              className={cn(
                "shrink-0 cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-[0.97]",
                on
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50",
              )}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        {summaries.length} route{summaries.length === 1 ? "" : "s"}
        {booking.pickupText ? ` near ${booking.pickupText}` : ""}
      </p>

      <div className="mt-2 space-y-3">
        {summaries.map((s) => {
          const next = s.nextDeparture;
          return (
            <Card key={s.route.id} className="shadow-card">
              <CardContent className="space-y-3 pt-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{s.label}</p>
                    <p className="text-xs text-muted-foreground">{s.route.roadName}</p>
                  </div>
                  <span className="num text-sm text-primary">
                    From {s.startingPrice.toLocaleString()} Ks
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5" /> {s.pickupCount} Pickup Points
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-3.5" /> Next{" "}
                    <span className="num text-foreground">{next?.time ?? "—"}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="size-3.5" />
                    {next
                      ? `${next.seatsLeft} seat${next.seatsLeft === 1 ? "" : "s"} left`
                      : "Full"}
                  </span>
                </div>

                {next ? (
                  <SeatBar filled={next.seatsFilled} capacity={next.seatsCapacity} />
                ) : null}

                <div className="flex items-center justify-between gap-3">
                  <Badge variant={next && next.seatsLeft > 0 ? "confirmed" : "muted"}>
                    {next && next.seatsLeft > 0 ? "Available" : "Fully booked"}
                  </Badge>
                  <Button
                    size="sm"
                    onClick={() => {
                      booking.set({ routeId: s.route.id, slotId: null });
                      navigate({ to: "/depart/$routeId", params: { routeId: s.route.id } });
                    }}
                  >
                    View Route
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {summaries.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No corridors match that search. Try a different pickup point or clear the
            time filter.
          </p>
        ) : null}
      </div>
    </AppShell>
  );
}
