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