import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, LocateFixed, MapPin } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { usePassengerNav } from "@/components/layout/passenger-nav";
import { MapView } from "@/components/map/map-view";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useBooking } from "@/lib/booking-store";
import { useSnappedCorridors } from "@/lib/routeGeometry";
import { distanceKm, getSlotDetails, type LatLng, type PickupPoint } from "@/lib/mockData";

export const Route = createFileRoute("/pickup")({
  head: () => ({
    meta: [
      { title: "Confirm Your Pickup Point — Tu Tu Ngar" },
      {
        name: "description",
        content:
          "See the pickup points on your Yangon corridor on the map, with the nearest one suggested automatically, and confirm where your shared ride collects you.",
      },
      { property: "og:title", content: "Confirm Your Pickup Point — Tu Tu Ngar" },
      {
        property: "og:description",
        content: "Map view of nearby pickup points on your chosen Yangon corridor.",
      },
    ],
  }),
  component: PickupConfirmation,
});

type LocState = "idle" | "asking" | "granted" | "denied";

function PickupConfirmation() {
  const navItems = usePassengerNav("trips");
  const navigate = useNavigate();
  const booking = useBooking();
  const { routes, points } = useSnappedCorridors();

  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [locState, setLocState] = useState<LocState>("idle");

  // Contextual, optional location request — only asked here, where it is used.
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocState("denied");
      return;
    }
    setLocState("asking");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setLocState("granted");
      },
      () => setLocState("denied"),
      { timeout: 8000, maximumAge: 300000 },
    );
  }, []);

  const route = routes.find((r) => r.id === booking.routeId) ?? routes[0] ?? null;
  const routePoints = useMemo(
    () => points.filter((p) => p.routeId === route?.id).sort((a, b) => a.sequence - b.sequence),
    [points, route?.id],
  );

  // Nearest pickup point via the shared Haversine helper.
  const ranked = useMemo(() => {
    if (!userLocation) return routePoints.map((p) => ({ point: p, km: null as number | null }));
    return routePoints
      .map((p) => ({ point: p, km: distanceKm(userLocation, [p.lat, p.lng]) }))
      .sort((a, b) => (a.km ?? 0) - (b.km ?? 0));
  }, [routePoints, userLocation]);

  const nearestId = userLocation ? (ranked[0]?.point.id ?? null) : null;

  // Auto-select the nearest point once, without locking the passenger in.
  useEffect(() => {
    if (nearestId && !booking.pickupPointId) booking.set({ pickupPointId: nearestId });
  }, [nearestId, booking]);

  const selectedId = booking.pickupPointId ?? routePoints[0]?.id ?? null;
  const selected = routePoints.find((p) => p.id === selectedId) ?? null;
  const slot = getSlotDetails(route?.id ?? null).find((s) => s.id === booking.slotId) ?? null;

  const fitTo: LatLng[] = [
    ...routePoints.map((p) => [p.lat, p.lng] as LatLng),
    ...(userLocation ? [userLocation] : []),
  ];

  return (
    <AppShell portal="passenger" navItems={navItems}>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Back" onClick={() => history.back()}>
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="text-xl">Confirm pickup point</h1>
      </div>

      <p className="mt-1 text-sm text-muted-foreground">
        {locState === "asking"
          ? "Checking your location to suggest the closest stop…"
          : locState === "granted"
            ? "We suggested the stop closest to you — tap any other stop to change it."
            : "Location isn't available, so pick your stop from the list below."}
      </p>

      <div className="mt-3 overflow-hidden rounded-2xl border border-border shadow-card">
        <MapView
          className="h-64"
          routes={route ? [route] : []}
          selectedRouteId={route?.id ?? null}
          points={routePoints}
          pickupId={selectedId}
          onSelectPoint={(id) => booking.set({ pickupPointId: id })}
          userLocation={userLocation}
          fitTo={fitTo}
        />
      </div>

      <ul className="mt-4 space-y-2">
        {ranked.map(({ point, km }) => (
          <PointRow
            key={point.id}
            point={point}
            km={km}
            selected={point.id === selectedId}
            nearest={point.id === nearestId}
            onSelect={() => booking.set({ pickupPointId: point.id })}
          />
        ))}
      </ul>

      <div className="safe-bottom fixed inset-x-0 bottom-14 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl space-y-1">
          <p className="text-xs text-muted-foreground">
            {selected ? selected.name : "Choose a stop"}
            {slot ? (
              <>
                {" · departs "}
                <span className="num text-foreground">{slot.time}</span>
              </>
            ) : null}
          </p>
          <Button
            className="w-full"
            size="lg"
            disabled={!selected}
            onClick={() => navigate({ to: "/book" })}
          >
            Confirm Pickup Point
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

function PointRow({
  point,
  km,
  selected,
  nearest,
  onSelect,
}: {
  point: PickupPoint;
  km: number | null;
  selected: boolean;
  nearest: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        aria-pressed={selected}
        onClick={onSelect}
        className={cn(
          "flex w-full cursor-pointer items-center gap-3 rounded-2xl border p-3.5 text-left transition-all active:scale-[0.98]",
          selected
            ? "border-primary bg-accent shadow-elevated"
            : "border-border bg-card shadow-card hover:border-primary/40",
        )}
      >
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full",
            selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          {selected ? <Check className="size-4" /> : <MapPin className="size-4" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{point.name}</span>
          <span className="block text-xs text-muted-foreground">
            {km === null ? `Stop ${point.sequence}` : `${km.toFixed(1)} km away`}
          </span>
        </span>
        {nearest ? (
          <Badge variant="progress" className="shrink-0">
            <LocateFixed className="mr-1 size-3" /> Nearest
          </Badge>
        ) : null}
      </button>
    </li>
  );
}
