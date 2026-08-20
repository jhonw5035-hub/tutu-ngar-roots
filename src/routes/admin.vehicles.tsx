import { createFileRoute } from "@tanstack/react-router";
import { AdminPlaceholder } from "@/components/admin/admin-shell";

export const Route = createFileRoute("/admin/vehicles")({
  head: () => ({
    meta: [
      { title: "Vehicles & Drivers — Tu Tu Ngar Admin" },
      { name: "description", content: "Fleet roster, driver profiles and availability across the Yangon network." },
      { property: "og:title", content: "Vehicles & Drivers — Tu Tu Ngar Admin" },
      { property: "og:description", content: "Fleet roster and driver availability." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AdminPlaceholder title="Vehicles & Drivers" blurb="Fleet roster, driver profiles and availability." />
  ),
});
