import type { ReactNode } from "react";
import { AppHeader, type Portal } from "./app-header";
import { BottomNav, type BottomNavItem } from "./bottom-nav";
import { PageContainer } from "./page-container";

export function AppShell({
  portal,
  navItems,
  children,
}: {
  portal?: Portal;
  navItems?: BottomNavItem[];
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader portal={portal} />
      <PageContainer>{children}</PageContainer>
      {navItems?.length ? <BottomNav items={navItems} /> : null}
    </div>
  );
}