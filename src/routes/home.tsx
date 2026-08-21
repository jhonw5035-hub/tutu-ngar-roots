import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { ArrowRight, Flag, MapPin } from "lucide-react";

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
import { timeWindows, trustSignals } from "@/lib/mockData";

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
  const [pickupHints, setPickupHints] = useState<Suggestion[]>([]);
  const [destHints, setDestHints] = useState<Suggestion[]>([]);

  const onPickupSuggestions = useCallback((s: Suggestion[]) => setPickupHints(s), []);
  const onDestSuggestions = useCallback((s: Suggestion[]) => setDestHints(s), []);

  const { pickupCoord, destinationCoord } = booking;

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
  }, [pickupCoord, destinationCoord, pickupHints, destHints, booking.pickupText, booking.destinationText]);

  const previewLine = useMemo<LatLng[] | undefined>(
    () =>
      pickupCoord && destinationCoord
        ? [
            [pickupCoord.lat, pickupCoord.lng],
            [destinationCoord.lat, destinationCoord.lng],
          ]
        : undefined,
    [pickupCoord, destinationCoord],
  );

  return (
    <AppShell portal="passenger" navItems={navItems}>
      <h1 className="text-2xl">Where are you going?</h1>

      <Card className="mt-4 shadow-card">
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-1.5">
            <Label htmlFor="pickup">
              <MapPin className="size-4 text-primary" /> Pickup point
            </Label>
            <LocationAutocomplete
              id="pickup"
              placeholder="Search a place — e.g. Hledan Junction"
              value={booking.pickupText}
              onValueChange={(pickupText) => booking.set({ pickupText, pickupCoord: null })}
              onPick={(p) => booking.set({ pickupText: p.label, pickupCoord: { lat: p.lat, lng: p.lng } })}
              onSuggestions={onPickupSuggestions}
              showCurrentLocation
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="destination">
              <Flag className="size-4 text-muted-foreground" /> Destination
            </Label>
            <LocationAutocomplete
              id="destination"
              placeholder="Where to — e.g. Sule Pagoda"
              value={booking.destinationText}
              onValueChange={(destinationText) =>
                booking.set({ destinationText, destinationCoord: null })
              }
              onPick={(p) =>
                booking.set({ destinationText: p.label, destinationCoord: { lat: p.lat, lng: p.lng } })
              }
              onSuggestions={onDestSuggestions}
            />
          </div>

          {markers.length ? (
            <div className="overflow-hidden rounded-xl border border-border">
              <MapView className="h-48" routes={[]} markers={markers} line={previewLine} />
            </div>
          ) : null}
        </CardContent>
      </Card>


      <section className="mt-6 space-y-3">
        <h2 className="text-lg">When are you travelling?</h2>
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
        Find Shared Rides <ArrowRight className="size-4" />
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
