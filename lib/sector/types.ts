export type SectorCode =
  | "ALGEMEEN"
  | "ZORG"
  | "SPORT"
  | "ICT"
  | "HORECA"
  | "BOUW"
  | "HANDEL"
  | "ONDERWIJS"
  | "TECHNIEK"
  | "UITERLIJKE_VERZORGING";

export type Sector = {
  code: SectorCode;
  label: string; // (NL default label, vervangen door getSectorLabel() in UI)
  icon: string; // emoji fallback
  accentClass: string; // badge class
  /** Dictionary key in `sectorLabels` (zie dictionaries.ts) */
  dictKey: SectorDictKey;
};

export type SectorDictKey =
  | "algemeen"
  | "zorg"
  | "sport"
  | "ict"
  | "horeca"
  | "bouw"
  | "handel"
  | "onderwijs"
  | "techniek"
  | "uiterlijkeVerzorging";

export const SECTORS: Sector[] = [
  { code: "ALGEMEEN",   label: "Algemeen NT2",        icon: "🌐", accentClass: "tc-chip-sand",          dictKey: "algemeen" },
  { code: "ZORG",       label: "Zorg & Welzijn",      icon: "💉", accentClass: "tc-chip-pink",          dictKey: "zorg" },
  { code: "SPORT",      label: "Sport & Bewegen",     icon: "💪", accentClass: "tc-chip-teal",          dictKey: "sport" },
  { code: "ICT",        label: "ICT & Digitalisering",icon: "💻", accentClass: "tc-chip-ink",           dictKey: "ict" },
  { code: "HORECA",     label: "Horeca & Keuken",     icon: "🍽", accentClass: "tc-chip-orange",        dictKey: "horeca" },
  { code: "BOUW",       label: "Bouw & Infra",        icon: "🏗", accentClass: "tc-chip-terracotta",    dictKey: "bouw" },
  { code: "HANDEL",     label: "Handel & Logistiek",  icon: "📦", accentClass: "tc-chip-sunset",        dictKey: "handel" },
  { code: "ONDERWIJS",  label: "Onderwijs & Kinderopvang", icon: "📚", accentClass: "tc-chip-green",   dictKey: "onderwijs" },
  { code: "TECHNIEK",   label: "Techniek & Engineering", icon: "⚙", accentClass: "tc-chip-ink",        dictKey: "techniek" },
  { code: "UITERLIJKE_VERZORGING", label: "Uiterlijke verzorging", icon: "💇", accentClass: "tc-chip-pink", dictKey: "uiterlijkeVerzorging" },
];

export const DEFAULT_SECTOR: SectorCode = "ALGEMEEN";
export const SECTOR_COOKIE = "tc_sector";
