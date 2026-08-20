import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Car, Flag, MapPin, ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { usePassengerNav } from "@/components/layout/passenger-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SeatBar } from "@/components/booking/seat-bar";
import { useBooking } from "@/lib/booking-store";
import { useSession } from "@/lib/session";
import {
  formatTime12,
  getPassengers,
  getPointsForRoute,
  getRoute,
  getSlotDetail,
  mockDriver,
  nearestPickupPoint,
  type LatLng,
} from "@/lib/mockData";

export const Route = createFileRoute("/ride/$slotId")({
  head: () => ({
    meta: [
      { title: "Shared Ride Details — Tu Tu Ngar Yangon" },
      {
        name: "description",
        content:
          "Your matched pickup stop, who is already onboard, driver verification and your fare for this Yangon shared departure.",
      },
      { property: "og:title", content: "Shared Ride Details — Tu Tu Ngar" },
      {
        property: "og:description",
        content: "Matched pickup point, group makeup and fare for your shared departure.",
      },
    ],
  }),
  component: RideDetails,
});

function RideDetails() {
  const { slotId } = Route.useParams();
  const navItems = usePassengerNav("trips");
  const navigate = useNavigate();
  const booking = useBooking();
  const { profile } = useSession();
  const [location, setLocation] = useState<LatLng | null>(null);

  // Contextual location use only — the matched stop is computed silently.
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation([pos.coords.latitude, pos.coords.longitude]),
      () => setLocation(null),
      { timeout: 8000, maximumAge: 300000 },
    );
  }, []);

  const slot = getSlotDetail(slotId);
  const route = getRoute(slot?.routeId ?? booking.routeId);
  const points = getPointsForRoute(route?.id ?? null);
  const pickup = nearestPickupPoint(route?.id ?? null, location);
  const destination = points[points.length - 1] ?? null;

  const riders = getPassengers(slotId);
  const women = riders.filter((r) => r.gender === "female").length;
  const men = riders.length - women;
  const youFemale = profile?.gender === "female";

  const routeId = slot?.routeId ?? null;
  const pickupId = pickup?.id ?? null;
  const set = booking.set;
//   useEffect(() => {
//     if (routeId && pickupId) set({ routeId, slotId, pickupPointId: pickupId });
//   }, [routeId, slotId, pickupId, set]);

  if (!slot || !route) {
    return (
      <AppShell portal="passenger" navItems={navItems}>
        <p className="text-sm text-muted-foreground">That departure is no longer available.</p>
        <Button className="mt-4" onClick={() => navigate({ to: "/rides" })}>
          Back to shared rides
        </Button>
      </AppShell>
    );
  }

  return (
    <AppShell portal="passenger" navItems={navItems}>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Back" onClick={() => history.back()}>
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="flex items-center gap-2 text-xl">
            <Car className="size-5 text-primary" /> Shared Ride
          </h1>
          <p className="text-sm text-muted-foreground">
            {route.from} → {route.to} · departs{" "}
            <span className="num text-foreground">{formatTime12(slot.time)}</span>
          </p>
        </div>
      </div>

      <Card className="mt-4 shadow-card">
        <CardContent className="space-y-4 pt-6">
          <div className="flex gap-3">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold">{pickup?.name ?? "Matched at departure"}</p>
              <p className="text-xs text-muted-foreground">Closest pickup point to your location</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Flag className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold">{destination?.name ?? route.to}</p>
              <p className="text-xs text-muted-foreground">Drop-off</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4 shadow-card">
        <CardContent className="space-y-3 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg">Passengers</h2>
            <span className="num text-sm text-muted-foreground">
              {slot.seatsFilled} / {slot.seatsCapacity} seats occupied
            </span>
          </div>
          <SeatBar filled={slot.seatsFilled} capacity={slot.seatsCapacity} />
          {/* Privacy: never show other passengers' names or photos here. */}
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-primary bg-accent px-3 py-1.5 text-xs font-semibold">
              {youFemale ? "👩" : "👨"} You
            </span>
            {riders.map((r) => (
              <span
                key={r.id}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground"
              >
                {r.gender === "female" ? "👩" : "👨"} Passenger
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Passenger preferences: 👩 Women: <span className="num">{women}</span> · 👨 Men:{" "}
            <span className="num">{men}</span>
            {slot.womenOnlyAvailable ? " · women-only group available" : ""}
          </p>
        </CardContent>
      </Card>

      <Card className="mt-4 shadow-card">
        <CardContent className="flex items-center justify-between gap-3 pt-6">
          <div>
            <Badge variant="confirmed">
              <ShieldCheck className="mr-1 size-3" /> Driver verified
            </Badge>
            <p className="mt-2 text-sm">{mockDriver.name}</p>
          </div>
          <p className="num text-sm text-muted-foreground">🚘 {mockDriver.plate}</p>
        </CardContent>
      </Card>

      <Card className="mt-4 shadow-card">
        <CardContent className="flex items-center justify-between pt-6">
          <span className="text-sm text-muted-foreground">Your fare</span>
          <span className="num text-xl font-semibold text-primary">
            {slot.price.toLocaleString()} MMK
          </span>
        </CardContent>
      </Card>

      <div className="safe-bottom fixed inset-x-0 bottom-14 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl">
          <Button className="w-full" size="lg" onClick={() => navigate({ to: "/pay" })}>
            Confirm &amp; Pay
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
