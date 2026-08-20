import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Heart, MapPin, ShieldCheck, ThumbsUp } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { usePassengerNav } from "@/components/layout/passenger-nav";
import { SeatBar } from "@/components/booking/seat-bar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useBooking } from "@/lib/booking-store";
import { getPointsForRoute, getRoute, getSlotDetails, pathDistanceKm } from "@/lib/mockData";

export const Route = createFileRoute("/depart/$routeId")({
  head: () => ({
    meta: [
      { title: "Choose Departure — Tu Tu Ngar Yangon" },
      {
        name: "description",
        content:
          "Compare departure times, seat availability and fares on your Yangon corridor, then lock in the slot that suits you.",
      },
      { property: "og:title", content: "Choose Departure — Tu Tu Ngar" },
      {
        property: "og:description",
        content: "Departure times, seats left and fares for your Yangon shared ride.",
      },
    ],
  }),
  component: TimeSelection,
});

function TimeSelection() {
  const { routeId } = useParams({ from: "/depart/$routeId" });
  const navItems = usePassengerNav("trips");
  const navigate = useNavigate();
  const booking = useBooking();

  const route = getRoute(routeId);
  const slots = getSlotDetails(routeId);
  const points = getPointsForRoute(routeId);
  const distance = route ? pathDistanceKm(route.path) : 0;

  const pickup = booking.pickupText || points[0]?.name || route?.from || "Pickup";
  const destination =
    booking.destinationText || points[points.length - 1]?.name || route?.to || "Destination";

  const dateLabel = new Date(`${booking.date}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  if (!route) {
    return (
      <AppShell portal="passenger" navItems={navItems}>
        <p className="text-sm text-muted-foreground">That route no longer exists.</p>
      </AppShell>
    );
  }

  return (
    <AppShell portal="passenger" navItems={navItems}>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Back"
          onClick={() => navigate({ to: "/discover" })}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="text-xl">Choose Departure</h1>
        <div className="ml-auto flex items-center gap-1 text-muted-foreground">
          <Heart className="size-5" aria-hidden />
          <ThumbsUp className="size-5" aria-hidden />
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-border bg-card p-4 shadow-card">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <MapPin className="size-4 text-primary" />
          {pickup} → {destination}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {route.roadName} · approx.{" "}
          <span className="num text-foreground">{distance.toFixed(1)} km</span> · {dateLabel}
        </p>
      </div>

      <ul className="mt-4 space-y-3">
        {slots.map((s) => {
          const selected = booking.slotId === s.id;
          const full = s.seatsLeft === 0;
          return (
            <li key={s.id}>
              <button
                type="button"
                disabled={full}
                aria-pressed={selected}
                onClick={() => booking.set({ slotId: s.id, routeId: route.id })}
                className={cn(
                  "w-full cursor-pointer rounded-2xl border p-4 text-left transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
                  selected
                    ? "border-primary bg-accent shadow-elevated"
                    : s.recommended
                      ? "border-primary/60 bg-primary/5 shadow-card"
                      : "border-border bg-card shadow-card hover:border-primary/40",
                )}
              >
                {s.recommended ? (
                  <Badge variant="progress" className="mb-2">
                    Recommended for you
                  </Badge>
                ) : null}
                <div className="flex items-baseline justify-between gap-3">
                  <p className="num text-lg">{s.time}</p>
                  <p className="num text-sm text-primary">{s.price.toLocaleString()} Ks</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Arrives approx. <span className="num text-foreground">{s.arrival}</span>
                </p>
                <SeatBar
                  className="mt-3"
                  filled={s.seatsFilled}
                  capacity={s.seatsCapacity}
                />
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="num text-muted-foreground">
                    {s.seatsFilled}/{s.seatsCapacity} seats
                  </span>
                  <span className="text-muted-foreground">
                    {s.seatsLeft === 1 ? "1 seat left" : `${s.seatsLeft} seats left`}
                  </span>
                  <Badge variant={full ? "muted" : "confirmed"} className="ml-auto">
                    {full ? "Fully booked" : "Available"}
                  </Badge>
                </div>
                {s.womenOnlyAvailable && !full ? (
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary">
                    <ShieldCheck className="size-3.5" /> Women-only group available
                  </p>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="safe-bottom fixed inset-x-0 bottom-14 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl">
          <Button
            className="w-full"
            size="lg"
            disabled={!booking.slotId}
            onClick={() => navigate({ to: "/book" })}
          >
            {booking.slotId ? "Confirm pickup point" : "Select a departure time"}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
