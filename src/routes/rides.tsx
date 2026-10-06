import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Clock, MapPin, Users } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { usePassengerNav } from "@/components/layout/passenger-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useBooking } from "@/lib/booking-store";
import { formatTime12, nearestCorridor, type Route as Corridor } from "@/lib/mockData";
import { getCorridorDepartures, type LiveDeparture } from "@/lib/rides.functions";
import { useT } from "@/lib/i18n";

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AvailableRides,
});

function AvailableRides() {
  const navItems = usePassengerNav("trips");
  const booking = useBooking();
  const t = useT();
  const [departures, setDepartures] = useState<LiveDeparture[]>([]);
  const [loading, setLoading] = useState(true);

  const { pickupCoord, destinationCoord, pickupText, destinationText } = booking;

  // DEMO SCOPE: free-text search is resolved to the geographically closest
  // of the 3 active corridors. Restoring the full corridor list in mockData
  // automatically widens this matcher — no change needed here.
  const match = useMemo(
    () =>
      nearestCorridor(
        pickupCoord ? [pickupCoord.lat, pickupCoord.lng] : null,
        destinationCoord ? [destinationCoord.lat, destinationCoord.lng] : null,
        pickupText,
        destinationText,
      ),
    [pickupCoord, destinationCoord, pickupText, destinationText],
  );

  const corridor = match?.route ?? null;
  const corridorId = corridor?.id ?? null;

  useEffect(() => {
    if (!corridorId) {
      setDepartures([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getCorridorDepartures({ data: { corridorId } })
      .then((rows) => {
        if (!cancelled) setDepartures(rows);
      })
      .catch(() => {
        if (!cancelled) setDepartures([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [corridorId]);

  return (
    <AppShell portal="passenger" navItems={navItems}>
      <section className="space-y-1">
        <h1 className="text-2xl">{t("availableSharedRides")}</h1>
        <p className="text-sm text-muted-foreground">
          {booking.pickupText || t("yourArea")} → {booking.destinationText || t("downtownYangon")} ·{" "}
          <span className="capitalize">{booking.day}</span>
        </p>
        {corridor ? (
          <p className="text-xs text-muted-foreground">{t("matchedCorridor")} {corridor.name}</p>
        ) : null}
      </section>

      <div className="mt-4 space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">{t("findingPeopleGoingYourWay")}</p>
        ) : !corridor || departures.length === 0 ? (
          <EmptyState hasCorridor={Boolean(corridor)} />
        ) : (
          departures.map((d) => <DepartureCard key={d.groupId} departure={d} corridor={corridor} />)
        )}
      </div>
    </AppShell>
  );
}

function EmptyState({ hasCorridor }: { hasCorridor: boolean }) {
  const navigate = useNavigate();
  const t = useT();
  return (
    <Card className="shadow-card">
      <CardContent className="space-y-3 pt-6 text-center">
        <p className="text-base font-semibold">{t("noRidesYet")}</p>
        <p className="text-sm text-muted-foreground">
          {hasCorridor ? t("nobodyBookedHint") : t("threeCorridorsHint")}
        </p>
        <Button variant="outline" onClick={() => navigate({ to: "/home" })}>
          {t("changeSearch")}
        </Button>
      </CardContent>
    </Card>
  );
}

function DepartureCard({ departure, corridor }: { departure: LiveDeparture; corridor: Corridor }) {
  const navigate = useNavigate();
  const booking = useBooking();
  const t = useT();
  const seatsLeft = Math.max(0, departure.seatsCapacity - departure.seatsFilled);
  const nearlyFull = seatsLeft === 1;

  return (
    <Card className={cn("shadow-card", nearlyFull && "border-primary/50")}>
      <CardContent className="space-y-3 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="num text-lg font-semibold">{formatTime12(departure.time)}</p>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-3.5 text-primary" /> {departure.pickupLabel} →{" "}
              {departure.destinationLabel}
            </p>
          </div>
          {nearlyFull ? <Badge variant="progress">{t("almostFull")}</Badge> : null}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {departure.riders.map((r) => (
              <span
                key={r.id}
                title={t("passenger")}
                className="num flex size-8 items-center justify-center rounded-full border-2 border-card bg-primary text-[11px] text-primary-foreground"
              >
                {r.firstName.slice(0, 2).toUpperCase()}
              </span>
            ))}
            {Array.from({ length: seatsLeft }, (_, i) => (
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
              {departure.seatsFilled} / {departure.seatsCapacity}
            </span>{" "}
            {t("seatsFilled")}
          </p>
        </div>

        {departure.hasDriver ? (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5" /> {t("driverAssignedAt")} {departure.pickupLabel}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
          <p className="text-sm">
            <span className="num font-semibold">{seatsLeft}</span>{" "}
            {seatsLeft === 1 ? t("seatAvailable") : t("seatsAvailable")} ·{" "}
            <span className="num text-primary">{corridor.fare.toLocaleString()} MMK</span> {t("perSeat")}
          </p>
          <Button
            size="sm"
            disabled={seatsLeft === 0}
            onClick={() => {
              booking.set({
                routeId: corridor.id,
                slotId: departure.groupId,
                pickupPointId: null,
                liveDeparture: departure,
              });
              navigate({ to: "/ride/$slotId", params: { slotId: departure.groupId } });
            }}
          >
            {t("viewRide")} <ArrowRight className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
