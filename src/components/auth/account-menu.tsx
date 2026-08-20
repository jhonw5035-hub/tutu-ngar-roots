import { useNavigate } from "@tanstack/react-router";
import { Bell, LogOut, UserRound } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/lib/session";

const roleLabel = {
  passenger: "Passenger",
  driver: "Driver",
  admin: "Admin",
} as const;

function getInitials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AccountMenu() {
  const { role, profile, signOut } = useSession();
  const navigate = useNavigate();

  const displayName = profile?.firstName || profile?.fullName || "Guest";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Account" className="relative rounded-full">
          <Avatar className="size-8">
            {profile?.photoDataUrl ? (
              <AvatarImage src={profile.photoDataUrl} alt={displayName} />
            ) : null}
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <span className="block text-sm font-semibold">{displayName}</span>
          <span className="block text-xs text-muted-foreground">
            {role ? `Signed in as ${roleLabel[role]}` : "Not signed in"}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            void signOut().then(() => navigate({ to: "/login", replace: true }));
          }}
        >
          <LogOut className="size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function NotificationBell() {
  return (
    <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
      <Bell className="size-5" />
      <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />
    </Button>
  );
}
