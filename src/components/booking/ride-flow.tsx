import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, Flag, LocateFixed, Loader2, MapPin, Radar } from "lucide-react";

import { LocationAutocomplete } from "@/components/booking/location-autocomplete";
import { PickupChooser } from "@/components/booking/pickup-chooser";
import { MapView } from "@/components/map/map-view";
import type { MapMarker } from "@/components/map/route-map";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBooking } from "@/lib/booking-store";
import { formatMMK, paymentMethods, quoteFare, type PaymentMethod } from "@/lib/fares";
import { formatTime12, timeWindows, type LatLng } from "@/lib/mockData";
import { useLanguage, useT } from "@/lib/i18n";
import { nearestPickups, type NearbyPickup } from "@/lib/main-road-pickups";
import { addHistoryBooking } from "@/lib/booking-history";
import { useLiveDriverRoute } from "@/lib/live-driver-route";
import { cn } from "@/lib/utils";

type Mode = "prebook" | "live";
type Step = "where" | "time" | "match" | "pay" | "done";

const DRIVER = { name: "Ko Min Thu", plate: "YGN 7B-2481" };
const MOCK_RIDERS = [
  { name: "Su", gender: "female" },
  { name: "Aung", gender: "male" },
  { name: "Hnin", gender: "female" },
] as const;

/** Shared Pre-Booking / Live Mode flow. Demo-only: no real payment or matching. */
export function RideFlow({ mode }: { mode: Mode }) {
  const navigate = useNavigate();
  const booking = useBooking();
  const t = useT();
  const steps: Step[] = mode === "prebook" ? ["where", "time", "match", "pay", "done"] : ["where", "match", "pay", "done"];
  const [step, setStep] = React.useState<Step>("where");
  const [day, setDay] = React.useState<"today" | "tomorrow">("today");
  const [windowId, setWindowId] = React.useState<string | null>(null);
  const [method, setMethod] = React.useState<PaymentMethod>("Cash");
  const [searching, setSearching] = React.useState(false);
  const { lang } = useLanguage();
  const [mainPickupId, setMainPickupId] = React.useState<string | null>(null);

  const { pickupCoord, destinationCoord } = booking;
  const quote = quoteFare(pickupCoord, destinationCoord);
  const idx = steps.indexOf(step);
  const live = useLiveLocation(mode === "live");
  // Live Mode measures from the device location; otherwise from the chosen pickup area.
  const originCoord = mode === "live" && live.coord && !pickupCoord ? live.coord : pickupCoord;
  const near = React.useMemo(
    () => (originCoord ? nearestPickups(originCoord) : { pickups: [] as NearbyPickup[], withinRadius: true }),
    [originCoord],
  );
  const nearPickups = near.pickups;
  React.useEffect(() => {
    // Preselect the nearest whenever the origin changes.
    setMainPickupId(nearPickups[0]?.id ?? null);
  }, [nearPickups]);
  const mainPickup = nearPickups.find((p) => p.id === mainPickupId) ?? null;
  const mainPickupLabel = mainPickup ? (lang === "my" ? mainPickup.nameMy : mainPickup.name) : booking.pickupText;
  const savedRef = React.useRef(false);
  const go = (s: Step) => {
    if (s === "match" && mode === "prebook") setSearching(true);
    if (s === "done" && mode === "prebook" && !savedRef.current && chosen && mainPickup) {
      savedRef.current = true;
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      if (day === "tomorrow") d.setDate(d.getDate() + 1);
      addHistoryBooking({
        id: `hb-${Date.now()}`,
        createdAt: Date.now(),
        pickupArea: booking.pickupText,
        destination: booking.destinationText,
        departAt: d.getTime() + toMin(chosen.from) * 60000,
        windowLabel: chosen.label,
        fare: quote?.fare ?? null,
        method,
        driverName: DRIVER.name,
        plate: DRIVER.plate,
        pickupPointId: mainPickup.id,
        pickupDistanceM: mainPickup.distanceM,
        ...(originCoord ? { areaLat: originCoord.lat, areaLng: originCoord.lng } : {}),
        status: "upcoming",
      });
    }
    setStep(s);
  };
  const back = () => {
    const previous = steps[idx - 1];
    if (previous) setStep(previous);
    else void navigate({ to: "/home" });
  };

  const now = new Date();
  const minMinutes = now.getHours() * 60 + now.getMinutes() + 120;
  const isDisabled = (from: string) => {
    if (day === "tomorrow") return minMinutes - 1440 > toMin(from);
    return toMin(from) < minMinutes;
  };
  const chosen = timeWindows.find((w) => w.id === windowId) ?? null;

  React.useEffect(() => {
    if (step !== "match") return;
    setSearching(true);
    const id = window.setTimeout(() => setSearching(false), 2600);
    return () => window.clearTimeout(id);
  }, [step, mode]);

  return (
    <div className="min-w-0 space-y-4 [overflow-wrap:anywhere]">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
        <Button type="button" variant="outline" size="icon" onClick={back} aria-label={t("back")} className="shrink-0 rounded-full">
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {mode === "prebook" ? t("preBooking") : t("liveMode")}
          </p>
          <h1 className="text-xl">
            {step === "where" && t("whereToGo")}
            {step === "time" && t("pickDepartureTime")}
            {step === "match" && (mode === "prebook" && !searching ? t("ridersOnYourRoute") : t("findingSharedRiders"))}
            {step === "pay" && t("payment")}
            {step === "done" && (mode === "prebook" ? t("bookingConfirmed") : t("driverOnTheWay"))}
          </h1>
        </div>
      </div>
      <div className="flex gap-1.5">
        {steps.map((s, i) => (
          <span key={s} className={cn("h-1.5 flex-1 rounded-full", i <= idx ? "bg-primary" : "bg-muted")} />
        ))}
      </div>

      {step === "where" ? (
        <Card className="shadow-card">
          <CardContent className="space-y-4 pt-6">
            {mode === "live" ? <LiveLocationPanel live={live} pickups={nearPickups} selectedId={mainPickupId} usingDevice={!pickupCoord} onUseDevice={() => { booking.set({ pickupText: "", pickupCoord: null }); live.request(); }} /> : null}
            <div className="space-y-1.5">
              <Label htmlFor="flow-pickup"><MapPin className="size-4 text-primary" /> {t("pickupPoint")}</Label>
              <LocationAutocomplete
                id="flow-pickup"
                placeholder={t("searchPlacePlaceholder")}
                value={booking.pickupText}
                onValueChange={(pickupText) => booking.set({ pickupText, pickupCoord: null })}
                onPick={(p) => booking.set({ pickupText: p.label, pickupCoord: { lat: p.lat, lng: p.lng } })}
                showCurrentLocation
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="flow-dest"><Flag className="size-4 text-muted-foreground" /> {t("destination")}</Label>
              <LocationAutocomplete
                id="flow-dest"
                placeholder={t("whereToPlaceholder")}
                value={booking.destinationText}
                onValueChange={(destinationText) => booking.set({ destinationText, destinationCoord: null })}
                onPick={(p) => booking.set({ destinationText: p.label, destinationCoord: { lat: p.lat, lng: p.lng } })}
              />
            </div>
            <PickupChooser pickups={nearPickups} withinRadius={near.withinRadius} selectedId={mainPickupId} onSelect={setMainPickupId} />
            {quote ? <FareBadge fare={quote.fare} from={quote.from.name} to={quote.to.name} /> : null}
            <Button className="w-full" size="lg" disabled={!originCoord || !destinationCoord || !mainPickupId} onClick={() => go(mode === "prebook" ? "time" : "match")}>
              {t("continueLabel")} <ArrowRight className="size-4" />
            </Button>
            {!originCoord || !destinationCoord ? (
              <p className="text-center text-xs text-muted-foreground">{t("pickBothPlacesHint")}</p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {step === "time" ? (
        <Card className="shadow-card">
          <CardContent className="space-y-4 pt-6">
            <p className="text-sm text-muted-foreground">{t("twoHourHint")}</p>
            <div className="flex gap-2">
              {(["today", "tomorrow"] as const).map((d) => (
                <button key={d} type="button" onClick={() => { setDay(d); setWindowId(null); }}
                  className={cn("flex-1 cursor-pointer rounded-xl border px-4 py-2.5 text-sm font-semibold capitalize",
                    day === d ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground")}>
                  {t(d)}
                </button>
              ))}
            </div>
            <div className="grid max-h-80 grid-cols-2 gap-2 overflow-y-auto pr-1">
              {timeWindows.map((w) => {
                const disabled = isDisabled(w.from);
                return (
                  <button key={w.id} type="button" disabled={disabled} onClick={() => setWindowId(w.id)}
                    className={cn("rounded-xl border px-2 py-2 text-xs font-medium transition-colors",
                      disabled ? "cursor-not-allowed border-border bg-muted text-muted-foreground/50"
                        : windowId === w.id ? "cursor-pointer border-primary bg-primary/10 text-primary"
                        : "cursor-pointer border-border bg-card hover:border-primary/50")}>
                    {w.label}
                  </button>
                );
              })}
            </div>
            <Button className="w-full" size="lg" disabled={!windowId} onClick={() => go("match")}>
              {t("seeMatchedRiders")} <ArrowRight className="size-4" />
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {step === "match" ? (
        <Card className="shadow-card">
          <CardContent className="space-y-4 pt-6">
            {searching ? (
              <div role="status" aria-live="polite" className="flex min-h-52 flex-col items-center justify-center gap-3 py-8 text-center">
                <span className="relative flex size-16 items-center justify-center">
                  <span className="absolute inset-0 motion-safe:animate-ping rounded-full bg-primary/30" />
                  <Radar className="relative size-8 text-primary" />
                </span>
                <p className="font-semibold">{mode === "prebook" ? t("findingRidersRoute") : t("findingRidersNearby")}</p>
                {mode === "live" ? <p className="text-xs text-muted-foreground">{t("searchingRadiusHint")}</p> : null}
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  {mode === "prebook"
                    ? `${t("alreadyBookedOn")} ${booking.pickupText} → ${booking.destinationText}${chosen ? `, ${chosen.label}` : ""}`
                    : t("matchedRidersNearby")}
                </p>
                <ul className="space-y-2">
                  {MOCK_RIDERS.map((r) => (
                    <li key={r.name} className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2">
                      <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-lg">
                        {r.gender === "female" ? "👩" : "👨"}
                      </span>
                      <span className="text-sm font-medium">{r.name}</span>
                    </li>
                  ))}
                </ul>
                {quote ? <FareBadge fare={quote.fare} from={quote.from.name} to={quote.to.name} /> : null}
                <Button className="w-full" size="lg" onClick={() => go("pay")}>
                  {t("joinThisRide")} <ArrowRight className="size-4" />
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : null}

      {step === "pay" ? (
        <Card className="shadow-card">
          <CardContent className="space-y-4 pt-6">
            {quote ? <FareBadge fare={quote.fare} from={quote.from.name} to={quote.to.name} /> : null}
            <div className="space-y-1.5">
              <Label htmlFor="pay-method">{t("paymentMethod")}</Label>
              <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
                <SelectTrigger id="pay-method" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{t("demoPaymentHint")}</p>
            </div>
            <Button className="h-auto min-h-12 w-full whitespace-normal px-4 py-3" size="lg" onClick={() => go("done")}>
              {t("pay")} {quote ? formatMMK(quote.fare) : ""} {t("withMethod")} {method}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {step === "done" ? (
        mode === "prebook" ? (
          <Card className="shadow-card">
            <CardContent className="space-y-4 pt-6 text-center">
              <CheckCircle2 className="prebook-success mx-auto size-14 text-primary" />
              <p className="text-lg font-semibold">
                {t("driverWillPickUpAt")} {chosen ? formatTime12(chosen.from) : t("yourTime")}
                {day === "tomorrow" ? ` ${t("tomorrow")}` : ""} {t("at")} {mainPickupLabel}
              </p>
              <p className="text-sm text-muted-foreground">{t("notify10Min")}</p>
              <DriverRow method={method} fare={quote?.fare} />
              <Button className="w-full" variant="outline" onClick={() => navigate({ to: "/home" })}>{t("backToHome")}</Button>
            </CardContent>
          </Card>
        ) : (
          <LiveTracking method={method} fare={quote?.fare} pickupPoint={mainPickup} pickupLabel={mainPickupLabel} />
        )
      ) : null}
    </div>
  );
}

function toMin(t: string) {
  const [h, m] = t.split(":").map(Number) as [number, number];
  return h * 60 + m;
}

export function FareBadge({ fare, from, to }: { fare: number; from: string; to: string }) {
  const t = useT();
  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
      <p className="text-lg font-bold text-primary">{formatMMK(fare)}</p>
      <p className="text-xs text-muted-foreground">{t("fixedRateForRoute")} · {from} → {to}</p>
    </div>
  );
}

function DriverRow({ method, fare }: { method: string; fare?: number | undefined }) {
  const t = useT();
  return (
    <div className="rounded-xl border border-border bg-card p-3 text-left text-sm">
      <p className="font-semibold">{DRIVER.name}</p>
      <p className="text-muted-foreground">{t("plate")} {DRIVER.plate}</p>
      <p className="text-muted-foreground">{t("paid")} {fare ? formatMMK(fare) : ""} · {method}</p>
    </div>
  );
}

function LiveTracking({ method, fare, pickupPoint, pickupLabel }: { method: string; fare?: number | undefined; pickupPoint: NearbyPickup | null; pickupLabel: string }) {
  const t = useT();
  const { pickupCoord } = useBooking();
  const src = pickupPoint ?? pickupCoord;
  const pickupText = pickupLabel;
  const pickup: LatLng | null = src ? [src.lat, src.lng] : null;
  const pickupKey = pickup ? `${pickup[0]},${pickup[1]}` : null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stablePickup = React.useMemo(() => pickup, [pickupKey]);
  const route = useLiveDriverRoute(stablePickup);
  const markers: MapMarker[] = pickup
    ? [{ id: "pickup", lat: pickup[0], lng: pickup[1], color: "#F75514", size: 26, label: "P", pulse: true, title: pickupText }]
    : [];

  return (
    <div className="space-y-4">
      <div className="relative isolate z-0 overflow-hidden rounded-2xl border border-border">
        {route.ready && route.path ? (
          <MapView className="h-72" routes={[]} markers={markers} line={route.path} vehicle={route.position} vehicleLabel={t("driver")} vehicleHeading={route.heading} fitTo={route.path} />
        ) : (
          <div className="flex h-72 items-center justify-center gap-2 bg-muted text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-primary" /> {t("driverOnTheWay")}
          </div>
        )}
      </div>
      <Card className="shadow-card">
        <CardContent className="space-y-3 pt-6">
          <p className="flex items-center gap-2 font-semibold">
            <Loader2 className="size-4 animate-spin text-primary" /> {t("driverHeadingTo")} {pickupText}
          </p>
          {route.etaMin != null ? (
            <p className="text-sm text-muted-foreground">ETA {route.etaMin} {t("minUnit")}</p>
          ) : null}
          <DriverRow method={method} fare={fare} />
        </CardContent>
      </Card>
    </div>
  );
}

/** Central Yangon (Sule) — demo fallback so Live Mode never breaks. */
const DEMO_LOCATION = { lat: 16.7770, lng: 96.1586 };
type LiveLocation = { coord: { lat: number; lng: number } | null; status: "idle" | "locating" | "ok" | "failed"; request: () => void };

function useLiveLocation(enabled: boolean): LiveLocation {
  const [coord, setCoord] = React.useState<LiveLocation["coord"]>(null);
  const [status, setStatus] = React.useState<LiveLocation["status"]>("idle");
  const request = React.useCallback(() => {
    const fail = () => { setCoord(DEMO_LOCATION); setStatus("failed"); };
    if (typeof navigator === "undefined" || !navigator.geolocation) return fail();
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => { setCoord({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setStatus("ok"); },
      fail,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  }, []);
  React.useEffect(() => { if (enabled) request(); }, [enabled, request]);
  return { coord, status, request };
}

function LiveLocationPanel({ live, pickups, selectedId, usingDevice, onUseDevice }: {
  live: LiveLocation; pickups: NearbyPickup[]; selectedId: string | null; usingDevice: boolean; onUseDevice: () => void;
}) {
  const t = useT();
  const markers: MapMarker[] = pickups.map((p) => ({
    id: p.id, lat: p.lat, lng: p.lng, color: p.id === selectedId ? "#F75514" : "#334155", size: p.id === selectedId ? 30 : 22, label: "P", title: p.name,
  }));
  const me: LatLng | null = usingDevice && live.coord ? [live.coord.lat, live.coord.lng] : null;
  const fit: LatLng[] = [...(me ? [me] : []), ...pickups.map((p) => [p.lat, p.lng] as LatLng)];
  return (
    <div className="space-y-2.5">
      <p className="text-sm text-muted-foreground">{t("locationExplain")}</p>
      {live.status === "locating" ? (
        <p role="status" className="flex items-center gap-2 text-sm"><Loader2 className="size-4 animate-spin text-primary" /> {t("locating")}</p>
      ) : live.status === "failed" ? (
        <p role="status" className="rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-medium text-primary">{t("liveLocationUnavailable")}</p>
      ) : live.status === "ok" && usingDevice ? (
        <p className="text-xs font-medium text-primary">{t("usingYourLocation")}</p>
      ) : null}
      {usingDevice && fit.length ? (
        <div className="relative isolate z-0 overflow-hidden rounded-xl border border-border">
          <MapView className="h-44" routes={[]} markers={markers} userLocation={me} fitTo={fit} />
        </div>
      ) : null}
      <Button type="button" variant="outline" className="min-h-10 w-full border-primary text-primary" onClick={onUseDevice} disabled={live.status === "locating"}>
        <LocateFixed className="size-4" /> {t("useMyLocation")}
      </Button>
    </div>
  );
}
