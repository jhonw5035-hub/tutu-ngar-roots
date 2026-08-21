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
