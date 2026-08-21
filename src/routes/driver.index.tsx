import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Banknote, Bell, Car, MapPin, Power, Users } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { useDriverNav } from "@/components/layout/driver-nav";
import { NotificationBell } from "@/components/auth/account-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MapView } from "@/components/map/map-view";
import { TripChat } from "@/components/chat/trip-chat";
import { NORTH_OKKALAPA, useDriverSimulation } from "@/lib/driver-sim";
import { useSession } from "@/lib/session";
import { acceptTrip, useAssignedTrip, useDriverStatus } from "@/lib/driver-live";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/driver/")({
  head: () => ({
    meta: [
      { title: "Driver home — Tu Tu Ngar" },
      {
        name: "description",
        content:
          "Tu Tu Ngar driver home: go online, view today's earnings, and see your next assigned trip.",
      },
      { property: "og:title", content: "Driver home — Tu Tu Ngar" },
      {
        property: "og:description",
        content: "Go online, check earnings and manage your next trip on Tu Tu Ngar.",
      },
    ],
  }),
  component: DriverHome,
});

function formatMmk(amount: number) {
  return `${amount.toLocaleString()} MMK`;
}

function DriverHome() {
  const { profile, userId } = useSession();
  const navItems = useDriverNav("home");

  // Real availability + dispatch, live from Supabase.
  const { isOnline, saving, setOnline } = useDriverStatus(userId);
  const { trip } = useAssignedTrip(userId);
  const [accepting, setAccepting] = useState(false);

  const hasAssignedTrip = Boolean(trip);
  const awaitingAccept = trip?.group.status === "pending_driver";

  async function accept() {
    if (!trip) return;
    setAccepting(true);
    try {
      await acceptTrip(trip.group.id, 8);
      toast.success("Trip accepted — passengers have been notified");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not accept the trip");
    }
    setAccepting(false);
  }

  const accepted = trip?.group.status === "accepted" || trip?.group.status === "in_progress";
  const pickupTarget =
    trip?.group.pickup_lat != null && trip?.group.pickup_lng != null
      ? { lat: Number(trip.group.pickup_lat), lng: Number(trip.group.pickup_lng) }
      : null;
  const etaMinutes = Number(trip?.group.eta_to_pickup?.replace(/\D/g, "") || 8);

  // DEMO: only the driver's position is simulated (starting in North
  // Okkalapa). Passenger locations come from real device geolocation.
  const sim = useDriverSimulation(userId, pickupTarget, etaMinutes);

  const displayName = profile?.firstName || profile?.fullName || "Driver";
  const earnings = 35000;
  const tripsCompleted = 8;
  const seatsServed = 28;

  const status = hasAssignedTrip ? "on-trip" : isOnline ? "online" : "offline";

  const statusMeta = {
    online: {
      dot: "bg-emerald-500",
      ring: "ring-emerald-500/20",
      label: "Online",
      sub: "You're ready for trips",
    },
    "on-trip": {
      dot: "bg-amber-500",
      ring: "ring-amber-500/20",
      label: "On Trip",
      sub: "Currently serving passengers",
    },
    offline: {
      dot: "bg-slate-400",
      ring: "ring-slate-400/20",
      label: "Offline",
      sub: "Not accepting trips",
    },
  } as const;

  const current = statusMeta[status];

  return (
    <AppShell portal="driver" navItems={navItems} headerActions={<NotificationBell />}>
      <div className="space-y-6">
        {/* Status indicator */}
        <div className="flex flex-col items-center text-center transition-all duration-300 ease-out">
          <div
            className={cn(
              "flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-sm ring-1 transition-all duration-300",
              current.ring,
              status === "online" && "scale-105",
            )}
          >
            <span className={cn("size-3 rounded-full", current.dot)} />
            <span className="text-sm font-semibold">{current.label}</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{current.sub}</p>
        </div>

        {/* Earnings card */}
        <Card className="overflow-hidden border border-border bg-card shadow-sm">
          <CardHeader className="pb-2 pt-5">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs font-medium">
                Today
              </Badge>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Banknote className="size-3.5" />
                Earnings
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-5">
            <p className="text-4xl font-extrabold tracking-tight text-foreground">
              {formatMmk(earnings)}
            </p>
            <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
              <span>Trips completed: {tripsCompleted}</span>
              <span className="text-border">|</span>
              <span>Seats served: {seatsServed}</span>
            </div>
          </CardContent>
        </Card>

        {/* Status / trip card */}
        <Card className="border border-border bg-card shadow-sm">
          {hasAssignedTrip ? (
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <Badge className="bg-amber-500 text-white">
                  {awaitingAccept ? "New assignment" : "Active trip"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {trip?.group.eta_to_pickup ? `ETA ${trip.group.eta_to_pickup}` : "Just assigned"}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2 font-medium">
                  <MapPin className="size-4 text-primary" />
                  {trip?.group.corridor_label ?? trip?.group.pickup_point_label ?? "Shared trip"}
                </p>
                <p className="flex items-center gap-2">
                  <Car className="size-4 text-primary" />
                  Pickup: {trip?.group.pickup_point_label ?? "Meeting point"}
                </p>
                <p className="flex items-center gap-2">
                  <Users className="size-4 text-primary" />
                  {trip?.bookings.length ?? 0} passengers · {profile?.seatCapacity ?? 4}-seat
                  vehicle
                </p>
              </div>
              {awaitingAccept ? (
                <Button className="w-full" disabled={accepting} onClick={() => void accept()}>
                  {accepting ? "Accepting…" : "Accept Trip"}
                </Button>
              ) : (
                <Button className="w-full" variant="secondary" disabled>
                  Trip accepted · en route
                </Button>
              )}
            </CardContent>
          ) : (
            <CardContent className="flex flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <Car className="size-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {isOnline ? "Waiting for a trip..." : "Go online to start receiving trips"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isOnline
                    ? "AI matching will assign you a shared ride soon."
                    : "You are currently not visible to the dispatch system."}
                </p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Live trip: simulated location control + temporary group chat */}
        {accepted && trip ? (
          <>
            <Card className="border border-border bg-card shadow-sm">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg">Live position</h2>
                  <span className="text-xs text-muted-foreground">
                    Demo simulation · {Math.round(sim.progress * 100)}% to pickup
                  </span>
                </div>
                <div className="overflow-hidden rounded-2xl border border-border">
                  <MapView
                    className="h-56"
                    routes={[]}
                    points={[]}
                    vehicle={sim.position ? [sim.position.lat, sim.position.lng] : null}
                    vehicleLabel="You"
                    userLocation={pickupTarget ? [pickupTarget.lat, pickupTarget.lng] : null}
                    fitTo={
                      pickupTarget
                        ? [
                            [NORTH_OKKALAPA.lat, NORTH_OKKALAPA.lng],
                            [pickupTarget.lat, pickupTarget.lng],
                          ]
                        : []
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    variant={sim.running ? "secondary" : "default"}
                    disabled={!pickupTarget}
                    onClick={() => (sim.running ? sim.stop() : sim.start())}
                  >
                    {sim.running ? "Pause movement" : "Simulate movement"}
                  </Button>
                  <Button variant="outline" disabled={!pickupTarget} onClick={() => sim.step()}>
                    Step
                  </Button>
                  <Button variant="ghost" onClick={() => sim.reset()}>
                    Reset
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Operator-controlled for the demo: moves you from North Okkalapa to the pickup
                  point over the accepted ETA. Passengers see this live on their map.
                </p>
              </CardContent>
            </Card>

            {userId ? (
              <TripChat
                groupId={trip.group.id}
                senderId={userId}
                senderName={displayName}
                senderRole="driver"
              />
            ) : null}
          </>
        ) : null}

        {/* Main action */}
        <div className="pt-2">
          <Button
            size="lg"
            className={cn(
              "h-16 w-full rounded-2xl text-lg font-bold shadow-lg transition-all duration-300",
              isOnline
                ? "border border-border bg-background text-foreground hover:bg-accent"
                : "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
            disabled={saving}
            onClick={() => void setOnline(!isOnline)}
          >
            <Power
              className={cn("size-5 transition-transform duration-300", isOnline && "rotate-180")}
            />
            {isOnline ? "Go Offline" : "Go Online"}
          </Button>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {isOnline
              ? "Going offline removes you from the next AI assignment batch."
              : "Going online makes you eligible for AI trip assignment."}
          </p>
        </div>
      </div>
    </AppShell>
  );
}
