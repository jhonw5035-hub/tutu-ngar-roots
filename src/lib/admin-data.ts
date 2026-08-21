import * as React from "react";

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type ProfileRow = Tables<"profiles">;
export type ComplaintRow = Tables<"complaints">;
export type BookingRow = Tables<"bookings">;
export type DriverStatusRow = Tables<"driver_status">;
export type TripGroupRow = Tables<"trip_groups">;

/** All user ids that hold a given role (roles live in user_roles, never on profiles). */
export async function idsWithRole(role: "passenger" | "driver" | "admin") {
  const { data } = await supabase.from("user_roles").select("user_id").eq("role", role);
  return (data ?? []).map((r) => r.user_id);
}

/** Profiles for every account holding the given role — 100% live data. */
export function useProfilesByRole(role: "passenger" | "driver" | "admin") {
  const [rows, setRows] = React.useState<ProfileRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    const ids = await idsWithRole(role);
    if (!ids.length) {
      setRows([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .in("id", ids)
      .order("created_at", { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  }, [role]);

  React.useEffect(() => {
    void load();
    const channel = supabase
      .channel(`admin-profiles-${role}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => void load())
      .on("postgres_changes", { event: "*", schema: "public", table: "user_roles" }, () => void load())
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [load, role]);

  return { rows, loading, reload: load };
}

export const displayName = (p: Pick<ProfileRow, "full_name" | "first_name">) =>
  p.full_name || p.first_name || "Unnamed account";

export const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—";

export const COMPLAINT_CATEGORIES = [
  { value: "cleanliness", label: "Vehicle cleanliness" },
  { value: "odor", label: "Odor" },
  { value: "driver_behavior", label: "Driver behaviour" },
  { value: "safety", label: "Safety" },
  { value: "other", label: "Other" },
] as const;

export const categoryLabel = (value: string) =>
  COMPLAINT_CATEGORIES.find((c) => c.value === value)?.label ?? "Other";
