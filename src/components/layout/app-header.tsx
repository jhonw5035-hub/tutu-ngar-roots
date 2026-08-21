import type { ReactNode } from "react";
import { Wordmark } from "./wordmark";
import { LanguageToggle } from "./language-toggle";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { useT, type TranslationKey } from "@/lib/i18n";

export type Portal = "passenger" | "driver" | "admin";

const portalLabel: Record<Portal, TranslationKey> = {
  passenger: "passenger",
  driver: "driver",
  admin: "admin",
};

export function AppHeader({
  portal,
  actions,
}: {
  portal?: Portal | undefined;
  actions?: ReactNode | undefined;
}) {
  const t = useT();
  return (
    <header className="safe-top sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-2">
          <Wordmark />
          {portal ? <Badge variant="outline">{t(portalLabel[portal])}</Badge> : null}
        </div>
        <div className="flex items-center gap-1">
          {actions}
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
