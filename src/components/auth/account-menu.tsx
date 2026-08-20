import { useNavigate } from "@tanstack/react-router";
import { LogOut, UserRound } from "lucide-react";

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

export function AccountMenu() {
  const { role, profile, signOut } = useSession();
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Account">
          <UserRound className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <span className="block text-sm font-semibold">
            {profile?.firstName || profile?.fullName || "Guest"}
          </span>
          <span className="block text-xs text-muted-foreground">
            {role ? `Signed in as ${roleLabel[role]}` : "Not signed in"}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            // TODO(supabase): await supabase.auth.signOut() before navigating.
            signOut();
            navigate({ to: "/login", replace: true });
          }}
        >
          <LogOut className="size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
