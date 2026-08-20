import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wordmark } from "@/components/layout/wordmark";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Tu Tu Ngar Shared Rides" },
      {
        name: "description",
        content:
          "Sign in with your Myanmar phone number to book pre-scheduled shared rides across Yangon with Tu Tu Ngar.",
      },
      { property: "og:title", content: "Sign in — Tu Tu Ngar Shared Rides" },
      {
        property: "og:description",
        content: "Sign in to pre-book shared seats across Yangon.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = React.useState("");

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="flex items-center justify-between px-4 py-4">
        <Wordmark />
        <ThemeToggle />
      </div>
      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 pb-16">
        <h1 className="text-2xl font-extrabold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your phone number to continue booking shared rides.
        </p>
        <form
          className="mt-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/book" });
          }}
        >
          <Input
            type="tel"
            inputMode="tel"
            placeholder="09 xxx xxx xxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            aria-label="Phone number"
          />
          <Button type="submit" size="lg" className="w-full">
            Continue
          </Button>
        </form>
      </main>
    </div>
  );
}