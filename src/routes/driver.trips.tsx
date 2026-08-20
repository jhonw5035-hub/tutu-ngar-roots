import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { useDriverNav } from "@/components/layout/driver-nav";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/driver/trips")({
  head: () => ({
    meta: [
      { title: "Driver trips — Tu Tu Ngar" },
      { name: "description", content: "Trip history for Tu Tu Ngar drivers." },
    ],
  }),
  component: DriverTrips,
});

function DriverTrips() {
  const navItems = useDriverNav("trips");
  return (
    <AppShell portal="driver" navItems={navItems}>
      <h1 className="text-2xl font-extrabold tracking-tight">Trips</h1>
      <Card className="mt-4 border border-border bg-card">
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          Your trip history will appear here.
        </CardContent>
      </Card>
    </AppShell>
  );
}
