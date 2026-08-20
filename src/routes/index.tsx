import { createFileRoute } from "@tanstack/react-router";

import { TaxiDoorScene } from "@/components/intro/taxi-door-scene";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tu Tu Ngar — Shared Rides Across Yangon" },
      {
        name: "description",
        content:
          "Tu Tu Ngar is pre-booked shared transportation in Yangon: scheduled departures, upfront pricing and safer rides together.",
      },
      { property: "og:title", content: "Tu Tu Ngar — Shared Rides Across Yangon" },
      {
        property: "og:description",
        content: "Shared rides across Yangon — booked ahead, priced upfront, safer together.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <TaxiDoorScene />;
}
