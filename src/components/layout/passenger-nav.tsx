import { useNavigate, useRouterState } from "@tanstack/react-router";
import { CalendarClock, Home, UserRound, Wallet } from "lucide-react";
import type { BottomNavItem } from "./bottom-nav";

type Tab = "home" | "trips" | "wallet" | "account";

/** Bottom tabs for the passenger portal. Pass an override while booking. */
export function usePassengerNav(activeTab?: Tab): BottomNavItem[] {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (tab: Tab, paths: string[]) =>
    activeTab ? activeTab === tab : paths.includes(pathname);

  return [
    {
      label: "Home",
      icon: Home,
      active: isActive("home", ["/home"]),
      onSelect: () => navigate({ to: "/home" }),
    },
    {
      label: "Trips",
      icon: CalendarClock,
      active: isActive("trips", ["/trips", "/discover", "/book"]),
      onSelect: () => navigate({ to: "/trips" }),
    },
    {
      label: "Wallet",
      icon: Wallet,
      active: isActive("wallet", ["/wallet"]),
      onSelect: () => navigate({ to: "/wallet" }),
    },
    {
      label: "Account",
      icon: UserRound,
      active: isActive("account", ["/account"]),
      onSelect: () => navigate({ to: "/account" }),
    },
  ];
}
