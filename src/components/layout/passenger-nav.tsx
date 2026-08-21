import { useNavigate, useRouterState } from "@tanstack/react-router";
import { CalendarClock, Home, UserRound } from "lucide-react";
import type { BottomNavItem } from "./bottom-nav";
import { useT } from "@/lib/i18n";

type Tab = "home" | "trips" | "account";

/** Bottom tabs for the passenger portal. Pass an override while booking. */
export function usePassengerNav(activeTab?: Tab): BottomNavItem[] {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const t = useT();

  const isActive = (tab: Tab, paths: string[]) =>
    activeTab ? activeTab === tab : paths.includes(pathname);

  return [
    {
      label: t("home"),
      icon: Home,
      active: isActive("home", ["/home"]),
      onSelect: () => navigate({ to: "/home" }),
    },
    {
      label: t("trips"),
      icon: CalendarClock,
      active: isActive("trips", ["/trips", "/rides", "/pay", "/confirmed", "/trip"]),
      onSelect: () => navigate({ to: "/trips" }),
    },
    {
      label: t("profile"),
      icon: UserRound,
      active: isActive("account", ["/account"]),
      onSelect: () => navigate({ to: "/account" }),
    },
  ];
}
