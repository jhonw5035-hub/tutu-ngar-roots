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

  // Available rides
  yourArea: "Your area",
  downtownYangon: "Downtown Yangon",
  matchedCorridor: "Matched corridor:",
  findingPeopleGoingYourWay: "Finding people going your way…",
  nobodyBookedHint: "Nobody has booked this corridor for that window yet — try another departure window.",
  threeCorridorsHint:
    "We only run three corridors today: North Okkalapa ↔ Sule, Inya Road ↔ Sanchaung and North Okkalapa ↔ South Okkalapa.",
  changeSearch: "Change search",
  almostFull: "Almost full",
  seatsFilled: "seats filled",
  driverAssignedAt: "Driver assigned · pickup at",
  seatAvailable: "seat available",
  seatsAvailable: "seats available",
  viewRide: "View Ride",

  // Payment
  pleaseLogInAgain: "Please log in again to book a seat",
  locationUnavailable: "Location unavailable — using your selected pickup area",
  couldNotConfirm: "Could not confirm your booking",
  confirmYourRide: "Confirm your ride.",
  routeLabel: "Route",
  timeLabel: "Time",
  seatsLabel: "Seats",
  seat: "Seat",
  sharedRide: "Shared ride",
  total: "Total",
  scanPayHint: "Scan and pay with any Myanmar bank app",
  processingPayment: "Processing payment…",
  payAndBook: "Pay & Book Seat",
  pickupArea: "Pickup area",

  // Confirmation
  youreBooked: "🎉 You're booked!",
  seatHeldHint: "Your seat is held. Be at your stop five minutes early.",
  confirmedLabel: "Confirmed",
  departs: "Departs",
  pickup: "Pickup",
  driverLabel: "Driver",
  assignedDriver: "Assigned driver",
  matchedIntoGroup: "You've been matched into a shared group",
  meetingPoint: "Meeting point:",
  beingFinalised: "Being finalised",
  driverEta: "Driver ETA",
  passengersInGroup: "in this group",
  minorityGenderNote:
    "Heads up: you're the only passenger of your gender in this group. Tell us if you'd rather wait for the next departure.",
  matchingYouHint: "Matching you with nearby passengers… this screen updates automatically.",
  passengers: "passengers",
  liveBadge: "Live",
  markerUpdatesHint: "The driver marker updates live as they approach your pickup point.",
  shareMyTrip: "Share My Trip",
  viewDriverPickup: "View Driver & Pickup",
  tripLinkCopied: "Trip link copied — share it with someone you trust",
  couldntShare: "Couldn't share right now",
  inThisGroup: "in this group",
  yourStop: "Your stop",

  // Trips / chat / autocomplete
  myTripsTitle: "My Trips.",
  upcoming: "Upcoming",
  completed: "Completed",
  viewTrip: "View Trip",
  yesterday: "Yesterday",
  notRated: "Not rated",
  rateAria: "Rate this trip",
  findingYou: "Finding you…",
  useMyCurrentLocation: "Use my current location",
  noPlacesFound: "No places found for",
  seatsBooked: "seats booked",
  messageFailed: "Message failed to send",
  tripChat: "Trip chat",
  tripChatHint: "This chat is only available for this trip.",
  loadingMessages: "Loading messages…",
  noMessagesYet: "No messages yet — say hello to your group.",
  you: "You",
  rider: "Rider",
  messagePlaceholder: "Message your group…",
  send: "Send",

  // Ride details / trip in progress
  departureUnavailable: "That departure is no longer available.",
  backToSharedRides: "Back to shared rides",
  matchedAtDeparture: "Matched at departure",
  closestPickupHint: "Closest pickup point to your location",
  dropOff: "Drop-off",
  passengersHeading: "Passengers",
  seatsOccupied: "seats occupied",
  womenCount: "Women",
  menCount: "Men",
  womenOnlyAvailable: "women-only group available",
  driverVerified: "Driver verified",
  yourFare: "Your fare",
  preparingDemo: "Preparing demo trip…",
  checkingActiveTrip: "Checking for your active trip…",
  noActiveTrip:
    "You don't have an active grouped trip yet. Once your booking is grouped and a driver accepts, the live route appears here.",
  previewDemoTrip: "Preview Demo Trip",
  demoHint: "Instantly preview a live trip for demo purposes.",
  demoReady: "Demo trip ready — pickup at",
  couldNotStartDemo: "Could not start the demo trip",
  yourDriver: "Your driver",
  onTheWay: "On the way",
  headingTo: "Heading to",
  currentRoute: "Current route",
  advanceDemo: "Advance demo",
  yourDropOff: "Your drop-off",
  pickedUp: "Picked Up",
  droppedOff: "Dropped off",
  finalDestination: "Final destination",
  upcomingStop: "Upcoming stop",
  minUnit: "min",
  passengersOnboard: "Passengers onboard",
  navigateTo: "Navigate to",
  dropN: "Drop",
  accountTitle: "Account",
  guestPassenger: "Guest passenger",
  noPhoneOnFile: "No phone on file",
  couldNotUpdatePhoto: "Could not update your photo",
  photoUpdated: "Profile photo updated",
  save: "Save",
  cancel: "Cancel",
  yourMessageSent: "Your message has been sent to our team",
  couldNotSendMessage: "Could not send your message",
  contactSupport: "Contact Support",
  contactSupportSub: "Message the Tu Tu Ngar team directly about anything.",
  tellUsPlaceholder: "Tell us what's going on…",
  yourMessages: "Your messages",
  teamReplyLabel: "Tu Tu Ngar team:",
  introTagline: "Shared rides across Yangon — booked ahead, priced upfront, and safer together.",
  getStarted: "Get Started",
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

  yourArea: "သင့်နေရာ",
  downtownYangon: "ရန်ကုန် မြို့လယ်",
  matchedCorridor: "ကိုက်ညီသည့် လမ်းကြောင်း -",
  findingPeopleGoingYourWay: "သင့်ဘက်သို့ သွားနေသည့် ခရီးသည်များ ရှာနေပါသည်…",
  nobodyBookedHint: "ထိုအချိန်အတွက် ဤလမ်းကြောင်းတွင် မည်သူမှ ကြိုစီစဉ်ထားခြင်း မရှိသေးပါ — အချိန်အခြားတစ်ခု စမ်းကြည့်ပါ။",
  threeCorridorsHint:
    "ယနေ့ လမ်းကြောင်း သုံးခုသာ ပြေးဆွဲပါသည် - မြောက်ဥက္ကလာ ↔ ဆူလေ၊ အင်းယားလမ်း ↔ စမ်းချောင်း နှင့် မြောက်ဥက္ကလာ ↔ တောင်ဥက္ကလာ။",
  changeSearch: "ရှာဖွေမှု ပြောင်းရန်",
  almostFull: "နေရာ ပြည့်နီးပါး",
  seatsFilled: "နေရာ ပြည့်",
  driverAssignedAt: "ယာဉ်မောင်း သတ်မှတ်ပြီး · ကြိုဆိုမည့်နေရာ -",
  seatAvailable: "နေရာ လွတ်",
  seatsAvailable: "နေရာလွတ်များ",
  viewRide: "ခရီးစဉ် ကြည့်ရန်",

  pleaseLogInAgain: "နေရာစီစဉ်ရန် ထပ်မံ ဝင်ရောက်ပါ",
  locationUnavailable: "တည်နေရာ မရနိုင်ပါ — သင်ရွေးထားသည့် ကြိုဆိုမည့်နေရာကို အသုံးပြုပါမည်",
  couldNotConfirm: "စီစဉ်မှု အတည်မပြုနိုင်ပါ",
  confirmYourRide: "ခရီးစဉ်ကို အတည်ပြုပါ။",
  routeLabel: "လမ်းကြောင်း",
  timeLabel: "အချိန်",
  seatsLabel: "နေရာများ",
  seat: "နေရာ",
  sharedRide: "မျှဝေခရီးစဉ်",
  total: "စုစုပေါင်း",
  scanPayHint: "မြန်မာဘဏ်အက်ပ်ဖြင့် စကန်ဖတ်ကာ ပေးချေပါ",
  processingPayment: "ငွေပေးချေမှု လုပ်ဆောင်နေပါသည်…",
  payAndBook: "ငွေပေးပြီး နေရာစီစဉ်မည်",
  pickupArea: "ကြိုဆိုမည့်နေရာ",

  youreBooked: "🎉 နေရာရရှိပါပြီ!",
  seatHeldHint: "သင့်နေရာကို သီးသန့်ထားပြီးပါပြီ။ အချိန်မှီ ၅ မိနစ်အလို ရောက်ရှိပါ။",
  confirmedLabel: "အတည်ပြုပြီး",
  departs: "ထွက်ခွာချိန် -",
  pickup: "ကြိုဆိုမည့်နေရာ",
  driverLabel: "ယာဉ်မောင်း",
  assignedDriver: "သတ်မှတ်ပေးထားသည့် ယာဉ်မောင်း",
  matchedIntoGroup: "မျှဝေအဖွဲ့တစ်ခုတွင် ထည့်သွင်းပေးလိုက်ပါပြီ",
  meetingPoint: "တွေ့ဆုံမည့်နေရာ -",
  beingFinalised: "အတည်ဖြစ်အောင် လုပ်ဆောင်နေပါသည်",
  driverEta: "ယာဉ်မောင်း ရောက်ရှိချိန်",
  passengersInGroup: "ယောက် ဤအဖွဲ့တွင် ရှိသည်",
  minorityGenderNote:
    "သတိပြုပါ - ဤအဖွဲ့တွင် သင့်လိင်တူ ခရီးသည် တစ်ယောက်တည်း ဖြစ်နေပါသည်။ နောက်ထွက်ခွာချိန်ကို စောင့်လိုပါက ကျွန်ုပ်တို့အား ပြောပါ။",
  matchingYouHint: "အနီးနားရှိ ခရီးသည်များနှင့် ကိုက်ညီအောင် လုပ်ဆောင်နေပါသည်… ဤမျက်နှာပြင်သည် အလိုအလျောက် ပြောင်းလဲပါမည်။",
  passengers: "ခရီးသည်",
  liveBadge: "တိုက်ရိုက်",
  markerUpdatesHint: "ယာဉ်မောင်း သင့်ထံ ချဉ်းကပ်လာသည်နှင့်အမျှ မှတ်သားချက်သည် တိုက်ရိုက် ပြောင်းလဲနေပါမည်။",
  shareMyTrip: "ကျွန်ုပ်၏ ခရီးစဉ်ကို မျှဝေမည်",
  viewDriverPickup: "ယာဉ်မောင်းနှင့် ကြိုဆိုမည့်နေရာ ကြည့်ရန်",
  tripLinkCopied: "ခရီးစဉ်လင့်ခ် ကော်ပီကူးပြီးပါပြီ — ယုံကြည်ရသူတစ်ဦးကို မျှဝေပါ",
  couldntShare: "မျှဝေ၍ မရပါ",
  inThisGroup: "ဤအဖွဲ့တွင် ရှိသည်",
  yourStop: "သင့်ဘူတာ",

  myTripsTitle: "ကျွန်ုပ်၏ ခရီးစဉ်များ။",
  upcoming: "လာမည့် ခရီးစဉ်",
  completed: "ပြီးစီးသော ခရီးစဉ်များ",
  viewTrip: "ခရီးစဉ် ကြည့်ရန်",
  yesterday: "မနေ့",
  notRated: "အဆင့်သတ်မှတ်ခြင်း မရှိပါ",
  rateAria: "ဤခရီးစဉ်ကို အဆင့်သတ်မှတ်ရန်",
  findingYou: "သင့်ကို ရှာနေပါသည်…",
  useMyCurrentLocation: "လက်ရှိတည်နေရာကို အသုံးပြုမည်",
  noPlacesFound: "နေရာ မတွေ့ပါ -",
  seatsBooked: "နေရာ စီစဉ်ပြီး",
  messageFailed: "မက်ဆေ့ပို့ရန် မအောင်မြင်ပါ",
  tripChat: "ခရီးစဉ် စကားဝိုင်း",
  tripChatHint: "ဤစကားဝိုင်းသည် ဤခရီးစဉ်အတွက်သာ ဖြစ်ပါသည်။",
  loadingMessages: "မက်ဆေ့များ ဖွင့်နေပါသည်…",
  noMessagesYet: "မက်ဆေ့ မရှိသေးပါ — အဖွဲ့ကို နှုတ်ဆက်ပါ။",
  you: "သင်",
  rider: "ခရီးသည်",
  messagePlaceholder: "အဖွဲ့ကို မက်ဆေ့ပို့ပါ…",
  send: "ပို့မည်",

  departureUnavailable: "ထိုခရီးစဉ် ရရှိနိုင်တော့မည် မဟုတ်ပါ။",
  backToSharedRides: "မျှဝေခရီးစဉ်များသို့ ပြန်ရန်",
  matchedAtDeparture: "ထွက်ခွာချိန်တွင် ကိုက်ညီပါသည်",
  closestPickupHint: "သင့်တည်နေရာနှင့် အနီးဆုံး ကြိုဆိုမည့်နေရာ",
  dropOff: "ဆင်းမည့်နေရာ",
  passengersHeading: "ခရီးသည်များ",
  seatsOccupied: "နေရာ ပြည့်နေပြီ",
  womenCount: "အမျိုးသမီး",
  menCount: "အမျိုးသား",
  womenOnlyAvailable: "အမျိုးသမီးသီးသန့် အဖွဲ့ ရနိုင်သည်",
  driverVerified: "ယာဉ်မောင်း စိစစ်ပြီး",
  yourFare: "သင်ပေးရမည့် ငွေ",
  preparingDemo: "ဒီမိုခရီးစဉ် ပြင်ဆင်နေပါသည်…",
  checkingActiveTrip: "သင့်လက်ရှိခရီးစဉ် စစ်ဆေးနေပါသည်…",
  noActiveTrip:
    "အဖွဲ့ဝင် ခရီးစဉ် မရှိသေးပါ။ သင့်စီစဉ်မှုကို အဖွဲ့အဖြစ် စုစည်းပြီး ယာဉ်မောင်းက လက်ခံပါက တိုက်ရိုက်လမ်းကြောင်း ဤနေရာတွင် ပေါ်လာမည်။",
  previewDemoTrip: "ဒီမိုခရီးစဉ် ကြိုကြည့်ရန်",
  demoHint: "ဒီမိုအတွက် တိုက်ရိုက်ခရီးစဉ်ကို ချက်ချင်း ကြိုကြည့်ပါ။",
  demoReady: "ဒီမိုခရီးစဉ် အသင့်ဖြစ်ပြီ — ကြိုဆိုမည့်နေရာ -",
  couldNotStartDemo: "ဒီမိုခရီးစဉ် စတင်၍ မရပါ",
  yourDriver: "သင့်ယာဉ်မောင်း",
  onTheWay: "လာနေပါပြီ",
  headingTo: "သွားနေသည် -",
  currentRoute: "လက်ရှိလမ်းကြောင်း",
  advanceDemo: "ဒီမို ရှေ့ဆက်ရန်",
  yourDropOff: "သင်ဆင်းမည့်နေရာ",
  pickedUp: "စီးပြီး",
  droppedOff: "ဆင်းပြီး",
  finalDestination: "နောက်ဆုံး ဆင်းမည့်နေရာ",
  upcomingStop: "လာမည့် ဘူတာ",
  minUnit: "မိနစ်",
  passengersOnboard: "စီးနေသည့် ခရီးသည်များ",
  navigateTo: "လမ်းညွှန် -",
  dropN: "ဆင်းမည့်နေရာ",
  accountTitle: "အကောင့်",
  guestPassenger: "ဧည့်သည် ခရီးသည်",
  noPhoneOnFile: "ဖုန်းနံပါတ် မရှိပါ",
  couldNotUpdatePhoto: "ဓာတ်ပုံ ပြောင်းလဲ၍ မရပါ",
  photoUpdated: "ကိုယ်ရေးဓာတ်ပုံ မွမ်းမံပြီး",
  save: "သိမ်းမည်",
  cancel: "ပယ်ဖျက်",
  yourMessageSent: "သင့်မေးမြန်းမှု ကျွန်ုပ်တို့အသင်းသို့ ရောက်ပါပြီ",
  couldNotSendMessage: "မေးမြန်းမှု ပို့၍ မရပါ",
  contactSupport: "အကူအညီ တောင်းရန်",
  contactSupportSub: "မည်သည့်အကြောင်းအရာမဆို Tu Tu Ngar အသင်းကို တိုက်ရိုက်မေးပါ။",
  tellUsPlaceholder: "ဖြစ်ပျက်နေသည်များကို ပြောပါ…",
  yourMessages: "သင့်မေးမြန်းမှုများ",
  teamReplyLabel: "Tu Tu Ngar အသင်း -",
  introTagline:
    "ရန်ကုန်တစ်ဝိုက် မျှဝေခရီးစဉ်များ — ကြိုစီစဉ်ပြီး ကြိုတွက်ထားသော ဈေးနှုန်းဖြင့် အတူစီးလျှင် ပိုစိတ်ချရသည်။",
  getStarted: "စတင်ရန်",
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
