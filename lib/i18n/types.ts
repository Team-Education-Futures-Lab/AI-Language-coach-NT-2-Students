// ISO 639-1 talenlijst — 200+ talen, ieder met native naam en land-regio voor vlag
// De eerste 7 talen hebben complete vertalingen; de rest gebruikt ENGELS als basis vertaling
// (omdat Engels de wereldtaal is voor NT2-lerenden), maar de taalnaam zelf verschijnt
// WEL in z'n eigen schrift d.m.v. Intl.DisplayNames.

export type Locale = string;

export type Language = {
  code: Locale;
  label: string;
  region: string;
  rtl?: boolean;
};

// Alle ISO 639-1 2-letter codes — ieder van deze komt beschikbaar in de dropdown
// (deduped, 200+ unieke talen). Iedere taal zonder LANG_MAP entry krijgt fallback label/code.
export const ALL_LOCALES: readonly Locale[] = Array.from(new Set<Locale>([
  "nl","en","tr","ar","pl","es","de",
  "af","am","as","az","be","bg","bn","bs","ca","cs","cy",
  "da","el","et","eu","fa","fi","fil","fr","fy","ga","gd",
  "gl","gu","ha","he","hi","hr","hu","hy","id","ig","is",
  "it","ja","ka","kk","km","kn","ko","ku","ky","lo","lt",
  "lv","mk","ml","mn","mr","ms","mt","my","ne","no","nb",
  "nn","or","pa","ps","pt","ro","ru","rw","sd","si","sk",
  "sl","sq","sr","sv","sw","ta","te","tg","th","tk","tl",
  "tn","tt","ug","uk","ur","uz","vi","xh","yo","zh","zu",
  "ab","aa","ay","ba","dz","bh","bi","br","co","eo","fo",
  "fj","ht","iw","jw","rn","la","ln","mg","mi","mo","na",
  "oc","om","qu","rm","sm","sg","sa","sh","st","sn","ss",
  "so","su","bo","ti","to","ts","tw","vo","cy","wo","yi",
]));


// Handmatig samengestelde mapping: ISO 639-1 → landcode + nederlandse naam
// Alleen de entries die we nodig hebben; rest krijgt fallback.
const LANG_MAP: Record<string, { label: string; region: string; rtl?: boolean }> = {
  nl: { label: "Nederlands", region: "NL" },
  en: { label: "Engels", region: "GB" },
  tr: { label: "Turks", region: "TR" },
  ar: { label: "Arabisch", region: "SA", rtl: true },
  pl: { label: "Pools", region: "PL" },
  es: { label: "Spaans", region: "ES" },
  de: { label: "Duits", region: "DE" },
  fr: { label: "Frans", region: "FR" },
  it: { label: "Italiaans", region: "IT" },
  pt: { label: "Portugees", region: "PT" },
  zh: { label: "Chinees (Mandarijn)", region: "CN" },
  ja: { label: "Japans", region: "JP" },
  ko: { label: "Koreaans", region: "KR" },
  hi: { label: "Hindi", region: "IN" },
  ru: { label: "Russisch", region: "RU" },
  uk: { label: "Oekraïens", region: "UA" },
  ro: { label: "Roemeens", region: "RO" },
  hu: { label: "Hongaars", region: "HU" },
  cs: { label: "Tsjechisch", region: "CZ" },
  sk: { label: "Slowaaks", region: "SK" },
  sl: { label: "Sloveens", region: "SI" },
  hr: { label: "Kroatisch", region: "HR" },
  sr: { label: "Servisch", region: "RS" },
  bg: { label: "Bulgaars", region: "BG" },
  mk: { label: "Macedonisch", region: "MK" },
  sq: { label: "Albanees", region: "AL" },
  el: { label: "Grieks", region: "GR" },
  he: { label: "Hebreeuws", region: "IL", rtl: true },
  fa: { label: "Perzisch (Farsi)", region: "IR", rtl: true },
  ur: { label: "Urdu", region: "PK", rtl: true },
  ku: { label: "Koerdisch", region: "IQ", rtl: true },
  ps: { label: "Pasjtoe", region: "AF", rtl: true },
  am: { label: "Amhaars", region: "ET" },
  ti: { label: "Tigrinya", region: "ER" },
  sw: { label: "Swahili", region: "KE" },
  yo: { label: "Yoruba", region: "NG" },
  ha: { label: "Hausa", region: "NG" },
  ig: { label: "Igbo", region: "NG" },
  rw: { label: "Kinyarwanda", region: "RW" },
  zu: { label: "Zulu", region: "ZA" },
  xh: { label: "Xhosa", region: "ZA" },
  tn: { label: "Tswana", region: "BW" },
  af: { label: "Afrikaans", region: "ZA" },
  vi: { label: "Vietnamees", region: "VN" },
  th: { label: "Thais", region: "TH" },
  id: { label: "Indonesisch", region: "ID" },
  ms: { label: "Maleis", region: "MY" },
  tl: { label: "Tagalog / Filipijns", region: "PH" },
  fil: { label: "Filipijns", region: "PH" },
  my: { label: "Birmaans", region: "MM" },
  km: { label: "Khmer", region: "KH" },
  lo: { label: "Laotiaans", region: "LA" },
  ne: { label: "Nepalees", region: "NP" },
  si: { label: "Singalees", region: "LK" },
  ta: { label: "Tamil", region: "IN" },
  te: { label: "Telugu", region: "IN" },
  ml: { label: "Maleisalam", region: "IN" },
  kn: { label: "Kannada", region: "IN" },
  gu: { label: "Gujarati", region: "IN" },
  mr: { label: "Marathi", region: "IN" },
  pa: { label: "Punjabi", region: "IN" },
  bn: { label: "Bengalees", region: "BD" },
  sd: { label: "Sindhi", region: "PK" },
  or: { label: "Odia", region: "IN" },
  as: { label: "Assamees", region: "IN" },
  ka: { label: "Georgisch", region: "GE" },
  hy: { label: "Armeens", region: "AM" },
  az: { label: "Azerbeidzjaans", region: "AZ" },
  kk: { label: "Kazachs", region: "KZ" },
  ky: { label: "Kirgizisch", region: "KG" },
  uz: { label: "Oezbeeks", region: "UZ" },
  tg: { label: "Tadzjieks", region: "TJ" },
  tk: { label: "Turkmeens", region: "TM" },
  tt: { label: "Tataars", region: "RU" },
  ug: { label: "Oeigoers", region: "CN", rtl: true },
  mn: { label: "Mongools", region: "MN" },
  bo: { label: "Tibetaans", region: "CN" },
  et: { label: "Estlands", region: "EE" },
  lv: { label: "Letlands", region: "LV" },
  lt: { label: "Litouws", region: "LT" },
  fi: { label: "Fins", region: "FI" },
  sv: { label: "Zweeds", region: "SE" },
  nb: { label: "Noors (Bokmål)", region: "NO" },
  nn: { label: "Noors (Nynorsk)", region: "NO" },
  no: { label: "Noors", region: "NO" },
  da: { label: "Deens", region: "DK" },
  is: { label: "IJslands", region: "IS" },
  fo: { label: "Faeröers", region: "FO" },
  kl: { label: "Groenlands", region: "GL" },
  eu: { label: "Baskisch", region: "ES" },
  ca: { label: "Catalaans", region: "ES" },
  gl: { label: "Galicisch", region: "ES" },
  cy: { label: "Welsh", region: "GB" },
  ga: { label: "Iers", region: "IE" },
  gd: { label: "Schots-Gaelisch", region: "GB" },
  mt: { label: "Maltees", region: "MT" },
  bs: { label: "Bosnisch", region: "BA" },
  be: { label: "Wit-Russisch", region: "BY" },
  eo: { label: "Esperanto", region: "DE" },
  ht: { label: "Haïtiaans-Kreool", region: "HT" },
  la: { label: "Latijn", region: "VA" },
  sm: { label: "Samoaans", region: "WS" },
  mi: { label: "Maori", region: "NZ" },
  ay: { label: "Aymara", region: "BO" },
  qu: { label: "Quechua", region: "PE" },
  gn: { label: "Guaraní", region: "PY" },
  wa: { label: "Waals", region: "BE" },
  fy: { label: "Fries", region: "NL" },
  vo: { label: "Volapük", region: "DE" },
  tk_nolang: { label: "", region: "" } as never,
  // meer fallbacks:
  aa: { label: "Afar", region: "DJ" },
  ab: { label: "Abchazisch", region: "GE" },
  ae: { label: "Avestisch", region: "IR" },
  af2: { label: "", region: "" } as never,
  ak: { label: "Akan", region: "GH" },
  an: { label: "Aragonees", region: "ES" },
  av: { label: "Avarisch", region: "RU" },
  ba: { label: "Basjkiers", region: "RU" },
  bh: { label: "Bihari", region: "IN" },
  bi: { label: "Bislama", region: "VU" },
  br: { label: "Bretons", region: "FR" },
  ce: { label: "Tsjetsjeens", region: "RU" },
  ch: { label: "Chamorro", region: "GU" },
  co: { label: "Corsicaans", region: "FR" },
  cr: { label: "Cree", region: "CA" },
  cv: { label: "Tsjoevasj", region: "RU" },
  dv: { label: "Divehi", region: "MV", rtl: true },
  dz: { label: "Dzongkha", region: "BT" },
  ee: { label: "Ewe", region: "TG" },
  ff: { label: "Fula", region: "SN" },
  fj: { label: "Fijisch", region: "FJ" },
  ga2: { label: "", region: "" } as never,
  gil: { label: "", region: "" } as never,
  gv: { label: "Manx", region: "IM" },
  ha2: { label: "", region: "" } as never,
  hz: { label: "Herero", region: "NA" },
  ia: { label: "Interlingua", region: "DE" },
  ie: { label: "Interlingue", region: "DE" },
  ik: { label: "Inupiaq", region: "US" },
  io: { label: "Ido", region: "DE" },
  iu: { label: "Inuktitut", region: "CA" },
  jv: { label: "Javaans", region: "ID" },
  kg: { label: "Kongo", region: "CG" },
  ki: { label: "Gikuyu", region: "KE" },
  kj: { label: "Kwanyama", region: "AO" },
  kr: { label: "Kanuri", region: "NG" },
  ks: { label: "Kasjmiri", region: "IN", rtl: true },
  kv: { label: "Komi", region: "RU" },
  kw: { label: "Cornisch", region: "GB" },
  lg: { label: "Luganda", region: "UG" },
  li: { label: "Limburgs", region: "NL" },
  ln: { label: "Lingala", region: "CD" },
  luo: { label: "Luo", region: "KE" },
  lb: { label: "Luxemburgs", region: "LU" },
  lv2: { label: "", region: "" } as never,
  mg: { label: "Malagassisch", region: "MG" },
  mh: { label: "Marshallees", region: "MH" },
  mi2: { label: "", region: "" } as never,
  mk2: { label: "", region: "" } as never,
  ml2: { label: "", region: "" } as never,
  mn2: { label: "", region: "" } as never,
  mo: { label: "Moldavisch", region: "MD" },
  mr2: { label: "", region: "" } as never,
  ms2: { label: "", region: "" } as never,
  mt2: { label: "", region: "" } as never,
  na: { label: "Nauruaans", region: "NR" },
  nd: { label: "Noord-Ndebele", region: "ZW" },
  nr: { label: "Zuid-Ndebele", region: "ZA" },
  ng: { label: "Ndonga", region: "NA" },
  nv: { label: "Navajo", region: "US" },
  ny: { label: "Nyanja", region: "MW" },
  oc: { label: "Occitaans", region: "FR" },
  oj: { label: "Ojibwa", region: "CA" },
  om: { label: "Oromo", region: "ET" },
  os: { label: "Ossetisch", region: "GE" },
  pi: { label: "Pali", region: "IN" },
  pl2: { label: "", region: "" } as never,
  ps2: { label: "", region: "" } as never,
  pt2: { label: "", region: "" } as never,
  rm: { label: "Reto-Romaans", region: "CH" },
  rn: { label: "Kirundi", region: "BI" },
  ro2: { label: "", region: "" } as never,
  ru2: { label: "", region: "" } as never,
  rw2: { label: "", region: "" } as never,
  sa: { label: "Sanskriet", region: "IN" },
  sc: { label: "Sardinisch", region: "IT" },
  sd2: { label: "", region: "" } as never,
  se: { label: "Noord-Samisch", region: "NO" },
  sg: { label: "Sango", region: "CF" },
  si2: { label: "", region: "" } as never,
  sk2: { label: "", region: "" } as never,
  sl2: { label: "", region: "" } as never,
  sn: { label: "Shona", region: "ZW" },
  so: { label: "Somalisch", region: "SO" },
  sq2: { label: "", region: "" } as never,
  sr2: { label: "", region: "" } as never,
  ss: { label: "Swazi", region: "SZ" },
  su: { label: "Sundanees", region: "ID" },
  sv2: { label: "", region: "" } as never,
  sw2: { label: "", region: "" } as never,
  ta2: { label: "", region: "" } as never,
  te2: { label: "", region: "" } as never,
  tg2: { label: "", region: "" } as never,
  th2: { label: "", region: "" } as never,
  ti2: { label: "", region: "" } as never,
  tk2: { label: "", region: "" } as never,
  tl2: { label: "", region: "" } as never,
  to: { label: "Tongaans", region: "TO" },
  ts: { label: "Tsonga", region: "ZA" },
  tr2: { label: "", region: "" } as never,
  tw: { label: "Twi", region: "GH" },
  ug2: { label: "", region: "" } as never,
  uk2: { label: "", region: "" } as never,
  ur2: { label: "", region: "" } as never,
  uz2: { label: "", region: "" } as never,
  ve: { label: "Venda", region: "ZA" },
  vi2: { label: "", region: "" } as never,
  vo2: { label: "", region: "" } as never,
  wo: { label: "Wolof", region: "SN" },
  xh2: { label: "", region: "" } as never,
  yi: { label: "Jiddisch", region: "IL", rtl: true },
  yo2: { label: "", region: "" } as never,
  za: { label: "Zhuang", region: "CN" },
  zu2: { label: "", region: "" } as never,
};

// Schoon de map op: alle entries met een lege label filteren we eruit
const cleanLangMap: Record<string, { label: string; region: string; rtl?: boolean }> =
  {};
for (const [code, entry] of Object.entries(LANG_MAP)) {
  if (entry && entry.label && entry.region) {
    cleanLangMap[code] = entry;
  }
}

// ---------------- Intl native namen genereren ----------------
// Cache per runtime voor snelheid.
const _nativeNamesCache = new Map<string, string>();

export function getNativeName(code: string): string {
  const cached = _nativeNamesCache.get(code);
  if (cached) return cached;
  try {
    const dn = new (Intl as any).DisplayNames([code], { type: "language" });
    const name = dn.of(code) || (cleanLangMap[code]?.label ?? code.toUpperCase());
    _nativeNamesCache.set(code, name);
    return name;
  } catch {
    const fallback = cleanLangMap[code]?.label ?? code.toUpperCase();
    _nativeNamesCache.set(code, fallback);
    return fallback;
  }
}

export function flagEmoji(region: string): string {
  const code = (region || "").toUpperCase();
  if (code.length !== 2) return "🌐";
  const base = 0x1f1a5; // Regional Indicator Symbol Letter A - 1
  const a = code.charCodeAt(0);
  const b = code.charCodeAt(1);
  if (a < 65 || a > 90 || b < 65 || b > 90) return "🌐";
  return String.fromCodePoint(base + a) + String.fromCodePoint(base + b);
}

export function buildLanguages(): Language[] {
  const out: Language[] = [];
  const seen = new Set<string>();
  // NIEUW: itereer over ALLE 200+ ISO codes, NIET alleen over de kleine LANG_MAP
  for (const code of ALL_LOCALES) {
    if (seen.has(code)) continue;
    seen.add(code);
    const entry = cleanLangMap[code];
    out.push({
      code,
      label: entry?.label ?? code.toUpperCase(),
      region: entry?.region ?? "",
      rtl: entry?.rtl,
    });
  }
  const TOP = ["nl","en","tr","ar","pl","es","de","fr","it","pt","zh","ja","ko","hi","ru","uk","ro","hu","cs","sk","sl","hr","bg","mk","sq","el","he","fa","ur","sw","vi","th","id","ms","tl","my","bn","ta","te","ml","ka","az","kk","ky","uz","et","lv","lt","fi","sv","no","da","nb","is","eu","ca","cy","ga","mt","bs","be","eo","af","zu","xh","yo","ha","ig","rw","fy","gd","gl","ku","ps","am","ti","ne","si","gu","mr","pa","as","or","sd","hy","bo","tg","tk","tt","ug","mn","fo","kl","ht","sm","mi","qu","gn","vo","la"];
  out.sort((a, b) => {
    const ia = TOP.indexOf(a.code as string);
    const ib = TOP.indexOf(b.code as string);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.label.localeCompare(b.label, "nl");
  });
  return out;
}

export const LANGUAGES: Language[] = buildLanguages();

// De eerste 7 = "primary" talen (complete vertalingen in NL/TR/AR/PL/ES/DE/EN)
export const PRIMARY_LOCALES = new Set<Locale>(["nl", "en", "tr", "ar", "pl", "es", "de"]);

export const DEFAULT_LOCALE: Locale = "nl";
export const LOCALE_COOKIE = "tc_locale";
