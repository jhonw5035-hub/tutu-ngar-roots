import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Building2, CalendarClock, Radar } from "lucide-react";
import mascotAsset from "@/assets/mascot.png.asset.json";

import { AppShell } from "@/components/layout/app-shell";
import { usePassengerNav } from "@/components/layout/passenger-nav";
import { MascotGreeting } from "@/components/home/mascot-greeting";
import { useBooking } from "@/lib/booking-store";
import { popularPlaces } from "@/lib/fares";
import { useLanguage, useT } from "@/lib/i18n";


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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PassengerHome,
});

function PassengerHome() {
  const navItems = usePassengerNav("home");
  const navigate = useNavigate();
  const booking = useBooking();
  const t = useT();
  const { lang } = useLanguage();

  return (
    <AppShell portal="passenger" navItems={navItems}>
      {/* Greeting pair: large animated mascot beside the welcome heading. */}
      <section className="flex items-center gap-3 pt-2 sm:gap-6">
        <MascotGreeting className="h-52 w-36 shrink-0 sm:h-60 sm:w-40" />
        <h1 className="min-w-0 text-3xl font-bold leading-tight tracking-tight text-primary sm:text-5xl">
          {t("welcomeToApp")}
        </h1>
      </section>

      <section className="mt-6 space-y-3">
        <div className="space-y-1">
          <h2 className="text-lg">{t("popularRoutes")}</h2>
          <p className="text-sm text-muted-foreground">{t("tapDestinationHint")}</p>
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
              className="flex min-w-0 cursor-pointer items-center gap-2 rounded-2xl border-2 border-primary/20 bg-card p-3 text-left text-sm font-semibold shadow-card transition-colors hover:border-primary/60 motion-safe:active:scale-[0.98]"
            >
              <Building2 className="size-4 shrink-0 text-primary" /> <span className="min-w-0 break-words">{lang === "my" ? p.nameMy : p.name}</span>
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
          <span className="min-w-0">
            <span className="block text-lg font-bold">{t("preBooking")}</span>
            <span className="block text-sm text-muted-foreground">{t("preBookingDesc")}</span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => navigate({ to: "/live" })}
          className="flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-primary/25 bg-card p-5 text-left shadow-card transition-all hover:border-primary active:scale-[0.99]"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Radar className="size-6" />
          </span>
          <span className="min-w-0">
            <span className="block text-lg font-bold">{t("liveMode")}</span>
            <span className="block text-sm text-muted-foreground">{t("liveModeDesc")}</span>
          </span>
        </button>
      </section>

    </AppShell>

  );
}
