import type { ReactNode } from "react";
import { Wordmark } from "./wordmark";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Badge } from "@/components/ui/badge";

export type Portal = "passenger" | "driver" | "admin";

const portalLabel: Record<Portal, string> = {
  passenger: "Passenger",
  driver: "Driver",
  admin: "Admin",
};

export function AppHeader({
  portal,
  actions,
}: {
  portal?: Portal | undefined;
  actions?: ReactNode | undefined;
}) {
  return (
    <header className="safe-top sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-2">
          <Wordmark />
          {portal ? <Badge variant="outline">{portalLabel[portal]}</Badge> : null}
        </div>
        <div className="flex items-center gap-1">
          {actions}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}