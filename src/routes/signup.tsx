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
import { RolePortalTabs } from "@/components/auth/role-portal-tabs";
import { ProfilePhotoField } from "@/components/auth/profile-photo-field";
import { portalHome, useSession, type Role, type SessionProfile } from "@/lib/session";

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

  const [role, setRole] = React.useState<Role>(search.role);
  const [step, setStep] = React.useState<"account" | "vehicle">("account");
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    fullName: "",
    firstName: "",
    phone: "",
    password: "",
    gender: "",
  });
  const [photoDataUrl, setPhotoDataUrl] = React.useState<string | undefined>(undefined);
  const [vehicle, setVehicle] = React.useState({ plateNumber: "", seatCapacity: "4" });

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function complete(profile: SessionProfile) {
    setLoading(true);
    // TODO(supabase): replace with supabase.auth.signUp({ email, password, options })
    // and insert the profile row + role row server-side.
    window.setTimeout(() => {
      signIn(role, profile);
      setLoading(false);
      navigate({ to: portalHome[role], replace: true });
    }, 700);
  }

  function handleAccountSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (role === "driver") {
      setStep("vehicle");
      return;
    }
    complete({ ...form, ...(photoDataUrl ? { photoDataUrl } : {}) });
  }

  function handleVehicleSubmit(event: React.FormEvent) {
    event.preventDefault();
    complete({
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
              <RolePortalTabs
                value={role}
                onChange={setRole}
                options={["passenger", "driver"]}
              />
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
                  <Select
                    value={form.gender}
                    onValueChange={(value) => update("gender", value)}
                  >
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
                <span className="font-semibold text-foreground">
                  locked after this step
                </span>{" "}
                — contact the team to change them later.
              </p>
              <form className="mt-6 space-y-4" onSubmit={handleVehicleSubmit}>
                <div className="space-y-1.5">
                  <Label htmlFor="plate">Plate number</Label>
                  <Input
                    id="plate"
                    placeholder="YGN 1A-2345"
                    value={vehicle.plateNumber}
                    onChange={(e) =>
                      setVehicle((v) => ({ ...v, plateNumber: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="seats">Seat capacity</Label>
                  <Select
                    value={vehicle.seatCapacity}
                    onValueChange={(value) =>
                      setVehicle((v) => ({ ...v, seatCapacity: value }))
                    }
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
