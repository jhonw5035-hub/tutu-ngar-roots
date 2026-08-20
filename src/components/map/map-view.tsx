import { Suspense, lazy, useEffect, useState } from "react";
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
  ...props
}: RouteMapProps & { className?: string }) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  return (
    <div
      className={cn(
        "relative h-64 w-full overflow-hidden rounded-xl border border-border shadow-card",
        className,
      )}
    >
      {hydrated ? (
        <Suspense fallback={<MapSkeleton />}>
          <RouteMap {...props} />
        </Suspense>
      ) : (
        <MapSkeleton />
      )}
    </div>
  );
}