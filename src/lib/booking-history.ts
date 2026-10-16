import * as React from "react";

/** Completed pre-bookings, persisted in localStorage for the demo. */
export type HistoryStatus = "upcoming" | "completed" | "cancelled";

export type HistoryBooking = {
  id: string;
  createdAt: number;
  pickupArea: string;
  destination: string;
  /** Departure window start, epoch ms. */
  departAt: number;
  windowLabel: string;
  fare: number | null;
  method: string;
  driverName: string;
  plate: string;
  pickupPointId: string;
  status: HistoryStatus;
};

const KEY = "ttn-booking-history";
const EVENT = "ttn-history-change";
export const CANCEL_CUTOFF_MS = 2 * 60 * 60 * 1000;

function read(): HistoryBooking[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as HistoryBooking[];
  } catch {
    return [];
  }
}

function write(list: HistoryBooking[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
}

export function addHistoryBooking(b: HistoryBooking) {
  write([b, ...read().filter((x) => x.id !== b.id)]);
}

/** Cancellation only while upcoming and more than 2 hours before departure. */
export function canCancel(b: HistoryBooking, now = Date.now()) {
  return b.status === "upcoming" && b.departAt - now > CANCEL_CUTOFF_MS;
}

export function cancelHistoryBooking(id: string) {
  write(read().map((b) => (b.id === id && canCancel(b) ? { ...b, status: "cancelled" } : b)));
}

/** Upcoming bookings whose departure has passed show as completed. */
export function effectiveStatus(b: HistoryBooking, now = Date.now()): HistoryStatus {
  if (b.status === "upcoming" && now > b.departAt + 30 * 60 * 1000) return "completed";
  return b.status;
}

export function useBookingHistory(): HistoryBooking[] | null {
  const [list, setList] = React.useState<HistoryBooking[] | null>(null);
  React.useEffect(() => {
    const sync = () => setList(read().sort((a, b) => b.createdAt - a.createdAt));
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return list;
}
