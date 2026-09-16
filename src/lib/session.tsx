import * as React from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useServerFn } from "@tanstack/react-start";

import { supabase } from "@/integrations/supabase/client";
import { getMyIdentity, loginWithEmail, signupWithEmail } from "@/lib/auth.functions";

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

/**
 * `supabase.auth.setSession()` makes a direct browser → Supabase call to
 * /auth/v1/user. On networks where that host is blocked or flaky the login
 * would fail even though the server already authenticated the user. When that
 * happens we persist the verified session straight into the client's auth
 * storage, which needs no network at all.
 */
async function persistSession(session: Session, user: User) {
  const { error } = await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });
  if (!error) return;
  console.warn("setSession failed, persisting session locally instead", error);

  const url = (import.meta.env["VITE_SUPABASE_URL"] as string | undefined) ?? "";
  const ref = url.replace(/^https?:\/\//, "").split(".")[0];
  if (!ref) throw new Error("Could not save your login. Please try again.");

  const expiresAt =
    session.expires_at ?? Math.floor(Date.now() / 1000) + (session.expires_in ?? 3600);
  const payload = JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    token_type: "bearer",
    expires_in: Math.max(60, expiresAt - Math.floor(Date.now() / 1000)),
    expires_at: expiresAt,
    user,
  });

  try {
    const storage = (supabase.auth as unknown as { storage?: Storage }).storage ?? window.localStorage;
    await storage.setItem(`sb-${ref}-auth-token`, payload);
    await supabase.auth.getSession();
  } catch (storageError) {
    console.error("Could not persist session locally", storageError);
    throw new Error("Could not save your login. Please try again.");
  }
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [role, setRole] = React.useState<Role | null>(null);
  const [profile, setProfile] = React.useState<SessionProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const loginFn = useServerFn(loginWithEmail);
  const signupFn = useServerFn(signupWithEmail);
  const identityFn = useServerFn(getMyIdentity);

  const load = React.useCallback(async (nextUser: User | null) => {
    setUser(nextUser);
    if (!nextUser) {
      setRole(null);
      setProfile(null);
      setLoading(false);
      return;
    }
    try {
      const identity = await identityFn();
      setRole(identity.role);
      setProfile(identity.profile);
    } catch (error) {
      console.error(error);
      setRole("passenger");
      setProfile({});
    }
    setLoading(false);
  }, [identityFn]);

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
      const result = await loginFn({ data: { email, password } });
      if (!result.ok) {
        const messages = {
          invalid_credentials: "Invalid email or password",
          email_unconfirmed: "Please confirm your email address first, then log in.",
          duplicate_email: "That email already has an account — log in instead.",
          weak_password: "Password must be at least 6 characters.",
          unavailable: "Login service is temporarily unavailable. Please try again shortly.",
          unknown: "Could not log in. Please try again.",
        } as const;
        throw new Error(messages[result.code]);
      }
      await persistSession(result.session, result.user);
      setUser(result.user);
      setRole(result.role);
      setProfile(result.profile);
      setLoading(false);
      return result.role;
    },
    [loginFn],
  );

  const signUp = React.useCallback<SessionValue["signUp"]>(
    async (input) => {
      const email = input.email.trim().toLowerCase();
      if (!email) throw new Error("An email address is required to create an account");
      const result = await signupFn({ data: { ...input, email } });
      if (!result.ok) {
        const messages = {
          invalid_credentials: "Could not create the account.",
          email_unconfirmed: "Check your email to confirm your account, then log in.",
          duplicate_email: "That email already has an account — log in instead.",
          weak_password: "Password must be at least 6 characters.",
          unavailable: "Signup service is temporarily unavailable. Please try again shortly.",
          unknown: "Could not create the account. Please try again.",
        } as const;
        throw new Error(messages[result.code]);
      }
      await persistSession(result.session, result.user);
      setUser(result.user);
      setRole(result.role);
      setProfile(result.profile);
      setLoading(false);
      return result.role;
    },
    [signupFn],
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
