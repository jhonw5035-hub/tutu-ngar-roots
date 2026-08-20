import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Banknote, Bell, Car, MapPin, Power, Users } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { useDriverNav } from "@/components/layout/driver-nav";
import { NotificationBell } from "@/components/auth/account-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/driver/")({
  head: () => ({
    meta: [
      { title: "Driver home — Tu Tu Ngar" },
      {
        name: "description",
        content:
          "Tu Tu Ngar driver home: go online, view today's earnings, and see your next assigned trip.",
      },
      { property: "og:title", content: "Driver home — Tu Tu Ngar" },
      {
        property: "og:description",
        content: "Go online, check earnings and manage your next trip on Tu Tu Ngar.",
      },
    ],
  }),
  component: DriverHome,
});

function getInitials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatMmk(amount: number) {
  return `${amount.toLocaleString()} MMK`;
}

function DriverHome() {
  const { profile } = useSession();
  const navItems = useDriverNav("home");

  // TODO(supabase): replace these local states with real driver availability and trip status.
  const [isOnline, setIsOnline] = useState(false);
  const [hasAssignedTrip, setHasAssignedTrip] = useState(false);

  const displayName = profile?.firstName || profile?.fullName || "Driver";
  const earnings = 35000;
  const tripsCompleted = 8;
  const seatsServed = 28;

  const status = hasAssignedTrip ? "on-trip" : isOnline ? "online" : "offline";

  const statusMeta = {
    online: {
      dot: "bg-emerald-500",
      ring: "ring-emerald-500/20",
      label: "Online",
      sub: "You're ready for trips",
    },
    "on-trip": {
      dot: "bg-amber-500",
      ring: "ring-amber-500/20",
      label: "On Trip",
      sub: "Currently serving passengers",
    },
    offline: {
      dot: "bg-slate-400",
      ring: "ring-slate-400/20",
      label: "Offline",
      sub: "Not accepting trips",
    },
  } as const;

  const current = statusMeta[status];

  return (
    <AppShell
      portal="driver"
      navItems={navItems}
      headerActions={
        <>
          <NotificationBell />
          <div className="hidden sm:block">
            <Avatar className="size-8">
              {profile?.photoDataUrl ? (
                <AvatarImage src={profile.photoDataUrl} alt={displayName} />
              ) : null}
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
          </div>
        </>
      }
    >
      <div className="space-y-6">
        {/* Status indicator */}
        <div className="flex flex-col items-center text-center transition-all duration-300 ease-out">
          <div
            className={cn(
              "flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-sm ring-1 transition-all duration-300",
              current.ring,
              status === "online" && "scale-105",
            )}
          >
            <span className={cn("size-3 rounded-full", current.dot)} />
            <span className="text-sm font-semibold">{current.label}</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{current.sub}</p>
        </div>

        {/* Earnings card */}
        <Card className="overflow-hidden border border-border bg-card shadow-sm">
          <CardHeader className="pb-2 pt-5">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs font-medium">
                Today
              </Badge>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Banknote className="size-3.5" />
                Earnings
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-5">
            <p className="text-4xl font-extrabold tracking-tight text-foreground">
              {formatMmk(earnings)}
            </p>
            <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
              <span>Trips completed: {tripsCompleted}</span>
              <span className="text-border">|</span>
              <span>Seats served: {seatsServed}</span>
            </div>
          </CardContent>
        </Card>

        {/* Status / trip card */}
        <Card className="border border-border bg-card shadow-sm">
          {hasAssignedTrip ? (
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <Badge className="bg-amber-500 text-white">Active trip</Badge>
                <span className="text-xs text-muted-foreground">Assigned 2 min ago</span>
              </div>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2 font-medium">
                  <MapPin className="size-4 text-primary" />
                  Hledan → Downtown
                </p>
                <p className="flex items-center gap-2">
                  <Car className="size-4 text-primary" />
                  Pickup at 15:30
                </p>
                <p className="flex items-center gap-2">
                  <Users className="size-4 text-primary" />
                  3 passengers · 4-seat sedan
                </p>
              </div>
              <Button className="w-full" variant="secondary">
                View Trip Details
              </Button>
            </CardContent>
          ) : (
            <CardContent className="flex flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <Car className="size-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {isOnline ? "Waiting for a trip..." : "Go online to start receiving trips"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isOnline
                    ? "AI matching will assign you a shared ride soon."
                    : "You are currently not visible to the dispatch system."}
                </p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Main action */}
        <div className="pt-2">
          <Button
            size="lg"
            className={cn(
              "h-16 w-full rounded-2xl text-lg font-bold shadow-lg transition-all duration-300",
              isOnline
                ? "border border-border bg-background text-foreground hover:bg-accent"
                : "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
            onClick={() => setIsOnline((prev) => !prev)}
          >
            <Power
              className={cn("size-5 transition-transform duration-300", isOnline && "rotate-180")}
            />
            {isOnline ? "Go Offline" : "Go Online"}
          </Button>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {isOnline
              ? "Going offline removes you from the next AI assignment batch."
              : "Going online makes you eligible for AI trip assignment."}
          </p>
        </div>

        {/* Demo-only state toggle */}
        <div className="flex items-center justify-between rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3">
          <div className="text-xs">
            <p className="font-medium text-foreground">Demo: simulate assigned trip</p>
            <p className="text-muted-foreground">Toggles the active-trip card preview.</p>
          </div>
          <Switch
            checked={hasAssignedTrip}
            onCheckedChange={setHasAssignedTrip}
            aria-label="Simulate assigned trip"
          />
        </div>
      </div>
    </AppShell>
  );
}
