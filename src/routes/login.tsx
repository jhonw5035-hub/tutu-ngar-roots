import { createFileRoute, Link } from "@tanstack/react-router";
import { Car, ShieldCheck, User } from "lucide-react";

import { Wordmark } from "@/components/layout/wordmark";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LanguageToggle } from "@/components/layout/language-toggle";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Choose your role — Tu Tu Ngar" },
      {
        name: "description",
        content: "Continue to Tu Tu Ngar as a passenger, driver or admin.",
      },
      { property: "og:title", content: "Choose your role — Tu Tu Ngar" },
      {
        property: "og:description",
        content: "Pick how you'd like to use Tu Tu Ngar shared rides.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RoleSelectPage,
});

const options = [
  { to: "/home", label: "Continue as Passenger", icon: User },
  { to: "/driver", label: "Continue as Driver", icon: Car },
  { to: "/admin", label: "Continue as Admin", icon: ShieldCheck },
] as const;

function RoleSelectPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="safe-top flex items-center justify-between px-4 py-4">
        <Wordmark />
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-5 pb-16">
        <h1 className="text-center text-2xl font-bold tracking-tight">Welcome to Tu Tu Ngar</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Choose how you&apos;d like to continue
        </p>
        <div className="mt-8 space-y-3">
          {options.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-primary px-5 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
