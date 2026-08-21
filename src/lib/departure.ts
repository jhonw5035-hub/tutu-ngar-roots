import {
  addMinutes,
  bandOf,
  getRoute,
  getSlotDetail,
  pathDistanceKm,
  type SlotDetail,
} from "@/lib/mockData";
import type { LiveDeparture } from "@/lib/rides.functions";

const AVG_SPEED_KMH = 22;

/** Present a live (Supabase) departure with the same shape as a mock slot. */
export function slotFromLiveDeparture(
  departure: LiveDeparture | null,
  routeId: string | null,
): SlotDetail | null {
  if (!departure) return null;
  const route = getRoute(routeId ?? departure.corridorId);
  if (!route) return null;
  const minutes = (pathDistanceKm(route.path) / AVG_SPEED_KMH) * 60;
  const femaleOnly =
    departure.riders.length > 0 && departure.riders.every((r) => r.gender === "female");

  return {
    id: departure.groupId,
    routeId: route.id,
    time: departure.time,
    seatsFilled: departure.seatsFilled,
    seatsCapacity: departure.seatsCapacity,
    seatsLeft: Math.max(0, departure.seatsCapacity - departure.seatsFilled),
    arrival: addMinutes(departure.time, minutes),
    band: bandOf(departure.time),
    price: route.fare,
    womenOnlyAvailable: femaleOnly,
    recommended: false,
  };
}

/** Mock slot when there is one, otherwise the live departure the user tapped. */
export function resolveSlot(
  slotId: string | null,
  liveDeparture: LiveDeparture | null,
  routeId: string | null,
): SlotDetail | null {
  return getSlotDetail(slotId) ?? slotFromLiveDeparture(liveDeparture, routeId);
}
