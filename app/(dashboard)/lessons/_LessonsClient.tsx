"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronRight,
  Clock,
  Filter,
  Flame,
  Heart,
  LayoutGrid,
  Lightbulb,
  Plus,
  Search,
  SortAsc,
  Sparkles,
  Star,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useTranslatedPayload } from "@/lib/i18n/useTranslatedPayload";
import { useSector } from "@/lib/sector/SectorProvider";
import { getSectorLabel } from "@/lib/i18n/dictionaries";
import { nlSources } from "@/lib/i18n/nlSources";
import { Bilingual } from "@/components/ui/bilingual";
import type { SectorCode } from "@/lib/sector/types";

const FireIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
    <path
      d="M12 2.5c1.5 2.2 3.5 3.8 3.5 7a3.5 3.5 0 1 1-7 0c0-1 .3-1.9.8-2.6C8 8.3 7.5 9.8 7.5 11a4.5 4.5 0 0 0 9 0c0-4-3-6.5-4.5-8.5Z"
      fill="currentColor"
    />
  </svg>
);

type TabKey = "all" | "mine" | "favs" | "drafts";
type LessonItem = {
  id: string;
  sector: SectorCode[];
  cover: string;
  sectorChip: string;
  erkChip: string;
  title: string;
  description: string;
  minutes: number;
  xp: number;
  exercises: number;
  progress: number;
  progressColor: "terracotta" | "teal" | "sand";
  favorite?: boolean;
  draft?: boolean;
};

const ERK_LEVELS = ["Alle", "A1", "A2", "B1", "B2", "C1"];
const SKILLS = ["Alle", "Luisteren", "Spreken", "Lezen", "Schrijven", "Gesprek", "Woordkennis"];

const SECTOR_FILTERS = [
  { code: "ALL", label: "Alle vakgebieden", icon: "🌐" },
  { code: "ZORG", label: "Zorg & Welzijn", icon: "💉" },
  { code: "SPORT", label: "Sport & Bewegen", icon: "💪" },
  { code: "ICT", label: "ICT & Digitaal", icon: "💻" },
  { code: "HORECA", label: "Horeca & Keuken", icon: "🍽️" },
  { code: "BOUW", label: "Bouw & Infra", icon: "🏗️" },
  { code: "HANDEL", label: "Handel & Logistiek", icon: "📦" },
  { code: "ONDERWIJS", label: "Onderwijs & Kinderopvang", icon: "📚" },
  { code: "TECHNIEK", label: "Techniek & Engineering", icon: "⚙️" },
  { code: "UITERLIJKE_VERZORGING", label: "Uiterlijke verzorging", icon: "💇" },
  { code: "ALGEMEEN", label: "Algemeen NT2", icon: "🌐" },
] as const;

const COVERS = [
  "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=60",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=60",
  "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=60",
  "https://images.unsplash.com/photo-1576398288189-c9060bc41a2e?auto=format&fit=crop&w=1200&q=60",
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=60",
  "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=1200&q=60",
  "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=60",
  "https://images.unsplash.com/photo-1587019158091-1a4f1d5b4d6b?auto=format&fit=crop&w=1200&q=60",
  "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=60",
  "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=1200&q=60",
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=60",
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?auto=format&fit=crop&w=1200&q=60",
];

const LESSONS: LessonItem[] = [
  {
    id: "z1",
    sector: ["ZORG", "ALGEMEEN"],
    cover: COVERS[0],
    sectorChip: "Zorg",
    erkChip: "ERK B1",
    title: "Dossier: Cliëntgegevens invullen",
    description: "Lees zorgdossier en markeer hoofdzaken. Oefen formulieren invullen met vaktaal.",
    minutes: 25,
    xp: 80,
    exercises: 6,
    progress: 35,
    progressColor: "terracotta",
    favorite: true,
  },
  {
    id: "s1",
    sector: ["SPORT", "ALGEMEEN"],
    cover: COVERS[1],
    sectorChip: "Sport & Bewegen",
    erkChip: "ERK A2",
    title: "Luisteren: uitleg van een training",
    description: "Luister naar de trainer, noteer tijd, aantal sets en aandachtspunten.",
    minutes: 18,
    xp: 60,
    exercises: 8,
    progress: 60,
    progressColor: "teal",
    favorite: true,
  },
  {
    id: "h1",
    sector: ["HANDEL", "BOUW", "ICT", "HORECA", "ALGEMEEN"],
    cover: COVERS[2],
    sectorChip: "Werk & Stage",
    erkChip: "ERK B1",
    title: "Gesprek: slecht nieuws brengen",
    description: "Moeilijk gesprek met collega of klant. Oefen met structuur en woordkeus.",
    minutes: 30,
    xp: 95,
    exercises: 4,
    progress: 10,
    progressColor: "sand",
  },
  {
    id: "i1",
    sector: ["ICT"],
    cover: COVERS[3],
    sectorChip: "ICT & Digitaal",
    erkChip: "ERK A2",
    title: "Incident melden bij de helpdesk",
    description: "Leg een storing duidelijk uit, gebruik de juiste ICT-woorden en vragenlijst.",
    minutes: 16,
    xp: 70,
    exercises: 5,
    progress: 0,
    progressColor: "terracotta",
  },
  {
    id: "hc1",
    sector: ["HORECA"],
    cover: COVERS[4],
    sectorChip: "Horeca & Keuken",
    erkChip: "ERK A2",
    title: "Bestelling opnemen (schrijven)",
    description: "Schrijf 8 bestellingen foutloos over, inclusief dieetwensen en opmerkingen.",
    minutes: 14,
    xp: 55,
    exercises: 4,
    progress: 20,
    progressColor: "sand",
    favorite: true,
  },
  {
    id: "o1",
    sector: ["ONDERWIJS", "ALGEMEEN"],
    cover: COVERS[5],
    sectorChip: "Kinderopvang",
    erkChip: "ERK B1",
    title: "Gesprek met een ouder",
    description: "Vertel hoe de dag van het kind is verlopen; formuleer het professioneel.",
    minutes: 22,
    xp: 110,
    exercises: 3,
    progress: 5,
    progressColor: "teal",
  },
  {
    id: "t1",
    sector: ["TECHNIEK", "BOUW"],
    cover: COVERS[6],
    sectorChip: "Bouw / Techniek",
    erkChip: "ERK A2",
    title: "Rapport: werkzaamheden en veiligheid",
    description: "Vul een werk- en veiligheidsrapport in volgens 5 regels van het bedrijf.",
    minutes: 17,
    xp: 75,
    exercises: 4,
    progress: 0,
    progressColor: "sand",
  },
  {
    id: "uv1",
    sector: ["UITERLIJKE_VERZORGING"],
    cover: COVERS[7],
    sectorChip: "Kappers",
    erkChip: "ERK A2",
    title: "Intakegesprek met nieuwe klant",
    description: "Stel 10 standaardvragen van de salon, vat samen wat de klant wil.",
    minutes: 15,
    xp: 55,
    exercises: 3,
    progress: 15,
    progressColor: "terracotta",
  },
  {
    id: "a1",
    sector: ["ALGEMEEN"],
    cover: COVERS[8],
    sectorChip: "Algemeen NT2",
    erkChip: "ERK A1",
    title: "Begroeten, voorstellen en afspraken maken",
    description: "Basiscursus Nederlands voor als je net begint. Met spraak en voorbeeldzinnen.",
    minutes: 20,
    xp: 40,
    exercises: 10,
    progress: 75,
    progressColor: "teal",
  },
  {
    id: "z2",
    sector: ["ZORG"],
    cover: COVERS[11],
    sectorChip: "Zorg",
    erkChip: "ERK A2",
    title: "Medicatiecheck en 5 rechten",
    description: "Oefen de 5 rechten van medicatie en schrijf de overdracht netjes over.",
    minutes: 22,
    xp: 72,
    exercises: 5,
    progress: 25,
    progressColor: "terracotta",
  },
  {
    id: "bd1",
    sector: ["BOUW"],
    cover: COVERS[9],
    sectorChip: "Bouw",
    erkChip: "ERK B1",
    title: "Toolbox vergadering bijwonen",
    description: "Luister, noteer actiepunten en geef je mening over veiligheid op locatie.",
    minutes: 28,
    xp: 88,
    exercises: 6,
    progress: 0,
    progressColor: "teal",
  },
  {
    id: "hdl1",
    sector: ["HANDEL"],
    cover: COVERS[10],
    sectorChip: "Handel",
    erkChip: "ERK A2",
    title: "Klant helpen in de winkel",
    description: "Vragen naar wensen, afmetingen en prijs. Oefen met getallen en maten.",
    minutes: 16,
    xp: 52,
    exercises: 6,
    progress: 50,
    progressColor: "sand",
  },
];

const TABS: { key: TabKey; labelKey: "tabAll" | "tabMine" | "tabFavs" | "tabDrafts"; counts: Record<TabKey, number> } = {
  key: "all",
  labelKey: "tabAll",
  counts: { all: 42, mine: 6, favs: 3, drafts: 2 },
};

function ProgressBar({
  value,
  color = "terracotta",
}: {
  value: number;
  color?: "terracotta" | "teal" | "sand";
}) {
  const pct = Math.max(0, Math.min(100, value));
  const bg =
    color === "terracotta"
      ? "linear-gradient(90deg,#e76f51 0%,#f4a261 55%,#e9c46a 100%)"
      : color === "teal"
      ? "linear-gradient(90deg,#2a9d8f,#73c2b9)"
      : "linear-gradient(90deg,#e9c46a,#f4a261)";
  return (
    <div className="tc-progress" aria-label={`${pct}%`}>
      <span
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ width: `${pct}%`, backgroundImage: bg }}
      />
    </div>
  );
}

export function LessonsClient() {
  const { t, showNlRef, locale } = useLocale();
  const { sector, sectorCode, sectors } = useSector();

  const [tab, setTab] = useState<TabKey>("all");
  const [query, setQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState<"ALL" | SectorCode>(sectorCode);
  const [erk, setErk] = useState("Alle");
  const [skill, setSkill] = useState("Alle");

  const translatedContent = useTranslatedPayload(
    useMemo(
      () => ({
        lessons: LESSONS,
        sectorFilters: SECTOR_FILTERS,
        erkLevels: ERK_LEVELS,
        skills: SKILLS,
        ui: {
          allLabel: "Alle",
          sectorsLabel: "ERK B1 • {count} sectors",
          mostRecent: "Most recent",
          noResults: "No results",
          noResultsHint: "Adjust your filters or clear your search.",
          progress: "Progress {progress}%",
          resume: "Resume",
          start: "Start",
          draftsCount: "2 drafts",
          recommendedStep1: "1. Basis: begroeten en voorstellen",
          recommendedStep2: "2. Werkwoordspelling (A2)",
          recommendedStep4: "4. t/m 12. (start voor +9)",
        },
      }),
      [],
    ),
    { source: "auto" },
  );

  const translatedLessons = translatedContent.lessons ?? LESSONS;
  const translatedSectorFilters = translatedContent.sectorFilters ?? SECTOR_FILTERS;
  const translatedErkLevels = translatedContent.erkLevels ?? ERK_LEVELS;
  const translatedSkills = translatedContent.skills ?? SKILLS;
  const translatedUi = translatedContent.ui ?? {
    allLabel: "Alle",
    sectorsLabel: "ERK B1 • {count} sectors",
    mostRecent: "Most recent",
    noResults: "No results",
    noResultsHint: "Adjust your filters or clear your search.",
    progress: "Progress {progress}%",
    resume: "Resume",
    start: "Start",
    draftsCount: "2 drafts",
    recommendedStep1: "1. Basis: begroeten en voorstellen",
    recommendedStep2: "2. Werkwoordspelling (A2)",
    recommendedStep4: "4. t/m 12. (start voor +9)",
  };

  const filtered = useMemo(() => {
    return translatedLessons.filter((l) => {
      if (sectorFilter !== "ALL" && !l.sector.includes(sectorFilter as SectorCode) && !l.sector.includes("ALGEMEEN" as SectorCode)) {
        // If a specific sector is chosen, show lessons of that sector OR general ones
        const matchesSector = l.sector.includes(sectorFilter as SectorCode);
        const fallback = l.sector.includes("ALGEMEEN" as SectorCode) && !l.sector.some((s) => s !== "ALGEMEEN");
        if (!matchesSector && !fallback) return false;
      }
      if (erk !== translatedUi.allLabel && l.erkChip !== `ERK ${erk}`) return false;
      if (query.trim().length > 0) {
        const q = query.trim().toLowerCase();
        if (
          !l.title.toLowerCase().includes(q) &&
          !l.description.toLowerCase().includes(q) &&
          !l.sectorChip.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (tab === "mine") return l.progress > 0;
      if (tab === "favs") return l.favorite;
      if (tab === "drafts") return l.draft;
      return true;
    });
  }, [tab, sectorFilter, erk, query, skill, translatedLessons, translatedUi.allLabel]);

  const tabs: { key: TabKey; label: (n: number) => string; badge?: "Docent" }[] = [
    { key: "all", label: (n) => t.lessons.tabAll(n) },
    { key: "mine", label: (n) => t.lessons.tabMine(n) },
    { key: "favs", label: (n) => t.lessons.tabFavs(n) },
    { key: "drafts", label: (n) => t.lessons.tabDrafts(n), badge: "Docent" },
  ];

  const shown = filtered.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="tc-card p-5 sm:p-7 bg-black/40 border-white/10 backdrop-blur-2xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={sector.accentClass}>
                <span className="text-sm leading-none">{sector.icon}</span>
                {(() => {
                  const sL = getSectorLabel(locale, sector.dictKey);
                  const sN = getSectorLabel("nl", sector.dictKey);
                  return showNlRef ? (
                    <Bilingual nl={sN} size="sm" variant="inline">{sL}</Bilingual>
                  ) : sL;
                })()}
              </span>
              <span className="tc-chip-teal">
                {showNlRef ? (
                  <Bilingual
                    nl={`ERK B1 • ${sectors.length} vakgebieden`}
                    size="sm"
                    variant="inline"
                  >
                    {translatedUi.sectorsLabel.replace("{count}", String(sectors.length))}
                  </Bilingual>
                ) : (
                  translatedUi.sectorsLabel.replace("{count}", String(sectors.length))
                )}
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
              {showNlRef ? (
                <Bilingual nl={nlSources.lessons.title} size="xl">{t.lessons.title}</Bilingual>
              ) : t.lessons.title}
            </h1>
            <div className="mt-1 text-sm font-semibold text-white/60 max-w-[620px]">
              {showNlRef ? (
                <Bilingual nl={nlSources.lessons.subtitle} size="sm">{t.lessons.subtitle}</Bilingual>
              ) : t.lessons.subtitle}
            </div>
          </div>
          <Link href="/lessons/new" className="tc-sunset-btn whitespace-nowrap">
            <Plus className="h-4 w-4" />
            {showNlRef ? (
              <Bilingual nl={nlSources.lessons.newLessonCta} size="md" variant="inline">{t.lessons.newLessonCta}</Bilingual>
            ) : t.lessons.newLessonCta}
          </Link>
        </div>

        {/* Search + filters */}
        <div className="mt-6 grid gap-3 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))_auto] md:items-center">
          <label className="tc-field flex items-center gap-2 bg-black/40 border-white/10">
            <Search className="h-4 w-4 text-white/50" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.common.search + "…"}
              className="w-full bg-transparent outline-none text-sm font-semibold text-white placeholder:text-white/40"
            />
          </label>
          <select
            value={erk}
            onChange={(e) => setErk(e.target.value)}
            className="tc-select-trigger w-full text-sm"
            aria-label={t.lessons.filterErk}
          >
            {translatedErkLevels.map((l) => (
              <option key={l} value={l}>
                {l === translatedUi.allLabel ? t.lessons.filterErk : `${t.lessons.filterErk}: ${l}`}
              </option>
            ))}
          </select>
          <select
            value={sectorFilter}
            onChange={(e) =>
              setSectorFilter(e.target.value as "ALL" | SectorCode)
            }
            className="tc-select-trigger w-full text-sm"
            aria-label={t.lessons.filterSector}
          >
            {translatedSectorFilters.map((s) => (
              <option key={s.code} value={s.code}>
                {s.icon}  {s.label}
              </option>
            ))}
          </select>
          <select
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            className="tc-select-trigger w-full text-sm"
            aria-label={t.lessons.filterSkill}
          >
            {translatedSkills.map((s) => (
              <option key={s} value={s}>
                {s === translatedUi.allLabel ? t.lessons.filterSkill : `${t.lessons.filterSkill}: ${s}`}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="tc-outline-btn whitespace-nowrap !px-4"
            aria-label={t.common.filter}
          >
            <Filter className="h-4 w-4" />
            {t.common.filter}
          </button>
        </div>

        {/* Tabs + sort */}
        <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
          <ul className="flex flex-wrap items-center gap-1 rounded-full bg-black/40 p-1 ring-1 ring-inset ring-white/10 shadow-lg backdrop-blur-md">
            {tabs.map((tabObj) => {
              const active = tab === tabObj.key;
              return (
                <li key={tabObj.key}>
                  <button
                    type="button"
                    onClick={() => setTab(tabObj.key)}
                    className={cn(
                      "relative inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-bold transition-all",
                      active
                        ? "bg-white/10 text-white ring-1 ring-white/20 shadow-lg"
                        : "text-white/60 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    <span className="relative flex items-center gap-2">
                      <span>{tabObj.label(TABS.counts[tabObj.key])}</span>
                      {tabObj.badge && (
                        <span className="rounded-full bg-fuchsia-500/20 px-2 py-0.5 text-[10px] font-black text-fuchsia-200 ring-1 ring-inset ring-fuchsia-500/30">
                          {tabObj.badge}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white/60">
              {t.lessons.sortBy}:
            </span>
            <button type="button" className="tc-chip bg-white/10 text-white border-white/20 hover:bg-white/20 !px-3">
              <SortAsc className="h-3.5 w-3.5" />
              {showNlRef ? (
                  <Bilingual nl="Meest recent" size="sm" variant="inline">{translatedUi.mostRecent}</Bilingual>
                ) : translatedUi.mostRecent}
            </button>
          </div>
        </div>
      </section>

      {/* Lesson grid + aside concept card */}
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          {shown.length === 0 ? (
            <div className="tc-card p-10 text-center">
              <LayoutGrid className="mx-auto h-10 w-10 text-white/50" />
              <h3 className="mt-2 font-display text-xl font-bold text-white">
                {showNlRef ? (
                  <Bilingual nl="Geen resultaten" size="lg">{translatedUi.noResults}</Bilingual>
                ) : translatedUi.noResults}
              </h3>
              <div className="mt-1 text-sm font-semibold text-white/60">
                {showNlRef ? (
                  <Bilingual nl="Pas je filters aan of wis je zoekopdracht." size="sm">
                    {translatedUi.noResultsHint}
                  </Bilingual>
                ) : translatedUi.noResultsHint}
              </div>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {shown.map((l) => (
                <Link
                  key={l.id}
                  href={`/lessons/${l.id}`}
                  className="tc-card group overflow-hidden flex flex-col"
                >
                  <div className="relative h-44 w-full overflow-hidden">
                    <img
                      src={l.cover}
                      alt={l.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                      <span className="tc-chip-sand-strong bg-white/10 text-white border-white/20 backdrop-blur-md !px-2.5 !py-1 text-[10px]">
                        {l.sectorChip}
                      </span>
                      <span className="tc-chip-teal-strong bg-white/10 text-white border-white/20 backdrop-blur-md !px-2.5 !py-1 text-[10px]">
                        {l.erkChip}
                      </span>
                    </div>
                    <div className="absolute right-3 top-3 flex items-center gap-1">
                      <button
                        type="button"
                        aria-label={locale === "nl" ? "Favoriet" : "Favorite"}
                        className={cn(
                          "grid h-8 w-8 place-items-center rounded-full shadow-tc-soft transition-colors backdrop-blur-md",
                          l.favorite
                            ? "bg-fuchsia-500/20 text-fuchsia-400"
                            : "bg-black/40 text-white hover:bg-fuchsia-500/20 hover:text-fuchsia-400",
                        )}
                      >
                        <Heart
                          className={cn(
                            "h-4 w-4",
                            l.favorite ? "fill-current" : "",
                          )}
                        />
                      </button>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-lg bg-black/40 px-2 py-1 text-[11px] font-black text-white shadow-tc-soft ring-1 ring-inset ring-white/20 backdrop-blur-md">
                          <Clock className="inline h-3 w-3 align-text-bottom text-fuchsia-400" />{" "}
                          {l.minutes} {t.common.minutesShort}
                        </span>
                        <span className="rounded-lg bg-black/40 px-2 py-1 text-[11px] font-black text-white shadow-tc-soft ring-1 ring-inset ring-white/20 backdrop-blur-md">
                          <Sparkles className="inline h-3 w-3 align-text-bottom text-emerald-400" />{" "}
                          +{l.xp} {t.common.xpLabel}
                        </span>
                      </div>
                      <span className="rounded-lg bg-black/40 px-2 py-1 text-[11px] font-black text-white shadow-tc-soft ring-1 ring-inset ring-white/20 backdrop-blur-md">
                        {l.exercises} {t.common.exercisesShort}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <h3 className="font-display text-lg font-bold leading-snug text-white line-clamp-2">
                      {l.title}
                    </h3>
                    <p className="text-sm font-semibold text-white/70 line-clamp-2 min-h-[42px]">
                      {l.description}
                    </p>
                    <div className="mt-auto space-y-2">
                      <ProgressBar value={l.progress} color={l.progressColor} />
                      <div className="flex items-center justify-between text-[11px] font-bold text-white/60">
<span>
                          {showNlRef ? (
                            <Bilingual nl={`Voortgang ${l.progress}%`} size="sm" variant="inline">
                              {translatedUi.progress.replace("{progress}", String(l.progress))}
                            </Bilingual>
                          ) : translatedUi.progress.replace("{progress}", String(l.progress))}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-fuchsia-400" />
                          +{l.xp} {showNlRef ? (
                            <Bilingual nl="XP" size="sm" variant="inline">XP</Bilingual>
                          ) : "XP"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="tc-chip bg-white/10 text-white border-white/20">
                        <Tag className="h-3.5 w-3.5" />
                        {l.erkChip}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-black text-fuchsia-400 transition-transform group-hover:translate-x-0.5">
                        {l.progress > 0 ? (
                          showNlRef ? (
                            <Bilingual nl="Hervatten" size="sm" variant="inline">{translatedUi.resume}</Bilingual>
                          ) : translatedUi.resume
                        ) : showNlRef ? (
                          <Bilingual nl="Starten" size="sm" variant="inline">{translatedUi.start}</Bilingual>
                        ) : translatedUi.start}
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}

              {/* 4e kolom (md/xl): Concept card placeholder */}
              <article className="tc-card p-5 flex flex-col justify-between bg-black/40 border-dashed border-white/20">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="tc-chip-sunset bg-amber-500/20 text-amber-100 border-amber-500/30">
                      <Lightbulb className="h-3.5 w-3.5" />
                      {t.lessons.conceptBadge}
                    </span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-black text-white ring-1 ring-inset ring-white/20">
{showNlRef ? (
                        <Bilingual nl="2 concepten" size="sm" variant="inline">
                          {translatedUi.draftsCount}
                        </Bilingual>
                      ) : translatedUi.draftsCount}
                    </span>
                  </div>
                  <div className="mt-4 grid h-28 place-items-center rounded-2xl border border-dashed border-white/20 bg-white/5">
                    <LayoutGrid className="h-10 w-10 text-white/30" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-white">
                    {t.lessons.conceptCardTitle}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-white/70">
                    {t.lessons.conceptCardSubtitle}
                  </p>
                </div>
                <Link
                  href="/lessons/new"
                  className="mt-5 tc-outline-btn w-full justify-center border-white/20 text-white hover:bg-white/10"
                >
                  <Plus className="h-4 w-4" />
                  {t.lessons.conceptCardCta}
                </Link>
              </article>
            </div>
          )}

          {/* Load more */}
          <div className="mt-6 flex justify-center">
            <button type="button" className="tc-outline-btn !px-6 border-white/20 text-white hover:bg-white/10">
              {t.lessons.loadMore}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Aside: Aanbevolen Leerpad */}
        <aside className="h-fit space-y-4 xl:sticky xl:top-28">
          <div className="tc-card overflow-hidden">
            <div className="relative h-40">
              <img
                src={COVERS[11]}
                alt="Leerpad"
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/40 via-fuchsia-500/20 to-transparent" />
              <div className="absolute left-4 top-4 flex items-center gap-1">
                <span className="tc-chip-sunset bg-white/10 text-white border-white/20 backdrop-blur-md">
                  <Flame className="h-3.5 w-3.5 text-fuchsia-400" />
                  {t.lessons.recommendedPath}
                </span>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-display text-xl font-bold text-white">
                {t.lessons.recommendedPathTitle}
              </h3>
              <p className="mt-1 text-sm font-semibold text-white/70">
                {t.lessons.recommendedPathSubtitle}
              </p>
              <ul className="mt-4 space-y-2">
                  {[
                  { p: 100, label: translatedUi.recommendedStep1, c: "teal" },
                  { p: 60,  label: translatedUi.recommendedStep2, c: "terracotta" },
{ p: 25,  label: `3. ${getSectorLabel(locale, sector.dictKey)}`, c: "sand" },
                  { p: 0,   label: translatedUi.recommendedStep4, c: "sand" },
                ].map((s, i) => (
                  <li key={i}>
                    <div className="flex items-center justify-between text-xs font-bold text-white/80 mb-1.5">
                      <span className="truncate">{s.label}</span>
                      <span>{s.p}%</span>
                    </div>
                    <ProgressBar
                      value={s.p}
                      color={s.c as "terracotta" | "teal" | "sand"}
                    />
                  </li>
                ))}
              </ul>
              <Link href="/lessons" className="mt-5 tc-sunset-btn w-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white hover:brightness-110">
                <FireIcon className="h-4 w-4" />
                {t.lessons.recommendedPathCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
