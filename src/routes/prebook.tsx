import { createFileRoute } from "@tanstack/react-router";

import { RideFlow } from "@/components/booking/ride-flow";
import { AppShell } from "@/components/layout/app-shell";
import { usePassengerNav } from "@/components/layout/passenger-nav";

export const Route = createFileRoute("/prebook")({
  head: () => ({
    meta: [
      { title: "Pre-Book a Shared Ride — Tu Tu Ngar" },
      { name: "description", content: "Reserve your seat at least 2 hours ahead at a fixed zone fare." },
      { property: "og:title", content: "Pre-Book a Shared Ride — Tu Tu Ngar" },
      { property: "og:description", content: "Reserve your seat at least 2 hours ahead at a fixed zone fare." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrebookPage,
});

function PrebookPage() {
  const navItems = usePassengerNav("home");
  return (
    <AppShell portal="passenger" navItems={navItems}>
      <RideFlow mode="prebook" />
    </AppShell>
  );
}
