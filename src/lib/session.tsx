import * as React from "react";

/**
 * TEMPORARY local-only session store.
 *
 * TODO(supabase): replace this whole module's internals with real Supabase Auth:
 *   - `signIn` -> supabase.auth.signInWithPassword(...)
 *   - `signUp` -> supabase.auth.signUp(...)
 *   - `signOut` -> supabase.auth.signOut()
 *   - role should come from a `user_roles` table (never from client state).
 * The provider API (role, profile, signIn/signUp/signOut) is intentionally
 * shaped so the swap is a drop-in, not a rewrite.
 */

export type Role = "passenger" | "driver" | "admin";

export type SessionProfile = {
  fullName?: string;
  firstName?: string;
  phone?: string;
  gender?: string;
  plateNumber?: string;
  seatCapacity?: number;
};

type SessionValue = {
  role: Role | null;
  profile: SessionProfile | null;
  signIn: (role: Role, profile?: SessionProfile) => void;
  signOut: () => void;
};

const SessionContext = React.createContext<SessionValue | null>(null);

const STORAGE_KEY = "ttn.session";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = React.useState<Role | null>(null);
  const [profile, setProfile] = React.useState<SessionProfile | null>(null);

  // Rehydrate after mount only (avoids SSR hydration mismatch).
  React.useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { role: Role; profile: SessionProfile | null };
        setRole(parsed.role);
        setProfile(parsed.profile ?? null);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const signIn = React.useCallback((nextRole: Role, nextProfile?: SessionProfile) => {
    setRole(nextRole);
    setProfile(nextProfile ?? null);
    try {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ role: nextRole, profile: nextProfile ?? null }),
      );
    } catch {
      /* ignore */
    }
  }, []);

  const signOut = React.useCallback(() => {
    setRole(null);
    setProfile(null);
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = React.useMemo(
    () => ({ role, profile, signIn, signOut }),
    [role, profile, signIn, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const ctx = React.useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within <SessionProvider>");
  return ctx;
}

export const portalHome: Record<Role, string> = {
  passenger: "/book",
  driver: "/driver",
  admin: "/admin",
};
