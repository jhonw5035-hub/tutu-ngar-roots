import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { ArrowRight, Building2, CalendarClock, Flag, MapPin, Radar } from "lucide-react";
import { FareBadge } from "@/components/booking/ride-flow";
import { popularPlaces, quoteFare } from "@/lib/fares";

import { AppShell } from "@/components/layout/app-shell";
import { usePassengerNav } from "@/components/layout/passenger-nav";
import { LocationAutocomplete } from "@/components/booking/location-autocomplete";
import { MapView } from "@/components/map/map-view";
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
import { cn } from "@/lib/utils";
import { useBooking } from "@/lib/booking-store";
import type { Suggestion } from "@/lib/geocode";
import type { MapMarker } from "@/components/map/route-map";
import type { LatLng } from "@/lib/mockData";
import { useRoadPath } from "@/lib/road-path";
import { useT } from "@/lib/i18n";
import { formatTime12, getSlotDetails, routes, timeWindows, trustSignals } from "@/lib/mockData";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Where Are You Going? — Tu Tu Ngar Shared Rides Yangon" },
      {
        name: "description",
        content:
          "Tell us your area, destination and travel window, and Tu Tu Ngar finds people already heading your way across Yangon.",
      },
      { property: "og:title", content: "Where Are You Going? — Tu Tu Ngar" },
      {
        property: "og:description",
        content: "Find shared departures with people going your way in Yangon.",
      },
    ],
  }),
  component: PassengerHome,
});

function PassengerHome() {
  const navItems = usePassengerNav("home");
  const navigate = useNavigate();
  const booking = useBooking();
  const t = useT();
  const [pickupHints, setPickupHints] = useState<Suggestion[]>([]);
  const [destHints, setDestHints] = useState<Suggestion[]>([]);

  const onPickupSuggestions = useCallback((s: Suggestion[]) => setPickupHints(s), []);
  const onDestSuggestions = useCallback((s: Suggestion[]) => setDestHints(s), []);

  const { pickupCoord, destinationCoord } = booking;
  const fareQuote = quoteFare(pickupCoord, destinationCoord);

  /** Live preview pins: chosen points win, otherwise show the suggestion set. */
  const markers = useMemo<MapMarker[]>(() => {
    const list: MapMarker[] = [];
    if (pickupCoord) {
      list.push({
        id: "pickup",
        lat: pickupCoord.lat,
        lng: pickupCoord.lng,
        color: "#F75514",
        size: 26,
        label: "P",
        pulse: true,
        title: booking.pickupText,
      });
    } else {
      pickupHints.forEach((s) =>
        list.push({ id: `ph-${s.id}`, lat: s.lat, lng: s.lng, color: "#94a3b8", title: s.primary }),
      );
    }
    if (destinationCoord) {
      list.push({
        id: "dest",
        lat: destinationCoord.lat,
        lng: destinationCoord.lng,
        color: "#0B2942",
        size: 26,
        label: "D",
        pulse: true,
        title: booking.destinationText,
      });
    } else if (pickupCoord) {
      destHints.forEach((s) =>
        list.push({ id: `dh-${s.id}`, lat: s.lat, lng: s.lng, color: "#94a3b8", title: s.primary }),
      );
    }
    return list;
  }, [
    pickupCoord,
    destinationCoord,
    pickupHints,
    destHints,
    booking.pickupText,
    booking.destinationText,
  ]);

  // Shared road-snapped geometry: never draw a raw 2-point straight line.
  const previewWaypoints = useMemo<LatLng[] | null>(
    () =>
      pickupCoord && destinationCoord
        ? [
            [pickupCoord.lat, pickupCoord.lng],
            [destinationCoord.lat, destinationCoord.lng],
          ]
        : null,
    [pickupCoord, destinationCoord],
  );
  const previewLine = useRoadPath(previewWaypoints);

  return (
    <AppShell portal="passenger" navItems={navItems}>
      <h1 className="text-2xl">{t("whereAreYouGoing")}</h1>

      <Card className="mt-4 shadow-card">
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-1.5">
            <Label htmlFor="pickup">
              <MapPin className="size-4 text-primary" /> {t("pickupPoint")}
            </Label>
            <LocationAutocomplete
              id="pickup"
              placeholder="Search a place — e.g. Hledan Junction"
              value={booking.pickupText}
              onValueChange={(pickupText) => booking.set({ pickupText, pickupCoord: null })}
              onPick={(p) =>
                booking.set({ pickupText: p.label, pickupCoord: { lat: p.lat, lng: p.lng } })
              }
              onSuggestions={onPickupSuggestions}
              showCurrentLocation
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="destination">
              <Flag className="size-4 text-muted-foreground" /> {t("destination")}
            </Label>
            <LocationAutocomplete
              id="destination"
              placeholder="Where to — e.g. Sule Pagoda"
              value={booking.destinationText}
              onValueChange={(destinationText) =>
                booking.set({ destinationText, destinationCoord: null })
              }
              onPick={(p) =>
                booking.set({
                  destinationText: p.label,
                  destinationCoord: { lat: p.lat, lng: p.lng },
                })
              }
              onSuggestions={onDestSuggestions}
            />
          </div>

          {markers.length ? (
            <div className="relative z-0 overflow-hidden rounded-xl border border-border isolate">
              <MapView className="h-48" routes={[]} markers={markers} line={previewLine} />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <section className="mt-6 space-y-3">
        <div className="space-y-1">
          <h2 className="text-lg">Popular Routes</h2>
          <p className="text-sm text-muted-foreground">Tap a destination to see the fixed fare.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {popularPlaces.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() =>
                booking.set({ destinationText: p.name, destinationCoord: { lat: p.lat, lng: p.lng } })
              }
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-2xl border-2 bg-card p-3 text-left text-sm font-semibold shadow-card transition-all active:scale-[0.98]",
                booking.destinationText === p.name
                  ? "border-primary"
                  : "border-primary/20 hover:border-primary/60",
              )}
            >
              <Building2 className="size-4 shrink-0 text-primary" /> {p.name}
            </button>
          ))}
        </div>
        {destinationCoord ? (
          <Card className="shadow-card">
            <CardContent className="space-y-2 pt-6">
              <p className="text-sm">
                <span className="font-semibold">{booking.pickupText || "Your pickup"}</span> →{" "}
                <span className="font-semibold">{booking.destinationText}</span>
              </p>
              {fareQuote ? (
                <FareBadge fare={fareQuote.fare} from={fareQuote.from.name} to={fareQuote.to.name} />
              ) : (
                <p className="text-xs text-muted-foreground">
                  Choose a pickup point above to see your fixed fare.
                </p>
              )}
            </CardContent>
          </Card>
        ) : null}
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => navigate({ to: "/prebook" })}
          className="flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-primary/25 bg-card p-5 text-left shadow-card transition-all hover:border-primary active:scale-[0.99]"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarClock className="size-6" />
          </span>
          <span>
            <span className="block text-lg font-bold">Pre-Booking</span>
            <span className="block text-sm text-muted-foreground">
              Book your seat at least 2 hours in advance
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => navigate({ to: "/live" })}
          className="flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-primary bg-primary/5 p-5 text-left shadow-card transition-all hover:bg-primary/10 active:scale-[0.99]"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Radar className="size-6" />
          </span>
          <span>
            <span className="block text-lg font-bold">Live Mode</span>
            <span className="block text-sm text-muted-foreground">
              Find a shared ride nearby, departing soon · book 5–15 min before
            </span>
          </span>
        </button>
      </section>


      <section className="mt-6 space-y-3">
        <h2 className="text-lg">{t("whenAreYouTravelling")}</h2>
        <div className="flex gap-2">
          {(["today", "tomorrow"] as const).map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={booking.day === d}
              onClick={() => booking.set({ day: d })}
              className={cn(
                "flex-1 cursor-pointer rounded-xl border px-4 py-2.5 text-sm font-semibold capitalize transition-all active:scale-[0.98]",
                booking.day === d
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50",
              )}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="window">Departure window</Label>
          <Select value={booking.windowId} onValueChange={(v) => booking.set({ windowId: v })}>
            <SelectTrigger id="window" className="w-full">
              <SelectValue placeholder="Pick a window" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {/* 48 half-hour windows — scrollable picker, not a wall of buttons. */}
              {timeWindows.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <Button
        className="mt-6 w-full"
        size="lg"
        onClick={() => {
          booking.set({ routeId: null, slotId: null, pickupPointId: null });
          navigate({ to: "/rides" });
        }}
      >
        {t("findSharedRides")} <ArrowRight className="size-4" />
      </Button>

      <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {trustSignals.map((t) => (
          <li key={t.label}>
            <span aria-hidden>{t.icon}</span> {t.label}
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
