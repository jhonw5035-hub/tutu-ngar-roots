import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wordmark } from "@/components/layout/wordmark";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LanguageToggle } from "@/components/layout/language-toggle";

import { portalHome, useSession } from "@/lib/session";
import { provisionDemoAccounts } from "@/lib/demo.functions";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — Tu Tu Ngar Shared Rides" },
      {
        name: "description",
        content:
          "Log in to Tu Tu Ngar with your email to book shared rides, drive a route, or manage the Yangon network.",
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

function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useSession();
  const [email, setEmail] = React.useState("");
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

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // The role always comes from the authenticated user's stored role —
      // never from anything the client guessed before signing in.
      const actualRole = await signIn(email.trim(), password);
      navigate({ to: portalHome[actualRole], replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log in. Please try again.");
      setLoading(false);
    }
  }


  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="safe-top flex items-center justify-between px-4 py-4">
        <Wordmark />
        <>
          <LanguageToggle />
          <ThemeToggle />
        </>
      </div>

      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-5 pb-16">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Log in and we&apos;ll take you to the right place.
          </p>

          <form className="mt-6 space-y-4" onSubmit={(e) => void handleSubmit(e)}>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

          <div className="mt-5 space-y-2 text-center text-sm">
            <p className="text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                Sign up
              </Link>
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
        </div>
      </main>
    </div>
  );
}
