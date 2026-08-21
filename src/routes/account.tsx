import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { Headset, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
import { usePassengerNav } from "@/components/layout/passenger-nav";
import { ProfilePhotoField } from "@/components/auth/profile-photo-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { sendSupportMessage, useMySupportMessages } from "@/lib/support";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Account — Tu Tu Ngar" },
      {
        name: "description",
        content: "Manage your Tu Tu Ngar passenger profile, photo and contact our support team.",
      },
      { property: "og:title", content: "Account — Tu Tu Ngar" },
      {
        property: "og:description",
        content: "Your passenger profile, photo and support messages.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const navItems = usePassengerNav("account");
  const { profile, userId, refreshProfile } = useSession();

  return (
    <AppShell portal="passenger" navItems={navItems}>
      <h1 className="text-2xl">Account</h1>

      <Card className="mt-4 shadow-card">
        <CardContent className="space-y-4 pt-6">
          <PhotoEditor
            userId={userId}
            name={profile?.fullName ?? profile?.firstName ?? "You"}
            current={profile?.photoDataUrl}
            onSaved={refreshProfile}
          />
          <div className="space-y-1 text-sm">
            <p className="font-semibold">{profile?.fullName || "Guest passenger"}</p>
            <p className="text-muted-foreground">{profile?.phone || "No phone on file"}</p>
          </div>
        </CardContent>
      </Card>

      <SupportSection userId={userId} name={profile?.fullName ?? profile?.firstName ?? null} />
    </AppShell>
  );
}

function PhotoEditor({
  userId,
  name,
  current,
  onSaved,
}: {
  userId: string | null;
  name: string;
  current?: string | undefined;
  onSaved: () => Promise<void>;
}) {
  const [draft, setDraft] = React.useState<string | undefined>(current);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => setDraft(current), [current]);

  const dirty = draft !== current;

  async function save() {
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ photo_url: draft ?? null })
      .eq("id", userId);
    setSaving(false);
    if (error) {
      toast.error("Could not update your photo");
      return;
    }
    await onSaved();
    toast.success("Profile photo updated");
  }

  return (
    <div className="space-y-3">
      <ProfilePhotoField value={draft} onChange={setDraft} name={name} />
      {dirty ? (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => void save()} disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : null} Save
          </Button>
          <Button size="sm" variant="outline" onClick={() => setDraft(current)} disabled={saving}>
            Cancel
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function SupportSection({ userId, name }: { userId: string | null; name: string | null }) {
  const { messages } = useMySupportMessages(userId);
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState("");
  const [sending, setSending] = React.useState(false);

  async function send() {
    if (!userId || !text.trim()) return;
    setSending(true);
    try {
      await sendSupportMessage({ senderId: userId, senderName: name, message: text });
      setText("");
      toast.success("Your message has been sent to our team");
    } catch {
      toast.error("Could not send your message");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="mt-6 space-y-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-muted"
      >
        <Headset className="size-5 text-primary" />
        <span className="min-w-0">
          <span className="block text-sm font-semibold">Contact Support</span>
          <span className="block text-xs text-muted-foreground">
            Message the Tu Tu Ngar team directly about anything.
          </span>
        </span>
      </button>

      {open ? (
        <Card className="shadow-card">
          <CardContent className="space-y-3 pt-6">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="Tell us what's going on…"
            />
            <Button onClick={() => void send()} disabled={sending || !text.trim()}>
              {sending ? <Loader2 className="size-4 animate-spin" /> : null} Send
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {messages.length ? (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">Your messages</h2>
          {messages.map((m) => (
            <article key={m.id} className="rounded-xl border border-border bg-card p-3">
              <div className="flex items-center gap-2">
                <Badge variant={m.status === "resolved" ? "outline" : "default"}>{m.status}</Badge>
                <span className="ml-auto text-xs text-muted-foreground">
                  {new Date(m.created_at).toLocaleString()}
                </span>
              </div>
              <p className="mt-2 text-sm">{m.message}</p>
              {m.admin_reply ? (
                <p className="mt-2 rounded-lg bg-muted p-2 text-xs">
                  <span className="font-semibold">Tu Tu Ngar team:</span> {m.admin_reply}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
