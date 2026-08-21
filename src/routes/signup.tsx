import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wordmark } from "@/components/layout/wordmark";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ProfilePhotoField } from "@/components/auth/profile-photo-field";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { portalHome, useSession, type SessionProfile } from "@/lib/session";

type SignupRole = "passenger" | "driver";

const searchSchema = z.object({
  role: z.enum(["passenger", "driver"]).catch("passenger"),
});

export const Route = createFileRoute("/signup")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Create an account — Tu Tu Ngar" },
      {
        name: "description",
        content:
          "Create a Tu Tu Ngar passenger or driver account to join pre-booked shared rides across Yangon.",
      },
      { property: "og:title", content: "Create an account — Tu Tu Ngar" },
      {
        property: "og:description",
        content: "Sign up as a passenger or driver on Tu Tu Ngar.",
      },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { signUp } = useSession();
  const [error, setError] = React.useState<string | null>(null);

  const [role, setRole] = React.useState<SignupRole>(search.role);
  const [step, setStep] = React.useState<"account" | "vehicle">("account");
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    fullName: "",
    firstName: "",
    phone: "",
    email: "",
    password: "",
    gender: "",
  });
  const [photoDataUrl, setPhotoDataUrl] = React.useState<string | undefined>(undefined);
  const [vehicle, setVehicle] = React.useState({ plateNumber: "", seatCapacity: "4" });

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function complete(profile: SessionProfile) {
    setLoading(true);
    setError(null);
    try {
      await signUp({
        role,
        fullName: profile.fullName ?? "",
        firstName: profile.firstName ?? "",
        phone: profile.phone ?? "",
        password: form.password,
        email: form.email.trim(),
        ...(profile.gender ? { gender: profile.gender } : {}),
        ...(profile.plateNumber ? { plateNumber: profile.plateNumber } : {}),
        ...(profile.seatCapacity ? { seatCapacity: profile.seatCapacity } : {}),
      });
      // Driver-facing identification photo only — never shown to passengers.
      if (profile.photoDataUrl) {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          await supabase
            .from("profiles")
            .update({ photo_url: profile.photoDataUrl })
            .eq("id", data.user.id);
        }
      }
      navigate({ to: portalHome[role], replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the account");
      setLoading(false);
    }
  }

  function handleAccountSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (role === "driver") {
      setStep("vehicle");
      return;
    }
    void complete({ ...form, ...(photoDataUrl ? { photoDataUrl } : {}) });
  }

  function handleVehicleSubmit(event: React.FormEvent) {
    event.preventDefault();
    void complete({
      ...form,
      ...(photoDataUrl ? { photoDataUrl } : {}),
      plateNumber: vehicle.plateNumber,
      seatCapacity: Number(vehicle.seatCapacity),
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="safe-top flex items-center justify-between px-4 py-4">
        <Wordmark />
        <ThemeToggle />
      </div>

      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-5 pb-16">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          {step === "account" ? (
            <>
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
                {(["passenger", "driver"] as SignupRole[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={role === option}
                    onClick={() => setRole(option)}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm font-medium capitalize transition-colors",
                      role === option
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <h1 className="mt-5 text-lg font-bold tracking-tight">
                Create your {role === "driver" ? "driver" : "passenger"} account
              </h1>
              <p className="text-sm text-muted-foreground">
                We only use your phone number to confirm rides.
              </p>

              <form className="mt-6 space-y-4" onSubmit={handleAccountSubmit}>
                <ProfilePhotoField
                  value={photoDataUrl}
                  onChange={setPhotoDataUrl}
                  name={form.fullName || form.firstName}
                />
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    value={form.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    value={form.firstName}
                    onChange={(e) => update("firstName", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    placeholder="09 xxx xxx xxx"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    You&apos;ll log in with this email — your phone number is only used for
                    ride contact.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gender">Gender (optional)</Label>
                  <Select value={form.gender} onValueChange={(value) => update("gender", value)}>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Prefer not to say" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="undisclosed">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {role === "driver"
                    ? "Continue"
                    : loading
                      ? "Creating account…"
                      : "Create account"}
                </Button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-lg font-bold tracking-tight">Your vehicle</h1>
              <p className="text-sm text-muted-foreground">
                Plate number and seat capacity are{" "}
                <span className="font-semibold text-foreground">locked after this step</span> —
                contact the team to change them later.
              </p>
              <form className="mt-6 space-y-4" onSubmit={handleVehicleSubmit}>
                <div className="space-y-1.5">
                  <Label htmlFor="plate">Plate number</Label>
                  <Input
                    id="plate"
                    placeholder="YGN 1A-2345"
                    value={vehicle.plateNumber}
                    onChange={(e) => setVehicle((v) => ({ ...v, plateNumber: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="seats">Seat capacity</Label>
                  <Select
                    value={vehicle.seatCapacity}
                    onValueChange={(value) => setVehicle((v) => ({ ...v, seatCapacity: value }))}
                  >
                    <SelectTrigger id="seats">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["3", "4", "6", "8", "12"].map((n) => (
                        <SelectItem key={n} value={n}>
                          {n} seats
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    onClick={() => setStep("account")}
                  >
                    Back
                  </Button>
                  <Button type="submit" size="lg" className="flex-1" disabled={loading}>
                    {loading ? "Saving…" : "Finish"}
                  </Button>
                </div>
              </form>
            </>
          )}

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
