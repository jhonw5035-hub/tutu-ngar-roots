import { Car, ShieldCheck, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Role } from "@/lib/session";

const tabs: { value: Role; label: string; icon: typeof UserRound }[] = [
  { value: "passenger", label: "Passenger", icon: UserRound },
  { value: "driver", label: "Driver", icon: Car },
  { value: "admin", label: "Admin", icon: ShieldCheck },
];

export function RolePortalTabs({
  value,
  onChange,
  options,
}: {
  value: Role;
  onChange: (role: Role) => void;
  options?: Role[];
}) {
  const visible = options ? tabs.filter((t) => options.includes(t.value)) : tabs;

  return (
    <div
      role="tablist"
      aria-label="Choose portal"
      className="grid gap-1 rounded-xl bg-muted p-1"
      style={{ gridTemplateColumns: `repeat(${visible.length}, minmax(0, 1fr))` }}
    >
      {visible.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <tab.icon className={cn("size-4", active && "text-primary")} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
