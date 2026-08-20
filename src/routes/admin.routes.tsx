import { createFileRoute } from "@tanstack/react-router";
import { AdminPlaceholder } from "@/components/admin/admin-shell";

export const Route = createFileRoute("/admin/routes")({
  head: () => ({
    meta: [
      { title: "Routes — Tu Tu Ngar Admin" },
      { name: "description", content: "Corridor definitions, stops and departure scheduling for Yangon shared rides." },
      { property: "og:title", content: "Routes — Tu Tu Ngar Admin" },
      { property: "og:description", content: "Corridors, stops and departure scheduling." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AdminPlaceholder title="Routes" blurb="Corridor definitions, stops and departure scheduling." />
  ),
});
