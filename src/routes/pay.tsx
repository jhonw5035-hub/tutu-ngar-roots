import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Loader2, QrCode } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { usePassengerNav } from "@/components/layout/passenger-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

import { resolveSlot } from "@/lib/departure";
import { useBooking } from "@/lib/booking-store";
import { createBooking, getCurrentPosition } from "@/lib/live";
import { useSession } from "@/lib/session";
import { formatTime12, getRoute } from "@/lib/mockData";

export const Route = createFileRoute("/pay")({
  head: () => ({
    meta: [
      { title: "Confirm Your Ride — Tu Tu Ngar Payment" },
      {
        name: "description",
        content:
          "Review your Yangon shared ride, pay your seat fare with MMQR and lock in your departure.",
      },
      { property: "og:title", content: "Confirm Your Ride — Tu Tu Ngar" },
      { property: "og:description", content: "Pay your seat fare with MMQR and book." },
    ],
  }),
  component: PaymentPage,
});

function PaymentPage() {
  const navItems = usePassengerNav("trips");
  const navigate = useNavigate();
  const booking = useBooking();
  const { userId, profile } = useSession();
  const [paying, setPaying] = useState(false);

  const slot = resolveSlot(booking.slotId, booking.liveDeparture, booking.routeId);
  const route = getRoute(booking.routeId);
  const fare = slot?.price ?? route?.fare ?? 3500;

  // Payment stays mocked (no gateway), but the booking itself is real: we
  // capture the device's coordinates and insert a pending row that the admin
  // optimizer will pick up.
  const pay = async () => {
    if (!userId) {
      toast.error("Please log in again to book a seat");
      navigate({ to: "/login" });
      return;
    }
    setPaying(true);
    try {
      const device = await getCurrentPosition();
      // Fall back to the geocoded pickup the passenger searched for on Home.
      const position = device ?? booking.pickupCoord;
      if (!device && !position) {
        toast.message("Location unavailable — using your selected pickup area");
      }
      const created = await createBooking({
        passengerId: userId,
        passengerName: profile?.firstName ?? profile?.fullName ?? null,
        passengerGender: profile?.gender ?? null,
        pickupLabel: booking.pickupText || route?.from || "Pickup area",
        destinationLabel: booking.destinationText || route?.to || "Destination",
        requestedTime: slot ? new Date().toISOString() : null,
        pickup: position,
        destination: booking.destinationCoord,
      });
      navigate({ to: "/confirmed", search: { booking: created.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not confirm your booking");
      setPaying(false);
    }
  };

  return (
    <AppShell portal="passenger" navItems={navItems}>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Back" onClick={() => history.back()}>
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="text-2xl">Confirm your ride.</h1>
      </div>

      <Card className="mt-4 shadow-card">
        <CardContent className="space-y-2 pt-6 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Route</span>
            <span className="font-semibold">
              {route ? `${route.from} → ${route.to}` : "Shared ride"}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Time</span>
            <span className="num">{slot ? formatTime12(slot.time) : "8:00 AM"}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Seats</span>
            <span className="num">1 Seat × {fare.toLocaleString()} MMK</span>
          </div>
          <div className="flex justify-between gap-3 border-t border-border pt-3 text-base">
            <span className="font-semibold">Total</span>
            <span className="num font-semibold text-primary">{fare.toLocaleString()} MMK</span>
          </div>
        </CardContent>
      </Card>

      <section className="mt-5 space-y-2">
        <h2 className="text-lg">Payment method</h2>
        <div className="flex items-center gap-3 rounded-2xl border border-primary bg-accent p-4 shadow-card">
          <span className="flex size-5 items-center justify-center rounded-full border-2 border-primary">
            <span className="size-2.5 rounded-full bg-primary" />
          </span>
          <QrCode className="size-5 text-primary" />
          <div>
            <p className="text-sm font-semibold">MMQR</p>
            <p className="text-xs text-muted-foreground">Scan and pay with any Myanmar bank app</p>
          </div>
        </div>
      </section>

      <div className="safe-bottom fixed inset-x-0 bottom-14 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl">
          <Button className="w-full" size="lg" disabled={paying} onClick={() => void pay()}>
            {paying ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Processing payment…
              </>
            ) : (
              "Pay & Book Seat"
            )}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
