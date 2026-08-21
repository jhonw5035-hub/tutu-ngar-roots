import * as React from "react";

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type SupportMessageRow = Tables<"support_messages">;

/**
 * General passenger → admin support channel. Separate from the temporary
 * per-trip group chat, which only coordinates one driver + group.
 */
export async function sendSupportMessage(input: {
  senderId: string;
  senderName?: string | null;
  message: string;
}) {
  const { error } = await supabase.from("support_messages").insert({
    sender_id: input.senderId,
    sender_name: input.senderName ?? null,
    message: input.message.trim(),
  });
  if (error) throw new Error(error.message);
}

/** The signed-in passenger's own thread (RLS scopes this to them). */
export function useMySupportMessages(senderId: string | null) {
  const [messages, setMessages] = React.useState<SupportMessageRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    if (!senderId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("support_messages")
      .select("*")
      .eq("sender_id", senderId)
      .order("created_at", { ascending: false });
    setMessages(data ?? []);
    setLoading(false);
  }, [senderId]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  React.useEffect(() => {
    if (!senderId) return;
    const channel = supabase
      .channel(`support-${senderId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "support_messages" },
        () => void refresh(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [senderId, refresh]);

  return { messages, loading, refresh };
}

/** Admin inbox: every general support message. */
export function useAllSupportMessages() {
  const [messages, setMessages] = React.useState<SupportMessageRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    const { data } = await supabase
      .from("support_messages")
      .select("*")
      .order("created_at", { ascending: false });
    setMessages(data ?? []);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  React.useEffect(() => {
    const channel = supabase
      .channel("support-admin")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "support_messages" },
        () => void refresh(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refresh]);

  return { messages, loading, refresh };
}

export async function replyToSupportMessage(id: string, reply: string) {
  const { error } = await supabase
    .from("support_messages")
    .update({ admin_reply: reply.trim(), status: "resolved" })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function resolveSupportMessage(id: string) {
  const { error } = await supabase
    .from("support_messages")
    .update({ status: "resolved" })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
