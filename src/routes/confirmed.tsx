import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Car, Loader2, MapPin, Share2, Users } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { AppShell } from "@/components/layout/app-shell";
import { usePassengerNav } from "@/components/layout/passenger-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SeatBar } from "@/components/booking/seat-bar";
import { resolveSlot } from "@/lib/departure";
import { useBooking } from "@/lib/booking-store";
import { formatTime12, getPoint, getPointsForRoute, getRoute, mockDriver } from "@/lib/mockData";
import { MapView } from "@/components/map/map-view";
import { TripChat } from "@/components/chat/trip-chat";
import { useDriverLocation } from "@/lib/driver-sim";
import { useMyLiveBooking } from "@/lib/live";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/confirmed")({
  validateSearch: z.object({ booking: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "You're Booked — Tu Tu Ngar Shared Ride" },
      {
        name: "description",
        content:
          "Your Yangon shared seat is confirmed: pickup stop, departure time, driver and plate, with live tracking on demand.",
      },
      { property: "og:title", content: "You're Booked — Tu Tu Ngar" },
      {
        property: "og:description",
        content: "Shared seat confirmed with driver and pickup details.",
      },
    ],
  }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const navItems = usePassengerNav("trips");
  const navigate = useNavigate();
  const booking = useBooking();
  const { booking: bookingId } = Route.useSearch();
  const { userId, profile } = useSession();
  // Live: flips from "matching" to the real group + driver the moment the
  // admin optimizer groups this booking.
  const live = useMyLiveBooking(userId, bookingId ?? null);
  const grouped = live.booking?.status === "grouped";
  // Chat + live driver tracking only exist once the driver has accepted.
  const accepted = live.group?.status === "accepted" || live.group?.status === "in_progress";
  // Driver position is simulated on the driver side; passenger location stays real.
  const driverLive = useDriverLocation(accepted ? (live.group?.driver_id ?? null) : null);
  const groupPickup =
    live.group?.pickup_lat != null && live.group?.pickup_lng != null
      ? { lat: Number(live.group.pickup_lat), lng: Number(live.group.pickup_lng) }
      : null;

  const slot = resolveSlot(booking.slotId, booking.liveDeparture, booking.routeId);
  const route = getRoute(booking.routeId);
  const points = getPointsForRoute(route?.id ?? null);
  const pickup = getPoint(booking.pickupPointId) ?? points[0] ?? null;
  const destination = points[points.length - 1] ?? null;
  const filled = Math.min((slot?.seatsFilled ?? 2) + 1, slot?.seatsCapacity ?? 4);
  const capacity = slot?.seatsCapacity ?? 4;

  const share = async () => {
    const text = `I'm riding Tu Tu Ngar: ${route?.from ?? "Yangon"} → ${route?.to ?? "Downtown"} at ${
      slot ? formatTime12(slot.time) : "8:00 AM"
    }, plate ${mockDriver.plate}.`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "My Tu Tu Ngar trip", text });
        return;
      }
      await navigator.clipboard.writeText(text);
      toast.success("Trip link copied — share it with someone you trust");
    } catch {
      toast.error("Couldn't share right now");
    }
  };

  return (
    <AppShell portal="passenger" navItems={navItems}>
      <section className="space-y-1 text-center">
        <h1 className="text-2xl">🎉 You're booked!</h1>
        <p className="text-sm text-muted-foreground">
          Your seat is held. Be at your stop five minutes early.
        </p>
      </section>

      <Card className="mt-5 shadow-card">
        <CardContent className="space-y-2 pt-6 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold">
              {route ? `${route.from} → ${route.to}` : "Shared ride"}
            </span>
            <Badge variant="confirmed">Confirmed</Badge>
          </div>
          <p className="text-muted-foreground">
            Departs{" "}
            <span className="num text-foreground">
              {slot ? formatTime12(slot.time) : "8:00 AM"}
            </span>{" "}
            · <span className="capitalize">{booking.day}</span>
          </p>
          <p className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="size-3.5 text-primary" /> Pickup: {pickup?.name ?? "Your stop"}
          </p>
          <p className="text-muted-foreground">
            Driver:{" "}
            {live.driver
              ? `${live.driver.first_name ?? live.driver.full_name ?? "Assigned driver"}`
              : mockDriver.name}{" "}
            ·{" "}
            <span className="num text-foreground">
              {live.driver?.plate_number ?? mockDriver.plate}
            </span>
          </p>
        </CardContent>
      </Card>

      <Card className="mt-4 shadow-card">
        <CardContent className="space-y-1 pt-6 text-sm">
          {grouped ? (
            <>
              <p className="flex items-center gap-2 font-semibold text-primary">
                <Users className="size-4" /> You&apos;ve been matched into a shared group
              </p>
              <p className="text-muted-foreground">
                Meeting point: {live.group?.pickup_point_label ?? "Being finalised"}
                {live.group?.eta_to_pickup ? ` · Driver ETA ${live.group.eta_to_pickup}` : ""}
              </p>
              <p className="text-muted-foreground">
                {live.members.length} passenger{live.members.length === 1 ? "" : "s"} in this group
              </p>
              {live.booking?.minority_gender_note ? (
                <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                  Heads up: you&apos;re the only passenger of your gender in this group. Tell us if
                  you&apos;d rather wait for the next departure.
                </p>
              ) : null}
            </>
          ) : (
            <p className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-primary" /> Matching you with nearby
              passengers… this screen updates automatically.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="mt-4 shadow-card">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-2 py-2 text-sm">
            <span className="font-semibold">{pickup?.name ?? route?.from}</span>
            <span className="h-6 w-0.5 bg-border" />
            <span className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Car className="size-5" />
            </span>
            <span className="h-6 w-0.5 bg-border" />
            <span className="font-semibold">{destination?.name ?? route?.to}</span>
          </div>

          <div className="mt-4 space-y-2">
            <p className="num text-center text-sm text-muted-foreground">
              {filled} / {capacity} passengers
            </p>
            <SeatBar filled={filled} capacity={capacity} />
          </div>
        </CardContent>
      </Card>

      {accepted ? (
        <>
          <Card className="mt-4 shadow-card">
            <CardContent className="space-y-2 pt-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg">Driver on the way</h2>
                <Badge variant="confirmed">Live</Badge>
              </div>
              <div className="overflow-hidden rounded-2xl border border-border">
                <MapView
                  className="h-56"
                  routes={[]}
                  points={[]}
                  vehicle={
                    driverLive.position ? [driverLive.position.lat, driverLive.position.lng] : null
                  }
                  vehicleLabel={
                    live.group?.eta_to_pickup ? `Driver · ${live.group.eta_to_pickup}` : "Driver"
                  }
                  userLocation={groupPickup ? [groupPickup.lat, groupPickup.lng] : null}
                  fitTo={
                    driverLive.position && groupPickup
                      ? [
                          [driverLive.position.lat, driverLive.position.lng],
                          [groupPickup.lat, groupPickup.lng],
                        ]
                      : groupPickup
                        ? [[groupPickup.lat, groupPickup.lng]]
                        : []
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground">
                The driver marker updates live as they approach your pickup point.
              </p>
            </CardContent>
          </Card>

          {userId && live.group ? (
            <TripChat
              className="mt-4"
              groupId={live.group.id}
              senderId={userId}
              senderName={profile?.firstName || profile?.fullName?.split(" ")[0] || "Passenger"}
              senderRole="passenger"
            />
          ) : null}
        </>
      ) : null}

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button variant="outline" size="lg" onClick={share}>
          <Share2 className="size-4" /> Share My Trip
        </Button>
        <Button size="lg" onClick={() => navigate({ to: "/trip" })}>
          View Driver &amp; Pickup
        </Button>
      </div>
    </AppShell>
  );
}
