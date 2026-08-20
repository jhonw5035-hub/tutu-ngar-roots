import { createFileRoute } from "@tanstack/react-router";
import { AdminPlaceholder } from "@/components/admin/admin-shell";

export const Route = createFileRoute("/admin/forecast")({
  head: () => ({
    meta: [
      { title: "Demand Forecast — Tu Tu Ngar Admin" },
      { name: "description", content: "Predicted passenger demand by corridor and departure window across Yangon." },
      { property: "og:title", content: "Demand Forecast — Tu Tu Ngar Admin" },
      { property: "og:description", content: "Predicted demand by corridor and time window." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AdminPlaceholder title="Demand Forecast" blurb="Predicted demand by corridor and time window." />
  ),
});
