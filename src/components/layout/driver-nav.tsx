import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Banknote, Car, Home, UserRound } from "lucide-react";
import type { BottomNavItem } from "./bottom-nav";
import { useT } from "@/lib/i18n";

type DriverTab = "home" | "trips" | "earnings" | "profile";

/** Bottom tabs for the driver portal. */
export function useDriverNav(activeTab?: DriverTab): BottomNavItem[] {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const t = useT();

  const isActive = (tab: DriverTab, paths: string[]) =>
    activeTab ? activeTab === tab : paths.includes(pathname);

  return [
    {
      label: t("home"),
      icon: Home,
      active: isActive("home", ["/driver"]),
      onSelect: () => navigate({ to: "/driver" }),
    },
    {
      label: t("trips"),
      icon: Car,
      active: isActive("trips", ["/driver/trips"]),
      onSelect: () => navigate({ to: "/driver/trips" }),
    },
    {
      label: t("earnings"),
      icon: Banknote,
      active: isActive("earnings", ["/driver/earnings"]),
      onSelect: () => navigate({ to: "/driver/earnings" }),
    },
    {
      label: t("profile"),
      icon: UserRound,
      active: isActive("profile", ["/driver/profile"]),
      onSelect: () => navigate({ to: "/driver/profile" }),
    },
  ];
}
