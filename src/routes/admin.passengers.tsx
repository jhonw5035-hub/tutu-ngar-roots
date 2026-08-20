import { createFileRoute } from "@tanstack/react-router";
import { AdminPlaceholder } from "@/components/admin/admin-shell";

export const Route = createFileRoute("/admin/passengers")({
  head: () => ({
    meta: [
      { title: "Passengers — Tu Tu Ngar Admin" },
      { name: "description", content: "Rider accounts, booking history and support tools for the Tu Tu Ngar network." },
      { property: "og:title", content: "Passengers — Tu Tu Ngar Admin" },
      { property: "og:description", content: "Rider accounts, bookings and support." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AdminPlaceholder title="Passengers" blurb="Rider accounts, booking history and support." />
  ),
});
