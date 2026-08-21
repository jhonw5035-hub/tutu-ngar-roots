import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

import { AccountMenu } from "@/components/auth/account-menu";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Wordmark } from "@/components/layout/wordmark";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: "📊" },
  { to: "/admin/ai-matching", label: "AI Matching", icon: "🤖" },
  { to: "/admin/vehicles", label: "Vehicles & Drivers", icon: "🚗" },
  { to: "/admin/routes", label: "Routes", icon: "🗺" },
  { to: "/admin/passengers", label: "Passengers", icon: "👥" },
  { to: "/admin/support", label: "Customer Support", icon: "🎧" },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/40 text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-3">
            <Wordmark />
            <span className="hidden text-xs font-semibold uppercase tracking-widest text-muted-foreground sm:inline">
              Operations Console
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Settings"
              className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Settings className="size-4" />
            </button>
            <ThemeToggle />
            <AccountMenu />
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 border-r border-border bg-background p-3 md:block">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/admin" }}
                activeProps={{ className: "bg-primary/10 text-foreground font-semibold" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted hover:text-foreground"
              >
                <span aria-hidden>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="flex gap-1 overflow-x-auto border-b border-border bg-background px-3 py-2 md:hidden">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/admin" }}
                activeProps={{ className: "bg-primary/10 text-foreground font-semibold" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className="shrink-0 rounded-lg px-3 py-1.5 text-xs transition-colors"
              >
                <span aria-hidden className="mr-1">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
          <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

export function AdminPlaceholder({ title, blurb }: { title: string; blurb: string }) {
  return (
    <AdminShell>
      <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{blurb}</p>
      <div className="mt-6 rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
        Coming soon
      </div>
    </AdminShell>
  );
}
