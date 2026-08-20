import { createFileRoute } from "@tanstack/react-router";
import { CarFront, Flag, Route as RouteIcon, Users } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin home — Tu Tu Ngar" },
      {
        name: "description",
        content:
          "Tu Tu Ngar admin overview: corridors, drivers, passengers and reported issues across Yangon.",
      },
      { property: "og:title", content: "Admin home — Tu Tu Ngar" },
      {
        property: "og:description",
        content: "Overview of corridors, drivers and reports for the Tu Tu Ngar team.",
      },
    ],
  }),
  component: AdminHome,
});

const stats = [
  { label: "Active corridors", value: "6", icon: RouteIcon },
  { label: "Drivers online", value: "18", icon: CarFront },
  { label: "Bookings today", value: "142", icon: Users },
  { label: "Open reports", value: "3", icon: Flag },
];

function AdminHome() {
  return (
    <AppShell portal="admin">
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Operations overview</h1>
          <p className="text-sm text-muted-foreground">
            Yangon network at a glance.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <stat.icon className="size-5 text-primary" />
              <p className="mt-3 text-2xl font-extrabold tracking-tight">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          Placeholder admin home — management tools arrive in a later step.
        </p>
      </div>
    </AppShell>
  );
}
