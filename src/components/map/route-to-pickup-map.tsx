import { MapView } from "@/components/map/map-view";
import { useRoadPath } from "@/lib/road-path";
import type { LatLng } from "@/lib/mockData";

/**
 * Small map showing a vehicle approaching a pickup point, with the connecting
 * line pulled from the shared OSRM road-snapped geometry (never a raw
 * straight segment between the two coordinates).
 */
export function RouteToPickupMap({
  vehicle,
  pickup,
  vehicleLabel,
  className = "h-56",
}: {
  vehicle: LatLng | null;
  pickup: LatLng | null;
  vehicleLabel?: string;
  className?: string;
}) {
  const line = useRoadPath(vehicle && pickup ? [vehicle, pickup] : null);

  return (
    <MapView
      className={className}
      routes={[]}
      points={[]}
      line={line}
      {...(vehicle ? { vehicle, vehicleLabel: vehicleLabel ?? "Driver" } : {})}
      {...(pickup ? { userLocation: pickup } : {})}
      fitTo={vehicle && pickup ? [vehicle, pickup] : pickup ? [pickup] : []}
    />
  );
}
