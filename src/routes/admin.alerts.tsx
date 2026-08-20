import { createFileRoute } from "@tanstack/react-router";
import { AdminPlaceholder } from "@/components/admin/admin-shell";

export const Route = createFileRoute("/admin/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts — Tu Tu Ngar Admin" },
      { name: "description", content: "Incidents, passenger reports and operational warnings needing attention." },
      { property: "og:title", content: "Alerts — Tu Tu Ngar Admin" },
      { property: "og:description", content: "Incidents, reports and operational warnings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AdminPlaceholder title="Alerts" blurb="Incidents, reports and operational warnings." />
  ),
});
