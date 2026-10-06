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
      <div className={portal === "passenger"
        ? "mx-auto grid min-h-14 w-full max-w-3xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-2 sm:flex sm:h-14 sm:justify-between sm:py-0"
        : "mx-auto flex h-14 w-full max-w-3xl items-center justify-between gap-3 px-4"}>
        <div className={portal === "passenger" ? "flex min-w-0 flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-2" : "flex items-center gap-2"}>
          <Wordmark className={portal === "passenger" ? "flex-col items-start gap-0 whitespace-nowrap sm:flex-row sm:items-baseline sm:gap-2" : undefined} />
          {portal ? <Badge variant="outline">{t(portalLabel[portal])}</Badge> : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {actions}
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
