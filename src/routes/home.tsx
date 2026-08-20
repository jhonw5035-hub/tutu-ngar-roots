import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, CalendarDays, MapPin, Navigation, Search } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { usePassengerNav } from "@/components/layout/passenger-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useBooking, useNearbyAreaLabel } from "@/lib/booking-store";
import { useSession } from "@/lib/session";
import {
  getRoute,
  getRouteSummary,
  popularRouteIds,
  upcomingTrip,
  type TimeBand,
} from "@/lib/mockData";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Passenger Home — Tu Tu Ngar Shared Rides Yangon" },
      {
        name: "description",
        content:
          "Set your pickup, destination, date and time of day, then find a shared seat on Yangon's busiest corridors with Tu Tu Ngar.",
      },
      { property: "og:title", content: "Passenger Home — Tu Tu Ngar" },
      {
        property: "og:description",
        content: "Book a pre-arranged shared seat across Yangon in a few taps.",
      },
    ],
  }),
  component: PassengerHome,
});

const bands: { value: TimeBand; label: string }[] = [
  { value: "any", label: "Any time" },
  { value: "morning", label: "Morning (before 12)" },
  { value: "afternoon", label: "Afternoon (12–5)" },
  { value: "evening", label: "Evening (after 5)" },
];

function PassengerHome() {
  const navItems = usePassengerNav("home");
  const navigate = useNavigate();
  const { profile } = useSession();
  const booking = useBooking();
  const [askLocation, setAskLocation] = useState(false);
  const nearby = useNearbyAreaLabel(askLocation);

  // Ask for location only once the passenger lands here with an empty pickup.
  useEffect(() => {
    if (!booking.pickupText) setAskLocation(true);
  }, [booking.pickupText]);

  useEffect(() => {
    if (nearby && !booking.pickupText) booking.set({ pickupText: nearby });
  }, [nearby, booking]);

  const popular = popularRouteIds
    .map((id) => getRoute(id))
    .filter((r): r is NonNullable<typeof r> => !!r)
    .map(getRouteSummary);

  const firstName = profile?.firstName || profile?.fullName?.split(" ")[0] || "friend";

  return (
    <AppShell
      portal="passenger"
      navItems={navItems}
      headerActions={
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="size-5" />
          <span className="absolute top-2 right-2 size-2 rounded-full bg-primary" />
        </Button>
      }
    >
      <section className="space-y-1">
        <p className="mm text-xl font-bold">မင်္ဂလာပါ {firstName} ရေ့</p>
        <h1 className="text-2xl">Where are you headed today?</h1>
        <p className="text-sm text-muted-foreground">
          Pre-book a shared seat and skip the roadside wait.
        </p>
      </section>

      <Card className="mt-5 shadow-card">
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-1.5">
            <Label htmlFor="pickup">Pickup point</Label>
            <div className="relative">
              <MapPin className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary" />
              <Input
                id="pickup"
                className="pl-9"
                placeholder="e.g. Hledan Junction"
                value={booking.pickupText}
                onChange={(e) => booking.set({ pickupText: e.target.value })}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {nearby
                ? "Prefilled from your location — edit it anytime."
                : "Type your street or landmark."}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="destination">Destination</Label>
            <div className="relative">
              <Navigation className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="destination"
                className="pl-9"
                list="ttn-points"
                placeholder="e.g. Sule Pagoda Road"
                value={booking.destinationText}
                onChange={(e) => booking.set({ destinationText: e.target.value })}
              />
              <PointOptions />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <div className="relative">
                <CalendarDays className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="date"
                  type="date"
                  className="pl-9"
                  value={booking.date}
                  onChange={(e) => booking.set({ date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="band">Time of day</Label>
              <Select
                value={booking.band}
                onValueChange={(v) => booking.set({ band: v as TimeBand })}
              >
                <SelectTrigger id="band" className="w-full">
                  <SelectValue placeholder="Any time" />
                </SelectTrigger>
                <SelectContent>
                  {bands.map((b) => (
                    <SelectItem key={b.value} value={b.value}>
                      {b.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={() => {
              booking.set({ query: booking.destinationText || booking.pickupText });
              navigate({ to: "/discover" });
            }}
          >
            <Search className="size-4" /> Find a Seat
          </Button>
        </CardContent>
      </Card>

      <section className="mt-6 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg">Upcoming trip</h2>
          <Link to="/trips" className="text-sm font-semibold text-primary">
            View All
          </Link>
        </div>
        <Card className="shadow-card">
          <CardContent className="space-y-2 pt-6">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold">{upcomingTrip.routeName}</span>
              <Badge variant="confirmed">{upcomingTrip.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {upcomingTrip.pickup} → {upcomingTrip.destination}
            </p>
            <Link
              to="/trip"
              className="inline-block text-sm font-semibold text-primary"
              onClick={() => booking.set({ routeId: "r-pyay" })}
            >
              Track live
            </Link>
            <p className="text-xs text-muted-foreground">
              {upcomingTrip.date} · <span className="num text-foreground">{upcomingTrip.time}</span>{" "}
              · <span className="num text-foreground">{upcomingTrip.fare.toLocaleString()} Ks</span>
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 space-y-2">
        <h2 className="text-lg">Popular routes</h2>
        <div className="grid grid-cols-2 gap-3">
          {popular.map((s) => (
            <button
              key={s.route.id}
              type="button"
              onClick={() => {
                booking.set({ routeId: s.route.id, query: s.route.roadName });
                navigate({ to: "/discover" });
              }}
              className="cursor-pointer rounded-2xl border border-border bg-card p-3.5 text-left shadow-card transition-all active:scale-[0.97] hover:border-primary/40"
            >
              <p className="text-sm font-semibold">{s.label}</p>
              <p className="text-xs text-muted-foreground">{s.route.roadName}</p>
              <p className="num mt-2 text-sm text-primary">
                From {s.startingPrice.toLocaleString()} Ks
              </p>
            </button>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

/** Lightweight datalist suggestions from the existing mock point names. */
function PointOptions() {
  const [names, setNames] = useState<string[]>([]);
  useEffect(() => {
    void import("@/lib/mockData").then((m) => setNames(m.allPointNames));
  }, []);
  return (
    <datalist id="ttn-points">
      {names.map((n) => (
        <option key={n} value={n} />
      ))}
    </datalist>
  );
}
