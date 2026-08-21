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

export const routes: Route[] = [
  {
    id: "r-pyay",
    name: "Pyay Road Corridor",
    roadName: "Pyay Road",
    from: "Hlaing",
    to: "Downtown",
    fare: 2500,
    path: [
      [16.8712, 96.1281],
      [16.8544, 96.1319],
      [16.8318, 96.1355],
      [16.8135, 96.1401],
      [16.7992, 96.1462],
      [16.7861, 96.1544],
      [16.7762, 96.1596],
    ],
    pickupPointIds: ["p-pyay-1", "p-pyay-2", "p-pyay-3", "p-pyay-4", "p-pyay-5"],
  },
  {
    id: "r-inya",
    name: "Inya Road Corridor",
    roadName: "Inya Road",
    from: "Inya Lake",
    to: "Downtown",
    fare: 2300,
    path: [
      [16.8305, 96.1521],
      [16.8221, 96.1462],
      [16.8138, 96.1418],
      [16.8009, 96.1481],
      [16.7885, 96.1549],
      [16.7773, 96.1604],
    ],
    pickupPointIds: ["p-inya-1", "p-inya-2", "p-inya-3", "p-inya-4"],
  },
  {
    id: "r-kabaraye",
    name: "Kabar Aye Pagoda Road Corridor",
    roadName: "Kabar Aye Pagoda Road",
    from: "Mayangone",
    to: "Downtown",
    fare: 2800,
    path: [
      [16.8721, 96.1548],
      [16.8562, 96.1571],
      [16.8382, 96.1596],
      [16.8212, 96.1611],
      [16.8021, 96.1601],
      [16.7861, 96.1601],
      [16.7769, 96.1612],
    ],
    pickupPointIds: ["p-kbr-1", "p-kbr-2", "p-kbr-3", "p-kbr-4", "p-kbr-5"],
  },
  {
    id: "r-univ",
    name: "University Avenue Corridor",
    roadName: "University Avenue Road",
    from: "Kamayut",
    to: "Shwedagon",
    fare: 2000,
    path: [
      [16.8244, 96.1352],
      [16.8231, 96.1451],
      [16.8203, 96.1548],
      [16.8148, 96.1638],
      [16.8054, 96.1691],
      [16.7981, 96.1495],
    ],
    pickupPointIds: ["p-univ-1", "p-univ-2", "p-univ-3", "p-univ-4"],
  },
  {
    id: "r-strand",
    name: "Strand Road Waterfront",
    roadName: "Strand Road",
    from: "Lanmadaw",
    to: "Botahtaung",
    fare: 1800,
    path: [
      [16.7742, 96.1439],
      [16.7728, 96.1521],
      [16.7715, 96.1594],
      [16.7708, 96.1668],
      [16.7703, 96.1742],
      [16.7699, 96.1801],
    ],
    pickupPointIds: ["p-str-1", "p-str-2", "p-str-3", "p-str-4"],
  },
  {
    id: "r-insein",
    name: "Insein Road Corridor",
    roadName: "Insein Road",
    from: "Insein",
    to: "Hledan",
    fare: 2600,
    path: [
      [16.8951, 96.1121],
      [16.8761, 96.1189],
      [16.8592, 96.1251],
      [16.8431, 96.1301],
      [16.8299, 96.1341],
    ],
    pickupPointIds: ["p-ins-1", "p-ins-2", "p-ins-3", "p-ins-4"],
  },
];

export const pickupPoints: PickupPoint[] = [
  // Pyay Road
  { id: "p-pyay-1", routeId: "r-pyay", name: "Hlaing Campus", lat: 16.8712, lng: 96.1281, sequence: 1, isDestination: false },
  { id: "p-pyay-2", routeId: "r-pyay", name: "Hledan Junction", lat: 16.8318, lng: 96.1355, sequence: 2, isDestination: false },
  { id: "p-pyay-3", routeId: "r-pyay", name: "Myaynigone", lat: 16.8135, lng: 96.1401, sequence: 3, isDestination: true },
  { id: "p-pyay-4", routeId: "r-pyay", name: "Hledan / Pyay Rd South", lat: 16.7992, lng: 96.1462, sequence: 4, isDestination: true },
  { id: "p-pyay-5", routeId: "r-pyay", name: "Sule Pagoda Road", lat: 16.7762, lng: 96.1596, sequence: 5, isDestination: true },
  // Inya Road
  { id: "p-inya-1", routeId: "r-inya", name: "Inya Lake View", lat: 16.8305, lng: 96.1521, sequence: 1, isDestination: false },
  { id: "p-inya-2", routeId: "r-inya", name: "Inya Road Mid Block", lat: 16.8138, lng: 96.1418, sequence: 2, isDestination: true },
  { id: "p-inya-3", routeId: "r-inya", name: "Dagon Township", lat: 16.7885, lng: 96.1549, sequence: 3, isDestination: true },
  { id: "p-inya-4", routeId: "r-inya", name: "Downtown Maha Bandula", lat: 16.7773, lng: 96.1604, sequence: 4, isDestination: true },
  // Kabar Aye
  { id: "p-kbr-1", routeId: "r-kabaraye", name: "Mayangone Market", lat: 16.8721, lng: 96.1548, sequence: 1, isDestination: false },
  { id: "p-kbr-2", routeId: "r-kabaraye", name: "Kabar Aye Pagoda", lat: 16.8562, lng: 96.1571, sequence: 2, isDestination: false },
  { id: "p-kbr-3", routeId: "r-kabaraye", name: "Yankin Centre", lat: 16.8382, lng: 96.1596, sequence: 3, isDestination: true },
  { id: "p-kbr-4", routeId: "r-kabaraye", name: "Tamwe Junction", lat: 16.8021, lng: 96.1601, sequence: 4, isDestination: true },
  { id: "p-kbr-5", routeId: "r-kabaraye", name: "Botahtaung", lat: 16.7769, lng: 96.1612, sequence: 5, isDestination: true },
  // University Ave
  { id: "p-univ-1", routeId: "r-univ", name: "Kamayut Junction", lat: 16.8244, lng: 96.1352, sequence: 1, isDestination: false },
  { id: "p-univ-2", routeId: "r-univ", name: "Yangon University", lat: 16.8231, lng: 96.1451, sequence: 2, isDestination: false },
  { id: "p-univ-3", routeId: "r-univ", name: "Inya Myaing", lat: 16.8203, lng: 96.1548, sequence: 3, isDestination: true },
  { id: "p-univ-4", routeId: "r-univ", name: "Shwedagon East Gate", lat: 16.7981, lng: 96.1495, sequence: 4, isDestination: true },
  // Strand
  { id: "p-str-1", routeId: "r-strand", name: "Lanmadaw Jetty", lat: 16.7742, lng: 96.1439, sequence: 1, isDestination: false },
  { id: "p-str-2", routeId: "r-strand", name: "Pansodan Jetty", lat: 16.7715, lng: 96.1594, sequence: 2, isDestination: true },
  { id: "p-str-3", routeId: "r-strand", name: "Strand Hotel", lat: 16.7708, lng: 96.1668, sequence: 3, isDestination: true },
  { id: "p-str-4", routeId: "r-strand", name: "Botahtaung Jetty", lat: 16.7699, lng: 96.1801, sequence: 4, isDestination: true },
  // Insein
  { id: "p-ins-1", routeId: "r-insein", name: "Insein Market", lat: 16.8951, lng: 96.1121, sequence: 1, isDestination: false },
  { id: "p-ins-2", routeId: "r-insein", name: "Mingaladon Gate", lat: 16.8761, lng: 96.1189, sequence: 2, isDestination: false },
  { id: "p-ins-3", routeId: "r-insein", name: "Thamaing Junction", lat: 16.8592, lng: 96.1251, sequence: 3, isDestination: true },
  { id: "p-ins-4", routeId: "r-insein", name: "Hledan Centre", lat: 16.8299, lng: 96.1341, sequence: 4, isDestination: true },
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
    routeName: "Pyay Road Corridor",
    pickup: "Hledan Junction",
    destination: "Sule Pagoda Road",
    date: "18 Aug 2026",
    time: "08:15",
    fare: 2500,
    driverName: "U Myo Thant",
    plate: "YGN 4C-8821",
  },
  {
    id: "t-1002",
    routeName: "Inya Road Corridor",
    pickup: "Inya Lake View",
    destination: "Downtown Maha Bandula",
    date: "16 Aug 2026",
    time: "08:00",
    fare: 2300,
    driverName: "Daw Khin Aye",
    plate: "YGN 2A-1174",
  },
  {
    id: "t-1003",
    routeName: "Insein Road Corridor",
    pickup: "Insein Market",
    destination: "Hledan Centre",
    date: "12 Aug 2026",
    time: "08:30",
    fare: 2600,
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
export const popularRouteIds = ["r-pyay", "r-inya"];

/** All pickup/destination names, for lightweight input suggestions. */
export const allPointNames = Array.from(new Set(pickupPoints.map((p) => p.name)));

/** Mock confirmed booking shown on Passenger Home. */
export const upcomingTrip = {
  id: "t-2001",
  status: "Confirmed",
  routeName: "Pyay Road Corridor",
  pickup: "Hledan Junction",
  destination: "Sule Pagoda Road",
  date: "Tomorrow",
  time: "08:15",
  fare: 2500,
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
    label: `${to12(h, m)} – ${to12(Math.floor(endTotal / 60), em)}`,
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
