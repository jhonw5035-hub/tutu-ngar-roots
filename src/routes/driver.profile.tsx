import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { useDriverNav } from "@/components/layout/driver-nav";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/driver/profile")({
  head: () => ({
    meta: [
      { title: "Driver profile — Tu Tu Ngar" },
      { name: "description", content: "Driver profile and settings for Tu Tu Ngar." },
      { property: "og:title", content: "Driver profile — Tu Tu Ngar" },
      { property: "og:description", content: "Driver profile and settings for Tu Tu Ngar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DriverProfile,
});

function DriverProfile() {
  const navItems = useDriverNav("profile");
  return (
    <AppShell portal="driver" navItems={navItems}>
      <h1 className="text-2xl font-extrabold tracking-tight">Profile</h1>
      <Card className="mt-4 border border-border bg-card">
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          Driver profile and vehicle settings will appear here.
        </CardContent>
      </Card>
    </AppShell>
  );
}
