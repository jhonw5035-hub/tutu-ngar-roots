import { useEffect, useState } from "react";

import type { LatLng } from "@/lib/mockData";

/** Simulated vehicle movement along a polyline (demo only, no live GPS yet). */
export function useVehicleAnimation(path: LatLng[] | null, enabled: boolean) {
  const [position, setPosition] = useState<LatLng | null>(path?.[0] ?? null);

  useEffect(() => {
    if (!enabled || !path || path.length < 2) return;
    let t = 0;
    const stepsPerLeg = 12;
    const total = (path.length - 1) * stepsPerLeg;
    const id = window.setInterval(() => {
      t = (t + 1) % total;
      const leg = Math.floor(t / stepsPerLeg);
      const f = (t % stepsPerLeg) / stepsPerLeg;
      const a = path[leg]!;
      const b = path[leg + 1]!;
      setPosition([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]);
    }, 120);
    return () => window.clearInterval(id);
  }, [path, enabled]);

  return position;
}
