import * as React from "react";

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type TripMessageRow = Tables<"trip_group_messages">;

/**
 * Temporary per-trip group chat. The thread only exists once a driver has
 * accepted the group (`trip_groups.status = 'accepted'`), and it is scoped to
 * the members of that single trip.
 */
export function useGroupChat(groupId: string | null, enabled = true) {
  const [messages, setMessages] = React.useState<TripMessageRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    if (!groupId || !enabled) {
      setMessages([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("trip_group_messages")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", { ascending: true });
    setMessages(data ?? []);
    setLoading(false);
  }, [groupId, enabled]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  React.useEffect(() => {
    if (!groupId || !enabled) return;
    const channel = supabase
      .channel(`trip-chat-${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "trip_group_messages",
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          const row = payload.new as TripMessageRow;
          setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, row]));
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [groupId, enabled]);

  return { messages, loading, refresh };
}

export async function sendGroupMessage(input: {
  groupId: string;
  senderId: string;
  senderName: string;
  senderRole: "passenger" | "driver";
  message: string;
}) {
  const { error } = await supabase.from("trip_group_messages").insert({
    group_id: input.groupId,
    sender_id: input.senderId,
    sender_name: input.senderName,
    sender_role: input.senderRole,
    message: input.message,
    is_system_message: false,
  });
  if (error) throw new Error(error.message);
}

/** Automatic, non-user message (e.g. the driver-accepted ETA notice). */
export async function postSystemMessage(groupId: string, message: string) {
  const { error } = await supabase.from("trip_group_messages").insert({
    group_id: groupId,
    message,
    is_system_message: true,
    sender_role: "system",
  });
  if (error) throw new Error(error.message);
}
