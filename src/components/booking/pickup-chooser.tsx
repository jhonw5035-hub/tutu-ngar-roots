import { MapPin } from "lucide-react";

import { Label } from "@/components/ui/label";
import { useLanguage, useT } from "@/lib/i18n";
import { formatDistance, type NearbyPickup } from "@/lib/main-road-pickups";
import { cn } from "@/lib/utils";

/** Nearest main-road pickup choices with distance and walking time. */
export function PickupChooser({
  pickups,
  withinRadius,
  selectedId,
  onSelect,
}: {
  pickups: NearbyPickup[];
  withinRadius: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const t = useT();
  const { lang } = useLanguage();
  if (!pickups.length) return null;
  return (
    <div className="space-y-1.5">
      <Label>{t("mainRoadPickup")}</Label>
      <div className="grid gap-2">
        {pickups.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            aria-pressed={selectedId === p.id}
            className={cn(
              "flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm",
              selectedId === p.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-card",
            )}
          >
            <MapPin className="size-4 shrink-0" />
            <span className="min-w-0 flex-1 font-medium">{lang === "my" ? p.nameMy : p.name}</span>
            <span className="num shrink-0 text-xs text-muted-foreground">
              {formatDistance(p.distanceM)} · {p.walkMin} {t("minWalk")}
            </span>
          </button>
        ))}
      </div>
      {!withinRadius && pickups[0] ? (
        <p className="text-xs font-medium text-primary">
          {t("nearestRoadIs")} {formatDistance(pickups[0].distanceM)} {t("awaySuffix")}
        </p>
      ) : null}
      <p className="text-xs text-muted-foreground">{t("mainRoadNote")}</p>
    </div>
  );
}
