import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Check, CircleDot, Flag, Navigation } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
import { usePassengerNav } from "@/components/layout/passenger-nav";
import { MapView } from "@/components/map/map-view";
import type { MapMarker } from "@/components/map/route-map";
import { TripChat } from "@/components/chat/trip-chat";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/session";
import { useMyLiveBooking, getCurrentPosition } from "@/lib/live";
import { useDriverLocation } from "@/lib/driver-sim";
import { startDemoTrip } from "@/lib/demo-trip.functions";
import { useRoadPath } from "@/lib/road-path";
import {
  distanceKm,
  getPointsForRoute,
  getRoute,
  nearestPickupCandidate,
  pickupCandidates,
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TripInProgress,
});

const AVG_SPEED_KMH = 22;

type Stop = {
  id: string;
  name: string;
  lat: number | null;
  lng: number | null;
  isDestination: boolean;
  /** True when this drop belongs to the signed-in passenger. */
  isYou: boolean;
};

function TripInProgress() {
  const navItems = usePassengerNav("trips");
  const { profile, userId } = useSession();
  const { booking, group, members, driver, loading, refresh } = useMyLiveBooking(userId);
  const { position: driverPosition } = useDriverLocation(group?.driver_id ?? null);
  const runDemoTrip = useServerFn(startDemoTrip);
  const [demoLoading, setDemoLoading] = useState(false);

  /** DEMO ONLY: materialise an accepted bot trip for the signed-in user. */
  const startDemo = async () => {
    if (!userId || demoLoading) return;
    setDemoLoading(true);
    try {
      const here = await getCurrentPosition();
      const routeId = "r-nokk-sule";
      const corridor = getRoute(routeId);
      const pickup =
        nearestPickupCandidate(routeId, here ? [here.lat, here.lng] : null) ??
        pickupCandidates[routeId]![0]!;
      const stops = getPointsForRoute(routeId);
      const drop = stops[stops.length - 1]!;
      await runDemoTrip({
        data: {
          userId,
          passengerName: profile?.firstName ?? profile?.fullName ?? "You",
          routeId,
          corridorName: corridor?.name ?? routeId,
          pickupLabel: pickup.name,
          pickupLat: pickup.lat,
          pickupLng: pickup.lng,
          dropLabel: drop.name,
          dropLat: drop.lat,
          dropLng: drop.lng,
        },
      });
      await refresh();
      toast.success(`Demo trip ready — pickup at ${pickup.name}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start the demo trip");
    }
    setDemoLoading(false);
  };

  /** Demo progress: how many stops the van has already served. */
  const [progress, setProgress] = useState(0);

  /**
   * Single source of truth for both the map markers and the checklist below:
   * the real trip_groups pickup point plus the ordered trip_group_members
   * drop points for this passenger's actual group.
   */
  const stops = useMemo<Stop[]>(() => {
    if (!group) return [];
    const list: Stop[] = [
      {
        id: `pickup-${group.id}`,
        name: group.pickup_point_label ?? booking?.pickup_label ?? "Pickup point",
        lat: group.pickup_lat != null ? Number(group.pickup_lat) : null,
        lng: group.pickup_lng != null ? Number(group.pickup_lng) : null,
        isDestination: false,
        isYou: false,
      },
    ];
    const ordered = [...members].sort((a, b) => (a.drop_order ?? 99) - (b.drop_order ?? 99));
    ordered.forEach((m, i) => {
      list.push({
        id: m.id,
        name: m.drop_label ?? `Drop ${i + 1}`,
        lat: m.drop_lat != null ? Number(m.drop_lat) : null,
        lng: m.drop_lng != null ? Number(m.drop_lng) : null,
        isDestination: i === ordered.length - 1,
        isYou: m.booking_id === booking?.id,
      });
    });
    return list;
  }, [group, members, booking]);

  const nextIndex = Math.min(progress, Math.max(0, stops.length - 1));
  const nextStop = stops[nextIndex] ?? null;

  const vehicle: LatLng | null = driverPosition ? [driverPosition.lat, driverPosition.lng] : null;

  const markers = useMemo<MapMarker[]>(
    () =>
      stops
        .filter((s): s is Stop & { lat: number; lng: number } => s.lat != null && s.lng != null)
        .map((s, i) => ({
          id: s.id,
          lat: s.lat,
          lng: s.lng,
          label: i === 0 ? "P" : String(i),
          color: s.id === nextStop?.id ? "#F75514" : i === 0 ? "#0B2942" : "#334155",
          size: s.id === nextStop?.id ? 28 : 22,
          pulse: s.id === nextStop?.id,
          title: s.name,
        })),
    [stops, nextStop],
  );

  // Shared source: the stop sequence is snapped to real roads via OSRM.
  const stopWaypoints = useMemo<LatLng[] | null>(() => {
    const pts = stops
      .filter((s) => s.lat != null && s.lng != null)
      .map((s) => [s.lat as number, s.lng as number] as LatLng);
    return pts.length > 1 ? pts : null;
  }, [stops]);
  const line = useRoadPath(stopWaypoints);

  const remainingKm =
    vehicle && nextStop?.lat != null && nextStop.lng != null
      ? distanceKm(vehicle, [nextStop.lat, nextStop.lng])
      : null;
  const etaMin = remainingKm ? Math.max(1, Math.round((remainingKm / AVG_SPEED_KMH) * 60)) : null;

  const driverName = driver?.full_name ?? driver?.first_name ?? "Your driver";
  const plate = driver?.plate_number ?? "—";

  if (loading || demoLoading) {
    return (
      <AppShell portal="passenger" navItems={navItems}>
        <h1 className="text-xl">Trip in progress</h1>
        <div className="mt-4 space-y-3">
          <div className="h-64 animate-pulse rounded-2xl bg-muted" />
          <div className="h-28 animate-pulse rounded-2xl bg-muted" />
          <p className="text-center text-sm text-muted-foreground">
            {demoLoading ? "Preparing demo trip…" : "Checking for your active trip…"}
          </p>
        </div>
      </AppShell>
    );
  }

  if (!group) {
    return (
      <AppShell portal="passenger" navItems={navItems}>
        <h1 className="text-xl">Trip in progress</h1>
        <div className="mt-4 rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          You don’t have an active grouped trip yet. Once your booking is grouped and a driver
          accepts, the live route appears here.
          <div className="mt-6 flex flex-col items-center gap-2">
            <Button onClick={() => void startDemo()} disabled={demoLoading}>
              {demoLoading ? "Preparing demo trip…" : "Preview Demo Trip"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Instantly preview a live trip for demo purposes.
            </p>
          </div>
        </div>
      </AppShell>
    );
  }


  return (
    <AppShell portal="passenger" navItems={navItems}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl">Trip in progress</h1>
          <p className="text-sm text-muted-foreground">
            {driverName} · {plate}
          </p>
        </div>
        <Badge variant="confirmed">
          {group.status === "accepted" ? "On the way" : group.status}
        </Badge>
      </div>

      <div className="relative mt-3 overflow-hidden rounded-2xl border border-border shadow-card">
        <MapView
          className="h-64"
          routes={[]}
          markers={markers}
          line={line}
          vehicle={vehicle}
          vehicleLabel={nextStop ? `Heading to ${nextStop.name}` : undefined}
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
              const done = i < progress;
              const isNext = i === nextIndex && !done;
              const last = i === stops.length - 1;
              return (
                <li key={stop.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        "flex size-7 items-center justify-center rounded-full border",
                        done
                          ? "border-primary bg-primary text-primary-foreground"
                          : isNext
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-muted text-muted-foreground",
                      )}
                    >
                      {done ? (
                        <Check className="size-3.5" />
                      ) : stop.isDestination ? (
                        <Flag className="size-3.5" />
                      ) : (
                        <CircleDot className="size-3.5" />
                      )}
                    </span>
                    {!last ? (
                      <span className={cn("w-0.5 flex-1", done ? "bg-primary/50" : "bg-border")} />
                    ) : null}
                  </div>

                  <div className={cn("min-w-0 flex-1", last ? "pb-0" : "pb-5")}>
                    <p className={cn("text-sm font-semibold", isNext ? "text-primary" : "")}>
                      {stop.name}
                      {stop.isYou ? (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          Your drop-off
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {done
                        ? i === 0
                          ? "Picked Up"
                          : "Dropped off"
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
          {/* Privacy: co-riders are shown as anonymous seats — never full
              profiles or photos. Only your own avatar may use your photo. */}
          <div className="mt-3 flex flex-wrap gap-4">
            <Rider
              name={profile?.firstName || profile?.fullName?.split(" ")[0] || "You"}
              photo={profile?.photoDataUrl}
              you
            />
            {members
              .filter((m) => m.booking_id !== booking?.id)
              .map((m, i) => (
                <Rider key={m.id} name={`Rider ${i + 1}`} />
              ))}
          </div>
        </CardContent>
      </Card>

      {userId ? (
        <TripChat
          className="mt-4 mb-24"
          groupId={group.id}
          senderId={userId}
          senderName={profile?.firstName || profile?.fullName || "You"}
          senderRole="passenger"
        />
      ) : null}

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
