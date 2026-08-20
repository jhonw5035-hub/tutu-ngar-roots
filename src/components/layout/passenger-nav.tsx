import { useNavigate, useRouterState } from "@tanstack/react-router";
import { CalendarClock, Home } from "lucide-react";
import type { BottomNavItem } from "./bottom-nav";

export function usePassengerNav(): BottomNavItem[] {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return [
    {
      label: "Book",
      icon: Home,
      active: pathname === "/book",
      onSelect: () => navigate({ to: "/book" }),
    },
    {
      label: "My trips",
      icon: CalendarClock,
      active: pathname === "/trips",
      onSelect: () => navigate({ to: "/trips" }),
    },
  ];
}