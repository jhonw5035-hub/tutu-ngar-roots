import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { Car, ShieldCheck, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wordmark } from "@/components/layout/wordmark";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { RolePortalTabs } from "@/components/auth/role-portal-tabs";
import { toast } from "sonner";

import { portalHome, useSession, type Role } from "@/lib/session";
import { provisionDemoAccounts } from "@/lib/demo.functions";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — Tu Tu Ngar Shared Rides" },
      {
        name: "description",
        content:
          "Log in to Tu Tu Ngar with your phone number to book shared rides, drive a route, or manage the Yangon network.",
      },
      { property: "og:title", content: "Log in — Tu Tu Ngar Shared Rides" },
      {
        property: "og:description",
        content: "One login for passengers, drivers and the Tu Tu Ngar team.",
      },
    ],
  }),
  component: LoginPage,
});

const accent: Record<Role, { icon: typeof UserRound; note: string }> = {
  passenger: { icon: UserRound, note: "Book and manage your shared seats." },
  driver: { icon: Car, note: "Pick up your assigned route and passengers." },
  admin: { icon: ShieldCheck, note: "Manage routes, drivers and reports." },
};

function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useSession();
  const [role, setRole] = React.useState<Role>("passenger");
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [provisioning, setProvisioning] = React.useState(false);

  // Demo helper: creates the fixed admin account plus a teammate driver and a
  // bot driver. Idempotent — existing accounts are skipped.
  async function setupDemoAccounts() {
    setProvisioning(true);
    try {
      const result = await provisionDemoAccounts();
      toast.success(
        result.created.length
          ? `Demo accounts ready: ${result.created.join(", ")}`
          : "Demo accounts already exist",
      );
    } catch {
      toast.error("Could not set up the demo accounts");
    }
    setProvisioning(false);
  }

  const Accent = accent[role].icon;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Real Supabase Auth. The role comes from the `user_roles` table, never
      // from the selected tab — the tab only decides where we land.
      const actualRole = await signIn(identifier, password);
      if (actualRole !== role) {
        setError(`This account is registered as a ${actualRole}. Switch to that tab to continue.`);
        setLoading(false);
        return;
      }
      navigate({ to: portalHome[actualRole], replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="safe-top flex items-center justify-between px-4 py-4">
        <Wordmark />
        <ThemeToggle />
      </div>

      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-5 pb-16">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <RolePortalTabs
            value={role}
            onChange={(next) => {
              setError(null);
              setRole(next);
            }}
          />

          <div className="mt-5 flex items-start gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Accent className="size-5" />
            </span>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Welcome back</h1>
              <p className="text-sm text-muted-foreground">{accent[role].note}</p>
            </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={(e) => void handleSubmit(e)}>
            <div className="space-y-1.5">
              <Label htmlFor="identifier">Phone number or email</Label>
              <Input
                id="identifier"
                type="text"
                inputMode="tel"
                autoComplete="username"
                placeholder="09 xxx xxx xxx"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error ? (
              <p role="alert" className="text-sm font-medium text-destructive">
                {error}
              </p>
            ) : null}
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Logging in…" : "Log In"}
            </Button>
          </form>

          <div className="mt-5 text-center text-sm">
            {role === "admin" ? (
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  Admin accounts are provisioned by the team.
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={provisioning}
                  onClick={() => void setupDemoAccounts()}
                >
                  {provisioning ? "Setting up…" : "Set up demo accounts"}
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  to="/signup"
                  search={{ role }}
                  className="font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Sign up
                </Link>
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
