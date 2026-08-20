/**
 * Hardcoded operations mock data for the admin portal.
 * TODO(supabase): replace with real queries + the greedy-clustering optimizer output.
 */

export type PendingArea = { area: string; passengers: number };

export type OptimizedGroup = {
  id: string;
  name: string;
  tone: "green" | "amber" | "blue";
  passengers: number;
  corridor: string;
  vehicle: string;
  seats: string;
};

export type VehicleOption = {
  plate: string;
  capacity: number;
  distanceKm: number;
  status: string;
};

export const todayStats = [
  { label: "Passengers", value: "128", icon: "👥" },
  { label: "Vehicles", value: "34", icon: "🚗" },
  { label: "Optimized Groups", value: "31", icon: "🧩" },
  { label: "Seat Utilization", value: "92%", icon: "⚡" },
];

export const pendingPassengers: PendingArea[] = [
  { area: "Sanchaung", passengers: 4 },
  { area: "Hledan", passengers: 2 },
  { area: "Kamayut", passengers: 2 },
];

export const pendingTotal = pendingPassengers.reduce((n, a) => n + a.passengers, 0);

export const optimizedGroups: OptimizedGroup[] = [
  {
    id: "A",
    name: "Group A",
    tone: "green",
    passengers: 4,
    corridor: "Sanchaung → Hledan / Tamine",
    vehicle: "Vehicle #24",
    seats: "4/4 seats",
  },
  {
    id: "B",
    name: "Group B",
    tone: "amber",
    passengers: 3,
    corridor: "Kamayut → Sule",
    vehicle: "Vehicle #17",
    seats: "3/4 seats",
  },
  {
    id: "C",
    name: "Group C",
    tone: "blue",
    passengers: 4,
    corridor: "Lanmadaw → Downtown",
    vehicle: "Vehicle #31",
    seats: "4/4 seats",
  },
];

export const previewGroup = {
  vehicle: "TGN-024",
  seats: "4/4 seats",
  pickup: "Sanchaung Junction",
  route: "Sanchaung → Hledan → Tamine",
};

export const beforeAi = [
  { rider: "P1", drop: "Alley" },
  { rider: "P2", drop: "Hledan" },
  { rider: "P3", drop: "Tamine" },
  { rider: "P4", drop: "Hledan" },
];

export const optimizedPickup = {
  name: "Sanchaung Junction",
  walks: [
    { rider: "P1", meters: 250 },
    { rider: "P2", meters: 400 },
    { rider: "P3", meters: 180 },
    { rider: "P4", meters: 350 },
  ],
};

export const optimizedDrops = [
  {
    name: "Hledan Bus Stop",
    walks: [
      { rider: "P1", meters: 210 },
      { rider: "P2", meters: 160 },
    ],
  },
  {
    name: "Tamine Lan Sone",
    walks: [
      { rider: "P3", meters: 300 },
      { rider: "P4", meters: 240 },
    ],
  },
];

export const whyThisRoute = [
  "4 passengers share the Sanchaung corridor",
  "Sanchaung Junction minimizes average walking distance",
  "Hledan is the best common drop point for 2 passengers",
  "Tamine remains on the vehicle's route",
  "Vehicle capacity = 4 seats",
  "No additional vehicle required",
];

export const vehicleOptions: VehicleOption[] = [
  { plate: "TGN-024", capacity: 4, distanceKm: 0.8, status: "Available" },
  { plate: "TGN-031", capacity: 7, distanceKm: 3.2, status: "Available" },
  { plate: "TGN-018", capacity: 4, distanceKm: 5.1, status: "Available" },
];

export const vehicleRecommendation = {
  plate: "TGN-024",
  reason: "Best capacity match + closest available driver.",
};

export const routeSequence = [
  "START",
  "📍 Sanchaung AI Meeting Point",
  "📍 Hledan Bus Stop",
  "📍 Tamine Lan Sone",
  "END",
];

export const routeStats = [
  { label: "Passengers", value: "4" },
  { label: "Vehicle capacity", value: "4" },
  { label: "Route distance", value: "7.2 km" },
  { label: "Pickup points", value: "1" },
  { label: "Drop points", value: "2" },
  { label: "Unnecessary detours", value: "Minimized" },
];

export const optimizationSteps = [
  "Grouping origins",
  "Comparing destinations",
  "Checking vehicle capacity",
  "Calculating meeting points",
  "Optimizing routes",
];
