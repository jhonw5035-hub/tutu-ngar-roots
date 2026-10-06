import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Building2, CalendarClock, Radar } from "lucide-react";
import mascotAsset from "@/assets/mascot.png.asset.json";

import { AppShell } from "@/components/layout/app-shell";
import { usePassengerNav } from "@/components/layout/passenger-nav";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useBooking } from "@/lib/booking-store";
import { popularPlaces } from "@/lib/fares";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Where Are You Going? — Tu Tu Ngar Shared Rides Yangon" },
      {
        name: "description",
        content:
          "Pick a popular destination or jump into Pre-Booking and Live Mode — Tu Tu Ngar finds people already heading your way across Yangon.",
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

  return (
    <AppShell portal="passenger" navItems={navItems}>
      {/* Mascot hero with the brand slogan, coloured like the wordmark. */}
      <section className="flex flex-col items-center pt-2 text-center">
        <img
          src={mascotAsset.url}
          alt="Tu Tu Ngar mascot — a smiling boy in a Myanmar longyi giving a thumbs up"
          className="h-44 w-auto object-contain sm:h-52"
          draggable={false}
        />
        <p className="mm mt-2 text-xl font-bold tracking-tight sm:text-2xl">
          <span className="text-foreground">အတူစီးရင် </span>
          <span className="text-primary">ပိုသက်သာတယ်</span>
        </p>
      </section>

      <section className="mt-6 space-y-3">
        <div className="space-y-1">
          <h2 className="text-lg">Popular Routes</h2>
          <p className="text-sm text-muted-foreground">
            Tap a destination to see available shared rides.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {popularPlaces.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                booking.set({
                  destinationText: p.name,
                  destinationCoord: { lat: p.lat, lng: p.lng },
                  routeId: null,
                  slotId: null,
                  pickupPointId: null,
                });
                navigate({ to: "/rides" });
              }}
              className="flex cursor-pointer items-center gap-2 rounded-2xl border-2 border-primary/20 bg-card p-3 text-left text-sm font-semibold shadow-card transition-all hover:border-primary/60 active:scale-[0.98]"
            >
              <Building2 className="size-4 shrink-0 text-primary" /> {p.name}
            </button>
          ))}
        </div>
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
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-primary bg-primary/5 p-5 text-left shadow-card transition-all hover:bg-primary/10 active:scale-[0.99]",
          )}
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

    </AppShell>

  );
}
