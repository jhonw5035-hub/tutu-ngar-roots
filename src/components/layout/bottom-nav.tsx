import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type BottomNavItem = {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  onSelect?: () => void;
};

export function BottomNav({ items }: { items: BottomNavItem[] }) {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur">
      <ul className="mx-auto flex w-full max-w-3xl items-stretch">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.label} className="flex-1">
              <button
                type="button"
                onClick={item.onSelect}
                aria-current={item.active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 w-full cursor-pointer flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors",
                  item.active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}