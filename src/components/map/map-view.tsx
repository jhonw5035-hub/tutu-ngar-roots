import { Suspense, lazy, useEffect, useState } from "react";
import { LocateFixed } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RouteMapProps } from "./route-map";

const RouteMap = lazy(() => import("./route-map"));

function MapSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
      Loading map…
    </div>
  );
}

export function MapView({
  className,
  showLocate = false,
  locateOffsetClassName = "bottom-4",
  ...props
}: RouteMapProps & {
  className?: string;
  showLocate?: boolean;
  locateOffsetClassName?: string;
}) {
  const [hydrated, setHydrated] = useState(false);
  const [locateNonce, setLocateNonce] = useState(0);
  useEffect(() => setHydrated(true), []);

  return (
    <div className={cn("relative h-64 w-full overflow-hidden", className)}>
      {hydrated ? (
        <Suspense fallback={<MapSkeleton />}>
          <RouteMap {...props} locateNonce={locateNonce} />
        </Suspense>
      ) : (
        <MapSkeleton />
      )}

      {showLocate && hydrated ? (
        <button
          type="button"
          aria-label="Locate me"
          onClick={() => setLocateNonce((n) => n + 1)}
          className={cn(
            "absolute right-4 z-[500] flex size-11 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-foreground shadow-elevated transition-transform active:scale-95",
            locateOffsetClassName,
          )}
        >
          <LocateFixed className="size-5" />
        </button>
      ) : null}
    </div>
  );
}
