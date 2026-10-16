/**
 * Designated main-road pickup points. Passengers are never collected inside
 * residential streets: every pickup area (fare zone) maps to 2–3 nearby main
 * roads, and the passenger chooses one (nearest preselected).
 */
import { zoneOf } from "@/lib/fares";

export type MainRoadPickup = {
  id: string;
  zoneId: string;
  name: string;
  nameMy: string;
  lat: number;
  lng: number;
};

export const mainRoadPickups: MainRoadPickup[] = [
  { id: "p-nokk-pyay", zoneId: "z-nokk", name: "Pyay Road", nameMy: "ပြည်လမ်း", lat: 16.8995, lng: 96.1665 },
  { id: "p-nokk-bargayar", zoneId: "z-nokk", name: "Bargayar Road", nameMy: "ဗားကရာလမ်း", lat: 16.9035, lng: 96.1745 },
  { id: "p-nokk-thudhamma", zoneId: "z-nokk", name: "Thudhamma Road", nameMy: "သုဓမ္မလမ်း", lat: 16.8935, lng: 96.1775 },
  { id: "p-sokk-thanthumar", zoneId: "z-sokk", name: "Thanthumar Road", nameMy: "သံသုမာလမ်း", lat: 16.8505, lng: 96.1835 },
  { id: "p-sokk-waizayantar", zoneId: "z-sokk", name: "Waizayantar Road", nameMy: "ဝေဇယန္တာလမ်း", lat: 16.8455, lng: 96.1755 },
  { id: "p-yankin-kabaaye", zoneId: "z-yankin", name: "Kaba Aye Pagoda Road", nameMy: "ကမ္ဘာအေးဘုရားလမ်း", lat: 16.8395, lng: 96.1555 },
  { id: "p-yankin-yankin", zoneId: "z-yankin", name: "Yankin Road", nameMy: "ရန်ကင်းလမ်း", lat: 16.8355, lng: 96.1625 },
  { id: "p-insein-insein", zoneId: "z-insein", name: "Insein Road", nameMy: "အင်းစိန်လမ်း", lat: 16.8865, lng: 96.1035 },
  { id: "p-insein-baho", zoneId: "z-insein", name: "Baho Road", nameMy: "ဗဟိုလမ်း", lat: 16.8905, lng: 96.0975 },
  { id: "p-kamayut-hledan", zoneId: "z-kamayut", name: "Hledan Junction", nameMy: "လှည်းတန်းလမ်းဆုံ", lat: 16.8245, lng: 96.1295 },
  { id: "p-kamayut-pyay", zoneId: "z-kamayut", name: "Pyay Road", nameMy: "ပြည်လမ်း", lat: 16.8215, lng: 96.1335 },
  { id: "p-kamayut-insein", zoneId: "z-kamayut", name: "Insein Road", nameMy: "အင်းစိန်လမ်း", lat: 16.8275, lng: 96.1275 },
  { id: "p-inya-inya", zoneId: "z-inya", name: "Inya Road", nameMy: "အင်းယားလမ်း", lat: 16.8285, lng: 96.1435 },
  { id: "p-inya-university", zoneId: "z-inya", name: "University Avenue", nameMy: "တက္ကသိုလ်ရိပ်သာလမ်း", lat: 16.8315, lng: 96.1465 },
  { id: "p-inya-dhammazedi", zoneId: "z-inya", name: "Dhammazedi Road", nameMy: "ဓမ္မစေတီလမ်း", lat: 16.8225, lng: 96.1475 },
  { id: "p-sanchaung-baho", zoneId: "z-sanchaung", name: "Baho Road", nameMy: "ဗဟိုလမ်း", lat: 16.8055, lng: 96.1305 },
  { id: "p-sanchaung-kyuntaw", zoneId: "z-sanchaung", name: "Kyun Taw Road", nameMy: "ကျွန်းတောလမ်း", lat: 16.8075, lng: 96.1345 },
  { id: "p-sanchaung-bagaya", zoneId: "z-sanchaung", name: "Bargayar Road", nameMy: "ဗားကရာလမ်း", lat: 16.8015, lng: 96.1365 },
  { id: "p-downtown-sule", zoneId: "z-downtown", name: "Sule Pagoda Road", nameMy: "ဆူးလေဘုရားလမ်း", lat: 16.7775, lng: 96.1585 },
  { id: "p-downtown-anawrahta", zoneId: "z-downtown", name: "Anawrahta Road", nameMy: "အနော်ရထာလမ်း", lat: 16.7795, lng: 96.1555 },
  { id: "p-downtown-mahabandoola", zoneId: "z-downtown", name: "Maha Bandoola Road", nameMy: "မဟာဗန္ဓုလလမ်း", lat: 16.7745, lng: 96.1605 },
];

function dist2(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  return (a.lat - b.lat) ** 2 + (a.lng - b.lng) ** 2;
}

/** Main-road pickups for the area around `coord`, nearest first. */
export function pickupsNear(coord: { lat: number; lng: number }): MainRoadPickup[] {
  const zone = zoneOf(coord.lat, coord.lng);
  return mainRoadPickups
    .filter((p) => p.zoneId === zone.id)
    .sort((a, b) => dist2(a, coord) - dist2(b, coord));
}

export function getPickup(id: string | null | undefined) {
  return mainRoadPickups.find((p) => p.id === id) ?? null;
}
