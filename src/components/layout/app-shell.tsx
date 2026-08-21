import type { ReactNode } from "react";
import { AppHeader, type Portal } from "./app-header";
import { BottomNav, type BottomNavItem } from "./bottom-nav";
import { PageContainer } from "./page-container";
import { AccountMenu } from "@/components/auth/account-menu";

export function AppShell({
  portal,
  navItems,
  fullBleed = false,
  headerActions,
  children,
}: {
  portal?: Portal;
  navItems?: BottomNavItem[];
  fullBleed?: boolean;
  headerActions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className={
        fullBleed
          ? "h-screen overflow-hidden bg-background text-foreground"
          : "min-h-screen bg-background text-foreground"
      }
    >
      <AppHeader
        portal={portal}
        actions={
          <>
            {headerActions}
            <AccountMenu />
          </>
        }
      />
      {fullBleed ? children : <PageContainer>{children}</PageContainer>}
      {navItems?.length ? <BottomNav items={navItems} /> : null}
    </div>
  );
}
