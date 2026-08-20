import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { useDriverNav } from "@/components/layout/driver-nav";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/driver/earnings")({
  head: () => ({
    meta: [
      { title: "Driver earnings — Tu Tu Ngar" },
      { name: "description", content: "Earnings breakdown for Tu Tu Ngar drivers." },
    ],
  }),
  component: DriverEarnings,
});

function DriverEarnings() {
  const navItems = useDriverNav("earnings");
  return (
    <AppShell portal="driver" navItems={navItems}>
      <h1 className="text-2xl font-extrabold tracking-tight">Earnings</h1>
      <Card className="mt-4 border border-border bg-card">
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          Your detailed earnings breakdown will appear here.
        </CardContent>
      </Card>
    </AppShell>
  );
}
