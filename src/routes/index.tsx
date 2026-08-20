import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarClock, Home, Ticket, User } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tu Tu Ngar — Design System" },
      {
        name: "description",
        content:
          "Design foundation for Tu Tu Ngar, the pre-booked shared transport platform for Yangon.",
      },
      { property: "og:title", content: "Tu Tu Ngar — Design System" },
      {
        property: "og:description",
        content: "Tokens, theming and component primitives for Tu Tu Ngar.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [tab, setTab] = useState("Home");
  const [seat, setSeat] = useState("B2");

  const navItems = [
    { label: "Home", icon: Home },
    { label: "Trips", icon: CalendarClock },
    { label: "Tickets", icon: Ticket },
    { label: "Profile", icon: User },
  ].map((i) => ({ ...i, active: tab === i.label, onSelect: () => setTab(i.label) }));

  return (
    <AppShell portal="passenger" navItems={navItems}>
      <section className="space-y-1">
        <h1 className="text-2xl">Design foundation</h1>
        <p className="text-sm text-muted-foreground">
          Tokens, theming and component primitives —{" "}
          <span className="mm">တူတူငှား</span> shell demo.
        </p>
      </section>

      <Card className="mt-6 shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            Hledan → Thanlyin
            <Badge variant="confirmed">Confirmed</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Departs</p>
              <p className="num text-xl">07:45</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Seats left</p>
              <p className="num text-xl">3</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Fare</p>
              <p className="num text-xl">2,500 Ks</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {["A1", "A2", "B1", "B2"].map((s) => (
              <Button
                key={s}
                size="sm"
                variant={seat === s ? "default" : "outline"}
                onClick={() => setSeat(s)}
              >
                {s}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4 shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Primitives</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pickup">Pickup point</Label>
            <Input id="pickup" placeholder="e.g. Hledan Junction" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="confirmed">Confirmed</Badge>
            <Badge variant="progress">In progress</Badge>
            <Badge variant="muted">Completed</Badge>
            <Badge variant="outline">Draft</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button>Book seat</Button>
            <Button variant="secondary">Save for later</Button>
            <Button variant="ghost">Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
