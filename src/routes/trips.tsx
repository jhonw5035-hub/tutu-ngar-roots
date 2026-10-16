import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Banknote, CalendarClock, Car, Map as MapIcon, MapPin } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
import { usePassengerNav } from "@/components/layout/passenger-nav";
import { MapView } from "@/components/map/map-view";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  cancelHistoryBooking,
  canCancel,
  effectiveStatus,
  useBookingHistory,
  type HistoryBooking,
} from "@/lib/booking-history";
import { formatMMK } from "@/lib/fares";
import { useLanguage, useT } from "@/lib/i18n";
import { formatDistance, getPickup, haversineM } from "@/lib/main-road-pickups";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/trips")({
  head: () => ({
    meta: [
      { title: "History — Tu Tu Ngar" },
      { name: "description", content: "Your Tu Tu Ngar pre-bookings: upcoming, completed and cancelled shared rides in Yangon." },
      { property: "og:title", content: "History — Tu Tu Ngar" },
      { property: "og:description", content: "Your pre-booked shared rides across Yangon." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const navItems = usePassengerNav("trips");
  const t = useT();
  const list = useBookingHistory();

  return (
    <AppShell portal="passenger" navItems={navItems}>
      <h1 className="text-2xl">{t("historyTitle")}</h1>
      <section className="mt-5 space-y-3">
        {list === null ? (
          <Skeleton className="h-40 w-full rounded-2xl" />
        ) : list.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            {t("noHistory")}
          </p>
        ) : (
          list.map((b) => (
            <HistoryCard key={b.id} b={b} defaultOpen={b.id === list.find((x) => effectiveStatus(x) === "upcoming")?.id} />
          ))
        )}
      </section>
    </AppShell>
  );
}

function HistoryCard({ b, defaultOpen }: { b: HistoryBooking; defaultOpen: boolean }) {
  const t = useT();
  const { lang } = useLanguage();
  const [showMap, setShowMap] = useState(defaultOpen);
  const status = effectiveStatus(b);
  const cancelled = status === "cancelled";
  const pickup = getPickup(b.pickupPointId);
  const pickupName = pickup ? (lang === "my" ? pickup.nameMy : pickup.name) : b.pickupArea;
  const area = b.areaLat != null && b.areaLng != null ? { lat: b.areaLat, lng: b.areaLng } : null;
  const distanceM = b.pickupDistanceM ?? (pickup && area ? Math.round(haversineM(area, pickup)) : null);

  const depart = new Date(b.departAt);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayDiff = Math.round((new Date(depart).setHours(0, 0, 0, 0) - today.getTime()) / 86400000);
  const dayLabel =
    dayDiff === 0 ? t("today") : dayDiff === 1 ? t("tomorrow") : dayDiff === -1 ? t("yesterday") : depart.toLocaleDateString();

  const badge =
    status === "upcoming" ? (
      <Badge variant="confirmed">{t("statusUpcoming")}</Badge>
    ) : status === "completed" ? (
      <Badge variant="secondary">{t("statusCompleted")}</Badge>
    ) : (
      <Badge variant="outline">{t("statusCancelled")}</Badge>
    );

  return (
    <Card className={cn("shadow-card", cancelled && "opacity-60 grayscale")}>
      <CardContent className="space-y-2.5 pt-6 text-sm">
        <div className="flex items-start justify-between gap-3">
          <span className="font-semibold [overflow-wrap:anywhere]">
            {b.pickupArea} → {b.destination}
          </span>
          {badge}
        </div>
        <p className="num flex items-center gap-2 text-muted-foreground">
          <CalendarClock className="size-4 shrink-0" /> {dayLabel}, {b.windowLabel}
        </p>
        <p className="num flex items-center gap-2 text-muted-foreground">
          <Banknote className="size-4 shrink-0" /> {b.fare ? formatMMK(b.fare) : "—"} · {b.method}
        </p>
        <p className="flex items-center gap-2 text-muted-foreground">
          <Car className="size-4 shrink-0" /> {b.driverName} · {b.plate}
        </p>
        <div className="flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2">
          <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
          <span className="min-w-0">
            <span className="block font-semibold text-primary">{t("pickupLabel")}: {pickupName}</span>
            {distanceM != null ? (
              <span className="num block text-xs text-foreground">{formatDistance(distanceM)} {t("fromYourArea")}</span>
            ) : null}
            <span className="block text-xs text-muted-foreground">{t("yourAreaLabel")}: {b.pickupArea}</span>
          </span>
        </div>
        {pickup ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowMap((v) => !v)}
            aria-expanded={showMap}
            className="min-h-10 w-full border-primary bg-primary/5 text-sm font-medium text-primary hover:bg-primary/10 hover:text-primary"
          >
            <MapIcon className="size-4" /> {showMap ? t("hideMap") : t("showMap")}
          </Button>
        ) : null}
        {showMap && pickup ? (
          <div className="relative isolate z-0 overflow-hidden rounded-xl border border-border">
            <MapView
              className="h-56"
              routes={[]}
              markers={[{ id: b.id, lat: pickup.lat, lng: pickup.lng, color: "#F75514", size: 34, label: "P", pulse: true, title: pickupName }]}
              userLocation={area ? [area.lat, area.lng] : null}
              fitTo={area ? [[pickup.lat, pickup.lng], [area.lat, area.lng]] : [[pickup.lat, pickup.lng]]}
            />
          </div>
        ) : null}
        {status === "upcoming" ? <CancelControl b={b} /> : null}
      </CardContent>
    </Card>
  );
}

function CancelControl({ b }: { b: HistoryBooking }) {
  const t = useT();
  const allowed = canCancel(b);
  if (!allowed) {
    return (
      <div className="space-y-1">
        <Button variant="outline" size="sm" disabled>{t("cancelBooking")}</Button>
        <p className="text-xs text-muted-foreground">{t("tooCloseToCancel")}</p>
      </div>
    );
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">{t("cancelBooking")}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("cancelBookingQ")}</AlertDialogTitle>
          <AlertDialogDescription>{t("cancelBookingBody")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("keepBooking")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              cancelHistoryBooking(b.id);
              toast(t("bookingCancelled"));
            }}
          >
            {t("confirmCancel")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
