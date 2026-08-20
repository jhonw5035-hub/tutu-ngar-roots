import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  CircleDollarSign,
  Clock,
  Copy,
  Loader2,
  MapPin,
  Navigation,
  QrCode,
  Share2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { MapView } from "@/components/map/map-view";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  getPassengers,
  getPoint,
  getPointsForRoute,
  getRoute,
  getSlotsForRoute,
  mockDriver,
  routes,
  type LatLng,
} from "@/lib/mockData";

type Step =
  | "route"
  | "pickup"
  | "destination"
  | "time"
  | "group"
  | "summary"
  | "payment"
  | "confirmed";

const stepOrder: Step[] = [
  "route",
  "pickup",
  "destination",
  "time",
  "group",
  "summary",
  "payment",
  "confirmed",
];

const stepTitle: Record<Step, string> = {
  route: "Choose your route",
  pickup: "Choose your pickup point",
  destination: "Choose your destination",
  time: "Choose a departure time",
  group: "Who you'll ride with",
  summary: "Review your booking",
  payment: "Pay with MMQR",
  confirmed: "Booking confirmed",
};

function useVehicleAnimation(path: LatLng[] | null, enabled: boolean) {
  const [position, setPosition] = useState<LatLng | null>(path?.[0] ?? null);

  useEffect(() => {
    if (!enabled || !path || path.length < 2) return;
    let t = 0;
    const stepsPerLeg = 40;
    const total = (path.length - 1) * stepsPerLeg;
    const id = window.setInterval(() => {
      t = (t + 1) % total;
      const leg = Math.floor(t / stepsPerLeg);
      const f = (t % stepsPerLeg) / stepsPerLeg;
      const a = path[leg]!;
      const b = path[leg + 1]!;
      setPosition([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]);
    }, 120);
    return () => window.clearInterval(id);
  }, [path, enabled]);

  return position;
}

export function BookingFlow() {
  const [step, setStep] = useState<Step>("route");
  const [routeId, setRouteId] = useState<string | null>(null);
  const [pickupId, setPickupId] = useState<string | null>(null);
  const [destinationId, setDestinationId] = useState<string | null>(null);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [womenOnly, setWomenOnly] = useState(false);
  const [paying, setPaying] = useState(false);
  const [hint, setHint] = useState(false);
  const [view, setView] = useState<"map" | "list">("map");

  const route = getRoute(routeId);
  const points = getPointsForRoute(routeId);
  const pickup = getPoint(pickupId);
  const destination = getPoint(destinationId);
  const slots = getSlotsForRoute(routeId);
  const slot = slots.find((s) => s.id === slotId) ?? null;
  const passengers = getPassengers(slotId);
  const visiblePassengers = womenOnly
    ? passengers.filter((p) => p.gender === "female")
    : passengers;

  const vehiclePos = useVehicleAnimation(route?.path ?? null, step === "confirmed");

  const canContinue = useMemo(() => {
    switch (step) {
      case "route":
        return !!routeId;
      case "pickup":
        return !!pickupId;
      case "destination":
        return !!destinationId;
      case "time":
        return !!slotId;
      default:
        return true;
    }
  }, [step, routeId, pickupId, destinationId, slotId]);

  useEffect(() => {
    if (canContinue) setHint(false);
  }, [canContinue]);

  const go = (next: Step) => setStep(next);
  const index = stepOrder.indexOf(step);

  const next = () => {
    if (!canContinue) {
      setHint(true);
      return;
    }
    go(stepOrder[Math.min(index + 1, stepOrder.length - 1)]!);
  };
  const back = () => go(stepOrder[Math.max(index - 1, 0)]!);

  const selectRoute = (id: string) => {
    if (id !== routeId) {
      setRouteId(id);
      setPickupId(null);
      setDestinationId(null);
      setSlotId(null);
    }
  };

  const pay = () => {
    setPaying(true);
    window.setTimeout(() => {
      setPaying(false);
      go("confirmed");
      toast.success("Payment received — your seat is booked");
    }, 1400);
  };

  const reset = () => {
    setStep("route");
    setRouteId(null);
    setPickupId(null);
    setDestinationId(null);
    setSlotId(null);
    setWomenOnly(false);
  };

  const share = async () => {
    const text = `I'm riding Tu Tu Ngar: ${route?.name} — pickup ${pickup?.name} at ${slot?.time}, driver ${mockDriver.name} (${mockDriver.plate}). Track: https://tutungar.app/t/DEMO123`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Trip link copied to clipboard");
    } catch {
      toast.error("Couldn't copy — please try again");
    }
  };

  const mapPoints =
    step === "route"
      ? []
      : step === "destination"
        ? points.filter((p) => p.id !== pickupId || p.id === destinationId)
        : points;

  const showSticky = step !== "payment" && step !== "confirmed";

  return (
    <div className="space-y-5 pb-8">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          {index > 0 && step !== "confirmed" ? (
            <Button variant="ghost" size="sm" onClick={back} className="-ml-2">
              <ArrowLeft className="size-4" /> Back
            </Button>
          ) : null}
          <Badge variant="muted">
            Step {Math.min(index + 1, 7)} of 7
          </Badge>
        </div>
        <h1 className="text-2xl">{stepTitle[step]}</h1>
        {route ? (
          <p className="text-sm text-muted-foreground">
            {route.roadName} · {route.from} → {route.to}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Tap a corridor on the map — <span className="mm">တူတူငှား</span> shared rides
            across Yangon.
          </p>
        )}
      </header>

      {step !== "payment" ? (
        <MapView
          className={step === "confirmed" ? "h-56" : "h-72"}
          routes={step === "route" ? routes : route ? [route] : routes}
          selectedRouteId={routeId}
          onSelectRoute={selectRoute}
          points={mapPoints}
          pickupId={pickupId}
          destinationId={destinationId}
          onSelectPoint={(id) => {
            if (step === "pickup") setPickupId(id);
            else if (step === "destination" && id !== pickupId) setDestinationId(id);
          }}
          vehicle={step === "confirmed" ? vehiclePos : null}
        />
      ) : null}

      {step === "route" ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Available corridors</p>
            <div className="flex gap-1 rounded-lg bg-muted p-1">
              {(["map", "list"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={cn(
                    "rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors",
                    view === v
                      ? "bg-background text-foreground shadow-card"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          {view === "list" || true ? (
            <ul className="space-y-2">
              {routes.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => selectRoute(r.id)}
                    aria-pressed={routeId === r.id}
                    className={cn(
                      "w-full cursor-pointer rounded-xl border p-3 text-left transition-all active:scale-[0.99]",
                      routeId === r.id
                        ? "border-primary bg-accent shadow-card"
                        : "border-border bg-card hover:border-primary/50",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{r.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.from} → {r.to} · {r.roadName}
                        </p>
                      </div>
                      <span className="num text-sm">{r.fare.toLocaleString()} Ks</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      {step === "pickup" || step === "destination" ? (
        <section className="space-y-2">
          <p className="text-sm font-semibold">
            {step === "pickup" ? "Pickup points in road order" : "Destinations ahead"}
          </p>
          <ul className="space-y-2">
            {(step === "pickup"
              ? points
              : points.filter((p) => p.id !== pickupId && p.isDestination)
            ).map((p) => {
              const selected = step === "pickup" ? p.id === pickupId : p.id === destinationId;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() =>
                      step === "pickup" ? setPickupId(p.id) : setDestinationId(p.id)
                    }
                    aria-pressed={selected}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition-all active:scale-[0.99]",
                      selected
                        ? "border-primary bg-accent shadow-card"
                        : "border-border bg-card hover:border-primary/50",
                    )}
                  >
                    <span
                      className={cn(
                        "num flex size-7 shrink-0 items-center justify-center rounded-full text-xs",
                        selected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {p.sequence}
                    </span>
                    <span className="text-sm font-medium">{p.name}</span>
                    {selected ? <Check className="ml-auto size-4 text-primary" /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {step === "time" ? (
        <section className="space-y-3">
          <p className="text-sm font-semibold">Departure slots today</p>
          <div className="grid grid-cols-2 gap-2">
            {slots.map((s) => {
              const full = s.seatsFilled >= s.seatsCapacity;
              const selected = s.id === slotId;
              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={full}
                  onClick={() => setSlotId(s.id)}
                  aria-pressed={selected}
                  className={cn(
                    "cursor-pointer rounded-xl border p-3 text-left transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
                    selected
                      ? "border-primary bg-accent shadow-card"
                      : "border-border bg-card hover:border-primary/50",
                  )}
                >
                  <p className="num text-lg">{s.time}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.seatsFilled} of {s.seatsCapacity} seats booked
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {step === "group" ? (
        <section className="space-y-3">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="size-4" /> Riders in the {slot?.time} van
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-3 rounded-lg bg-muted p-3">
                <Label htmlFor="women-only" className="text-sm">
                  Prefer women-only grouping
                </Label>
                <Switch id="women-only" checked={womenOnly} onCheckedChange={setWomenOnly} />
              </div>
              {visiblePassengers.length ? (
                <ul className="space-y-2">
                  {visiblePassengers.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center gap-3 rounded-lg border border-border p-3"
                    >
                      <span className="flex size-8 items-center justify-center rounded-full bg-accent text-sm">
                        {p.gender === "female" ? "♀" : "♂"}
                      </span>
                      <span className="text-sm font-medium">{p.firstName}</span>
                      <Badge variant="muted" className="ml-auto capitalize">
                        {p.gender}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No matching riders yet — you'd be first in this group.
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Only first names and gender are shared. Full identities stay private.
              </p>
            </CardContent>
          </Card>
        </section>
      ) : null}

      {step === "summary" ? (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Booking summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <SummaryRow icon={Navigation} label="Route" value={route?.name ?? "—"} />
            <SummaryRow icon={MapPin} label="Pickup" value={pickup?.name ?? "—"} />
            <SummaryRow icon={MapPin} label="Destination" value={destination?.name ?? "—"} />
            <SummaryRow icon={Clock} label="Departs" value={slot?.time ?? "—"} />
            <SummaryRow icon={Users} label="Seats" value="1 seat" />
            <Separator />
            <SummaryRow
              icon={CircleDollarSign}
              label="Fare"
              value={`${(route?.fare ?? 0).toLocaleString()} Ks`}
            />
            {womenOnly ? (
              <Badge variant="confirmed">Women-only grouping requested</Badge>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {step === "payment" ? (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Scan to pay with MMQR</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="mx-auto flex size-48 items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted">
              <QrCode className="size-24 text-muted-foreground" />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Amount due{" "}
              <span className="num text-foreground">
                {(route?.fare ?? 0).toLocaleString()} Ks
              </span>
            </p>
            <Button className="w-full" size="lg" disabled={paying} onClick={pay}>
              {paying ? <Loader2 className="size-4 animate-spin" /> : null}
              {paying ? "Confirming payment…" : "Simulate Payment Success"}
            </Button>
            <Button variant="ghost" className="w-full" onClick={back} disabled={paying}>
              Back to summary
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {step === "confirmed" ? (
        <div className="space-y-4">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                Your ride is booked
                <Badge variant="confirmed">Confirmed</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <SummaryRow icon={MapPin} label="Pickup" value={pickup?.name ?? "—"} />
              <SummaryRow icon={Clock} label="Departs" value={slot?.time ?? "—"} />
              <Separator />
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-accent text-base font-bold">
                  {mockDriver.name.slice(0, 1)}
                </div>
                <div>
                  <p className="font-semibold">{mockDriver.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {mockDriver.vehicle} · <span className="num">{mockDriver.plate}</span>
                  </p>
                </div>
                <Badge variant="progress" className="ml-auto">
                  On the way
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={share} variant="secondary">
                  <Share2 className="size-4" /> Share my trip
                </Button>
                <Button variant="ghost" onClick={share}>
                  <Copy className="size-4" /> Copy link
                </Button>
              </div>
            </CardContent>
          </Card>
          <Button variant="outline" className="w-full" onClick={reset}>
            Book another ride
          </Button>
        </div>
      ) : null}

      {showSticky ? (
        <div className="safe-bottom fixed inset-x-0 bottom-14 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto w-full max-w-3xl">
            {hint && !canContinue ? (
              <p className="mb-2 text-xs font-medium text-destructive">
                Make a selection to continue.
              </p>
            ) : null}
            <Button
              className="w-full transition-transform active:scale-[0.99]"
              size="lg"
              aria-disabled={!canContinue}
              onClick={next}
              variant={canContinue ? "default" : "secondary"}
            >
              {step === "summary" ? "Confirm & Pay" : "Continue"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="size-4 text-muted-foreground" />
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-auto text-right font-medium">{value}</span>
    </div>
  );
}