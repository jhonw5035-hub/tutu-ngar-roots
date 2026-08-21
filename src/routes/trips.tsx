import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Star } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { usePassengerNav } from "@/components/layout/passenger-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useBooking } from "@/lib/booking-store";
import { formatTime12, getRoute, pastTrips, upcomingTrip } from "@/lib/mockData";
import { resolveSlot } from "@/lib/departure";

export const Route = createFileRoute("/trips")({
  head: () => ({
    meta: [
      { title: "My Trips — Tu Tu Ngar" },
      {
        name: "description",
        content:
          "Your upcoming Tu Tu Ngar shared departures and completed Yangon rides, with fares and ratings.",
      },
      { property: "og:title", content: "My Trips — Tu Tu Ngar" },
      {
        property: "og:description",
        content: "Upcoming shared departures and completed rides in Yangon.",
      },
    ],
  }),
  component: TripsPage,
});

function TripsPage() {
  const navItems = usePassengerNav("trips");
  const navigate = useNavigate();
  const booking = useBooking();

  const slot = resolveSlot(booking.slotId, booking.liveDeparture, booking.routeId);
  const route = getRoute(booking.routeId);

  const upcoming = slot && route
    ? {
        label: `${route.from} → ${route.to}`,
        when: `${booking.day === "today" ? "Today" : "Tomorrow"} · ${formatTime12(slot.time)}`,
      }
    : {
        label: `${upcomingTrip.pickup} → ${upcomingTrip.destination}`,
        when: `${upcomingTrip.date} · ${formatTime12(upcomingTrip.time)}`,
      };

  return (
    <AppShell portal="passenger" navItems={navItems}>
      <h1 className="text-2xl">My Trips.</h1>

      <section className="mt-5 space-y-2">
        <h2 className="text-lg">Upcoming</h2>
        <Card className="shadow-card">
          <CardContent className="space-y-2 pt-6">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold">{upcoming.label}</span>
              <Badge variant="confirmed">Confirmed</Badge>
            </div>
            <p className="num text-sm text-muted-foreground">{upcoming.when}</p>
            <Button size="sm" onClick={() => navigate({ to: "/trip" })}>
              View Trip
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 space-y-2">
        <h2 className="text-lg">Completed</h2>
        {pastTrips.map((trip, i) => (
          <Card key={trip.id} className="shadow-card">
            <CardContent className="space-y-2 pt-6">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">
                  {trip.pickup} → {trip.destination}
                </span>
                <span className="num text-sm text-primary">
                  {trip.fare.toLocaleString()} MMK
                </span>
              </div>
              <p className="num text-xs text-muted-foreground">
                {i === 0 ? "Yesterday" : trip.date} · {formatTime12(trip.time)}
              </p>
              <StarRating tripId={trip.id} />
            </CardContent>
          </Card>
        ))}
      </section>
    </AppShell>
  );
}

function StarRating({ tripId }: { tripId: string }) {
  const [rating, setRating] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`Rate ${n} star${n === 1 ? "" : "s"} for trip ${tripId}`}
          onClick={() => setRating(n)}
          className="cursor-pointer p-0.5 transition-transform active:scale-90"
        >
          <Star
            className={cn(
              "size-4",
              n <= rating ? "fill-primary text-primary" : "text-muted-foreground",
            )}
          />
        </button>
      ))}
      <span className="ml-1 text-xs text-muted-foreground">
        {rating ? `${rating}.0` : "Not rated"}
      </span>
    </div>
  );
}
