import { describe, expect, it } from "vitest";
import { canCancel, type HistoryBooking } from "./booking-history";
import { haversineM, nearestPickups } from "./main-road-pickups";

const base: HistoryBooking = {
  id: "x", createdAt: 0, pickupArea: "a", destination: "b", departAt: 0, windowLabel: "", fare: 2000,
  method: "Cash", driverName: "Ko Min Thu", plate: "YGN 7B-2481", pickupPointId: "p-nokk-pyay", status: "upcoming",
};
const H = 3600_000;

describe("cancellation rule", () => {
  it("allows cancel more than 2 hours before departure", () => {
    expect(canCancel({ ...base, departAt: 2 * H + 60_000 }, 0)).toBe(true);
  });
  it("blocks cancel within 2 hours of departure", () => {
    expect(canCancel({ ...base, departAt: 2 * H - 60_000 }, 0)).toBe(false);
  });
  it("blocks cancel of an already cancelled booking", () => {
    expect(canCancel({ ...base, departAt: 10 * H, status: "cancelled" }, 0)).toBe(false);
  });
});

describe("main-road pickups", () => {
  it("suggests at most 3 points, all within 800 m, nearest first", () => {
    const { pickups, withinRadius } = nearestPickups({ lat: 16.7770, lng: 96.1586 });
    expect(withinRadius).toBe(true);
    expect(pickups.length).toBeGreaterThan(0);
    expect(pickups.length).toBeLessThanOrEqual(3);
    for (const p of pickups) expect(p.distanceM).toBeLessThanOrEqual(800);
    const d = pickups.map((p) => p.distanceM);
    expect([...d].sort((a, b) => a - b)).toEqual(d);
  });
  it("falls back to the single nearest point when none is within 800 m", () => {
    const { pickups, withinRadius } = nearestPickups({ lat: 17.2, lng: 96.5 });
    expect(withinRadius).toBe(false);
    expect(pickups).toHaveLength(1);
  });
  it("haversine: 0.01 deg latitude is about 1.11 km", () => {
    expect(Math.round(haversineM({ lat: 16.8, lng: 96.1 }, { lat: 16.81, lng: 96.1 }))).toBe(1112);
  });
});
