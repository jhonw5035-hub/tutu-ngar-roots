import * as React from "react";

/**
 * Lightweight app-wide language switching (English / Burmese).
 *
 * Deliberately not a full i18n framework: a flat key → string dictionary per
 * language, a `t()` lookup, and localStorage persistence. Keys missing from
 * Burmese fall back to English, so partial coverage is safe.
 */
export type Lang = "en" | "my";

const en = {
  // Header / nav
  passenger: "Passenger",
  driver: "Driver",
  admin: "Admin",
  home: "Home",
  trips: "Trips",
  profile: "Profile",
  earnings: "Earnings",
  language: "Language",
  english: "English",
  burmese: "Burmese",
  logOut: "Log out",

  // Home
  whereAreYouGoing: "Where are you going?",
  pickupPoint: "Pickup point",
  destination: "Destination",
  orChooseFixedRoute: "Or choose a fixed route",
  fixedRouteSubtext:
    "Tu Tu Ngar runs on fixed shared routes — pick one to see available rides instantly.",
  fixedRoute: "Fixed route",
  seeAvailableRides: "See available rides",
  whenAreYouTravelling: "When are you travelling?",
  today: "Today",
  tomorrow: "Tomorrow",
  findSharedRides: "Find Shared Rides",

  // Rides / booking
  availableSharedRides: "Available Shared Rides",
  noRidesYet: "No shared rides on this route yet",
  seatsLeft: "seats left",
  perSeat: "per seat",
  confirmAndPay: "Confirm & Pay",
  tripInProgress: "Trip in progress",

  // Auth
  logIn: "Log In",
  signUp: "Sign Up",
  email: "Email",
  password: "Password",
  fullName: "Full name",
  phoneNumber: "Phone number",
  createAccount: "Create account",
  alreadyHaveAccount: "Already have an account?",
  noAccountYet: "Don't have an account?",

  // Driver
  online: "Online",
  offline: "Offline",
  goOnline: "GO ONLINE",
  goOffline: "GO OFFLINE",
  todaysEarnings: "Today's earnings",

  // Home greeting pair
  welcomeToApp: "Welcome to Tu Tu Ngar App",
  popularRoutes: "Popular Routes",
  tapDestinationHint: "Tap a destination to see available shared rides.",
  preBooking: "Pre-Booking",
  preBookingDesc: "Book your seat at least 2 hours in advance",
  liveMode: "Live Mode",
  liveModeDesc: "Find a shared ride nearby, departing soon · book 5–15 min before",

  // Role select / account menu
  welcomeTitle: "Welcome to Tu Tu Ngar",
  chooseHowContinue: "Choose how you'd like to continue",
  continueAsPassenger: "Continue as Passenger",
  continueAsDriver: "Continue as Driver",
  continueAsAdmin: "Continue as Admin",
  viewProfile: "View profile",
  settings: "Settings",
  notifications: "Notifications",
  accountMenu: "Account menu",
  signedInAs: "Signed in as",
  notSignedIn: "Not signed in",
  back: "Back",

  // Ride flow (Pre-Booking / Live Mode)
  whereToGo: "Where to go?",
  pickDepartureTime: "Pick a departure time",
  ridersOnYourRoute: "Riders on your route",
  findingSharedRiders: "Finding shared riders",
  payment: "Payment",
  bookingConfirmed: "Booking confirmed",
  driverOnTheWay: "Driver on the way",
  searchPlacePlaceholder: "Search a place — e.g. Hledan Junction",
  whereToPlaceholder: "Where to — e.g. Sule Square",
  continueLabel: "Continue",
  pickBothPlacesHint: "Pick both places from the suggestions to continue.",
  twoHourHint: "Book at least 2 hours in advance — earlier times are greyed out.",
  seeMatchedRiders: "See matched riders",
  findingRidersRoute: "Finding other riders on your route…",
  findingRidersNearby: "Finding shared riders near you…",
  searchingRadiusHint: "Searching within 1.5 km for riders heading your way",
  alreadyBookedOn: "Already booked on",
  matchedRidersNearby: "Matched! These riders nearby are heading the same direction.",
  joinThisRide: "Join this ride",
  paymentMethod: "Payment method",
  demoPaymentHint: "Demo only — no real payment is taken.",
  pay: "Pay",
  withMethod: "with",
  at: "at",
  driverWillPickUpAt: "Your driver will pick you up at",
  yourTime: "your time",
  notify10Min: "We'll notify you 10 minutes before your driver arrives.",
  backToHome: "Back to home",
  fixedRateForRoute: "Fixed rate for this route",
  plate: "Plate",
  paid: "Paid",
  driverHeadingTo: "Driver heading to",
} satisfies Record<string, string>;

export type TranslationKey = keyof typeof en;

const my: Partial<Record<TranslationKey, string>> = {
  passenger: "ခရီးသည်",
  driver: "ယာဉ်မောင်း",
  admin: "စီမံခန့်ခွဲသူ",
  home: "ပင်မ",
  trips: "ခရီးစဉ်များ",
  profile: "ကိုယ်ရေးအချက်အလက်",
  earnings: "ဝင်ငွေ",
  language: "ဘာသာစကား",
  english: "အင်္ဂလိပ်",
  burmese: "မြန်မာ",
  logOut: "ထွက်ရန်",

  whereAreYouGoing: "ဘယ်ကိုသွားမလဲ?",
  pickupPoint: "ကြိုဆိုမည့်နေရာ",
  destination: "သွားလိုသည့်နေရာ",
  orChooseFixedRoute: "သို့မဟုတ် သတ်မှတ်လမ်းကြောင်း ရွေးပါ",
  fixedRouteSubtext:
    "တူတူငှားသည် သတ်မှတ်ထားသော မျှဝေလမ်းကြောင်းများဖြင့် ပြေးဆွဲသည် — တစ်ခုရွေးပြီး ခရီးစဉ်များကို ချက်ချင်းကြည့်ပါ။",
  fixedRoute: "သတ်မှတ်လမ်းကြောင်း",
  seeAvailableRides: "ရရှိနိုင်သည့် ခရီးစဉ်များ ကြည့်ရန်",
  whenAreYouTravelling: "ဘယ်အချိန်သွားမလဲ?",
  today: "ယနေ့",
  tomorrow: "မနက်ဖြန်",
  findSharedRides: "မျှဝေခရီးစဉ် ရှာရန်",

  availableSharedRides: "ရရှိနိုင်သည့် မျှဝေခရီးစဉ်များ",
  noRidesYet: "ဤလမ်းကြောင်းတွင် မျှဝေခရီးစဉ် မရှိသေးပါ",
  seatsLeft: "နေရာလွတ်",
  perSeat: "တစ်နေရာလျှင်",
  confirmAndPay: "အတည်ပြု၍ ငွေပေးရန်",
  tripInProgress: "ခရီးစဉ် လုပ်ဆောင်ဆဲ",

  logIn: "ဝင်ရောက်ရန်",
  signUp: "အကောင့်ဖွင့်ရန်",
  email: "အီးမေးလ်",
  password: "စကားဝှက်",
  fullName: "အမည်အပြည့်အစုံ",
  phoneNumber: "ဖုန်းနံပါတ်",
  createAccount: "အကောင့်ဖွင့်ရန်",
  alreadyHaveAccount: "အကောင့်ရှိပြီးသားလား?",
  noAccountYet: "အကောင့်မရှိသေးဘူးလား?",

  online: "အွန်လိုင်း",
  offline: "အော့ဖ်လိုင်း",
  goOnline: "အွန်လိုင်းဝင်ရန်",
  goOffline: "အော့ဖ်လိုင်းသွားရန်",
  todaysEarnings: "ယနေ့ ဝင်ငွေ",

  welcomeToApp: "တူတူငှား အက်ပ်သို့ ကြိုဆိုပါသည်",
  popularRoutes: "လူကြိုက်များသော လမ်းကြောင်းများ",
  tapDestinationHint: "သွားလိုရာနေရာကို နှိပ်ပြီး ရရှိနိုင်သည့် မျှဝေခရီးစဉ်များ ကြည့်ပါ။",
  preBooking: "ကြိုတင်စီစဉ်မှု",
  preBookingDesc: "အနည်းဆုံး ၂ နာရီအကြို ကိုယ့်နေရာ ကြိုစီစဉ်ပါ",
  liveMode: "တိုက်ရိုက် ရှာဖွေမှု",
  liveModeDesc: "အနီးနားရှိ မကြာမီ ထွက်ခွာမည့် မျှဝေခရီးစဉ် ရှာပါ · ထွက်ခွာခင် ၅–၁၅ မိနစ်အကြို စီစဉ်ပါ",

  welcomeTitle: "တူတူငှားမှ ကြိုဆိုပါသည်",
  chooseHowContinue: "ဆက်လက်ရန် နည်းလမ်းကို ရွေးပါ",
  continueAsPassenger: "ခရီးသည်အဖြစ် ဆက်လက်ရန်",
  continueAsDriver: "ယာဉ်မောင်းအဖြစ် ဆက်လက်ရန်",
  continueAsAdmin: "စီမံခန့်ခွဲသူအဖြစ် ဆက်လက်ရန်",
  viewProfile: "ကိုယ်ရေးအချက်အလက် ကြည့်ရန်",
  settings: "ဆက်တင်များ",
  notifications: "အသိပေးချက်များ",
  accountMenu: "အကောင့် မီနူး",
  signedInAs: "ဝင်ရောက်ထားသည့် အကောင့် -",
  notSignedIn: "မဝင်ရောက်ရသေးပါ",
  back: "နောက်သို့",

  whereToGo: "ဘယ်ကို သွားချင်ပါသလဲ?",
  pickDepartureTime: "ထွက်ခွာမည့် အချိန် ရွေးပါ",
  ridersOnYourRoute: "သင့်လမ်းကြောင်းပေါ်ရှိ ခရီးသည်များ",
  findingSharedRiders: "မျှဝေခရီးသည်များ ရှာဖွေနေပါသည်",
  payment: "ငွေပေးချေမှု",
  bookingConfirmed: "စီစဉ်မှု အတည်ပြုပြီးပါပြီ",
  driverOnTheWay: "ယာဉ်မောင်း လာနေပါပြီ",
  searchPlacePlaceholder: "နေရာ ရှာပါ — ဥပမာ လှည်းတန်း ဂျန်းရှင်",
  whereToPlaceholder: "ဘယ်ကို သွားမလဲ — ဥပမာ ဆူလေ စကွဲ",
  continueLabel: "ရှေ့ဆက်ရန်",
  pickBothPlacesHint: "ဆက်လက်ရန် နေရာနှစ်ခုလုံးကို အကြံပြုချက်များမှ ရွေးပါ။",
  twoHourHint: "အနည်းဆုံး ၂ နာရီအကြို စီစဉ်ပါ — စောသည့်အချိန်များကို ဖျော့ပြထားသည်။",
  seeMatchedRiders: "ကိုက်ညီသည့် ခရီးသည်များ ကြည့်ရန်",
  findingRidersRoute: "သင့်လမ်းကြောင်းပေါ်ရှိ ခရီးသည်များ ရှာနေပါသည်…",
  findingRidersNearby: "အနီးနားရှိ မျှဝေခရီးသည်များ ရှာနေပါသည်…",
  searchingRadiusHint: "သင့်ဘက်သို့ သွားနေသည့် ခရီးသည်များကို ၁.၅ ကီလိုမီတာအတွင်း ရှာဖွေပါသည်",
  alreadyBookedOn: "ကြိုတင်စာရင်းပေးထားပြီး -",
  matchedRidersNearby: "ကိုက်ညီပါပြီ! အနီးနားရှိ ခရီးသည်များ တစ်လမ်းတည်း သွားနေကြသည်။",
  joinThisRide: "ဤခရီးစဉ်တွင် ပါဝင်ရန်",
  paymentMethod: "ငွေပေးချေမှု နည်းလမ်း",
  demoPaymentHint: "ဒီမိုသာဖြစ်ပါသည် — ငွေအားလုံး မယူပါ။",
  pay: "ပေးချေမည်",
  withMethod: "ဖြင့်",
  at: "တွင်",
  driverWillPickUpAt: "ယာဉ်မောင်းသည် သင့်ကို ဤအချိန်တွင် ကြိုဆိုမည် -",
  yourTime: "သင်ရွေးထားသည့် အချိန်",
  notify10Min: "ယာဉ်မောင်း မရောက်လာမီ ၁၀ မိနစ်အကြို အသိပေးမည်။",
  backToHome: "ပင်မသို့ ပြန်ရန်",
  fixedRateForRoute: "ဤလမ်းကြောင်းအတွက် ပုံသေနှုန်း",
  plate: "ကားပလိတ်",
  paid: "ပေးချေပြီး",
  driverHeadingTo: "ယာဉ်မောင်း သွားနေသည့် နေရာ -",
};

const dictionaries: Record<Lang, Partial<Record<TranslationKey, string>>> = { en, my };

const STORAGE_KEY = "ttn:lang";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = React.createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default to English; hydrate the stored preference after mount so SSR and
  // the first client render agree.
  const [lang, setLangState] = React.useState<Lang>("en");

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "my") setLangState(stored);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const setLang = React.useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const value = React.useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang,
      t: (key) => dictionaries[lang][key] ?? en[key],
    }),
    [lang, setLang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = React.useContext(LanguageContext);
  // Safe fallback so components can render outside the provider (e.g. tests).
  return ctx ?? { lang: "en", setLang: () => undefined, t: (key) => en[key] };
}

/** Shorthand: `const t = useT()` then `t('findSharedRides')`. */
export function useT() {
  return useLanguage().t;
}
