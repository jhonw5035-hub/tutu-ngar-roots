export type LatLng = [number, number];

export type Route = {
  id: string;
  name: string;
  roadName: string;
  from: string;
  to: string;
  fare: number;
  path: LatLng[];
  pickupPointIds: string[];
};

export type PickupPoint = {
  id: string;
  routeId: string;
  name: string;
  lat: number;
  lng: number;
  sequence: number;
  isDestination: boolean;
};

export type TimeSlot = {
  id: string;
  routeId: string;
  time: string;
  seatsFilled: number;
  seatsCapacity: number;
};

export type Gender = "female" | "male";

export type MockPassenger = {
  id: string;
  firstName: string;
  gender: Gender;
  timeSlotId: string;
};

export const YANGON_CENTER: LatLng = [16.8409, 96.1735];

/* ------------------------------------------------------------------ */
/* DEMO SCOPE: exactly 3 corridors.                                     */
/* The competition demo deliberately narrows the network to three       */
/* corridors so AI Matching, Routes and Available Shared Rides all tell */
/* one story. The wider corridor set (Pyay Road, Kabar Aye Pagoda Road, */
/* University Avenue, Strand Road, Insein Road) lived here before and   */
/* can be restored post-hackathon by appending those Route entries to   */
/* `routes` and their stops to `pickupPoints` — nothing else in the app */
/* hardcodes corridor ids.                                              */
/* Paths below are endpoint + via guesses; useSnappedCorridors() runs   */
/* them through OSRM so the drawn lines follow real streets.            */
/* ------------------------------------------------------------------ */

export const routes: Route[] = [
  {
    id: "r-nokk-sule",
    name: "North Okkalapa ↔ Sule",
    roadName: "Thudhamma / Kabar Aye Pagoda Road",
    from: "North Okkalapa",
    to: "Sule",
    fare: 3000,
    path: [
      [16.9006, 96.172],
      [16.8688, 96.1662],
      [16.8382, 96.1596],
      [16.8021, 96.1601],
      [16.776, 96.1595],
    ],
    pickupPointIds: ["p-nsu-1", "p-nsu-2", "p-nsu-3", "p-nsu-4", "p-nsu-5"],
  },
  {
    id: "r-inya-sanchaung",
    name: "Inya Road ↔ Sanchaung",
    roadName: "Inya Road",
    from: "Inya Road",
    to: "Sanchaung",
    fare: 2000,
    path: [
      [16.8283, 96.1462],
      [16.8206, 96.1399],
      [16.8149, 96.1358],
      [16.8094, 96.133],
    ],
    pickupPointIds: ["p-isa-1", "p-isa-2", "p-isa-3", "p-isa-4"],
  },
  {
    id: "r-nokk-sokk",
    name: "North Okkalapa ↔ South Okkalapa",
    roadName: "Waizayanta Road",
    from: "North Okkalapa",
    to: "South Okkalapa",
    fare: 1800,
    path: [
      [16.9006, 96.172],
      [16.8836, 96.1786],
      [16.8681, 96.1841],
      [16.854, 96.1885],
    ],
    pickupPointIds: ["p-nso-1", "p-nso-2", "p-nso-3", "p-nso-4"],
  },
];

export const pickupPoints: PickupPoint[] = [
  // North Okkalapa ↔ Sule
  { id: "p-nsu-1", routeId: "r-nokk-sule", name: "North Okkalapa Market", lat: 16.9006, lng: 96.172, sequence: 1, isDestination: false },
  { id: "p-nsu-2", routeId: "r-nokk-sule", name: "Thudhamma Road", lat: 16.8688, lng: 96.1662, sequence: 2, isDestination: false },
  { id: "p-nsu-3", routeId: "r-nokk-sule", name: "Yankin Centre", lat: 16.8382, lng: 96.1596, sequence: 3, isDestination: true },
  { id: "p-nsu-4", routeId: "r-nokk-sule", name: "Tamwe Junction", lat: 16.8021, lng: 96.1601, sequence: 4, isDestination: true },
  { id: "p-nsu-5", routeId: "r-nokk-sule", name: "Sule Pagoda", lat: 16.776, lng: 96.1595, sequence: 5, isDestination: true },
  // Inya Road ↔ Sanchaung
  { id: "p-isa-1", routeId: "r-inya-sanchaung", name: "Inya Road (Inya Lake)", lat: 16.8283, lng: 96.1462, sequence: 1, isDestination: false },
  { id: "p-isa-2", routeId: "r-inya-sanchaung", name: "Inya Myaing", lat: 16.8206, lng: 96.1399, sequence: 2, isDestination: false },
  { id: "p-isa-3", routeId: "r-inya-sanchaung", name: "Hledan Junction", lat: 16.8149, lng: 96.1358, sequence: 3, isDestination: true },
  { id: "p-isa-4", routeId: "r-inya-sanchaung", name: "Sanchaung Market", lat: 16.8094, lng: 96.133, sequence: 4, isDestination: true },
  // North Okkalapa ↔ South Okkalapa
  { id: "p-nso-1", routeId: "r-nokk-sokk", name: "North Okkalapa Market", lat: 16.9006, lng: 96.172, sequence: 1, isDestination: false },
  { id: "p-nso-2", routeId: "r-nokk-sokk", name: "Waizayanta Road", lat: 16.8836, lng: 96.1786, sequence: 2, isDestination: false },
  { id: "p-nso-3", routeId: "r-nokk-sokk", name: "Thingangyun", lat: 16.8681, lng: 96.1841, sequence: 3, isDestination: true },
  { id: "p-nso-4", routeId: "r-nokk-sokk", name: "South Okkalapa Market", lat: 16.854, lng: 96.1885, sequence: 4, isDestination: true },
];


export const timeSlots: TimeSlot[] = routes.flatMap((r) => [
  { id: `${r.id}-t1`, routeId: r.id, time: "08:00", seatsFilled: 2, seatsCapacity: 4 },
  { id: `${r.id}-t2`, routeId: r.id, time: "08:15", seatsFilled: 1, seatsCapacity: 4 },
  { id: `${r.id}-t3`, routeId: r.id, time: "08:30", seatsFilled: 3, seatsCapacity: 4 },
  { id: `${r.id}-t4`, routeId: r.id, time: "08:45", seatsFilled: 0, seatsCapacity: 4 },
]);

const firstNamesFemale = ["Ei Ei", "Su Su", "Thida", "Nandar", "Moe Moe"];
const firstNamesMale = ["Kyaw", "Aung", "Zaw", "Min", "Htet"];

export const mockPassengers: MockPassenger[] = timeSlots.flatMap((slot, slotIndex) =>
  Array.from({ length: slot.seatsFilled }, (_, i) => {
    const female = (slotIndex + i) % 2 === 0;
    const pool = female ? firstNamesFemale : firstNamesMale;
    return {
      id: `${slot.id}-p${i}`,
      firstName: pool[(slotIndex + i) % pool.length]!,
      gender: (female ? "female" : "male") as Gender,
      timeSlotId: slot.id,
    };
  }),
);

export const mockDriver = {
  name: "U Myo Thant",
  plate: "YGN 4C-8821",
  vehicle: "Toyota Probox — Silver",
  rating: 4.8,
  photo: null as string | null,
};

export type PastTrip = {
  id: string;
  routeName: string;
  pickup: string;
  destination: string;
  date: string;
  time: string;
  fare: number;
  driverName: string;
  plate: string;
};

export const pastTrips: PastTrip[] = [
  {
    id: "t-1001",
    routeName: "North Okkalapa ↔ Sule",
    pickup: "North Okkalapa Market",
    destination: "Sule Pagoda",
    date: "18 Aug 2026",
    time: "08:15",
    fare: 3000,
    driverName: "U Myo Thant",
    plate: "YGN 4C-8821",
  },
  {
    id: "t-1002",
    routeName: "Inya Road ↔ Sanchaung",
    pickup: "Inya Road (Inya Lake)",
    destination: "Sanchaung Market",
    date: "16 Aug 2026",
    time: "08:00",
    fare: 2000,
    driverName: "Daw Khin Aye",
    plate: "YGN 2A-1174",
  },
  {
    id: "t-1003",
    routeName: "North Okkalapa ↔ South Okkalapa",
    pickup: "North Okkalapa Market",
    destination: "South Okkalapa Market",
    date: "12 Aug 2026",
    time: "08:30",
    fare: 1800,
    driverName: "U Zaw Win",
    plate: "YGN 7B-3390",
  },
];


export const getRoute = (id: string | null) => routes.find((r) => r.id === id) ?? null;
export const getPointsForRoute = (routeId: string | null) =>
  pickupPoints
    .filter((p) => p.routeId === routeId)
    .sort((a, b) => a.sequence - b.sequence);
export const getPoint = (id: string | null) => pickupPoints.find((p) => p.id === id) ?? null;
export const getSlotsForRoute = (routeId: string | null) =>
  timeSlots.filter((s) => s.routeId === routeId);
export const getPassengers = (slotId: string | null) =>
  mockPassengers.filter((p) => p.timeSlotId === slotId);
/* ------------------------------------------------------------------ */
/* Derived view-models for the card-based passenger screens.           */
/* Everything below is computed from the arrays above — no new source. */
/* ------------------------------------------------------------------ */

export type TimeBand = "any" | "morning" | "afternoon" | "evening";

export function bandOf(time: string): Exclude<TimeBand, "any"> {
  const hour = Number(time.slice(0, 2));
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

function haversineKm(a: LatLng, b: LatLng) {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function pathDistanceKm(path: LatLng[]) {
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) total += haversineKm(path[i]!, path[i + 1]!);
  return total;
}

const AVG_SPEED_KMH = 22;

export function addMinutes(time: string, minutes: number) {
  const [h, m] = time.split(":").map(Number) as [number, number];
  const total = (h * 60 + m + Math.round(minutes)) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export type SlotDetail = TimeSlot & {
  seatsLeft: number;
  arrival: string;
  band: Exclude<TimeBand, "any">;
  price: number;
  /** True when everyone already booked in this van is female. */
  womenOnlyAvailable: boolean;
  recommended: boolean;
};

export function getSlotDetails(routeId: string | null): SlotDetail[] {
  const route = getRoute(routeId);
  if (!route) return [];
  const minutes = (pathDistanceKm(route.path) / AVG_SPEED_KMH) * 60;

  const details: SlotDetail[] = getSlotsForRoute(routeId).map((slot) => {
    const riders = getPassengers(slot.id);
    return {
      ...slot,
      seatsLeft: Math.max(0, slot.seatsCapacity - slot.seatsFilled),
      arrival: addMinutes(slot.time, minutes),
      band: bandOf(slot.time),
      price: route.fare,
      womenOnlyAvailable: riders.length > 0 && riders.every((r) => r.gender === "female"),
      recommended: false,
    };
  });

  // Soonest departure that still has comfortable availability.
  const pick = details.find((d) => d.seatsLeft >= 2) ?? details.find((d) => d.seatsLeft >= 1);
  return details.map((d) => (d.id === pick?.id ? { ...d, recommended: true } : d));
}

export type RouteSummary = {
  route: Route;
  label: string;
  startingPrice: number;
  pickupCount: number;
  nextDeparture: SlotDetail | null;
  distanceKm: number;
};

export function getRouteSummary(route: Route): RouteSummary {
  const slots = getSlotDetails(route.id);
  return {
    route,
    label: `${route.from} → ${route.to}`,
    startingPrice: route.fare,
    pickupCount: getPointsForRoute(route.id).length,
    nextDeparture: slots.find((s) => s.seatsLeft > 0) ?? slots[0] ?? null,
    distanceKm: pathDistanceKm(route.path),
  };
}

export const routeSummaries = (): RouteSummary[] => routes.map(getRouteSummary);

/** Quick-select cards on Passenger Home. */
export const popularRouteIds = ["r-nokk-sule", "r-inya-sanchaung"];

/** All pickup/destination names, for lightweight input suggestions. */
export const allPointNames = Array.from(new Set(pickupPoints.map((p) => p.name)));

/** Mock confirmed booking shown on Passenger Home. */
export const upcomingTrip = {
  id: "t-2001",
  status: "Confirmed",
  routeName: "North Okkalapa ↔ Sule",
  pickup: "North Okkalapa Market",
  destination: "Sule Pagoda",
  date: "Tomorrow",
  time: "08:15",
  fare: 3000,
};


/** Great-circle distance in km between two [lat, lng] pairs. */
export const distanceKm = (a: LatLng, b: LatLng) => haversineKm(a, b);

export type TripStop = {
  id: string;
  name: string;
  isDestination: boolean;
  pickedUp: boolean;
};

/**
 * Ordered stop list for a live trip. `progress` is how many stops the van has
 * already served — the demo steps through this to update the checklist.
 */
export function getTripStops(routeId: string | null, progress = 1): TripStop[] {
  return getPointsForRoute(routeId).map((p, i) => ({
    id: p.id,
    name: p.name,
    isDestination: i === getPointsForRoute(routeId).length - 1,
    pickedUp: i < progress,
  }));
}

/* ------------------------------------------------------------------ */
/* Grouping-first view models: "find people going your way".           */
/* ------------------------------------------------------------------ */

/** Area-level pickup/destination options (not specific stops). */
export const areas = [
  "Hledan",
  "Sanchaung",
  "Kamayut",
  "Insein",
  "Mayangone",
  "Inya Lake",
  "Downtown Yangon",
  "Botahtaung",
];

export type TimeWindow = { id: string; label: string; from: string; to: string };

const pad = (n: number) => String(n).padStart(2, "0");
const to12 = (h: number, m: number) =>
  `${h % 12 === 0 ? 12 : h % 12}:${pad(m)} ${h < 12 ? "AM" : "PM"}`;

/** Full 24-hour day in 30-minute departure windows (48 slots). */
export const timeWindows: TimeWindow[] = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? 0 : 30;
  const endTotal = i * 30 + 30;
  const eh = Math.floor(endTotal / 60) % 24;
  const em = endTotal % 60;
  return {
    id: `w-${i}`,
    label: `${to12(h, m)} – ${to12(eh, em)}`,
    from: `${pad(h)}:${pad(m)}`,
    to: endTotal >= 1440 ? "23:59" : `${pad(eh)}:${pad(em)}`,
  };
});

/** "08:15" -> "8:15 AM" */
export function formatTime12(time: string) {
  const [h, m] = time.split(":").map(Number) as [number, number];
  const suffix = h < 12 ? "AM" : "PM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

export type Departure = {
  slot: SlotDetail;
  route: Route;
  /** "Hledan → Downtown Yangon" */
  label: string;
  /** Minutes until the van reaches the passenger's area, when plausible. */
  pickupEtaMin: number | null;
  riders: MockPassenger[];
};

const matchesArea = (route: Route, text: string) => {
  const q = text.trim().toLowerCase();
  if (!q) return true;
  return (
    route.from.toLowerCase().includes(q) ||
    route.to.toLowerCase().includes(q) ||
    route.roadName.toLowerCase().includes(q) ||
    route.name.toLowerCase().includes(q) ||
    getPointsForRoute(route.id).some((p) => p.name.toLowerCase().includes(q))
  );
};

/**
 * Shared departures matching the passenger's area pair + time window.
 * Falls back to every departure so the demo never shows an empty screen.
 */
export function getDepartures(
  pickup: string,
  destination: string,
  windowId: string,
): Departure[] {
  const win = timeWindows.find((w) => w.id === windowId) ?? timeWindows[0]!;

  const build = (route: Route) =>
    getSlotDetails(route.id)
      .filter((s) => s.time >= win.from && s.time <= win.to)
      .map((slot, i) => ({
        slot,
        route,
        label: `${route.from} → ${route.to}`,
        pickupEtaMin: slot.seatsLeft > 0 ? 8 + i * 6 : null,
        riders: getPassengers(slot.id),
      }));

  const matched = routes.filter((r) => matchesArea(r, pickup) && matchesArea(r, destination));
  // A couple of corridors, all their departures — so the demo shows both a
  // nearly-full van (social proof) and one that is just starting to fill.
  const pool = (matched.length ? matched : routes).slice(0, 2).flatMap(build);
  return pool.sort((a, b) => a.slot.time.localeCompare(b.slot.time)).slice(0, 5);
}

export const getSlotDetail = (slotId: string | null) => {
  const slot = timeSlots.find((s) => s.id === slotId);
  if (!slot) return null;
  return getSlotDetails(slot.routeId).find((s) => s.id === slot.id) ?? null;
};

/**
 * Nearest pickup point on a route, using the shared Haversine helper.
 * Applied silently on Ride Details — the passenger never picks a stop.
 */
export function nearestPickupPoint(routeId: string | null, location: LatLng | null) {
  const points = getPointsForRoute(routeId).filter((p) => !p.isDestination);
  const list = points.length ? points : getPointsForRoute(routeId);
  if (!list.length) return null;
  if (!location) return list[0]!;
  return list.reduce((best, p) =>
    distanceKm(location, [p.lat, p.lng]) < distanceKm(location, [best.lat, best.lng]) ? p : best,
  );
}

/** Trust-signal copy for the home footer (believable placeholders). */
export const trustSignals = [
  { icon: "👥", label: "1,240+ shared trips" },
  { icon: "💰", label: "Save on your journey" },
  { icon: "🛡", label: "Verified drivers" },
];
