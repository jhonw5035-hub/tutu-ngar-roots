import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/app-shell";
import { usePassengerNav } from "@/components/layout/passenger-nav";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Account — Tu Tu Ngar" },
      {
        name: "description",
        content: "Manage your Tu Tu Ngar passenger profile, phone number and preferences.",
      },
      { property: "og:title", content: "Account — Tu Tu Ngar" },
      { property: "og:description", content: "Your passenger profile and preferences." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const navItems = usePassengerNav("account");
  const { profile } = useSession();
  return (
    <AppShell portal="passenger" navItems={navItems}>
      <h1 className="text-2xl">Account</h1>
      <Card className="mt-4 shadow-card">
        <CardContent className="space-y-1 pt-6 text-sm">
          <p className="font-semibold">{profile?.fullName || "Guest passenger"}</p>
          <p className="text-muted-foreground">{profile?.phone || "No phone on file"}</p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
