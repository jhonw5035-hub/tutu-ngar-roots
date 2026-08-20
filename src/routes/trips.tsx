import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, Droplets, ShieldAlert, Sparkles, UserX, Wind } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
import { usePassengerNav } from "@/components/layout/passenger-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { pastTrips } from "@/lib/mockData";

export const Route = createFileRoute("/trips")({
  head: () => ({
    meta: [
      { title: "My Trips — Tu Tu Ngar" },
      {
        name: "description",
        content:
          "Review your past Tu Tu Ngar shared rides in Yangon and report an issue in a few taps.",
      },
      { property: "og:title", content: "My Trips — Tu Tu Ngar" },
      {
        property: "og:description",
        content: "Past shared rides and quick issue reporting for Yangon commuters.",
      },
    ],
  }),
  component: TripsPage,
});

const categories = [
  { id: "clean", label: "Vehicle cleanliness", icon: Sparkles },
  { id: "odor", label: "Odor", icon: Wind },
  { id: "driver", label: "Driver behavior", icon: UserX },
  { id: "safety", label: "Safety", icon: ShieldAlert },
  { id: "other", label: "Other", icon: AlertTriangle },
];

function TripsPage() {
  const navItems = usePassengerNav();
  const [openTripId, setOpenTripId] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [detail, setDetail] = useState("");
  const [sending, setSending] = useState(false);

  const submit = () => {
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      setOpenTripId(null);
      setCategory(null);
      setDetail("");
      toast.success("Report submitted — our safety team will review it");
    }, 1000);
  };

  return (
    <AppShell portal="passenger" navItems={navItems}>
      <section className="space-y-1">
        <h1 className="text-2xl">My trips</h1>
        <p className="text-sm text-muted-foreground">
          Past shared rides. Something wrong? Report it in a couple of taps.
        </p>
      </section>

      <div className="mt-5 space-y-3">
        {pastTrips.map((trip) => (
          <Card key={trip.id} className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between gap-2 text-base">
                {trip.routeName}
                <Badge variant="muted">Completed</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                {trip.pickup} → {trip.destination}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span>{trip.date}</span>
                <span className="num text-foreground">{trip.time}</span>
                <span className="num text-foreground">
                  {trip.fare.toLocaleString()} Ks
                </span>
                <span>
                  {trip.driverName} · <span className="num">{trip.plate}</span>
                </span>
              </div>

              {openTripId === trip.id ? (
                <div className="space-y-3 rounded-xl border border-border p-3">
                  <p className="text-sm font-semibold">What went wrong?</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c) => {
                      const Icon = c.icon;
                      const selected = category === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setCategory(c.id)}
                          aria-pressed={selected}
                          className={cn(
                            "flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-all active:scale-[0.98]",
                            selected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card hover:border-primary/50",
                          )}
                        >
                          <Icon className="size-3.5" />
                          {c.label}
                        </button>
                      );
                    })}
                  </div>
                  {category ? (
                    <Textarea
                      value={detail}
                      onChange={(e) => setDetail(e.target.value)}
                      placeholder="Add any detail that helps (optional)"
                      rows={3}
                    />
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Pick a category first — details are optional.
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button disabled={!category || sending} onClick={submit}>
                      {sending ? "Sending…" : "Submit report"}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setOpenTripId(null);
                        setCategory(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setOpenTripId(trip.id);
                    setCategory(null);
                    setDetail("");
                  }}
                >
                  <Droplets className="size-4" /> Report an issue
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}