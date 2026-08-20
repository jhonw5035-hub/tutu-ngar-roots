import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useSnappedCorridors } from "@/lib/routeGeometry";
import { getPassengers, getSlotsForRoute, mockDriver, type LatLng } from "@/lib/mockData";

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

const PEEK = 48;
const FULL = 88;

function useVehicleAnimation(path: LatLng[] | null, enabled: boolean) {
  const [position, setPosition] = useState<LatLng | null>(path?.[0] ?? null);

  useEffect(() => {
    if (!enabled || !path || path.length < 2) return;
    let t = 0;
    const stepsPerLeg = 12;
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

/** Slim Grab-style step dots. */
function StepDots({ index, total }: { index: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`Step ${index + 1} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all duration-300",
            i === index
              ? "w-6 bg-primary"
              : i < index
                ? "w-1.5 bg-primary/50"
                : "w-1.5 bg-border",
          )}
        />
      ))}
    </div>
  );
}

function TapCard({
  selected,
  justSelected,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
  justSelected?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "w-full cursor-pointer rounded-2xl border p-3.5 text-left transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50",
        selected
          ? "border-primary bg-accent shadow-elevated"
          : "border-border bg-card shadow-card hover:border-primary/40",
        justSelected && "select-pop",
        className,
      )}
      {...props}
    />
  );
}

export function BookingFlow() {
  const { routes, points: allPoints, loading } = useSnappedCorridors();

  const [step, setStep] = useState<Step>("route");
  const [routeId, setRouteId] = useState<string | null>(null);
  const [pickupId, setPickupId] = useState<string | null>(null);
  const [destinationId, setDestinationId] = useState<string | null>(null);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [womenOnly, setWomenOnly] = useState(false);
  const [paying, setPaying] = useState(false);
  const [hint, setHint] = useState(false);
  const [popId, setPopId] = useState<string | null>(null);
  const [sheet, setSheet] = useState(PEEK);
  const dragRef = useRef<{ startY: number; startH: number } | null>(null);

  const route = routes.find((r) => r.id === routeId) ?? null;
  const points = useMemo(
    () => allPoints.filter((p) => p.routeId === routeId).sort((a, b) => a.sequence - b.sequence),
    [allPoints, routeId],
  );
  const pickup = points.find((p) => p.id === pickupId) ?? null;
  const destination = points.find((p) => p.id === destinationId) ?? null;
  const slots = getSlotsForRoute(routeId);
  const slot = slots.find((s) => s.id === slotId) ?? null;
  const passengers = getPassengers(slotId);
  const visiblePassengers = womenOnly
    ? passengers.filter((p) => p.gender === "female")
    : passengers;

  const vehiclePos = useVehicleAnimation(route?.path ?? null, step === "confirmed");

  const pop = (id: string) => {
    setPopId(id);
    window.setTimeout(() => setPopId((cur) => (cur === id ? null : cur)), 450);
  };

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

  const index = stepOrder.indexOf(step);
  const go = (nextStep: Step) => {
    setStep(nextStep);
    setSheet(nextStep === "summary" || nextStep === "payment" || nextStep === "group" ? FULL : PEEK);
  };

  const next = () => {
    if (!canContinue) {
      setHint(true);
      return;
    }
    go(stepOrder[Math.min(index + 1, stepOrder.length - 1)]!);
  };
  const back = () => go(stepOrder[Math.max(index - 1, 0)]!);

  const selectRoute = (id: string) => {
    pop(id);
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
    setSheet(PEEK);
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

  // --- draggable sheet handle -------------------------------------------
  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { startY: e.clientY, startH: sheet };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const delta = ((d.startY - e.clientY) / window.innerHeight) * 100;
    setSheet(Math.min(FULL, Math.max(22, d.startH + delta)));
  }, []);
  const onPointerUp = () => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setSheet((h) => (h > (PEEK + FULL) / 2 ? FULL : h < PEEK - 10 ? 30 : PEEK));
  };

  const mapPoints =
    step === "route"
      ? []
      : step === "destination"
        ? points.filter((p) => p.id !== pickupId || p.id === destinationId)
        : points;

  const showSticky = step !== "payment" && step !== "confirmed";

  return (
    <div className="fixed inset-x-0 top-14 bottom-14">
      {/* Map layer — takes the whole screen behind the sheet */}
      <div className="absolute inset-0">
        <MapView
          className="h-full"
          showLocate
          locateOffsetClassName="top-4"
          routes={step === "route" ? routes : route ? [route] : routes}
          selectedRouteId={routeId}
          onSelectRoute={selectRoute}
          points={mapPoints}
          pickupId={pickupId}
          destinationId={destinationId}
          onSelectPoint={(id) => {
            if (step === "pickup") {
              setPickupId(id);
              pop(id);
            } else if (step === "destination" && id !== pickupId) {
              setDestinationId(id);
              pop(id);
            }
          }}
          vehicle={step === "confirmed" ? vehiclePos : null}
        />
      </div>

      {/* Bottom sheet */}
      <section
        className="absolute inset-x-0 bottom-0 z-[600] flex flex-col rounded-t-3xl border-t border-border bg-card shadow-elevated"
        style={{
          height: `${sheet}%`,
          transition: dragRef.current ? "none" : "height 320ms cubic-bezier(.22,1,.36,1)",
        }}
      >
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onClick={() => setSheet((h) => (h >= FULL - 1 ? PEEK : FULL))}
          className="flex cursor-grab touch-none flex-col items-center pt-2.5 pb-1 active:cursor-grabbing"
          role="separator"
          aria-label="Drag to resize panel"
        >
          <span className="h-1.5 w-10 rounded-full bg-border" />
        </div>

        <div className="flex items-center gap-2 px-4 pt-1">
          {index > 0 && step !== "confirmed" ? (
            <Button variant="ghost" size="sm" onClick={back} className="-ml-2 h-8 px-2">
              <ArrowLeft className="size-4" />
            </Button>
          ) : null}
          <StepDots index={Math.min(index, 6)} total={7} />
          {loading ? (
            <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="size-3 animate-spin" /> snapping roads
            </span>
          ) : null}
        </div>

        <div className="px-4 pt-2">
          <h1 className="text-xl">{stepTitle[step]}</h1>
          <p className="text-sm text-muted-foreground">
            {route ? (
              `${route.roadName} · ${route.from} → ${route.to}`
            ) : (
              <>
                Tap a corridor — <span className="mm">တူတူငှား</span> shared rides across
                Yangon.
              </>
            )}
          </p>
        </div>

        <div
          key={step}
          className="step-in min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pt-3 pb-4"
        >
          {step === "route" ? (
            <ul className="space-y-2.5">
              {routes.map((r) => (
                <li key={r.id}>
                  <TapCard
                    selected={routeId === r.id}
                    justSelected={popId === r.id}
                    onClick={() => selectRoute(r.id)}
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
                  </TapCard>
                </li>
              ))}
            </ul>
          ) : null}

          {step === "pickup" || step === "destination" ? (
            <ul className="space-y-2.5">
              {(step === "pickup"
                ? points
                : points.filter((p) => p.id !== pickupId && p.isDestination)
              ).map((p) => {
                const selected =
                  step === "pickup" ? p.id === pickupId : p.id === destinationId;
                return (
                  <li key={p.id}>
                    <TapCard
                      selected={selected}
                      justSelected={popId === p.id}
                      onClick={() => {
                        if (step === "pickup") setPickupId(p.id);
                        else setDestinationId(p.id);
                        pop(p.id);
                      }}
                      className="flex items-center gap-3"
                    >
                      <span
                        className={cn(
                          "num flex size-7 shrink-0 items-center justify-center rounded-full text-xs transition-colors",
                          selected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {p.sequence}
                      </span>
                      <span className="text-sm font-medium">{p.name}</span>
                      {selected ? <Check className="ml-auto size-4 text-primary" /> : null}
                    </TapCard>
                  </li>
                );
              })}
            </ul>
          ) : null}

          {step === "time" ? (
            <div className="grid grid-cols-2 gap-2.5">
              {slots.map((s) => {
                const full = s.seatsFilled >= s.seatsCapacity;
                return (
                  <TapCard
                    key={s.id}
                    disabled={full}
                    selected={s.id === slotId}
                    justSelected={popId === s.id}
                    onClick={() => {
                      setSlotId(s.id);
                      pop(s.id);
                    }}
                  >
                    <p className="num text-lg">{s.time}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.seatsFilled} of {s.seatsCapacity} seats booked
                    </p>
                  </TapCard>
                );
              })}
            </div>
          ) : null}

          {step === "group" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 rounded-2xl bg-muted p-3.5">
                <Label htmlFor="women-only" className="text-sm">
                  Prefer women-only grouping
                </Label>
                <Switch id="women-only" checked={womenOnly} onCheckedChange={setWomenOnly} />
              </div>
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Users className="size-4" /> Riders in the {slot?.time} van
              </p>
              {visiblePassengers.length ? (
                <ul className="space-y-2">
                  {visiblePassengers.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card"
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
            </div>
          ) : null}

          {step === "summary" ? (
            <div className="space-y-3 rounded-2xl border border-border bg-card p-4 text-sm shadow-card">
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
            </div>
          ) : null}

          {step === "payment" ? (
            <div className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-card">
              <p className="text-sm font-semibold">Scan to pay with MMQR</p>
              <div className="mx-auto flex size-44 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted">
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
            </div>
          ) : null}

          {step === "confirmed" ? (
            <div className="space-y-3">
              <div className="space-y-3 rounded-2xl border border-border bg-card p-4 text-sm shadow-card">
                <div className="flex items-center justify-between">
                  <p className="text-base font-bold">Your ride is booked</p>
                  <Badge variant="confirmed">Confirmed</Badge>
                </div>
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
              </div>
              <Button variant="outline" className="w-full" onClick={reset}>
                Book another ride
              </Button>
            </div>
          ) : null}
        </div>

        {showSticky ? (
          <div className="border-t border-border bg-card/95 px-4 py-3 backdrop-blur">
            {hint && !canContinue ? (
              <p className="mb-2 text-xs font-medium text-destructive">
                Make a selection to continue.
              </p>
            ) : null}
            <Button
              className="w-full transition-transform active:scale-[0.98]"
              size="lg"
              aria-disabled={!canContinue}
              onClick={next}
              variant={canContinue ? "default" : "secondary"}
            >
              {step === "summary" ? "Confirm & Pay" : "Continue"}
            </Button>
          </div>
        ) : null}
      </section>
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
