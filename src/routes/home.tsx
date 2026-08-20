import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Bell, Flag, MapPin, UserRound } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { usePassengerNav } from "@/components/layout/passenger-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useBooking, useNearbyAreaLabel } from "@/lib/booking-store";
import { useSession } from "@/lib/session";
import { areas, timeWindows, trustSignals } from "@/lib/mockData";

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
  const { profile } = useSession();
  const [askLocation, setAskLocation] = useState(false);
  const nearby = useNearbyAreaLabel(askLocation);

  useEffect(() => {
    if (!booking.pickupText) setAskLocation(true);
  }, [booking.pickupText]);

  useEffect(() => {
    if (nearby && !booking.pickupText) booking.set({ pickupText: nearby.replace("Near ", "") });
  }, [nearby, booking]);

  const initials = (profile?.firstName || profile?.fullName || "You").slice(0, 2).toUpperCase();

  return (
    <AppShell
      portal="passenger"
      navItems={navItems}
      headerActions={
        <>
          <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
            <Bell className="size-5" />
            <span className="absolute top-2 right-2 size-2 rounded-full bg-primary" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Profile"
            onClick={() => navigate({ to: "/account" })}
          >
            {profile?.photoDataUrl ? (
              <img
                src={profile.photoDataUrl}
                alt="Your profile"
                className="size-7 rounded-full object-cover"
              />
            ) : profile ? (
              <span className="num flex size-7 items-center justify-center rounded-full bg-primary text-[11px] text-primary-foreground">
                {initials}
              </span>
            ) : (
              <UserRound className="size-5" />
            )}
          </Button>
        </>
      }
    >
      <h1 className="text-2xl">Where are you going?</h1>

      <Card className="mt-4 shadow-card">
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-1.5">
            <Label htmlFor="pickup">
              <MapPin className="size-4 text-primary" /> Pickup point
            </Label>
            <Input
              id="pickup"
              list="ttn-areas"
              placeholder="Your area — e.g. Hledan"
              value={booking.pickupText}
              onChange={(e) => booking.set({ pickupText: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="destination">
              <Flag className="size-4 text-muted-foreground" /> Destination
            </Label>
            <Input
              id="destination"
              list="ttn-areas"
              placeholder="Where to — e.g. Downtown Yangon"
              value={booking.destinationText}
              onChange={(e) => booking.set({ destinationText: e.target.value })}
            />
          </div>

          <datalist id="ttn-areas">
            {areas.map((a) => (
              <option key={a} value={a} />
            ))}
          </datalist>
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
            <SelectContent>
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
