import { createFileRoute } from "@tanstack/react-router";
import { Car, Clock, MapPin, Users } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/driver")({
  head: () => ({
    meta: [
      { title: "Driver home — Tu Tu Ngar" },
      {
        name: "description",
        content:
          "Tu Tu Ngar driver home: see today's assigned corridor, departure time and booked passengers.",
      },
      { property: "og:title", content: "Driver home — Tu Tu Ngar" },
      {
        property: "og:description",
        content: "Today's route, departure time and booked seats for Tu Tu Ngar drivers.",
      },
    ],
  }),
  component: DriverHome,
});

function DriverHome() {
  const { profile } = useSession();

  return (
    <AppShell portal="driver">
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Good day{profile?.firstName ? `, ${profile.firstName}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground">
            Here is your next assigned trip.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <Badge variant="outline">Next trip</Badge>
            <Badge variant="secondary">
              {profile?.plateNumber ?? "YGN 1A-2345"}
            </Badge>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <p className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              Pyay Road corridor — Hledan to Downtown
            </p>
            <p className="flex items-center gap-2">
              <Clock className="size-4 text-primary" />
              Departs 15:30
            </p>
            <p className="flex items-center gap-2">
              <Users className="size-4 text-primary" />
              4 of {profile?.seatCapacity ?? 6} seats booked
            </p>
          </div>
          <Button size="lg" className="mt-5 w-full">
            <Car className="size-4" />
            Start trip
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Placeholder driver home — live trip management arrives in a later step.
        </p>
      </div>
    </AppShell>
  );
}
