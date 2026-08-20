import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/app-shell";
import { usePassengerNav } from "@/components/layout/passenger-nav";
import { BookingFlow } from "@/components/booking/booking-flow";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book a Shared Ride in Yangon — Tu Tu Ngar" },
      {
        name: "description",
        content:
          "Pick a Yangon corridor on the map, choose your pickup, destination and departure slot, and pre-book a shared seat in minutes.",
      },
      { property: "og:title", content: "Book a Shared Ride in Yangon — Tu Tu Ngar" },
      {
        property: "og:description",
        content:
          "Map-first pre-booking for shared rides along Pyay Road, Inya Road and more.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const navItems = usePassengerNav();

  return (
    <AppShell portal="passenger" navItems={navItems} fullBleed>
      <BookingFlow />
    </AppShell>
  );
}
