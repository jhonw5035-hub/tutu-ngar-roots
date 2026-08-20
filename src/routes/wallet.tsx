import { createFileRoute } from "@tanstack/react-router";
import { Wallet } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { usePassengerNav } from "@/components/layout/passenger-nav";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Wallet — Tu Tu Ngar" },
      {
        name: "description",
        content: "Your Tu Tu Ngar ride balance, MMQR payments and trip receipts.",
      },
      { property: "og:title", content: "Wallet — Tu Tu Ngar" },
      { property: "og:description", content: "Ride balance and MMQR payments." },
    ],
  }),
  component: WalletPage,
});

function WalletPage() {
  const navItems = usePassengerNav("wallet");
  return (
    <AppShell portal="passenger" navItems={navItems}>
      <h1 className="text-2xl">Wallet</h1>
      <Card className="mt-4 shadow-card">
        <CardContent className="flex items-center gap-3 pt-6">
          <Wallet className="size-5 text-primary" />
          <div>
            <p className="num text-lg">12,400 Ks</p>
            <p className="text-sm text-muted-foreground">
              Demo balance — MMQR top-ups arrive in a later step.
            </p>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
