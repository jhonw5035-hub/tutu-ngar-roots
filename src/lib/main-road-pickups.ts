/**
 * Designated main-road pickup points. Passengers are never collected inside
 * residential streets. Every coordinate below is an actual OpenStreetMap node
 * on the road's centerline (trunk/primary/secondary ways), sampled roughly
 * every 650 m along each road so every area has a point close by.
 */
export type MainRoadPickup = {
  id: string;
  name: string;
  nameMy: string;
  lat: number;
  lng: number;
};

export type NearbyPickup = MainRoadPickup & { distanceM: number; walkMin: number };

/** Only suggest points within this walking radius. */
export const PICKUP_RADIUS_M = 800;
/** Average walking speed, metres per minute (~4.8 km/h). */
const WALK_M_PER_MIN = 80;

export const mainRoadPickups: MainRoadPickup[] = [
  { id: "mr-strand-0", name: "Strand Road", nameMy: "ကမ်းနားလမ်း", lat: 16.769045, lng: 96.166935 },
  { id: "mr-strand-1", name: "Strand Road", nameMy: "ကမ်းနားလမ်း", lat: 16.769087, lng: 96.180648 },
  { id: "mr-strand-2", name: "Strand Road", nameMy: "ကမ်းနားလမ်း", lat: 16.769294, lng: 96.174459 },
  { id: "mr-strand-3", name: "Strand Road", nameMy: "ကမ်းနားလမ်း", lat: 16.769485, lng: 96.160671 },
  { id: "mr-strand-4", name: "Strand Road", nameMy: "ကမ်းနားလမ်း", lat: 16.771417, lng: 96.154844 },
  { id: "mr-strand-5", name: "Strand Road", nameMy: "ကမ်းနားလမ်း", lat: 16.772183, lng: 96.148477 },
  { id: "mr-strand-6", name: "Strand Road", nameMy: "ကမ်းနားလမ်း", lat: 16.774408, lng: 96.142559 },
  { id: "mr-strand-7", name: "Strand Road", nameMy: "ကမ်းနားလမ်း", lat: 16.777406, lng: 96.136642 },
  { id: "mr-maha-bandula-8", name: "Mahabandoola Road", nameMy: "မဟာဗန္ဓုလလမ်း", lat: 16.773591, lng: 96.178646 },
  { id: "mr-maha-bandula-9", name: "Mahabandoola Road", nameMy: "မဟာဗန္ဓုလလမ်း", lat: 16.773879, lng: 96.172509 },
  { id: "mr-maha-bandula-10", name: "Mahabandoola Road", nameMy: "မဟာဗန္ဓုလလမ်း", lat: 16.774095, lng: 96.166206 },
  { id: "mr-maha-bandula-11", name: "Mahabandoola Road", nameMy: "မဟာဗန္ဓုလလမ်း", lat: 16.774251, lng: 96.159287 },
  { id: "mr-maha-bandula-12", name: "Mahabandoola Road", nameMy: "မဟာဗန္ဓုလလမ်း", lat: 16.774528, lng: 96.153135 },
  { id: "mr-maha-bandula-13", name: "Mahabandoola Road", nameMy: "မဟာဗန္ဓုလလမ်း", lat: 16.774742, lng: 96.146669 },
  { id: "mr-maha-bandula-14", name: "Mahabandoola Road", nameMy: "မဟာဗန္ဓုလလမ်း", lat: 16.781009, lng: 96.185169 },
  { id: "mr-waizayandar-15", name: "Waizayandar Road", nameMy: "ဝေဇယန္တာလမ်း", lat: 16.808907, lng: 96.192457 },
  { id: "mr-waizayandar-16", name: "Waizayandar Road", nameMy: "ဝေဇယန္တာလမ်း", lat: 16.814752, lng: 96.190669 },
  { id: "mr-waizayandar-17", name: "Waizayandar Road", nameMy: "ဝေဇယန္တာလမ်း", lat: 16.819164, lng: 96.185713 },
  { id: "mr-waizayandar-18", name: "Waizayandar Road", nameMy: "ဝေဇယန္တာလမ်း", lat: 16.823279, lng: 96.181268 },
  { id: "mr-waizayandar-19", name: "Waizayandar Road", nameMy: "ဝေဇယန္တာလမ်း", lat: 16.829575, lng: 96.179652 },
  { id: "mr-waizayandar-20", name: "Waizayandar Road", nameMy: "ဝေဇယန္တာလမ်း", lat: 16.83529, lng: 96.177243 },
  { id: "mr-waizayandar-21", name: "Waizayandar Road", nameMy: "ဝေဇယန္တာလမ်း", lat: 16.840546, lng: 96.173807 },
  { id: "mr-waizayandar-22", name: "Waizayandar Road", nameMy: "ဝေဇယန္တာလမ်း", lat: 16.845615, lng: 96.170449 },
  { id: "mr-waizayandar-23", name: "Waizayandar Road", nameMy: "ဝေဇယန္တာလမ်း", lat: 16.851405, lng: 96.167469 },
  { id: "mr-waizayandar-24", name: "Waizayandar Road", nameMy: "ဝေဇယန္တာလမ်း", lat: 16.859514, lng: 96.162686 },
  { id: "mr-waizayandar-25", name: "Waizayandar Road", nameMy: "ဝေဇယန္တာလမ်း", lat: 16.864473, lng: 96.159394 },
  { id: "mr-lay-daungkan-26", name: "Lay Daungkan Road", nameMy: "လေးထောင့်ကန်လမ်း", lat: 16.819802, lng: 96.178911 },
  { id: "mr-lay-daungkan-27", name: "Lay Daungkan Road", nameMy: "လေးထောင့်ကန်လမ်း", lat: 16.820356, lng: 96.172271 },
  { id: "mr-lay-daungkan-28", name: "Lay Daungkan Road", nameMy: "လေးထောင့်ကန်လမ်း", lat: 16.82331, lng: 96.183854 },
  { id: "mr-lay-daungkan-29", name: "Lay Daungkan Road", nameMy: "လေးထောင့်ကန်လမ်း", lat: 16.82783, lng: 96.187961 },
  { id: "mr-lay-daungkan-30", name: "Lay Daungkan Road", nameMy: "လေးထောင့်ကန်လမ်း", lat: 16.830892, lng: 96.193281 },
  { id: "mr-lay-daungkan-31", name: "Lay Daungkan Road", nameMy: "လေးထောင့်ကန်လမ်း", lat: 16.835556, lng: 96.197995 },
  { id: "mr-lay-daungkan-32", name: "Lay Daungkan Road", nameMy: "လေးထောင့်ကန်လမ်း", lat: 16.840172, lng: 96.202758 },
  { id: "mr-lay-daungkan-33", name: "Lay Daungkan Road", nameMy: "လေးထောင့်ကန်လမ်း", lat: 16.844157, lng: 96.207897 },
  { id: "mr-thu-dhamma-34", name: "Thudhamma Road", nameMy: "သုဓမ္မာလမ်း", lat: 16.869594, lng: 96.158009 },
  { id: "mr-thu-dhamma-35", name: "Thudhamma Road", nameMy: "သုဓမ္မာလမ်း", lat: 16.875337, lng: 96.156597 },
  { id: "mr-thu-dhamma-36", name: "Thudhamma Road", nameMy: "သုဓမ္မာလမ်း", lat: 16.881416, lng: 96.155482 },
  { id: "mr-thu-dhamma-37", name: "Thudhamma Road", nameMy: "သုဓမ္မာလမ်း", lat: 16.887256, lng: 96.154269 },
  { id: "mr-thu-dhamma-38", name: "Thudhamma Road", nameMy: "သုဓမ္မာလမ်း", lat: 16.893049, lng: 96.155334 },
  { id: "mr-thu-dhamma-39", name: "Thudhamma Road", nameMy: "သုဓမ္မာလမ်း", lat: 16.897417, lng: 96.1604 },
  { id: "mr-thu-dhamma-40", name: "Thudhamma Road", nameMy: "သုဓမ္မာလမ်း", lat: 16.901972, lng: 96.164652 },
  { id: "mr-thu-dhamma-41", name: "Thudhamma Road", nameMy: "သုဓမ္မာလမ်း", lat: 16.908083, lng: 96.166231 },
  { id: "mr-thu-dhamma-42", name: "Thudhamma Road", nameMy: "သုဓမ္မာလမ်း", lat: 16.914643, lng: 96.164695 },
  { id: "mr-thu-dhamma-43", name: "Thudhamma Road", nameMy: "သုဓမ္မာလမ်း", lat: 16.920137, lng: 96.162144 },
  { id: "mr-thu-dhamma-44", name: "Thudhamma Road", nameMy: "သုဓမ္မာလမ်း", lat: 16.924302, lng: 96.157831 },
  { id: "mr-sule-pagoda-45", name: "Sule Pagoda Road", nameMy: "ဆူးလေဘုရားလမ်း", lat: 16.770371, lng: 96.158585 },
  { id: "mr-sule-pagoda-46", name: "Sule Pagoda Road", nameMy: "ဆူးလေဘုရားလမ်း", lat: 16.776519, lng: 96.158883 },
  { id: "mr-bargayar-47", name: "Bargayar Road", nameMy: "ဗားကရာလမ်း", lat: 16.803726, lng: 96.135659 },
  { id: "mr-bargayar-48", name: "Bargayar Road", nameMy: "ဗားကရာလမ်း", lat: 16.803819, lng: 96.122904 },
  { id: "mr-insein-49", name: "Insein Road", nameMy: "အင်းစိန်လမ်း", lat: 16.826466, lng: 96.130644 },
  { id: "mr-insein-50", name: "Insein Road", nameMy: "အင်းစိန်လမ်း", lat: 16.832235, lng: 96.129268 },
  { id: "mr-insein-51", name: "Insein Road", nameMy: "အင်းစိန်လမ်း", lat: 16.83822, lng: 96.127379 },
  { id: "mr-insein-52", name: "Insein Road", nameMy: "အင်းစိန်လမ်း", lat: 16.844272, lng: 96.125986 },
  { id: "mr-insein-53", name: "Insein Road", nameMy: "အင်းစိန်လမ်း", lat: 16.850313, lng: 96.124619 },
  { id: "mr-insein-54", name: "Insein Road", nameMy: "အင်းစိန်လမ်း", lat: 16.85624, lng: 96.123692 },
  { id: "mr-insein-55", name: "Insein Road", nameMy: "အင်းစိန်လမ်း", lat: 16.861919, lng: 96.121859 },
  { id: "mr-insein-56", name: "Insein Road", nameMy: "အင်းစိန်လမ်း", lat: 16.867684, lng: 96.120099 },
  { id: "mr-insein-57", name: "Insein Road", nameMy: "အင်းစိန်လမ်း", lat: 16.873099, lng: 96.117645 },
  { id: "mr-insein-58", name: "Insein Road", nameMy: "အင်းစိန်လမ်း", lat: 16.877489, lng: 96.113326 },
  { id: "mr-insein-59", name: "Insein Road", nameMy: "အင်းစိန်လမ်း", lat: 16.882925, lng: 96.110818 },
  { id: "mr-insein-60", name: "Insein Road", nameMy: "အင်းစိန်လမ်း", lat: 16.887906, lng: 96.10754 },
  { id: "mr-insein-61", name: "Insein Road", nameMy: "အင်းစိန်လမ်း", lat: 16.89933, lng: 96.105881 },
  { id: "mr-insein-62", name: "Insein Road", nameMy: "အင်းစိန်လမ်း", lat: 16.900655, lng: 96.097165 },
  { id: "mr-inya-63", name: "Inya Road", nameMy: "အင်းလျားလမ်း", lat: 16.806209, lng: 96.145533 },
  { id: "mr-inya-64", name: "Inya Road", nameMy: "အင်းလျားလမ်း", lat: 16.811465, lng: 96.142681 },
  { id: "mr-inya-65", name: "Inya Road", nameMy: "အင်းလျားလမ်း", lat: 16.816386, lng: 96.139141 },
  { id: "mr-inya-66", name: "Inya Road", nameMy: "အင်းလျားလမ်း", lat: 16.822562, lng: 96.139035 },
  { id: "mr-inya-67", name: "Inya Road", nameMy: "အင်းလျားလမ်း", lat: 16.828408, lng: 96.139542 },
  { id: "mr-inya-68", name: "Inya Road", nameMy: "အင်းလျားလမ်း", lat: 16.833661, lng: 96.136636 },
  { id: "mr-parami-69", name: "Parami Road", nameMy: "ပါရမီလမ်း", lat: 16.84995, lng: 96.156655 },
  { id: "mr-parami-70", name: "Parami Road", nameMy: "ပါရမီလမ်း", lat: 16.851085, lng: 96.162745 },
  { id: "mr-parami-71", name: "Parami Road", nameMy: "ပါရမီလမ်း", lat: 16.851532, lng: 96.150729 },
  { id: "mr-parami-72", name: "Parami Road", nameMy: "ပါရမီလမ်း", lat: 16.853239, lng: 96.14197 },
  { id: "mr-parami-73", name: "Parami Road", nameMy: "ပါရမီလမ်း", lat: 16.854022, lng: 96.168233 },
  { id: "mr-parami-74", name: "Parami Road", nameMy: "ပါရမီလမ်း", lat: 16.854396, lng: 96.135976 },
  { id: "mr-parami-75", name: "Parami Road", nameMy: "ပါရမီလမ်း", lat: 16.854844, lng: 96.108324 },
  { id: "mr-parami-76", name: "Parami Road", nameMy: "ပါရမီလမ်း", lat: 16.856402, lng: 96.11447 },
  { id: "mr-parami-77", name: "Parami Road", nameMy: "ပါရမီလမ်း", lat: 16.857119, lng: 96.130501 },
  { id: "mr-parami-78", name: "Parami Road", nameMy: "ပါရမီလမ်း", lat: 16.857418, lng: 96.123482 },
  { id: "mr-parami-79", name: "Parami Road", nameMy: "ပါရမီလမ်း", lat: 16.857646, lng: 96.174113 },
  { id: "mr-parami-80", name: "Parami Road", nameMy: "ပါရမီလမ်း", lat: 16.86431, lng: 96.180452 },
  { id: "mr-natmauk-81", name: "Natmauk Road", nameMy: "နတ်မောက်လမ်း", lat: 16.795592, lng: 96.171707 },
  { id: "mr-natmauk-82", name: "Natmauk Road", nameMy: "နတ်မောက်လမ်း", lat: 16.79996, lng: 96.164141 },
  { id: "mr-baho-83", name: "Baho Road", nameMy: "ဗဟိုလမ်း", lat: 16.786357, lng: 96.133962 },
  { id: "mr-baho-84", name: "Baho Road", nameMy: "ဗဟိုလမ်း", lat: 16.792529, lng: 96.13255 },
  { id: "mr-baho-85", name: "Baho Road", nameMy: "ဗဟိုလမ်း", lat: 16.798316, lng: 96.130937 },
  { id: "mr-baho-86", name: "Baho Road", nameMy: "ဗဟိုလမ်း", lat: 16.80452, lng: 96.129895 },
  { id: "mr-baho-87", name: "Baho Road", nameMy: "ဗဟိုလမ်း", lat: 16.810316, lng: 96.129074 },
  { id: "mr-baho-88", name: "Baho Road", nameMy: "ဗဟိုလမ်း", lat: 16.815621, lng: 96.12642 },
  { id: "mr-baho-89", name: "Baho Road", nameMy: "ဗဟိုလမ်း", lat: 16.821612, lng: 96.125994 },
  { id: "mr-baho-90", name: "Baho Road", nameMy: "ဗဟိုလမ်း", lat: 16.828328, lng: 96.124436 },
  { id: "mr-baho-91", name: "Baho Road", nameMy: "ဗဟိုလမ်း", lat: 16.833793, lng: 96.122083 },
  { id: "mr-baho-92", name: "Baho Road", nameMy: "ဗဟိုလမ်း", lat: 16.840091, lng: 96.120401 },
  { id: "mr-baho-93", name: "Baho Road", nameMy: "ဗဟိုလမ်း", lat: 16.84635, lng: 96.118725 },
  { id: "mr-baho-94", name: "Baho Road", nameMy: "ဗဟိုလမ်း", lat: 16.852119, lng: 96.11721 },
  { id: "mr-baho-95", name: "Baho Road", nameMy: "ဗဟိုလမ်း", lat: 16.858035, lng: 96.11561 },
  { id: "mr-baho-96", name: "Baho Road", nameMy: "ဗဟိုလမ်း", lat: 16.864297, lng: 96.11397 },
  { id: "mr-baho-97", name: "Baho Road", nameMy: "ဗဟိုလမ်း", lat: 16.870294, lng: 96.112403 },
  { id: "mr-baho-98", name: "Baho Road", nameMy: "ဗဟိုလမ်း", lat: 16.876382, lng: 96.111875 },
  { id: "mr-baho-99", name: "Baho Road", nameMy: "ဗဟိုလမ်း", lat: 16.883063, lng: 96.109676 },
  { id: "mr-anawrahta-100", name: "Anawrahta Road", nameMy: "အနော်ရထာလမ်း", lat: 16.776304, lng: 96.175471 },
  { id: "mr-anawrahta-101", name: "Anawrahta Road", nameMy: "အနော်ရထာလမ်း", lat: 16.77652, lng: 96.168886 },
  { id: "mr-anawrahta-102", name: "Anawrahta Road", nameMy: "အနော်ရထာလမ်း", lat: 16.776717, lng: 96.162728 },
  { id: "mr-anawrahta-103", name: "Anawrahta Road", nameMy: "အနော်ရထာလမ်း", lat: 16.776936, lng: 96.156484 },
  { id: "mr-anawrahta-104", name: "Anawrahta Road", nameMy: "အနော်ရထာလမ်း", lat: 16.777161, lng: 96.149959 },
  { id: "mr-anawrahta-105", name: "Anawrahta Road", nameMy: "အနော်ရထာလမ်း", lat: 16.777375, lng: 96.143564 },
  { id: "mr-anawrahta-106", name: "Anawrahta Road", nameMy: "အနော်ရထာလမ်း", lat: 16.777445, lng: 96.136691 },
  { id: "mr-anawrahta-107", name: "Anawrahta Road", nameMy: "အနော်ရထာလမ်း", lat: 16.871385, lng: 96.225108 },
  { id: "mr-anawrahta-108", name: "Anawrahta Road", nameMy: "အနော်ရထာလမ်း", lat: 16.874782, lng: 96.220004 },
  { id: "mr-anawrahta-109", name: "Anawrahta Road", nameMy: "အနော်ရထာလမ်း", lat: 16.877946, lng: 96.213426 },
  { id: "mr-anawrahta-110", name: "Anawrahta Road", nameMy: "အနော်ရထာလမ်း", lat: 16.880994, lng: 96.206359 },
  { id: "mr-anawrahta-111", name: "Anawrahta Road", nameMy: "အနော်ရထာလမ်း", lat: 16.885482, lng: 96.201705 },
  { id: "mr-anawrahta-112", name: "Anawrahta Road", nameMy: "အနော်ရထာလမ်း", lat: 16.890868, lng: 96.198744 },
  { id: "mr-anawrahta-113", name: "Anawrahta Road", nameMy: "အနော်ရထာလမ်း", lat: 16.896144, lng: 96.195827 },
  { id: "mr-anawrahta-114", name: "Anawrahta Road", nameMy: "အနော်ရထာလမ်း", lat: 16.902235, lng: 96.192431 },
  { id: "mr-anawrahta-115", name: "Anawrahta Road", nameMy: "အနော်ရထာလမ်း", lat: 16.907729, lng: 96.189314 },
  { id: "mr-shwe-gone-dine-116", name: "Shwegondaing Road", nameMy: "ရွှေဂုံတိုင်လမ်း", lat: 16.801431, lng: 96.144572 },
  { id: "mr-shwe-gone-dine-117", name: "Shwegondaing Road", nameMy: "ရွှေဂုံတိုင်လမ်း", lat: 16.804353, lng: 96.152128 },
  { id: "mr-shwe-gone-dine-118", name: "Shwegondaing Road", nameMy: "ရွှေဂုံတိုင်လမ်း", lat: 16.807597, lng: 96.157459 },
  { id: "mr-shwe-gone-dine-119", name: "Shwegondaing Road", nameMy: "ရွှေဂုံတိုင်လမ်း", lat: 16.810582, lng: 96.163151 },
  { id: "mr-shwe-gone-dine-120", name: "Shwegondaing Road", nameMy: "ရွှေဂုံတိုင်လမ်း", lat: 16.811502, lng: 96.170772 },
  { id: "mr-bogyoke-aung-san-121", name: "Bogyoke Aung San Road", nameMy: "ဗိုလ်ချုပ်အောင်ဆန်းလမ်း", lat: 16.778709, lng: 96.172495 },
  { id: "mr-bogyoke-aung-san-122", name: "Bogyoke Aung San Road", nameMy: "ဗိုလ်ချုပ်အောင်ဆန်းလမ်း", lat: 16.779013, lng: 96.166016 },
  { id: "mr-bogyoke-aung-san-123", name: "Bogyoke Aung San Road", nameMy: "ဗိုလ်ချုပ်အောင်ဆန်းလမ်း", lat: 16.779283, lng: 96.159593 },
  { id: "mr-bogyoke-aung-san-124", name: "Bogyoke Aung San Road", nameMy: "ဗိုလ်ချုပ်အောင်ဆန်းလမ်း", lat: 16.779506, lng: 96.153314 },
  { id: "mr-bogyoke-aung-san-125", name: "Bogyoke Aung San Road", nameMy: "ဗိုလ်ချုပ်အောင်ဆန်းလမ်း", lat: 16.77974, lng: 96.146815 },
  { id: "mr-bogyoke-aung-san-126", name: "Bogyoke Aung San Road", nameMy: "ဗိုလ်ချုပ်အောင်ဆန်းလမ်း", lat: 16.779983, lng: 96.140342 },
  { id: "mr-pyay-127", name: "Pyay Road", nameMy: "ပြည်လမ်း", lat: 16.779804, lng: 96.14504 },
  { id: "mr-pyay-128", name: "Pyay Road", nameMy: "ပြည်လမ်း", lat: 16.785367, lng: 96.142706 },
  { id: "mr-pyay-129", name: "Pyay Road", nameMy: "ပြည်လမ်း", lat: 16.791096, lng: 96.140906 },
  { id: "mr-pyay-130", name: "Pyay Road", nameMy: "ပြည်လမ်း", lat: 16.797534, lng: 96.138896 },
  { id: "mr-pyay-131", name: "Pyay Road", nameMy: "ပြည်လမ်း", lat: 16.803365, lng: 96.137336 },
  { id: "mr-pyay-132", name: "Pyay Road", nameMy: "ပြည်လမ်း", lat: 16.809196, lng: 96.135688 },
  { id: "mr-pyay-133", name: "Pyay Road", nameMy: "ပြည်လမ်း", lat: 16.815288, lng: 96.134019 },
  { id: "mr-pyay-134", name: "Pyay Road", nameMy: "ပြည်လမ်း", lat: 16.820941, lng: 96.132209 },
  { id: "mr-pyay-135", name: "Pyay Road", nameMy: "ပြည်လမ်း", lat: 16.826681, lng: 96.130872 },
  { id: "mr-pyay-136", name: "Pyay Road", nameMy: "ပြည်လမ်း", lat: 16.832919, lng: 96.132925 },
  { id: "mr-pyay-137", name: "Pyay Road", nameMy: "ပြည်လမ်း", lat: 16.838651, lng: 96.13452 },
  { id: "mr-pyay-138", name: "Pyay Road", nameMy: "ပြည်လမ်း", lat: 16.844415, lng: 96.135797 },
  { id: "mr-pyay-139", name: "Pyay Road", nameMy: "ပြည်လမ်း", lat: 16.849368, lng: 96.139365 },
  { id: "mr-pyay-140", name: "Pyay Road", nameMy: "ပြည်လမ်း", lat: 16.855009, lng: 96.141134 },
  { id: "mr-pyay-141", name: "Pyay Road", nameMy: "ပြည်လမ်း", lat: 16.860879, lng: 96.142161 },
  { id: "mr-pyay-142", name: "Pyay Road", nameMy: "ပြည်လမ်း", lat: 16.867037, lng: 96.14209 },
  { id: "mr-pyay-143", name: "Pyay Road", nameMy: "ပြည်လမ်း", lat: 16.873103, lng: 96.139827 },
  { id: "mr-pyay-144", name: "Pyay Road", nameMy: "ပြည်လမ်း", lat: 16.878596, lng: 96.137726 },
  { id: "mr-pyay-145", name: "Pyay Road", nameMy: "ပြည်လမ်း", lat: 16.884176, lng: 96.135834 },
  { id: "mr-pyay-146", name: "Pyay Road", nameMy: "ပြည်လမ်း", lat: 16.887876, lng: 96.1252 },
  { id: "mr-pyay-147", name: "Pyay Road", nameMy: "ပြည်လမ်း", lat: 16.889151, lng: 96.132499 },
  { id: "mr-pyay-148", name: "Pyay Road", nameMy: "ပြည်လမ်း", lat: 16.891052, lng: 96.120071 },
  { id: "mr-pyay-149", name: "Pyay Road", nameMy: "ပြည်လမ်း", lat: 16.896905, lng: 96.122551 },
  { id: "mr-pyay-150", name: "Pyay Road", nameMy: "ပြည်လမ်း", lat: 16.902154, lng: 96.126068 },
  { id: "mr-pyay-151", name: "Pyay Road", nameMy: "ပြည်လမ်း", lat: 16.90727, lng: 96.129332 },
  { id: "mr-pyay-152", name: "Pyay Road", nameMy: "ပြည်လမ်း", lat: 16.912803, lng: 96.133896 },
  { id: "mr-pyay-153", name: "Pyay Road", nameMy: "ပြည်လမ်း", lat: 16.918761, lng: 96.134253 },
  { id: "mr-kan-yeiktha-154", name: "Kan Yeiktha Road", nameMy: "ကန်ရိပ်သာလမ်း", lat: 16.792681, lng: 96.167832 },
  { id: "mr-kan-yeiktha-155", name: "Kan Yeiktha Road", nameMy: "ကန်ရိပ်သာလမ်း", lat: 16.794138, lng: 96.161882 },
  { id: "mr-u-wisara-156", name: "U Wisara Road", nameMy: "ဦးဝီစာရလမ်း", lat: 16.781966, lng: 96.153308 },
  { id: "mr-u-wisara-157", name: "U Wisara Road", nameMy: "ဦးဝီစာရလမ်း", lat: 16.787015, lng: 96.150131 },
  { id: "mr-u-wisara-158", name: "U Wisara Road", nameMy: "ဦးဝီစာရလမ်း", lat: 16.792669, lng: 96.148232 },
  { id: "mr-u-wisara-159", name: "U Wisara Road", nameMy: "ဦးဝီစာရလမ်း", lat: 16.798552, lng: 96.145638 },
  { id: "mr-u-wisara-160", name: "U Wisara Road", nameMy: "ဦးဝီစာရလမ်း", lat: 16.803915, lng: 96.143122 },
  { id: "mr-u-wisara-161", name: "U Wisara Road", nameMy: "ဦးဝီစာရလမ်း", lat: 16.808723, lng: 96.138875 },
  { id: "mr-u-wisara-162", name: "U Wisara Road", nameMy: "ဦးဝီစာရလမ်း", lat: 16.813126, lng: 96.13485 },
  { id: "mr-u-wisara-163", name: "U Wisara Road", nameMy: "ဦးဝီစာရလမ်း", lat: 16.865937, lng: 96.181143 },
  { id: "mr-u-wisara-164", name: "U Wisara Road", nameMy: "ဦးဝီစာရလမ်း", lat: 16.870526, lng: 96.177046 },
  { id: "mr-u-wisara-165", name: "U Wisara Road", nameMy: "ဦးဝီစာရလမ်း", lat: 16.878184, lng: 96.171524 },
  { id: "mr-u-wisara-166", name: "U Wisara Road", nameMy: "ဦးဝီစာရလမ်း", lat: 16.883898, lng: 96.168295 },
  { id: "mr-kabar-aye-pagoda-167", name: "Kaba Aye Pagoda Road", nameMy: "ကမ္ဘာအေးဘုရားလမ်း", lat: 16.800366, lng: 96.158323 },
  { id: "mr-kabar-aye-pagoda-168", name: "Kaba Aye Pagoda Road", nameMy: "ကမ္ဘာအေးဘုရားလမ်း", lat: 16.805632, lng: 96.155519 },
  { id: "mr-kabar-aye-pagoda-169", name: "Kaba Aye Pagoda Road", nameMy: "ကမ္ဘာအေးဘုရားလမ်း", lat: 16.811564, lng: 96.156096 },
  { id: "mr-kabar-aye-pagoda-170", name: "Kaba Aye Pagoda Road", nameMy: "ကမ္ဘာအေးဘုရားလမ်း", lat: 16.817712, lng: 96.156451 },
  { id: "mr-kabar-aye-pagoda-171", name: "Kaba Aye Pagoda Road", nameMy: "ကမ္ဘာအေးဘုရားလမ်း", lat: 16.823185, lng: 96.15393 },
  { id: "mr-kabar-aye-pagoda-172", name: "Kaba Aye Pagoda Road", nameMy: "ကမ္ဘာအေးဘုရားလမ်း", lat: 16.829063, lng: 96.154632 },
  { id: "mr-kabar-aye-pagoda-173", name: "Kaba Aye Pagoda Road", nameMy: "ကမ္ဘာအေးဘုရားလမ်း", lat: 16.834962, lng: 96.155476 },
  { id: "mr-kabar-aye-pagoda-174", name: "Kaba Aye Pagoda Road", nameMy: "ကမ္ဘာအေးဘုရားလမ်း", lat: 16.84091, lng: 96.15633 },
  { id: "mr-kabar-aye-pagoda-175", name: "Kaba Aye Pagoda Road", nameMy: "ကမ္ဘာအေးဘုရားလမ်း", lat: 16.846884, lng: 96.157201 },
  { id: "mr-kabar-aye-pagoda-176", name: "Kaba Aye Pagoda Road", nameMy: "ကမ္ဘာအေးဘုရားလမ်း", lat: 16.852964, lng: 96.15739 },
  { id: "mr-kabar-aye-pagoda-177", name: "Kaba Aye Pagoda Road", nameMy: "ကမ္ဘာအေးဘုရားလမ်း", lat: 16.858847, lng: 96.156027 },
  { id: "mr-kabar-aye-pagoda-178", name: "Kaba Aye Pagoda Road", nameMy: "ကမ္ဘာအေးဘုရားလမ်း", lat: 16.864704, lng: 96.154851 },
  { id: "mr-kabar-aye-pagoda-179", name: "Kaba Aye Pagoda Road", nameMy: "ကမ္ဘာအေးဘုရားလမ်း", lat: 16.866398, lng: 96.143117 },
  { id: "mr-kabar-aye-pagoda-180", name: "Kaba Aye Pagoda Road", nameMy: "ကမ္ဘာအေးဘုရားလမ်း", lat: 16.868387, lng: 96.149979 },
  { id: "mr-than-thu-mar-181", name: "Thanthumar Road", nameMy: "သံသုမာလမ်း", lat: 16.814817, lng: 96.190613 },
  { id: "mr-than-thu-mar-182", name: "Thanthumar Road", nameMy: "သံသုမာလမ်း", lat: 16.817401, lng: 96.196542 },
  { id: "mr-than-thu-mar-183", name: "Thanthumar Road", nameMy: "သံသုမာလမ်း", lat: 16.820586, lng: 96.201778 },
  { id: "mr-than-thu-mar-184", name: "Thanthumar Road", nameMy: "သံသုမာလမ်း", lat: 16.824444, lng: 96.206369 },
  { id: "mr-than-thu-mar-185", name: "Thanthumar Road", nameMy: "သံသုမာလမ်း", lat: 16.83013, lng: 96.208053 },
  { id: "mr-than-thu-mar-186", name: "Thanthumar Road", nameMy: "သံသုမာလမ်း", lat: 16.836326, lng: 96.207658 },
  { id: "mr-than-thu-mar-187", name: "Thanthumar Road", nameMy: "သံသုမာလမ်း", lat: 16.842277, lng: 96.204953 },
  { id: "mr-than-thu-mar-188", name: "Thanthumar Road", nameMy: "သံသုမာလမ်း", lat: 16.846339, lng: 96.200485 },
  { id: "mr-than-thu-mar-189", name: "Thanthumar Road", nameMy: "သံသုမာလမ်း", lat: 16.848744, lng: 96.194781 },
  { id: "mr-than-thu-mar-190", name: "Thanthumar Road", nameMy: "သံသုမာလမ်း", lat: 16.850451, lng: 96.188699 },
  { id: "mr-than-thu-mar-191", name: "Thanthumar Road", nameMy: "သံသုမာလမ်း", lat: 16.854402, lng: 96.18382 },
  { id: "mr-than-thu-mar-192", name: "Thanthumar Road", nameMy: "သံသုမာလမ်း", lat: 16.858898, lng: 96.179746 },
  { id: "mr-than-thu-mar-193", name: "Thanthumar Road", nameMy: "သံသုမာလမ်း", lat: 16.863011, lng: 96.17326 },
  { id: "mr-than-thu-mar-194", name: "Thanthumar Road", nameMy: "သံသုမာလမ်း", lat: 16.866517, lng: 96.168291 },
  { id: "mr-than-thu-mar-195", name: "Thanthumar Road", nameMy: "သံသုမာလမ်း", lat: 16.870288, lng: 96.162019 },
  { id: "mr-bayint-naung-196", name: "Bayint Naung Road", nameMy: "ဘုရင့်နောင်လမ်း", lat: 16.820032, lng: 96.122031 },
  { id: "mr-bayint-naung-197", name: "Bayint Naung Road", nameMy: "ဘုရင့်နောင်လမ်း", lat: 16.82585, lng: 96.123098 },
  { id: "mr-bayint-naung-198", name: "Bayint Naung Road", nameMy: "ဘုရင့်နောင်လမ်း", lat: 16.831518, lng: 96.121261 },
  { id: "mr-bayint-naung-199", name: "Bayint Naung Road", nameMy: "ဘုရင့်နောင်လမ်း", lat: 16.833599, lng: 96.115322 },
  { id: "mr-bayint-naung-200", name: "Bayint Naung Road", nameMy: "ဘုရင့်နောင်လမ်း", lat: 16.839157, lng: 96.113076 },
  { id: "mr-bayint-naung-201", name: "Bayint Naung Road", nameMy: "ဘုရင့်နောင်လမ်း", lat: 16.845091, lng: 96.112134 },
  { id: "mr-bayint-naung-202", name: "Bayint Naung Road", nameMy: "ဘုရင့်နောင်လမ်း", lat: 16.851084, lng: 96.109627 },
  { id: "mr-bayint-naung-203", name: "Bayint Naung Road", nameMy: "ဘုရင့်နောင်လမ်း", lat: 16.853838, lng: 96.214219 },
  { id: "mr-bayint-naung-204", name: "Bayint Naung Road", nameMy: "ဘုရင့်နောင်လမ်း", lat: 16.855241, lng: 96.208269 },
  { id: "mr-bayint-naung-205", name: "Bayint Naung Road", nameMy: "ဘုရင့်နောင်လမ်း", lat: 16.857297, lng: 96.108481 },
  { id: "mr-bayint-naung-206", name: "Bayint Naung Road", nameMy: "ဘုရင့်နောင်လမ်း", lat: 16.863167, lng: 96.107349 },
  { id: "mr-bayint-naung-207", name: "Bayint Naung Road", nameMy: "ဘုရင့်နောင်လမ်း", lat: 16.868624, lng: 96.104967 },
  { id: "mr-bayint-naung-208", name: "Bayint Naung Road", nameMy: "ဘုရင့်နောင်လမ်း", lat: 16.868637, lng: 96.194846 },
  { id: "mr-bayint-naung-209", name: "Bayint Naung Road", nameMy: "ဘုရင့်နောင်လမ်း", lat: 16.874042, lng: 96.102571 },
  { id: "mr-bayint-naung-210", name: "Bayint Naung Road", nameMy: "ဘုရင့်နောင်လမ်း", lat: 16.879321, lng: 96.099778 },
  { id: "mr-bayint-naung-211", name: "Bayint Naung Road", nameMy: "ဘုရင့်နောင်လမ်း", lat: 16.885216, lng: 96.097641 },
  { id: "mr-bayint-naung-212", name: "Bayint Naung Road", nameMy: "ဘုရင့်နောင်လမ်း", lat: 16.891012, lng: 96.095548 },
  { id: "mr-bayint-naung-213", name: "Bayint Naung Road", nameMy: "ဘုရင့်နောင်လမ်း", lat: 16.897018, lng: 96.095049 },
  { id: "mr-bayint-naung-214", name: "Bayint Naung Road", nameMy: "ဘုရင့်နောင်လမ်း", lat: 16.902805, lng: 96.096963 },
  { id: "mr-dhamma-seti-215", name: "Dhamma Seti Road", nameMy: "ဓမ္မစေတီလမ်း", lat: 16.801263, lng: 96.13781 },
  { id: "mr-dhamma-seti-216", name: "Dhamma Seti Road", nameMy: "ဓမ္မစေတီလမ်း", lat: 16.804779, lng: 96.142819 },
];

/** Great-circle distance in metres (Haversine). */
export function haversineM(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000;
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function walkMinutes(m: number) {
  return Math.max(1, Math.ceil(m / WALK_M_PER_MIN));
}

/**
 * Nearest 2–3 main-road points within 800 m, nearest first. One point per road
 * so suggestions are distinct roads. When none is within 800 m, returns just
 * the single nearest point with `withinRadius: false`.
 */
export function nearestPickups(coord: { lat: number; lng: number }, max = 3) {
  const all: NearbyPickup[] = mainRoadPickups
    .map((p) => {
      const distanceM = Math.round(haversineM(coord, p));
      return { ...p, distanceM, walkMin: walkMinutes(distanceM) };
    })
    .sort((a, b) => a.distanceM - b.distanceM);
  const seen = new Set<string>();
  const near: NearbyPickup[] = [];
  for (const p of all) {
    if (p.distanceM > PICKUP_RADIUS_M) break;
    if (seen.has(p.name)) continue;
    seen.add(p.name);
    near.push(p);
    if (near.length === max) break;
  }
  if (near.length) return { pickups: near, withinRadius: true };
  return { pickups: all.slice(0, 1), withinRadius: false };
}

export function formatDistance(m: number) {
  return m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`;
}

export function getPickup(id: string | null | undefined) {
  return mainRoadPickups.find((p) => p.id === id) ?? null;
}
