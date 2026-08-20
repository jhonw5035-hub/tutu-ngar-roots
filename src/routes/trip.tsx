import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, CircleDot, Flag, Navigation } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { usePassengerNav } from "@/components/layout/passenger-nav";
import { MapView } from "@/components/map/map-view";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useBooking } from "@/lib/booking-store";
import { useSnappedCorridors } from "@/lib/routeGeometry";
import { useVehicleAnimation } from "@/lib/use-vehicle-animation";
import { useSession } from "@/lib/session";
import {
  distanceKm,
  getPassengers,
  getSlotsForRoute,
  getTripStops,
  mockDriver,
  type LatLng,
} from "@/lib/mockData";

export const Route = createFileRoute("/trip")({
  head: () => ({
    meta: [
      { title: "Trip In Progress — Live Tracking | Tu Tu Ngar" },
      {
        name: "description",
        content:
          "Follow your Tu Tu Ngar shared ride live: vehicle position, stop-by-stop pickup progress and who is riding with you.",
      },
      { property: "og:title", content: "Trip In Progress — Tu Tu Ngar" },
      {
        property: "og:description",
        content: "Live vehicle position and stop-by-stop progress for your shared ride.",
      },
    ],
  }),
  component: TripInProgress,
});

const AVG_SPEED_KMH = 22;

function TripInProgress() {
  const navItems = usePassengerNav("trips");
  const booking = useBooking();
  const { routes, points } = useSnappedCorridors();
  const { profile } = useSession();

  // Demo progress: how many stops the van has already served.
  const [progress, setProgress] = useState(1);

  const route = routes.find((r) => r.id === booking.routeId) ?? routes[0] ?? null;
  const stops = useMemo(() => getTripStops(route?.id ?? null, progress), [route?.id, progress]);
  const routePoints = points
    .filter((p) => p.routeId === route?.id)
    .sort((a, b) => a.sequence - b.sequence);

  const vehicle = useVehicleAnimation(route?.path ?? null, true);
  const nextStop = stops.find((s) => !s.pickedUp) ?? stops[stops.length - 1] ?? null;
  const nextPoint = routePoints.find((p) => p.id === nextStop?.id) ?? null;

  const remainingKm =
    vehicle && nextPoint ? distanceKm(vehicle, [nextPoint.lat, nextPoint.lng]) : null;
  const etaMin = remainingKm ? Math.max(1, Math.round((remainingKm / AVG_SPEED_KMH) * 60)) : null;

  const slotId = booking.slotId ?? getSlotsForRoute(route?.id ?? null)[0]?.id ?? null;
  const riders = getPassengers(slotId);
  const capacity = getSlotsForRoute(route?.id ?? null).find((s) => s.id === slotId)?.seatsCapacity ?? 4;

  const fitTo: LatLng[] = route?.path ?? [];

  return (
    <AppShell portal="passenger" navItems={navItems}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl">Trip in progress</h1>
          <p className="text-sm text-muted-foreground">
            {mockDriver.name} · {mockDriver.plate}
          </p>
        </div>
        <Badge variant="confirmed">On the way</Badge>
      </div>

      <div className="relative mt-3 overflow-hidden rounded-2xl border border-border shadow-card">
        <MapView
          className="h-64"
          routes={route ? [route] : []}
          selectedRouteId={route?.id ?? null}
          points={routePoints}
          pickupId={nextPoint?.id ?? null}
          vehicle={vehicle}
          vehicleLabel={nextStop ? `Heading to ${nextStop.name}` : undefined}
          fitTo={fitTo}
        />
      </div>

      <Card className="mt-4 shadow-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg">Current route</h2>
            <Button
              variant="ghost"
              size="sm"
              disabled={progress >= stops.length}
              onClick={() => setProgress((p) => Math.min(stops.length, p + 1))}
            >
              Advance demo
            </Button>
          </div>

          <ol className="mt-3 space-y-0">
            {stops.map((stop, i) => {
              const isNext = stop.id === nextStop?.id && !stop.pickedUp;
              const last = i === stops.length - 1;
              return (
                <li key={stop.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        "flex size-7 items-center justify-center rounded-full border",
                        stop.pickedUp
                          ? "border-primary bg-primary text-primary-foreground"
                          : isNext
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-muted text-muted-foreground",
                      )}
                    >
                      {stop.pickedUp ? (
                        <Check className="size-3.5" />
                      ) : stop.isDestination ? (
                        <Flag className="size-3.5" />
                      ) : (
                        <CircleDot className="size-3.5" />
                      )}
                    </span>
                    {!last ? (
                      <span
                        className={cn(
                          "w-0.5 flex-1",
                          stop.pickedUp ? "bg-primary/50" : "bg-border",
                        )}
                      />
                    ) : null}
                  </div>

                  <div className={cn("min-w-0 flex-1", last ? "pb-0" : "pb-5")}>
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        isNext ? "text-primary" : stop.pickedUp ? "" : "text-foreground",
                      )}
                    >
                      {stop.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stop.pickedUp
                        ? "Picked Up"
                        : isNext
                          ? `${etaMin ?? "—"} min · ${remainingKm ? remainingKm.toFixed(1) : "—"} km`
                          : stop.isDestination
                            ? "Final destination"
                            : "Upcoming stop"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>

      <Card className="mt-4 shadow-card">
        <CardContent className="pt-6">
          <h2 className="text-lg">Passengers onboard</h2>
          {/* Privacy: first name only. Never surface full profiles or photos of
              other passengers here — only your own avatar can use your photo. */}
          <div className="mt-3 flex flex-wrap gap-4">
            <Rider
              name={profile?.firstName || profile?.fullName?.split(" ")[0] || "You"}
              photo={profile?.photoDataUrl}
              you
            />
            {riders.map((r) => (
              <Rider key={r.id} name={r.firstName} />
            ))}
            {Array.from({ length: Math.max(0, capacity - riders.length - 1) }, (_, i) => (
              <div key={i} className="w-14 text-center">
                <div className="mx-auto size-12 rounded-full border-2 border-dashed border-border" />
                <p className="mt-1 text-xs text-muted-foreground">Open</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="safe-bottom fixed inset-x-0 bottom-14 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl">
          <Button className="w-full" size="lg">
            <Navigation className="size-4" />
            Navigate to {nextStop?.name ?? "destination"}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

function Rider({ name, photo, you }: { name: string; photo?: string | undefined; you?: boolean }) {
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <div className="w-14 text-center">
      {photo ? (
        <img
          src={photo}
          alt={`${name}'s profile`}
          className="mx-auto size-12 rounded-full object-cover"
        />
      ) : (
        <div className="num mx-auto flex size-12 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
          {initials}
        </div>
      )}
      <p className="mt-1 truncate text-xs">{you ? "You" : name}</p>
    </div>
  );
}
