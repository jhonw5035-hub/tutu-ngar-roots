import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { ChevronDown, Search } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import {
  categoryLabel,
  displayName,
  formatDate,
  useProfilesByRole,
  type BookingRow,
  type ComplaintRow,
} from "@/lib/admin-data";

export const Route = createFileRoute("/admin/passengers")({
  head: () => ({
    meta: [
      { title: "Passengers — Tu Tu Ngar Admin" },
      {
        name: "description",
        content:
          "Rider accounts, booking history and support tools for the Tu Tu Ngar network in Yangon.",
      },
      { property: "og:title", content: "Passengers — Tu Tu Ngar Admin" },
      { property: "og:description", content: "Rider accounts, bookings and support." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PassengersPage,
});

function PassengersPage() {
  const { rows, loading } = useProfilesByRole("passenger");
  const [query, setQuery] = React.useState("");
  const [openId, setOpenId] = React.useState<string | null>(null);

  const filtered = rows.filter((p) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return displayName(p).toLowerCase().includes(q) || (p.phone ?? "").toLowerCase().includes(q);
  });

  return (
    <AdminShell>
      <h1 className="text-2xl font-extrabold tracking-tight">Passengers</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Rider accounts, booking history and support. Every signed-up passenger appears here
        automatically.
      </p>

      <div className="relative mt-5">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or phone"
          className="pl-9"
          aria-label="Search passengers"
        />
      </div>

      <section className="mt-4 space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading passengers…</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            No passenger accounts match this search.
          </div>
        ) : null}

        {filtered.map((p) => (
          <article key={p.id} className="rounded-xl border border-border bg-card p-4">
            <button
              type="button"
              className="flex w-full items-center gap-3 text-left"
              onClick={() => setOpenId(openId === p.id ? null : p.id)}
              aria-expanded={openId === p.id}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {displayName(p).slice(0, 1).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{displayName(p)}</span>
                <span className="block text-xs text-muted-foreground">
                  {p.phone ?? "No phone"} · {p.gender ?? "gender n/a"} · joined{" "}
                  {formatDate(p.created_at)}
                </span>
              </span>
              <ChevronDown
                className={`size-4 shrink-0 text-muted-foreground transition-transform ${
                  openId === p.id ? "rotate-180" : ""
                }`}
              />
            </button>

            {openId === p.id ? <PassengerDetail passengerId={p.id} /> : null}
          </article>
        ))}
      </section>
    </AdminShell>
  );
}

function PassengerDetail({ passengerId }: { passengerId: string }) {
  const [bookings, setBookings] = React.useState<BookingRow[]>([]);
  const [complaints, setComplaints] = React.useState<ComplaintRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    void (async () => {
      const [b, c] = await Promise.all([
        supabase
          .from("bookings")
          .select("*")
          .eq("passenger_id", passengerId)
          .order("created_at", { ascending: false }),
        supabase
          .from("complaints")
          .select("*")
          .eq("passenger_id", passengerId)
          .order("created_at", { ascending: false }),
      ]);
      if (!active) return;
      setBookings(b.data ?? []);
      setComplaints(c.data ?? []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [passengerId]);

  if (loading) return <p className="mt-3 text-sm text-muted-foreground">Loading history…</p>;

  return (
    <div className="mt-4 space-y-4 rounded-lg border border-border bg-background p-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Booking history ({bookings.length})
        </p>
        {bookings.length ? (
          <ul className="mt-2 space-y-2">
            {bookings.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium">
                  {b.pickup_label ?? "Pickup"} → {b.destination_label ?? "Destination"}
                </span>
                <Badge variant="outline">{b.status}</Badge>
                <span className="ml-auto text-xs text-muted-foreground">
                  {formatDate(b.created_at)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">No bookings yet.</p>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Complaints filed ({complaints.length})
        </p>
        {complaints.length ? (
          <ul className="mt-2 space-y-2 text-sm">
            {complaints.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{categoryLabel(c.category)}</Badge>
                <span className="text-muted-foreground">{c.details || "No details"}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {formatDate(c.created_at)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">No complaints filed.</p>
        )}
      </div>
    </div>
  );
}
