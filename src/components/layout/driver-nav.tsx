import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Banknote, Car, Home, UserRound } from "lucide-react";
import type { BottomNavItem } from "./bottom-nav";

type DriverTab = "home" | "trips" | "earnings" | "profile";

/** Bottom tabs for the driver portal. */
export function useDriverNav(activeTab?: DriverTab): BottomNavItem[] {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (tab: DriverTab, paths: string[]) =>
    activeTab ? activeTab === tab : paths.includes(pathname);

  return [
    {
      label: "Home",
      icon: Home,
      active: isActive("home", ["/driver"]),
      onSelect: () => navigate({ to: "/driver" }),
    },
    {
      label: "Trips",
      icon: Car,
      active: isActive("trips", ["/driver/trips"]),
      onSelect: () => navigate({ to: "/driver/trips" }),
    },
    {
      label: "Earnings",
      icon: Banknote,
      active: isActive("earnings", ["/driver/earnings"]),
      onSelect: () => navigate({ to: "/driver/earnings" }),
    },
    {
      label: "Profile",
      icon: UserRound,
      active: isActive("profile", ["/driver/profile"]),
      onSelect: () => navigate({ to: "/driver/profile" }),
    },
  ];
}
