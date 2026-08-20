import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Car, MapPin, Share2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
import { usePassengerNav } from "@/components/layout/passenger-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SeatBar } from "@/components/booking/seat-bar";
import { useBooking } from "@/lib/booking-store";
import {
  formatTime12,
  getPoint,
  getPointsForRoute,
  getRoute,
  getSlotDetail,
  mockDriver,
} from "@/lib/mockData";

export const Route = createFileRoute("/confirmed")({
  head: () => ({
    meta: [
      { title: "You're Booked — Tu Tu Ngar Shared Ride" },
      {
        name: "description",
        content:
          "Your Yangon shared seat is confirmed: pickup stop, departure time, driver and plate, with live tracking on demand.",
      },
      { property: "og:title", content: "You're Booked — Tu Tu Ngar" },
      { property: "og:description", content: "Shared seat confirmed with driver and pickup details." },
    ],
  }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const navItems = usePassengerNav("trips");
  const navigate = useNavigate();
  const booking = useBooking();

  const slot = getSlotDetail(booking.slotId);
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
            Departs <span className="num text-foreground">{slot ? formatTime12(slot.time) : "8:00 AM"}</span>{" "}
            · <span className="capitalize">{booking.day}</span>
          </p>
          <p className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="size-3.5 text-primary" /> Pickup: {pickup?.name ?? "Your stop"}
          </p>
          <p className="text-muted-foreground">
            Driver: {mockDriver.name} · <span className="num text-foreground">{mockDriver.plate}</span>
          </p>
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
