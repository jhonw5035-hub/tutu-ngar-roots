import { createFileRoute } from "@tanstack/react-router";

import { RideFlow } from "@/components/booking/ride-flow";
import { AppShell } from "@/components/layout/app-shell";
import { usePassengerNav } from "@/components/layout/passenger-nav";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: [
      { title: "Live Mode — Find a Shared Ride Nearby | Tu Tu Ngar" },
      { name: "description", content: "Find a shared ride nearby departing in the next few minutes." },
      { property: "og:title", content: "Live Mode — Tu Tu Ngar" },
      { property: "og:description", content: "Find a shared ride nearby departing in the next few minutes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LivePage,
});

function LivePage() {
  const navItems = usePassengerNav("home");
  return (
    <AppShell portal="passenger" navItems={navItems}>
      <RideFlow mode="live" />
    </AppShell>
  );
}
