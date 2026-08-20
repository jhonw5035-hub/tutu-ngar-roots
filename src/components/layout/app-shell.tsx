import type { ReactNode } from "react";
import { AppHeader, type Portal } from "./app-header";
import { BottomNav, type BottomNavItem } from "./bottom-nav";
import { PageContainer } from "./page-container";

export function AppShell({
  portal,
  navItems,
  fullBleed = false,
  children,
}: {
  portal?: Portal;
  navItems?: BottomNavItem[];
  fullBleed?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={fullBleed ? "h-screen overflow-hidden bg-background text-foreground" : "min-h-screen bg-background text-foreground"}>
      <AppHeader portal={portal} />
      {fullBleed ? children : <PageContainer>{children}</PageContainer>}
      {navItems?.length ? <BottomNav items={navItems} /> : null}
    </div>
  );
}