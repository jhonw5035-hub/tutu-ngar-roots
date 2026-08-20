import * as React from "react";

import type { TimeBand } from "@/lib/mockData";

/**
 * Passenger booking draft — shared across Home → Route Discovery → Time
 * Selection → the existing map booking flow. Same state model as before,
 * just lifted so the new card screens can hand off to each other.
 */
export type BookingDraft = {
  pickupText: string;
  destinationText: string;
  /** ISO yyyy-mm-dd */
  date: string;
  band: TimeBand;
  query: string;
  routeId: string | null;
  slotId: string | null;
  /** Confirmed pickup point on the selected route. */
  pickupPointId: string | null;
};

type BookingValue = BookingDraft & {
  set: (patch: Partial<BookingDraft>) => void;
  reset: () => void;
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const initial: BookingDraft = {
  pickupText: "",
  destinationText: "",
  date: todayISO(),
  band: "any",
  query: "",
  routeId: null,
  slotId: null,
  pickupPointId: null,
};

const BookingContext = React.createContext<BookingValue | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = React.useState<BookingDraft>(initial);

  const set = React.useCallback(
    (patch: Partial<BookingDraft>) => setDraft((d) => ({ ...d, ...patch })),
    [],
  );
  const reset = React.useCallback(() => setDraft({ ...initial, date: todayISO() }), []);

  const value = React.useMemo(() => ({ ...draft, set, reset }), [draft, set, reset]);
  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking(): BookingValue {
  const ctx = React.useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within <BookingProvider>");
  return ctx;
}

/**
 * Best-effort nearby-area label from the browser's geolocation, matched to the
 * closest known pickup point. Never blocks the form — the field stays editable.
 */
export function useNearbyAreaLabel(enabled: boolean) {
  const [label, setLabel] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!enabled || typeof navigator === "undefined" || !navigator.geolocation) return;
    let cancelled = false;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { pickupPoints } = await import("@/lib/mockData");
        if (cancelled) return;
        let best = pickupPoints[0]!;
        let bestD = Infinity;
        for (const p of pickupPoints) {
          const d = (p.lat - pos.coords.latitude) ** 2 + (p.lng - pos.coords.longitude) ** 2;
          if (d < bestD) {
            bestD = d;
            best = p;
          }
        }
        setLabel(`Near ${best.name}`);
      },
      () => setLabel(null),
      { timeout: 6000, maximumAge: 300000 },
    );
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return label;
}
