"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Award,
  Bot,
  ChevronRight,
  Clock,
  Ear,
  FileText,
  Gauge,
  Headphones,
  HeartHandshake,
  NotebookPen,
  Phone,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useTranslatedPayload } from "@/lib/i18n/useTranslatedPayload";
import { useSector } from "@/lib/sector/SectorProvider";
import type { SectorCode } from "@/lib/sector/types";
import { getSectorLabel } from "@/lib/i18n/dictionaries";
import { nlSources } from "@/lib/i18n/nlSources";
import { Bilingual } from "@/components/ui/bilingual";

type Recommendation = {
  sector: SectorCode[] | "ALL";
  icon: React.ReactNode;
  iconBg: string;
  chip: string;
  title: string;
  description: string;
  exercises: number;
  xp: number;
  progress: number;
  progressColor: "terracotta" | "teal" | "sand";
  cta: { label: string; primary: boolean };
};

type ActivityRow = {
  iconBg: string;
  icon: React.ReactNode;
  title: string;
  meta: string;
  rightBadge?: string;
  rightBtn?: { label: string };
  status: "graded" | "retry" | "ongoing";
};

type WeeklyGoal = {
  iconBg: string;
  icon: React.ReactNode;
  label: string;
  current: number;
  target: number;
  unit: string;
  color: "terracotta" | "teal" | "sand";
  done?: boolean;
};

const FireIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
    <path
      d="M12 2.5c1.5 2.2 3.5 3.8 3.5 7a3.5 3.5 0 1 1-7 0c0-1 .3-1.9.8-2.6C8 8.3 7.5 9.8 7.5 11a4.5 4.5 0 0 0 9 0c0-4-3-6.5-4.5-8.5Z"
      fill="currentColor"
    />
  </svg>
);

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

export function DashboardClient({ userName = "Amira" }: { userName?: string }) {
  const { t, showNlRef, locale } = useLocale();
  const { sector, sectorCode, sectors } = useSector();

  const translatedContent = useTranslatedPayload(
    useMemo(
      () => ({
        recommendations: [
          {
            sector: ["ZORG"],
            chip: "Zorg • ERK B1",
            title: "Dossier: Cliëntgegevens invullen",
            description: "Lees een zorgdossier, markeer de hoofdzaken en vul het formulier in.",
            cta: { label: "Hervatten (7 min)", primary: true },
          },
          {
            sector: ["SPORT", "ALGEMEEN"],
            chip: "Sport • ERK A2",
            title: "Luisteren: uitleg van een training",
            description: "Je luistert naar de trainer en noteert de belangrijkste punten.",
            cta: { label: "Beginnen (9 min)", primary: false },
          },
          {
            sector: ["HANDEL", "BOUW", "ICT", "HORECA", "ALGEMEEN"],
            chip: "Werk & Stage • ERK B1",
            title: "Gesprek: slecht nieuws overbrengen",
            description: "Oefen een moeilijk gesprek met collega of klant, met feedback achteraf.",
            cta: { label: "Start nu (15 min)", primary: false },
          },
          {
            sector: ["ICT"],
            chip: "ICT • ERK A2",
            title: "Incident melden bij de helpdesk",
            description: "Praat met de helpdesk over een technische storing: leg duidelijk uit wat er mis is.",
            cta: { label: "Start nu (8 min)", primary: false },
          },
          {
            sector: ["HORECA"],
            chip: "Horeca • ERK A2",
            title: "Bestelling opnemen (schrijven)",
            description: "Schrijf 8 bestellingen foutloos over, inclusief dieetwensen en opmerkingen.",
            cta: { label: "Hervatten (6 min)", primary: false },
          },
          {
            sector: ["ONDERWIJS", "ALGEMEEN"],
            chip: "Kinderopvang • ERK B1",
            title: "Gesprek met een ouder",
            description: "Vertel de ouder hoe de dag van hun kind is verlopen; formuleer het professioneel.",
            cta: { label: "Start nu (10 min)", primary: false },
          },
          {
            sector: ["TECHNIEK", "BOUW"],
            chip: "Bouw/Techniek • ERK A2",
            title: "Rapport: werkzaamheden en veiligheid",
            description: "Vul een werk- en veiligheidsrapport in volgens de 5 regels van je bedrijf.",
            cta: { label: "Start nu (9 min)", primary: false },
          },
          {
            sector: ["UITERLIJKE_VERZORGING"],
            chip: "Kappers • ERK A2",
            title: "Intakegesprek met nieuwe klant",
            description: "Stel de 10 standaardvragen van jouw salon, vat samen wat de klant wil.",
            cta: { label: "Hervatten (6 min)", primary: false },
          },
        ],
        activity: [
          {
            title: "Luisteren: instructie broodafdeling",
            meta: "Vandaag • Score 7/10 • Onderbroken",
            rightBtn: { label: "Hervatten" },
          },
          {
            title: "Spelling: werkwoordstijden (12 stuks)",
            meta: "Gisteren • Score 4/10 • Tip: herhaal regelmatig",
            rightBtn: { label: "Herhaal nu (3 min)" },
          },
          {
            title: "Leestekst: Veilig medicatie toedienen",
            meta: "Afgerond gisteren • Begripstest 8/10 goed",
            rightBadge: "+45 XP",
          },
          {
            title: "Bellen: afspraak verzetten",
            meta: "2 dagen geleden • AI-feedback: Let op de aanhef",
            rightBadge: "+25 XP",
          },
        ],
        goals: [
          { label: "XP verdienen deze week", unit: "XP" },
          { label: "Lessen afmaken", unit: "lessen" },
          { label: "Oefenminuten", unit: "min" },
        ],
        ui: {
          total: "total",
          nextBadge: "Next badge:",
          jobInterview: "Job Interview",
          stageQuestions: "12 vragen",
          stageXp: "+180 XP",
          stageLive: "Live spraak",
          internshipSupervisor: "Stagebegeleider",
          listeningSoon: "Luistert… spreekt binnen 2s",
          supervisorBubble:
            "Goedemorgen! Zou je even kunnen vertellen hoe de afdeling erbij ligt?",
          userBubble:
            "Goedemorgen, jullie hebben vandaag 6 medewerkers en 13 cliënten, volgens het rooster.",
          recentActivityHint:
            "Where you last left off — resume in one click.",
          completed: "completed",
          week37: "Week 37",
        },
      }),
      [],
    ),
    { source: "auto" },
  );

  const recommendations: Recommendation[] = [
    {
      sector: ["ZORG"],
      icon: <FileText className="h-5 w-5 text-cozy-terracotta" />,
      iconBg: "bg-cozy-terracotta/10",
      chip: translatedContent.recommendations?.[0]?.chip ?? "Zorg • ERK B1",
      title: translatedContent.recommendations?.[0]?.title ?? "Dossier: Cliëntgegevens invullen",
      description:
        translatedContent.recommendations?.[0]?.description ??
        "Lees een zorgdossier, markeer de hoofdzaken en vul het formulier in.",
      exercises: 6,
      xp: 80,
      progress: 35,
      progressColor: "terracotta",
      cta: {
        label: translatedContent.recommendations?.[0]?.cta?.label ?? "Hervatten (7 min)",
        primary: true,
      },
    },
    {
      sector: ["SPORT", "ALGEMEEN"],
      icon: <Ear className="h-5 w-5 text-cozy-teal" />,
      iconBg: "bg-cozy-teal/10",
      chip: translatedContent.recommendations?.[1]?.chip ?? "Sport • ERK A2",
      title: translatedContent.recommendations?.[1]?.title ?? "Luisteren: uitleg van een training",
      description:
        translatedContent.recommendations?.[1]?.description ??
        "Je luistert naar de trainer en noteert de belangrijkste punten.",
      exercises: 8,
      xp: 60,
      progress: 60,
      progressColor: "teal",
      cta: {
        label: translatedContent.recommendations?.[1]?.cta?.label ?? "Beginnen (9 min)",
        primary: false,
      },
    },
    {
      sector: ["HANDEL", "BOUW", "ICT", "HORECA", "ALGEMEEN"],
      icon: <Users className="h-5 w-5 text-cozy-orange" />,
      iconBg: "bg-cozy-orange/10",
      chip: translatedContent.recommendations?.[2]?.chip ?? "Werk & Stage • ERK B1",
      title:
        translatedContent.recommendations?.[2]?.title ?? "Gesprek: slecht nieuws overbrengen",
      description:
        translatedContent.recommendations?.[2]?.description ??
        "Oefen een moeilijk gesprek met collega of klant, met feedback achteraf.",
      exercises: 4,
      xp: 95,
      progress: 10,
      progressColor: "sand",
      cta: {
        label: translatedContent.recommendations?.[2]?.cta?.label ?? "Start nu (15 min)",
        primary: false,
      },
    },
    {
      sector: ["ICT"],
      icon: <Gauge className="h-5 w-5 text-cozy-ink" />,
      iconBg: "bg-cozy-ink/10",
      chip: translatedContent.recommendations?.[3]?.chip ?? "ICT • ERK A2",
      title: translatedContent.recommendations?.[3]?.title ?? "Incident melden bij de helpdesk",
      description:
        translatedContent.recommendations?.[3]?.description ??
        "Praat met de helpdesk over een technische storing: leg duidelijk uit wat er mis is.",
      exercises: 5,
      xp: 70,
      progress: 0,
      progressColor: "terracotta",
      cta: {
        label: translatedContent.recommendations?.[3]?.cta?.label ?? "Start nu (8 min)",
        primary: false,
      },
    },
    {
      sector: ["HORECA"],
      icon: <NotebookPen className="h-5 w-5 text-cozy-terracotta" />,
      iconBg: "bg-cozy-terracotta/10",
      chip: translatedContent.recommendations?.[4]?.chip ?? "Horeca • ERK A2",
      title:
        translatedContent.recommendations?.[4]?.title ?? "Bestelling opnemen (schrijven)",
      description:
        translatedContent.recommendations?.[4]?.description ??
        "Schrijf 8 bestellingen foutloos over, inclusief dieetwensen en opmerkingen.",
      exercises: 4,
      xp: 55,
      progress: 20,
      progressColor: "sand",
      cta: {
        label: translatedContent.recommendations?.[4]?.cta?.label ?? "Hervatten (6 min)",
        primary: false,
      },
    },
    {
      sector: ["ONDERWIJS", "ALGEMEEN"],
      icon: <Sparkles className="h-5 w-5 text-cozy-teal" />,
      iconBg: "bg-cozy-teal/10",
      chip: translatedContent.recommendations?.[5]?.chip ?? "Kinderopvang • ERK B1",
      title: translatedContent.recommendations?.[5]?.title ?? "Gesprek met een ouder",
      description:
        translatedContent.recommendations?.[5]?.description ??
        "Vertel de ouder hoe de dag van hun kind is verlopen; formuleer het professioneel.",
      exercises: 3,
      xp: 110,
      progress: 5,
      progressColor: "teal",
      cta: {
        label: translatedContent.recommendations?.[5]?.cta?.label ?? "Start nu (10 min)",
        primary: false,
      },
    },
    {
      sector: ["TECHNIEK", "BOUW"],
      icon: <ShieldCheck className="h-5 w-5 text-cozy-terracotta" />,
      iconBg: "bg-cozy-terracotta/10",
      chip: translatedContent.recommendations?.[6]?.chip ?? "Bouw/Techniek • ERK A2",
      title:
        translatedContent.recommendations?.[6]?.title ?? "Rapport: werkzaamheden en veiligheid",
      description:
        translatedContent.recommendations?.[6]?.description ??
        "Vul een werk- en veiligheidsrapport in volgens de 5 regels van je bedrijf.",
      exercises: 4,
      xp: 75,
      progress: 0,
      progressColor: "sand",
      cta: {
        label: translatedContent.recommendations?.[6]?.cta?.label ?? "Start nu (9 min)",
        primary: false,
      },
    },
    {
      sector: ["UITERLIJKE_VERZORGING"],
      icon: <HeartHandshake className="h-5 w-5 text-cozy-pink" />,
      iconBg: "bg-cozy-pink/10",
      chip: translatedContent.recommendations?.[7]?.chip ?? "Kappers • ERK A2",
      title:
        translatedContent.recommendations?.[7]?.title ?? "Intakegesprek met nieuwe klant",
      description:
        translatedContent.recommendations?.[7]?.description ??
        "Stel de 10 standaardvragen van jouw salon, vat samen wat de klant wil.",
      exercises: 3,
      xp: 55,
      progress: 15,
      progressColor: "terracotta",
      cta: {
        label: translatedContent.recommendations?.[7]?.cta?.label ?? "Hervatten (6 min)",
        primary: false,
      },
    },
  ];

  const activity: ActivityRow[] = [
    {
      iconBg: "bg-cozy-orange/10",
      icon: <Headphones className="h-5 w-5 text-cozy-orange" />,
      title: translatedContent.activity?.[0]?.title ?? "Luisteren: instructie broodafdeling",
      meta: translatedContent.activity?.[0]?.meta ?? "Vandaag • Score 7/10 • Onderbroken",
      rightBtn: { label: translatedContent.activity?.[0]?.rightBtn?.label ?? "Hervatten" },
      status: "ongoing",
    },
    {
      iconBg: "bg-cozy-terracotta/10",
      icon: <RefreshCw className="h-5 w-5 text-cozy-terracotta" />,
      title:
        translatedContent.activity?.[1]?.title ?? "Spelling: werkwoordstijden (12 stuks)",
      meta:
        translatedContent.activity?.[1]?.meta ??
        "Gisteren • Score 4/10 • Tip: herhaal regelmatig",
      rightBtn: {
        label: translatedContent.activity?.[1]?.rightBtn?.label ?? "Herhaal nu (3 min)",
      },
      status: "retry",
    },
    {
      iconBg: "bg-cozy-teal/10",
      icon: <FileText className="h-5 w-5 text-cozy-teal" />,
      title:
        translatedContent.activity?.[2]?.title ?? "Leestekst: Veilig medicatie toedienen",
      meta:
        translatedContent.activity?.[2]?.meta ??
        "Afgerond gisteren • Begripstest 8/10 goed",
      rightBadge: translatedContent.activity?.[2]?.rightBadge ?? "+45 XP",
      status: "graded",
    },
    {
      iconBg: "bg-cozy-sand/30",
      icon: <Phone className="h-5 w-5 text-cozy-orange" />,
      title: translatedContent.activity?.[3]?.title ?? "Bellen: afspraak verzetten",
      meta:
        translatedContent.activity?.[3]?.meta ??
        "2 dagen geleden • AI-feedback: Let op de aanhef",
      rightBadge: translatedContent.activity?.[3]?.rightBadge ?? "+25 XP",
      status: "graded",
    },
  ];

  const goals: WeeklyGoal[] = [
    {
      iconBg: "bg-cozy-terracotta/10",
      icon: <Zap className="h-5 w-5 text-cozy-terracotta" />,
      label: translatedContent.goals?.[0]?.label ?? "XP verdienen deze week",
      current: 940,
      target: 1200,
      unit: translatedContent.goals?.[0]?.unit ?? "XP",
      color: "terracotta",
    },
    {
      iconBg: "bg-cozy-teal/10",
      icon: <Target className="h-5 w-5 text-cozy-teal" />,
      label: translatedContent.goals?.[1]?.label ?? "Lessen afmaken",
      current: 3,
      target: 5,
      unit: translatedContent.goals?.[1]?.unit ?? "lessen",
      color: "teal",
    },
    {
      iconBg: "bg-cozy-orange/10",
      icon: <Clock className="h-5 w-5 text-cozy-orange" />,
      label: translatedContent.goals?.[2]?.label ?? "Oefenminuten",
      current: 140,
      target: 180,
      unit: translatedContent.goals?.[2]?.unit ?? "min",
      color: "sand",
      done: true,
    },
  ];

  const filteredRecommendations = recommendations
    .filter((r) => r.sector === "ALL" || r.sector.includes(sectorCode))
    .slice(0, 3);

  // Also show some generic ones if sector filter gave too few results
  const allShown =
    filteredRecommendations.length >= 3
      ? filteredRecommendations
      : [
          ...filteredRecommendations,
          ...recommendations.filter((r) => r.sector === "ALL" || r.sector.includes("ALGEMEEN")).slice(0, 3 - filteredRecommendations.length),
        ];

  const levelProgress = 45;
  const level = 5;

  return (
    <div className="space-y-6">
      {/* ---------- Sector header banner (vóór hero) ---------- */}
      <div className="tc-card overflow-visible bg-gradient-to-br from-white via-[hsl(198_55%_97%)] to-[hsl(44_80%_96%)] p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-tc-card ring-1 ring-[hsl(198_35%_90%)] text-3xl">
              {sector.icon}
            </span>
            <div className="min-w-0 leading-tight">
              <p className="text-[11px] font-black uppercase tracking-wider text-cozy-ink/50">
                {showNlRef ? (
                  <Bilingual
                    nl={`${nlSources.nav.sector} • ${nlSources.dashboard.sectorHeaderTagline}`}
                    size="sm"
                    variant="inline"
                  >
                    {`${t.nav.sector} • ${t.dashboard.sectorHeaderTagline}`}
                  </Bilingual>
                ) : (
                  <>{t.nav.sector} • {t.dashboard.sectorHeaderTagline}</>
                )}
              </p>
              <h2 className="font-display text-lg font-bold text-cozy-ink">
                {showNlRef ? (
                  <Bilingual
                    nl={`${nlSources.dashboard.sectorHeaderTitlePrefix} ${getSectorLabel("nl", sector.dictKey)}`}
                    size="lg"
                  >
                    {`${t.dashboard.sectorHeaderTitlePrefix} ${getSectorLabel(locale, sector.dictKey)}`}
                  </Bilingual>
                ) : (
                  <>
                    {t.dashboard.sectorHeaderTitlePrefix}
                    <span className="text-cozy-terracotta">{getSectorLabel(locale, sector.dictKey)}</span>
                    {t.dashboard.sectorHeaderTitleSuffix}
                  </>
                )}
              </h2>
              <div className="text-sm font-semibold text-cozy-ink/65">
                {showNlRef ? (
                  <Bilingual nl={nlSources.dashboard.sectorHeaderSubtitle} size="sm">
                    {t.dashboard.sectorHeaderSubtitle}
                  </Bilingual>
                ) : (
                  t.dashboard.sectorHeaderSubtitle
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={sector.accentClass}>
              <span className="text-sm leading-none">{sector.icon}</span>
              {(() => {
                const sLabel = getSectorLabel(locale, sector.dictKey);
                const sNlLabel = getSectorLabel("nl", sector.dictKey);
                return showNlRef ? (
                  <Bilingual nl={sNlLabel} size="sm" variant="inline">
                    {sLabel}
                  </Bilingual>
                ) : (
                  sLabel
                );
              })()}
            </span>
            {sectors.slice(0, 3).map((s) =>
              s.code === sectorCode ? null : (
                <span key={s.code} className="tc-chip bg-white text-cozy-ink/70 ring-1 ring-inset ring-[hsl(198_35%_90%)]">
                  <span className="text-sm leading-none">{s.icon}</span>
                  {(() => {
                    const sLabel = getSectorLabel(locale, s.dictKey);
                    const sNlLabel = getSectorLabel("nl", s.dictKey);
                    return showNlRef ? (
                      <Bilingual nl={sNlLabel} size="sm" variant="inline">
                        {sLabel}
                      </Bilingual>
                    ) : (
                      sLabel
                    );
                  })()}
                </span>
              ),
            )}
          </div>
        </div>
      </div>

      {/* ---------- HERO + XP CARD ---------- */}
      <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,420px)]">
        <div className="tc-card p-6 sm:p-8 overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 bg-tc-header-hero opacity-80"
          />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="tc-chip-pink">
                <FireIcon className="h-3.5 w-3.5" />
                {showNlRef ? (
                  <Bilingual nl={nlSources.dashboard.stat7day} size="sm" variant="inline">
                    {t.dashboard.stat7day}
                  </Bilingual>
                ) : (
                  t.dashboard.stat7day
                )}
              </span>
              <span className="tc-chip-sand">
                <Sparkles className="h-3.5 w-3.5" />
                {showNlRef ? (
                  <Bilingual
                    nl={nlSources.dashboard.statLevelProgress(level, 550, level + 1)}
                    size="sm"
                    variant="inline"
                  >
                    {t.dashboard.statLevelProgress(level, 550, level + 1)}
                  </Bilingual>
                ) : (
                  t.dashboard.statLevelProgress(level, 550, level + 1)
                )}
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-[2.2rem] font-bold tracking-tight text-cozy-ink">
              {showNlRef ? (
                <Bilingual nl={`${nlSources.dashboard.welcome} ${userName}`} size="xl">
                  {t.dashboard.welcome(userName)}
                </Bilingual>
              ) : (
                <>{t.dashboard.welcome(userName)} ��</>
              )}
            </h1>
            <div className="mt-2 max-w-[560px] text-base font-semibold text-cozy-ink/70">
              {showNlRef ? (
                <Bilingual nl={nlSources.dashboard.welcomeBack} size="md">
                  {t.dashboard.welcomeBack}
                </Bilingual>
              ) : (
                t.dashboard.welcomeBack
              )}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/lessons" className="tc-sunset-btn">
                {showNlRef ? (
                  <Bilingual nl={nlSources.dashboard.heroCta1} size="md" variant="inline">
                    {t.dashboard.heroCta1}
                  </Bilingual>
                ) : (
                  t.dashboard.heroCta1
                )}
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link href="/practice" className="tc-outline-btn">
                {showNlRef ? (
                  <Bilingual nl={nlSources.dashboard.heroCta2} size="md" variant="inline">
                    {t.dashboard.heroCta2}
                  </Bilingual>
                ) : (
                  t.dashboard.heroCta2
                )}
              </Link>
            </div>
          </div>
        </div>

        <div className="tc-card p-6">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="tc-card-sky rounded-2xl p-3">
              <div className="text-[11px] font-black uppercase tracking-wider text-cozy-ink/50">
                {showNlRef ? (
                  <Bilingual nl={nlSources.dashboard.stat7day} size="sm">
                    {t.dashboard.stat7day}
                  </Bilingual>
                ) : (
                  t.dashboard.stat7day
                )}
              </div>
              <p className="mt-1 font-display text-2xl font-black text-cozy-terracotta">7</p>
              <div className="text-[11px] font-bold text-cozy-ink/60">
                {showNlRef ? (
                  <Bilingual nl="op rij" size="sm" variant="inline">
                    {t.dashboard.stat7day.split(" ").slice(-1).join(" ")}
                  </Bilingual>
                ) : (
                  t.dashboard.stat7day.split(" ").slice(-1).join(" ")
                )}
              </div>
            </div>
            <div className="tc-card-sky rounded-2xl p-3">
              <div className="text-[11px] font-black uppercase tracking-wider text-cozy-ink/50">
                {showNlRef ? (
                  <Bilingual nl={nlSources.dashboard.statXp} size="sm">
                    {t.dashboard.statXp}
                  </Bilingual>
                ) : (
                  t.dashboard.statXp
                )}
              </div>
              <p className="mt-1 font-display text-2xl font-black text-cozy-orange">1.450</p>
              <div className="text-[11px] font-bold text-cozy-ink/60">
                {showNlRef ? (
                  <Bilingual nl="totaal" size="sm" variant="inline">
                    {translatedContent.ui?.total ?? "total"}
                  </Bilingual>
                ) : (
                  translatedContent.ui?.total ?? "total"
                )}
              </div>
            </div>
            <div className="tc-card-sky rounded-2xl p-3">
              <div className="text-[11px] font-black uppercase tracking-wider text-cozy-ink/50">
                {showNlRef ? (
                  <Bilingual nl={nlSources.dashboard.statLevel} size="sm">
                    {t.dashboard.statLevel(level)}
                  </Bilingual>
                ) : (
                  t.dashboard.statLevel(level)
                )}
              </div>
              <p className="mt-1 font-display text-2xl font-black text-cozy-teal">{level}</p>
              <div className="text-[11px] font-bold text-cozy-ink/60">
                {showNlRef ? (
                  <Bilingual
                    nl={nlSources.dashboard.statLevelProgress(level, 550, level + 1)}
                    size="sm"
                    variant="inline"
                  >
                    {t.dashboard.statLevelProgress(level, 550, level + 1)}
                  </Bilingual>
                ) : (
                  t.dashboard.statLevelProgress(level, 550, level + 1)
                )}
              </div>
            </div>
          </div>
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between text-sm font-bold text-cozy-ink">
              <span>{t.dashboard.statLevel(level)}</span>
              <span>{levelProgress}%</span>
            </div>
            <ProgressBar value={levelProgress} color="terracotta" />
            <div className="text-xs font-semibold text-cozy-ink/60">
              {showNlRef ? (
                <Bilingual nl="Volgende badge:" size="sm" variant="inline">
                  {translatedContent.ui?.nextBadge ?? "Next badge:"}
                </Bilingual>
              ) : (
                translatedContent.ui?.nextBadge ?? "Next badge:"
              )}{" "}
              <Award className="inline h-3.5 w-3.5 align-text-bottom text-cozy-sand" />{" "}
              <span className="font-bold text-cozy-ink">Communicator</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- AANBEVOLEN + ASIDE 3 cards ---------- */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(300px,380px)]">
        <div className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold text-cozy-ink">
                {showNlRef ? (
                  <Bilingual nl={nlSources.dashboard.recommendedLessons} size="lg">
                    {t.dashboard.recommendedLessons}
                  </Bilingual>
                ) : (
                  t.dashboard.recommendedLessons
                )}
              </h2>
              <div className="text-sm font-semibold text-cozy-ink/60">
                {showNlRef ? (
                  <Bilingual
                    nl={`Gekozen op basis van ERK ${level < 4 ? "A2" : "B1"} + ${getSectorLabel("nl", sector.dictKey)}.`}
                    size="sm"
                  >
                    {`Gekozen op basis van ERK ${level < 4 ? "A2" : "B1"} + ${getSectorLabel(locale, sector.dictKey)}.`}
                  </Bilingual>
                ) : (
                  `Gekozen op basis van ERK ${level < 4 ? "A2" : "B1"} + ${getSectorLabel(locale, sector.dictKey)}.`
                )}
              </div>
            </div>
            <Link href="/lessons" className="tc-outline-btn !px-4 !py-2 text-xs">
              {showNlRef ? (
                <Bilingual nl={nlSources.common.viewAll} size="sm" variant="inline">
                  {t.common.viewAll}
                </Bilingual>
              ) : (
                t.common.viewAll
              )} <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {allShown.map((r, i) => (
              <article key={i} className="tc-card p-4 flex flex-col">
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className={cn(
                      "grid h-10 w-10 shrink-0 place-items-center rounded-2xl",
                      r.iconBg,
                    )}
                  >
                    {r.icon}
                  </span>
                  <span className="tc-chip-teal-strong !rounded-xl !text-[10px]">
                    {r.chip}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold leading-snug text-cozy-ink">
                  {r.title}
                </h3>
                <p className="mt-1 text-sm font-semibold text-cozy-ink/65 min-h-[42px]">
                  {r.description}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs font-bold text-cozy-ink/60">
                  <span className="inline-flex items-center gap-1">
                    <NotebookPen className="h-3.5 w-3.5" />
                    {r.exercises} {showNlRef ? (
                      <Bilingual nl={nlSources.common.exercisesShort} size="sm" variant="inline">
                        {t.common.exercisesShort}
                      </Bilingual>
                    ) : t.common.exercisesShort}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3.5 w-3.5" />
                    +{r.xp} {showNlRef ? (
                      <Bilingual nl={nlSources.common.xpLabel} size="sm" variant="inline">
                        {t.common.xpLabel}
                      </Bilingual>
                    ) : t.common.xpLabel}
                  </span>
                </div>
                <div className="mt-3">
                  <ProgressBar value={r.progress} color={r.progressColor} />
                  <div className="mt-1 text-[11px] font-bold text-cozy-ink/55">
                    {r.progress}% {showNlRef ? (
                      <Bilingual nl="afgerond" size="sm" variant="inline">
                        {translatedContent.ui?.completed ?? "completed"}
                      </Bilingual>
                    ) : translatedContent.ui?.completed ?? "completed"}
                  </div>
                </div>
                <Link
                  href="/lessons"
                  className={cn(
                    "mt-4 inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-bold",
                    r.cta.primary
                      ? "tc-sunset-btn"
                      : "tc-outline-btn",
                  )}
                >
                  {r.cta.label}
                </Link>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          {/* Woord vd dag */}
          <div className="tc-card p-5 bg-gradient-to-br from-white to-[hsl(44_90%_96%)]">
            <div className="flex items-start justify-between">
              <span className="tc-chip-teal">
                <Sparkles className="h-3.5 w-3.5" />
                {showNlRef ? (
                  <Bilingual nl={nlSources.dashboard.wordOfDay} size="sm" variant="inline">
                    {t.dashboard.wordOfDay}
                  </Bilingual>
                ) : t.dashboard.wordOfDay}
              </span>
              <button
                type="button"
                aria-label="Uitleg"
                className="grid h-8 w-8 place-items-center rounded-full bg-cozy-sand/40 text-cozy-ink hover:bg-cozy-sand transition-colors"
              >
                <Bot className="h-4 w-4" />
              </button>
            </div>
            <h3 className="mt-3 font-display text-2xl font-black text-cozy-ink">
              {showNlRef ? (
                <Bilingual nl={nlSources.dashboard.wordOfDayTitle} size="xl">
                  {t.dashboard.wordOfDayTitle}
                </Bilingual>
              ) : t.dashboard.wordOfDayTitle}
            </h3>
            <p className="mt-1 text-xs font-black uppercase tracking-wider text-cozy-terracotta">
              {showNlRef ? (
                <Bilingual nl="zelfstandig naamwoord • de/het • ERK A2" size="sm" variant="inline">
                  noun • common/neuter • CEFR A2
                </Bilingual>
              ) : "noun • common/neuter • CEFR A2"}
            </p>
            <div className="mt-3 text-sm font-semibold leading-relaxed text-cozy-ink/75">
              {showNlRef ? (
                <Bilingual nl={nlSources.dashboard.wordOfDayExample} size="sm">
                  {t.dashboard.wordOfDayExample}
                </Bilingual>
              ) : t.dashboard.wordOfDayExample}
            </div>
            <button type="button" className="mt-4 tc-teal-btn w-full">
              {showNlRef ? (
                <Bilingual nl={nlSources.dashboard.wordOfDayCta} size="sm" variant="inline">
                  {t.dashboard.wordOfDayCta}
                </Bilingual>
              ) : t.dashboard.wordOfDayCta}
            </button>
          </div>

          {/* Weekdoelen */}
          <div className="tc-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-cozy-ink">
                {showNlRef ? (
                  <Bilingual nl={nlSources.dashboard.weeklyGoals} size="lg">
                    {t.dashboard.weeklyGoals}
                  </Bilingual>
                ) : t.dashboard.weeklyGoals}
              </h3>
              <span className="tc-chip-sand">
                {translatedContent.ui?.week37 ?? "Week 37"}
              </span>
            </div>
            <ul className="mt-4 space-y-4">
              {goals.map((g) => (
                <li key={g.label}>
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
                        g.iconBg,
                      )}
                    >
                      {g.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-bold text-cozy-ink">
                          {g.label}
                        </p>
                        <p className="shrink-0 text-xs font-black text-cozy-ink/60">
                          {g.current}/{g.target} {g.unit}
                          {g.done && " ✓"}
                        </p>
                      </div>
                      <div className="mt-2">
                        <ProgressBar
                          value={Math.round((g.current / g.target) * 100)}
                          color={g.color}
                        />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Hulp */}
          <div className="tc-card p-5 bg-gradient-to-br from-cozy-teal/[0.04] via-white to-cozy-orange/[0.05]">
            <div className="flex items-start gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cozy-terracotta via-cozy-orange to-cozy-sand shadow-tc-soft ring-1 ring-inset ring-white/60">
                <Users className="h-5 w-5 text-cozy-ink" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-wider text-cozy-terracotta">
                  {showNlRef ? (
                    <Bilingual nl={nlSources.dashboard.needHelp} size="sm" variant="inline">
                      {t.dashboard.needHelp}
                    </Bilingual>
                  ) : t.dashboard.needHelp}
                </p>
                <h3 className="mt-0.5 font-display text-lg font-bold text-cozy-ink">
                  {showNlRef ? (
                    <Bilingual nl={nlSources.dashboard.needHelpTitle} size="lg">
                      {t.dashboard.needHelpTitle}
                    </Bilingual>
                  ) : t.dashboard.needHelpTitle}
                </h3>
                <div className="mt-1 text-xs font-semibold text-cozy-ink/65">
                  {showNlRef ? (
                    <Bilingual nl={nlSources.dashboard.needHelpSubtitle} size="sm">
                      {t.dashboard.needHelpSubtitle}
                    </Bilingual>
                  ) : t.dashboard.needHelpSubtitle}
                </div>
              </div>
            </div>
            <Link href="/chat" className="mt-4 tc-sunset-btn w-full">
              {showNlRef ? (
                <Bilingual nl={nlSources.dashboard.needHelpCta} size="md" variant="inline">
                  {t.dashboard.needHelpCta}
                </Bilingual>
              ) : (
                t.dashboard.needHelpCta
              )}
            </Link>
          </div>
        </aside>
      </section>

      {/* ---------- STAGESIMULATIE BANNER ---------- */}
      <section className="tc-card overflow-hidden">
        <div className="grid gap-0 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="relative p-6 sm:p-8">
            <div aria-hidden className="absolute inset-0 bg-tc-ai-panel opacity-90" />
            <div className="relative">
              <span className="tc-chip-sunset">
                <Bot className="h-3.5 w-3.5" />
                {showNlRef ? (
                  <Bilingual nl="Stagegesprek" size="sm" variant="inline">
                    {translatedContent.ui?.jobInterview ?? "Job Interview"}
                  </Bilingual>
                ) : translatedContent.ui?.jobInterview ?? "Job Interview"}
              </span>
              <h2 className="mt-3 font-display text-2xl sm:text-[1.8rem] font-bold text-cozy-ink">
                {showNlRef ? (
                  <Bilingual nl={nlSources.dashboard.stageSimulation} size="xl">
                    {t.dashboard.stageSimulation}
                  </Bilingual>
                ) : t.dashboard.stageSimulation}
              </h2>
              <div className="mt-2 max-w-[520px] text-sm font-semibold text-cozy-ink/70">
                {showNlRef ? (
                  <Bilingual nl={nlSources.dashboard.stageSimulationSubtitle} size="sm">
                    {t.dashboard.stageSimulationSubtitle}
                  </Bilingual>
                ) : t.dashboard.stageSimulationSubtitle}
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link href="/practice/1" className="tc-sunset-btn">
                  {showNlRef ? (
                    <Bilingual nl={nlSources.dashboard.stageSimulationCta} size="md" variant="inline">
                      {t.dashboard.stageSimulationCta}
                    </Bilingual>
                  ) : (
                    t.dashboard.stageSimulationCta
                  )}
                </Link>
                <div className="flex flex-wrap gap-2">
                  <span className="tc-chip-ink">
                    {translatedContent.ui?.stageQuestions ?? "12 vragen"}
                  </span>
                  <span className="tc-chip-teal">
                    {translatedContent.ui?.stageXp ?? "+180 XP"}
                  </span>
                  <span className="tc-chip-orange">
                    {translatedContent.ui?.stageLive ?? "Live spraak"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="relative flex items-center justify-center p-6 sm:p-8 bg-[hsl(198_50%_96%)]">
            <div className="relative w-full max-w-[360px] rounded-3xl border border-[hsl(198_35%_88%)] bg-white p-5 shadow-tc-card">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-cozy-teal to-[hsl(188_40%_55%)] text-white grid place-items-center font-black shadow-tc-soft">
                  SV
                </div>
                <div>
                  <p className="font-bold text-sm text-cozy-ink">
                    {translatedContent.ui?.internshipSupervisor ?? "Stagebegeleider"}
                  </p>
                  <p className="text-xs font-semibold text-cozy-ink/55">
                    {translatedContent.ui?.listeningSoon ?? "Luistert… spreekt binnen 2s"}
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="rounded-2xl rounded-tl-sm bg-[hsl(198_45%_94%)] px-3 py-2 text-sm font-semibold text-cozy-ink/85 w-4/5">
                  {translatedContent.ui?.supervisorBubble ??
                    "Goedemorgen! Zou je even kunnen vertellen hoe de afdeling erbij ligt?"}
                </div>
                <div className="ml-auto w-4/5 rounded-2xl rounded-tr-sm bg-tc-sunset-btn px-3 py-2 text-sm font-bold text-cozy-ink">
                  {translatedContent.ui?.userBubble ??
                    "Goedemorgen, jullie hebben vandaag 6 medewerkers en 13 cliënten, volgens het rooster."}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs font-bold text-cozy-ink/55">
                <span>⏱ 00:42</span>
                <span className="tc-chip-teal">Tips: 2</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- RECENT ACTIVITY ---------- */}
      <section className="tc-card p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <div>
            <h2 className="font-display text-xl font-bold text-cozy-ink">
              {showNlRef ? (
                <Bilingual nl={nlSources.dashboard.recentActivity} size="lg">
                  {t.dashboard.recentActivity}
                </Bilingual>
              ) : (
                t.dashboard.recentActivity
              )}
            </h2>
            <div className="text-sm font-semibold text-cozy-ink/60">
              {showNlRef ? (
                <Bilingual nl="Waar je het laatst mee bezig was — hervat met één klik." size="sm">
                  {translatedContent.ui?.recentActivityHint ??
                    "Where you last left off — resume in one click."}
                </Bilingual>
              ) : (
                translatedContent.ui?.recentActivityHint ??
                "Where you last left off — resume in one click."
              )}
            </div>
          </div>
          <Link href="/progress" className="tc-outline-btn !px-4 !py-2 text-xs">
            {showNlRef ? (
              <Bilingual nl={nlSources.dashboard.viewAllActivity} size="sm" variant="inline">
                {t.dashboard.viewAllActivity}
              </Bilingual>
            ) : (
              t.dashboard.viewAllActivity
            )}
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <ul className="divide-y divide-[hsl(198_35%_92%)]">
          {activity.map((r, i) => (
            <li key={i} className="py-3.5 flex flex-wrap items-center gap-4">
              <span
                className={cn(
                  "grid h-11 w-11 shrink-0 place-items-center rounded-2xl",
                  r.iconBg,
                )}
              >
                {r.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-cozy-ink">{r.title}</p>
                <p className="text-xs font-semibold text-cozy-ink/60">{r.meta}</p>
              </div>
              <div className="shrink-0">
                {r.rightBadge && (
                  <span className="tc-chip-teal-strong !text-[11px]">
                    {r.rightBadge}
                  </span>
                )}
                {r.rightBtn && (
                  <Link
                    href="/practice"
                    className={cn(
                      "tc-chip",
                      r.status === "retry"
                        ? "tc-chip-terracotta !px-4 !py-1.5 text-[12px]"
                        : "tc-chip-sand !px-4 !py-1.5 text-[12px]",
                    )}
                  >
                    {r.status === "ongoing" ? (
                      <>
                        <Clock className="h-3.5 w-3.5" />
                        {r.rightBtn.label}
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-3.5 w-3.5" />
                        {r.rightBtn.label}
                      </>
                    )}
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
