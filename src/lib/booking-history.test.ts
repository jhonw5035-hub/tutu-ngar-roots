import { describe, expect, it } from "vitest";
import { canCancel, type HistoryBooking } from "./booking-history";
import { pickupsNear } from "./main-road-pickups";

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
  it("North Okkalapa offers Pyay Road and Bargayar Road", () => {
    const names = pickupsNear({ lat: 16.9006, lng: 96.172 }).map((p) => p.name);
    expect(names).toContain("Pyay Road");
    expect(names).toContain("Bargayar Road");
  });
});
