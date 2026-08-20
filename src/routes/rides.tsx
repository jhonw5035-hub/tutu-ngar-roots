import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Clock, MapPin, Users } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { usePassengerNav } from "@/components/layout/passenger-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useBooking } from "@/lib/booking-store";
import { formatTime12, getDepartures, type Departure } from "@/lib/mockData";

export const Route = createFileRoute("/rides")({
  head: () => ({
    meta: [
      { title: "Available Shared Rides — Tu Tu Ngar Yangon" },
      {
        name: "description",
        content:
          "See Yangon departures where people are already heading your way: seats filled, pickup ETA and price per seat.",
      },
      { property: "og:title", content: "Available Shared Rides — Tu Tu Ngar" },
      {
        property: "og:description",
        content: "Shared departures with real seat-fill and price per seat.",
      },
    ],
  }),
  component: AvailableRides,
});

function AvailableRides() {
  const navItems = usePassengerNav("trips");
  const booking = useBooking();

  const departures = getDepartures(
    booking.pickupText,
    booking.destinationText,
    booking.windowId,
  );

  return (
    <AppShell portal="passenger" navItems={navItems}>
      <section className="space-y-1">
        <h1 className="text-2xl">Available shared rides</h1>
        <p className="text-sm text-muted-foreground">
          {booking.pickupText || "Your area"} → {booking.destinationText || "Downtown Yangon"} ·{" "}
          <span className="capitalize">{booking.day}</span>
        </p>
      </section>

      <div className="mt-4 space-y-3">
        {departures.map((d) => (
          <DepartureCard key={d.slot.id} departure={d} />
        ))}
      </div>
    </AppShell>
  );
}

function DepartureCard({ departure }: { departure: Departure }) {
  const navigate = useNavigate();
  const booking = useBooking();
  const { slot, route, label, riders, pickupEtaMin } = departure;
  const nearlyFull = slot.seatsLeft === 1;

  return (
    <Card className={cn("shadow-card", nearlyFull && "border-primary/50")}>
      <CardContent className="space-y-3 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="num text-lg font-semibold">{formatTime12(slot.time)}</p>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-3.5 text-primary" /> {label}
            </p>
          </div>
          {nearlyFull ? <Badge variant="progress">Almost full</Badge> : null}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {riders.map((r) => (
              <span
                key={r.id}
                title="Passenger"
                className="num flex size-8 items-center justify-center rounded-full border-2 border-card bg-primary text-[11px] text-primary-foreground"
              >
                {r.firstName.slice(0, 2).toUpperCase()}
              </span>
            ))}
            {Array.from({ length: slot.seatsLeft }, (_, i) => (
              <span
                key={i}
                className="flex size-8 items-center justify-center rounded-full border-2 border-dashed border-border bg-card text-muted-foreground"
              >
                <Users className="size-3.5" />
              </span>
            ))}
          </div>
          <p className="text-sm">
            <span aria-hidden>🚗</span>{" "}
            <span className="num">
              {slot.seatsFilled} / {slot.seatsCapacity}
            </span>{" "}
            seats filled
          </p>
        </div>

        {pickupEtaMin ? (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5" /> Pickup in ~
            <span className="num">{pickupEtaMin}</span> min
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
          <p className="text-sm">
            <span className="num font-semibold">{slot.seatsLeft}</span> seat
            {slot.seatsLeft === 1 ? "" : "s"} available ·{" "}
            <span className="num text-primary">{slot.price.toLocaleString()} MMK</span> / seat
          </p>
          <Button
            size="sm"
            disabled={slot.seatsLeft === 0}
            onClick={() => {
              booking.set({ routeId: route.id, slotId: slot.id, pickupPointId: null });
              navigate({ to: "/ride/$slotId", params: { slotId: slot.id } });
            }}
          >
            View Ride <ArrowRight className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
