import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, Flag, Loader2, MapPin, Radar } from "lucide-react";

import { LocationAutocomplete } from "@/components/booking/location-autocomplete";
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
import { useRoadPath } from "@/lib/road-path";
import { useVehicleAnimation } from "@/lib/use-vehicle-animation";
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
  const steps: Step[] = mode === "prebook" ? ["where", "time", "match", "pay", "done"] : ["where", "match", "pay", "done"];
  const [step, setStep] = React.useState<Step>("where");
  const [day, setDay] = React.useState<"today" | "tomorrow">("today");
  const [windowId, setWindowId] = React.useState<string | null>(null);
  const [method, setMethod] = React.useState<PaymentMethod>("Cash");
  const [searching, setSearching] = React.useState(false);

  const { pickupCoord, destinationCoord } = booking;
  const quote = quoteFare(pickupCoord, destinationCoord);
  const idx = steps.indexOf(step);
  const go = (s: Step) => setStep(s);
  const back = () => (idx === 0 ? navigate({ to: "/home" }) : setStep(steps[idx - 1]!));

  const now = new Date();
  const minMinutes = now.getHours() * 60 + now.getMinutes() + 120;
  const isDisabled = (from: string) => {
    if (day === "tomorrow") return minMinutes - 1440 > toMin(from);
    return toMin(from) < minMinutes;
  };
  const chosen = timeWindows.find((w) => w.id === windowId) ?? null;

  React.useEffect(() => {
    if (step !== "match" || mode !== "live") return;
    setSearching(true);
    const id = window.setTimeout(() => setSearching(false), 2600);
    return () => window.clearTimeout(id);
  }, [step, mode]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button type="button" onClick={back} aria-label="Back" className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-border bg-card">
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {mode === "prebook" ? "Pre-Booking" : "Live Mode"}
          </p>
          <h1 className="text-xl">
            {step === "where" && "Where to go?"}
            {step === "time" && "Pick a departure time"}
            {step === "match" && (mode === "prebook" ? "Riders on your route" : "Finding shared riders")}
            {step === "pay" && "Payment"}
            {step === "done" && (mode === "prebook" ? "Booking confirmed" : "Driver on the way")}
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
            <div className="space-y-1.5">
              <Label htmlFor="flow-pickup"><MapPin className="size-4 text-primary" /> Pickup point</Label>
              <LocationAutocomplete
                id="flow-pickup"
                placeholder="Search a place — e.g. Hledan Junction"
                value={booking.pickupText}
                onValueChange={(pickupText) => booking.set({ pickupText, pickupCoord: null })}
                onPick={(p) => booking.set({ pickupText: p.label, pickupCoord: { lat: p.lat, lng: p.lng } })}
                showCurrentLocation
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="flow-dest"><Flag className="size-4 text-muted-foreground" /> Destination</Label>
              <LocationAutocomplete
                id="flow-dest"
                placeholder="Where to — e.g. Sule Square"
                value={booking.destinationText}
                onValueChange={(destinationText) => booking.set({ destinationText, destinationCoord: null })}
                onPick={(p) => booking.set({ destinationText: p.label, destinationCoord: { lat: p.lat, lng: p.lng } })}
              />
            </div>
            {quote ? <FareBadge fare={quote.fare} from={quote.from.name} to={quote.to.name} /> : null}
            <Button className="w-full" size="lg" disabled={!pickupCoord || !destinationCoord} onClick={() => go(steps[1]!)}>
              Continue <ArrowRight className="size-4" />
            </Button>
            {!pickupCoord || !destinationCoord ? (
              <p className="text-center text-xs text-muted-foreground">Pick both places from the suggestions to continue.</p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {step === "time" ? (
        <Card className="shadow-card">
          <CardContent className="space-y-4 pt-6">
            <p className="text-sm text-muted-foreground">Book at least 2 hours in advance — earlier times are greyed out.</p>
            <div className="flex gap-2">
              {(["today", "tomorrow"] as const).map((d) => (
                <button key={d} type="button" onClick={() => { setDay(d); setWindowId(null); }}
                  className={cn("flex-1 cursor-pointer rounded-xl border px-4 py-2.5 text-sm font-semibold capitalize",
                    day === d ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground")}>
                  {d}
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
              See matched riders <ArrowRight className="size-4" />
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {step === "match" ? (
        <Card className="shadow-card">
          <CardContent className="space-y-4 pt-6">
            {mode === "live" && searching ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <span className="relative flex size-16 items-center justify-center">
                  <span className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
                  <Radar className="relative size-8 text-primary" />
                </span>
                <p className="font-semibold">Finding shared riders near you…</p>
                <p className="text-xs text-muted-foreground">Searching within 1.5 km for riders heading your way</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  {mode === "prebook"
                    ? `Already booked on ${booking.pickupText} → ${booking.destinationText}${chosen ? `, ${chosen.label}` : ""}`
                    : "Matched! These riders nearby are heading the same direction."}
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
                  Join this ride <ArrowRight className="size-4" />
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
              <Label htmlFor="pay-method">Payment method</Label>
              <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
                <SelectTrigger id="pay-method" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Demo only — no real payment is taken.</p>
            </div>
            <Button className="w-full" size="lg" onClick={() => go("done")}>
              Pay {quote ? formatMMK(quote.fare) : ""} with {method}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {step === "done" ? (
        mode === "prebook" ? (
          <Card className="shadow-card">
            <CardContent className="space-y-4 pt-6 text-center">
              <CheckCircle2 className="mx-auto size-14 text-primary" />
              <p className="text-lg font-semibold">
                Your driver will pick you up at {chosen ? formatTime12(chosen.from) : "your time"}
                {day === "tomorrow" ? " tomorrow" : ""} at {booking.pickupText}
              </p>
              <DriverRow method={method} fare={quote?.fare} />
              <Button className="w-full" variant="outline" onClick={() => navigate({ to: "/home" })}>Back to home</Button>
            </CardContent>
          </Card>
        ) : (
          <LiveTracking method={method} fare={quote?.fare} />
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
  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
      <p className="text-lg font-bold text-primary">{formatMMK(fare)}</p>
      <p className="text-xs text-muted-foreground">Fixed rate for this route · {from} → {to}</p>
    </div>
  );
}

function DriverRow({ method, fare }: { method: string; fare?: number | undefined }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 text-left text-sm">
      <p className="font-semibold">{DRIVER.name}</p>
      <p className="text-muted-foreground">Plate {DRIVER.plate}</p>
      <p className="text-muted-foreground">Paid {fare ? formatMMK(fare) : ""} · {method}</p>
    </div>
  );
}

function LiveTracking({ method, fare }: { method: string; fare?: number | undefined }) {
  const { pickupCoord, pickupText } = useBooking();
  const pickup: LatLng | null = pickupCoord ? [pickupCoord.lat, pickupCoord.lng] : null;
  const waypoints = React.useMemo<LatLng[] | null>(
    () => (pickup ? [[pickup[0] + 0.012, pickup[1] + 0.01], pickup] : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pickupCoord],
  );
  const path = useRoadPath(waypoints) ?? null;
  const vehicle = useVehicleAnimation(path, true);
  const markers: MapMarker[] = pickup
    ? [{ id: "pickup", lat: pickup[0], lng: pickup[1], color: "#F75514", size: 26, label: "P", pulse: true, title: pickupText }]
    : [];

  return (
    <div className="space-y-4">
      <div className="relative isolate z-0 overflow-hidden rounded-2xl border border-border">
        <MapView className="h-72" routes={[]} markers={markers} line={path ?? undefined} vehicle={vehicle} vehicleLabel="Driver" fitTo={path ?? undefined} />
      </div>
      <Card className="shadow-card">
        <CardContent className="space-y-3 pt-6">
          <p className="flex items-center gap-2 font-semibold">
            <Loader2 className="size-4 animate-spin text-primary" /> Driver heading to {pickupText}
          </p>
          <DriverRow method={method} fare={fare} />
        </CardContent>
      </Card>
    </div>
  );
}
