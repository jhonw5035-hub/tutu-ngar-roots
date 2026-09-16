import { createClient, type Session, type User } from "@supabase/supabase-js";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

type AppRole = "passenger" | "driver" | "admin";

type ProfileDto = {
  fullName?: string;
  firstName?: string;
  phone?: string;
  gender?: string;
  photoDataUrl?: string;
  plateNumber?: string;
  seatCapacity?: number;
};

type AuthSuccess = {
  ok: true;
  session: Session;
  user: User;
  role: AppRole;
  profile: ProfileDto;
};

type AuthFailure = {
  ok: false;
  code: "invalid_credentials" | "email_unconfirmed" | "duplicate_email" | "weak_password" | "unavailable" | "unknown";
};

function createAuthClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Supabase authentication is not configured");

  return createClient<Database>(url, key, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

function resolveRole(rows: Array<{ role: string }> | null): AppRole {
  const roles = (rows ?? []).map((row) => row.role);
  if (roles.includes("admin")) return "admin";
  if (roles.includes("driver")) return "driver";
  return "passenger";
}

function mapProfile(row: Database["public"]["Tables"]["profiles"]["Row"] | null): ProfileDto {
  if (!row) return {};
  return {
    ...(row.full_name ? { fullName: row.full_name } : {}),
    ...(row.first_name ? { firstName: row.first_name } : {}),
    ...(row.phone ? { phone: row.phone } : {}),
    ...(row.gender ? { gender: row.gender } : {}),
    ...(row.photo_url ? { photoDataUrl: row.photo_url } : {}),
    ...(row.plate_number ? { plateNumber: row.plate_number } : {}),
    ...(row.seat_capacity ? { seatCapacity: row.seat_capacity } : {}),
  };
}

async function loadIdentity(
  client: ReturnType<typeof createAuthClient>,
  user: User,
): Promise<Pick<AuthSuccess, "role" | "profile">> {
  const [{ data: roleRows }, { data: profileRow }] = await Promise.all([
    client.from("user_roles").select("role").eq("user_id", user.id),
    client.from("profiles").select("*").eq("id", user.id).maybeSingle(),
  ]);
  return { role: resolveRole(roleRows), profile: mapProfile(profileRow) };
}

export const loginWithEmail = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ email: z.string().trim().email(), password: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data }): Promise<AuthSuccess | AuthFailure> => {
    try {
      const client = createAuthClient();
      const { data: authData, error } = await client.auth.signInWithPassword({
        email: data.email.toLowerCase(),
        password: data.password,
      });
      if (error || !authData.session || !authData.user) {
        const message = error?.message ?? "";
        if (/invalid login credentials/i.test(message)) return { ok: false, code: "invalid_credentials" };
        if (/email not confirmed/i.test(message)) return { ok: false, code: "email_unconfirmed" };
        return { ok: false, code: "unknown" };
      }
      const identity = await loadIdentity(client, authData.user);
      return { ok: true, session: authData.session, user: authData.user, ...identity };
    } catch (error) {
      console.error("Server-side login failed", error);
      return { ok: false, code: "unavailable" };
    }
  });

const signupSchema = z.object({
  role: z.enum(["passenger", "driver"]),
  fullName: z.string().trim().min(1),
  firstName: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  email: z.string().trim().email(),
  password: z.string().min(6),
  gender: z.string().optional(),
  plateNumber: z.string().optional(),
  seatCapacity: z.number().int().positive().optional(),
});

export const signupWithEmail = createServerFn({ method: "POST" })
  .inputValidator((input) => signupSchema.parse(input))
  .handler(async ({ data }): Promise<AuthSuccess | AuthFailure> => {
    try {
      const client = createAuthClient();
      const { data: authData, error } = await client.auth.signUp({
        email: data.email.toLowerCase(),
        password: data.password,
        options: {
          data: {
            role: data.role,
            full_name: data.fullName,
            first_name: data.firstName,
            phone: data.phone,
            gender: ["male", "female", "other"].includes(data.gender ?? "") ? data.gender : null,
            plate_number: data.plateNumber ?? null,
            seat_capacity: data.seatCapacity ?? null,
          },
        },
      });
      if (error) {
        if (/already registered|already been registered|user_already_exists/i.test(error.message)) {
          return { ok: false, code: "duplicate_email" };
        }
        if (/password/i.test(error.message) && /at least|short|weak/i.test(error.message)) {
          return { ok: false, code: "weak_password" };
        }
        return { ok: false, code: "unknown" };
      }
      if (!authData.session || !authData.user) return { ok: false, code: "email_unconfirmed" };
      const identity = await loadIdentity(client, authData.user);
      return { ok: true, session: authData.session, user: authData.user, ...identity };
    } catch (error) {
      console.error("Server-side signup failed", error);
      return { ok: false, code: "unavailable" };
    }
  });

export const getMyIdentity = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [{ data: roleRows }, { data: profileRow }] = await Promise.all([
      context.supabase.from("user_roles").select("role").eq("user_id", context.userId),
      context.supabase.from("profiles").select("*").eq("id", context.userId).maybeSingle(),
    ]);
    return { role: resolveRole(roleRows), profile: mapProfile(profileRow) };
  });