import * as React from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

/**
 * Real Supabase Auth session store. The shape (role, profile, signIn, signUp,
 * signOut) matches the earlier local-only scaffolding so existing screens keep
 * working — only the internals now talk to Supabase.
 */

export type Role = "passenger" | "driver" | "admin";
export type Gender = "male" | "female" | "other";

export type SessionProfile = {
  fullName?: string;
  firstName?: string;
  phone?: string;
  gender?: string;
  /**
   * Driver-facing identification photo only.
   * NEVER render this in the passenger group preview — that screen stays
   * first name + gender icon by design.
   */
  photoDataUrl?: string;
  plateNumber?: string;
  seatCapacity?: number;
};

export type SignUpInput = {
  role: Exclude<Role, "admin">;
  fullName: string;
  firstName: string;
  phone: string;
  email: string;
  password: string;
  gender?: string;
  plateNumber?: string;
  seatCapacity?: number;
};

type SessionValue = {
  user: User | null;
  userId: string | null;
  role: Role | null;
  profile: SessionProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<Role>;
  signUp: (input: SignUpInput) => Promise<Role>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const SessionContext = React.createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [role, setRole] = React.useState<Role | null>(null);
  const [profile, setProfile] = React.useState<SessionProfile | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async (nextUser: User | null) => {
    setUser(nextUser);
    if (!nextUser) {
      setRole(null);
      setProfile(null);
      setLoading(false);
      return;
    }
    const [{ data: roleRows }, { data: profileRow }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", nextUser.id),
      supabase.from("profiles").select("*").eq("id", nextUser.id).maybeSingle(),
    ]);
    const roles = (roleRows ?? []).map((r) => r.role as Role);
    setRole(
      roles.includes("admin")
        ? "admin"
        : roles.includes("driver")
          ? "driver"
          : roles.includes("passenger")
            ? "passenger"
            : null,
    );
    setProfile(
      profileRow
        ? {
            ...(profileRow.full_name ? { fullName: profileRow.full_name } : {}),
            ...(profileRow.first_name ? { firstName: profileRow.first_name } : {}),
            ...(profileRow.phone ? { phone: profileRow.phone } : {}),
            ...(profileRow.gender ? { gender: profileRow.gender } : {}),
            ...(profileRow.photo_url ? { photoDataUrl: profileRow.photo_url } : {}),
            ...(profileRow.plate_number ? { plateNumber: profileRow.plate_number } : {}),
            ...(profileRow.seat_capacity ? { seatCapacity: profileRow.seat_capacity } : {}),
          }
        : {},
    );
    setLoading(false);
  }, []);

  React.useEffect(() => {
    let active = true;
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session: Session | null) => {
      if (!active) return;
      // Never await inside the auth callback — defer the profile fetch.
      setTimeout(() => void load(session?.user ?? null), 0);
    });
    void supabase.auth.getSession().then(({ data }) => {
      if (active) void load(data.session?.user ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [load]);

  const signIn = React.useCallback<SessionValue["signIn"]>(
    async (emailInput, password) => {
      // Supabase Auth signs in by email only — phone numbers are contact data.
      const email = emailInput.trim().toLowerCase();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) throw new Error(error?.message ?? "Could not sign in");
      const { data: roleRows } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);
      const roles = (roleRows ?? []).map((r) => r.role as Role);
      const resolved: Role = roles.includes("admin")
        ? "admin"
        : roles.includes("driver")
          ? "driver"
          : "passenger";
      await load(data.user);
      return resolved;
    },
    [load],
  );

  const signUp = React.useCallback<SessionValue["signUp"]>(
    async (input) => {
      const email = input.email.trim().toLowerCase();
      if (!email) throw new Error("An email address is required to create an account");
      const { data, error } = await supabase.auth.signUp({
        email,
        password: input.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            role: input.role,
            full_name: input.fullName,
            first_name: input.firstName,
            phone: input.phone,
            gender: ["male", "female", "other"].includes(input.gender ?? "") ? input.gender : null,
            plate_number: input.plateNumber ?? null,
            seat_capacity: input.seatCapacity ?? null,
          },
        },
      });
      if (error || !data.user) throw new Error(error?.message ?? "Could not create the account");
      if (!data.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: input.password,
        });
        if (signInError) throw new Error(signInError.message);
      }
      await load(data.user);
      return input.role;
    },
    [load],
  );

  const signOut = React.useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setProfile(null);
  }, []);

  const refreshProfile = React.useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    await load(data.user ?? null);
  }, [load]);

  const value = React.useMemo(
    () => ({
      user,
      userId: user?.id ?? null,
      role,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }),
    [user, role, profile, loading, signIn, signUp, signOut, refreshProfile],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const ctx = React.useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within <SessionProvider>");
  return ctx;
}

export const portalHome: Record<Role, string> = {
  passenger: "/home",
  driver: "/driver",
  admin: "/admin",
};
