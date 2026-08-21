import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { AlertTriangle } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  replyToSupportMessage,
  resolveSupportMessage,
  useAllSupportMessages,
} from "@/lib/support";
import {
  COMPLAINT_CATEGORIES,
  categoryLabel,
  displayName,
  formatDate,
  type ComplaintRow,
  type ProfileRow,
} from "@/lib/admin-data";

export const Route = createFileRoute("/admin/support")({
  head: () => ({
    meta: [
      { title: "Customer Support — Tu Tu Ngar Admin" },
      {
        name: "description",
        content:
          "Triage passenger complaints about vehicles and drivers across the Tu Tu Ngar Yangon network.",
      },
      { property: "og:title", content: "Customer Support — Tu Tu Ngar Admin" },
      {
        property: "og:description",
        content: "Complaint triage by category and target, with repeat-pattern flags.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SupportPage,
});

type TargetFilter = "all" | "driver" | "vehicle";

function SupportPage() {
  const [rows, setRows] = React.useState<ComplaintRow[]>([]);
  const [people, setPeople] = React.useState<Record<string, ProfileRow>>({});
  const [category, setCategory] = React.useState<string>("all");
  const [target, setTarget] = React.useState<TargetFilter>("all");

  const load = React.useCallback(async () => {
    const { data } = await supabase
      .from("complaints")
      .select("*")
      .order("created_at", { ascending: false });
    const list = data ?? [];
    setRows(list);

    const ids = [
      ...new Set(list.flatMap((c) => [c.passenger_id, c.driver_id]).filter(Boolean) as string[]),
    ];
    if (ids.length) {
      const { data: profiles } = await supabase.from("profiles").select("*").in("id", ids);
      setPeople(Object.fromEntries((profiles ?? []).map((p) => [p.id, p])));
    }
  }, []);

  React.useEffect(() => {
    void load();
    const channel = supabase
      .channel("admin-complaints")
      .on("postgres_changes", { event: "*", schema: "public", table: "complaints" }, () => void load())
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [load]);

  /** Repeat pattern = same person + same category reported 2+ times. */
  const repeatKeys = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of rows) {
      const subject = c.target_type === "vehicle" ? c.driver_id ?? "unknown-vehicle" : c.driver_id ?? "unknown-driver";
      const key = `${subject}:${c.category}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return new Set([...counts.entries()].filter(([, n]) => n >= 2).map(([k]) => k));
  }, [rows]);

  const filtered = rows.filter(
    (c) => (category === "all" || c.category === category) && (target === "all" || c.target_type === target),
  );

  const byCategory = COMPLAINT_CATEGORIES.map((c) => ({
    ...c,
    count: rows.filter((r) => r.category === c.value).length,
  }));

  async function resolve(id: string) {
    await supabase.from("complaints").update({ status: "resolved" }).eq("id", id);
    void load();
  }

  return (
    <AdminShell>
      <h1 className="text-2xl font-extrabold tracking-tight">Customer Support</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Trip complaints about vehicles and drivers, plus general messages passengers send the team
        directly. Repeat reports are flagged so patterns stand out from one-offs.
      </p>

      <Tabs defaultValue="complaints" className="mt-5">
        <TabsList>
          <TabsTrigger value="complaints">Trip complaints ({rows.length})</TabsTrigger>
          <TabsTrigger value="messages">Direct messages</TabsTrigger>
        </TabsList>

        <TabsContent value="complaints">
      <div className="mt-5 flex flex-wrap gap-2">
        <FilterChip active={category === "all"} onClick={() => setCategory("all")}>
          All categories ({rows.length})
        </FilterChip>
        {byCategory.map((c) => (
          <FilterChip key={c.value} active={category === c.value} onClick={() => setCategory(c.value)}>
            {c.label} ({c.count})
          </FilterChip>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {(["all", "driver", "vehicle"] as const).map((t) => (
          <FilterChip key={t} active={target === t} onClick={() => setTarget(t)}>
            {t === "all" ? "Vehicle & driver" : t === "driver" ? "About drivers" : "About vehicles"}
          </FilterChip>
        ))}
      </div>

      <section className="mt-5 space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            No complaints match this filter. Reports passengers file from “My Trips” appear here
            instantly.
          </div>
        ) : null}

        {filtered.map((c) => {
          const subject = c.driver_id ? people[c.driver_id] : null;
          const reporter = people[c.passenger_id];
          const isPattern = repeatKeys.has(`${c.driver_id ?? "unknown"}:${c.category}`);
          return (
            <article key={c.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{categoryLabel(c.category)}</Badge>
                <Badge variant="outline">
                  {c.target_type === "vehicle" ? "🚗 Vehicle" : "🧑‍✈️ Driver"}
                </Badge>
                {isPattern ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-600">
                    <AlertTriangle className="size-3" /> Repeat pattern
                  </span>
                ) : null}
                <span className="ml-auto text-xs text-muted-foreground">
                  {formatDate(c.created_at)}
                </span>
              </div>
              <p className="mt-2 text-sm">{c.details || "No additional details provided."}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Reported by {reporter ? displayName(reporter) : "Passenger"}
                {subject ? ` · about ${displayName(subject)}${subject.plate_number ? ` (${subject.plate_number})` : ""}` : ""}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant={c.status === "resolved" ? "outline" : "default"}>{c.status}</Badge>
                {c.status !== "resolved" ? (
                  <Button size="sm" variant="outline" onClick={() => void resolve(c.id)}>
                    Mark resolved
                  </Button>
                ) : null}
              </div>
            </article>
          );
        })}
      </section>
        </TabsContent>

        <TabsContent value="messages">
          <SupportInbox />
        </TabsContent>
      </Tabs>
    </AdminShell>
  );
}

/** General passenger → admin messages (separate from per-trip complaints). */
function SupportInbox() {
  const { messages } = useAllSupportMessages();
  const [replies, setReplies] = React.useState<Record<string, string>>({});

  if (messages.length === 0) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
        No direct support messages yet. Anything a passenger sends from “Contact Support” lands
        here instantly.
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {messages.map((m) => (
        <article key={m.id} className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={m.status === "resolved" ? "outline" : "default"}>{m.status}</Badge>
            <span className="text-sm font-semibold">{m.sender_name ?? "Passenger"}</span>
            <span className="ml-auto text-xs text-muted-foreground">{formatDate(m.created_at)}</span>
          </div>
          <p className="mt-2 text-sm">{m.message}</p>
          {m.admin_reply ? (
            <p className="mt-2 rounded-lg bg-muted p-2 text-xs">
              <span className="font-semibold">Your reply:</span> {m.admin_reply}
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              <Textarea
                rows={2}
                placeholder="Reply to this passenger…"
                value={replies[m.id] ?? ""}
                onChange={(e) => setReplies((r) => ({ ...r, [m.id]: e.target.value }))}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={!(replies[m.id] ?? "").trim()}
                  onClick={() => void replyToSupportMessage(m.id, replies[m.id] ?? "")}
                >
                  Send reply
                </Button>
                {m.status !== "resolved" ? (
                  <Button size="sm" variant="outline" onClick={() => void resolveSupportMessage(m.id)}>
                    Mark resolved
                  </Button>
                ) : null}
              </div>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}
