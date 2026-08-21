import * as React from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { sendGroupMessage, useGroupChat } from "@/lib/chat";

export type TripChatProps = {
  groupId: string;
  senderId: string;
  senderName: string;
  senderRole: "passenger" | "driver";
  className?: string;
};

/**
 * Lightweight coordination chat for one trip only ("I'm 2 minutes late",
 * "I'm wearing a blue shirt"). Not a messaging product — it disappears with
 * the trip.
 */
export function TripChat({ groupId, senderId, senderName, senderRole, className }: TripChatProps) {
  const { messages, loading } = useGroupChat(groupId);
  const [text, setText] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const message = text.trim();
    if (!message || sending) return;
    setSending(true);
    try {
      await sendGroupMessage({ groupId, senderId, senderName, senderRole, message });
      setText("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Message failed to send");
    }
    setSending(false);
  }

  return (
    <Card className={cn("shadow-card", className)}>
      <CardContent className="space-y-3 pt-6">
        <div>
          <h2 className="text-lg">Trip chat</h2>
          <p className="text-xs text-muted-foreground">
            This chat is only available for this trip.
          </p>
        </div>

        <div
          ref={listRef}
          className="max-h-64 space-y-3 overflow-y-auto rounded-xl bg-muted/40 p-3"
        >
          {loading ? (
            <p className="text-center text-xs text-muted-foreground">Loading messages…</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground">
              No messages yet — say hello to your group.
            </p>
          ) : (
            messages.map((m) =>
              m.is_system_message ? (
                <p
                  key={m.id}
                  className="mx-auto max-w-[85%] text-center text-xs italic text-muted-foreground"
                >
                  {m.message}
                </p>
              ) : (
                <div
                  key={m.id}
                  className={cn(
                    "flex flex-col gap-1",
                    m.sender_id === senderId ? "items-end" : "items-start",
                  )}
                >
                  <span className="text-[11px] text-muted-foreground">
                    {m.sender_id === senderId ? "You" : (m.sender_name ?? "Rider")}
                    {m.sender_role ? ` · ${m.sender_role}` : ""}
                  </span>
                  <span
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                      m.sender_id === senderId
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-foreground border border-border",
                    )}
                  >
                    {m.message}
                  </span>
                </div>
              ),
            )
          )}
        </div>

        <form className="flex gap-2" onSubmit={(e) => void submit(e)}>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Message your group…"
            aria-label="Message"
          />
          <Button type="submit" size="icon" disabled={sending || !text.trim()}>
            <Send className="size-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
