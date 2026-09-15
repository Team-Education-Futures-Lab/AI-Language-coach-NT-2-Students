"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_LOCALE, LOCALE_COOKIE, type Locale } from "./types";
import { getDictionary, PRIMARY_LOCALES_WITH_FULL_DICT, type Dict } from "./dictionaries";

const I18N_FETCH_VERSION = "v2";

type Ctx = {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  t: Dict;
  /**
   * `true` als de UI de Nederlandse bron-referentie MOET tonen naast de vertaling.
   * - false voor `nl` (NL is de brontaal, geen referentie nodig)
   * - true voor ALLE andere talen (190+ ISO 639-1 codes), inclusief primary 6
   *   (EN/TR/AR/PL/ES/DE), zodat NT2-leerlingen hun eigen taal + de NL bron zien.
   */
  showNlRef: boolean;
};

const LocaleContext = createContext<Ctx | null>(null);

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 2;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  if (!match) return null;
  try {
    return decodeURIComponent(match.slice(name.length + 1));
  } catch {
    return null;
  }
}

function writeCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") return;
  const encoded = encodeURIComponent(value);
  document.cookie =
    `${name}=${encoded}; path=/; SameSite=Lax; max-age=${maxAgeSeconds}` +
    (typeof location !== "undefined" && location.protocol === "https:"
      ? "; Secure"
      : "");
}

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(
    initialLocale ?? DEFAULT_LOCALE,
  );
  const [t, setT] = useState<Dict>(() =>
    getDictionary(initialLocale ?? DEFAULT_LOCALE),
  );

  useEffect(() => {
    if (initialLocale) return;
    const saved = readCookie(LOCALE_COOKIE) as Locale | null;
    // Accepteer ELKE ISO 639-1 code (alle talen ter wereld — fallt back op Engels via getDictionary)
    if (saved && typeof saved === "string" && saved.length >= 2) {
      setLocaleState(saved as Locale);
    }
  }, [initialLocale]);

  useEffect(() => {
    if (initialLocale) setLocaleState(initialLocale);
  }, [initialLocale]);

  const setLocale = useCallback((loc: Locale) => {
    setLocaleState(loc);
    writeCookie(LOCALE_COOKIE, loc, COOKIE_MAX_AGE);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", loc);
    }
  }, []);

  useEffect(() => {
    let active = true;

    if (locale === "nl" || PRIMARY_LOCALES_WITH_FULL_DICT.has(locale)) {
      setT(getDictionary(locale));
      return () => {
        active = false;
      };
    }

    setT(getDictionary("en"));

    fetch(
      `/api/i18n?locale=${encodeURIComponent(locale)}&v=${I18N_FETCH_VERSION}`,
      { cache: "no-store" },
    )
      .then((r) => r.json())
      .then((j) => {
        if (!active) return;
        if (!j || j.ok !== true || !j.templates) return;
        setT(buildDictFromTemplates(j.templates));
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [locale]);

  const value = useMemo<Ctx>(() => {
    return {
      locale,
      setLocale,
      t,
      showNlRef: locale !== "nl",
    };
  }, [locale, setLocale, t]);

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    return {
      locale: DEFAULT_LOCALE as Locale,
      setLocale: () => {},
      t: getDictionary(DEFAULT_LOCALE),
      showNlRef: false,
    };
  }
  return ctx;
}

function applyTemplate(
  template: string,
  vars: Record<string, string | number>,
): string {
  let out = template;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll(`{${k}}`, String(v));
  }
  return out;
}

function looksLikeLeakedKey(input: unknown): input is string {
  return typeof input === "string" && /^\{[a-zA-Z][a-zA-Z0-9_.-]*\}$/.test(input.trim());
}

function preferSafeString(candidate: unknown, fallback: string) {
  if (typeof candidate !== "string") return fallback;
  if (!candidate.trim() || looksLikeLeakedKey(candidate)) return fallback;
  return candidate;
}

function buildDictFromTemplates(templates: any): Dict {
  const base = getDictionary("en");

  const navT = templates?.nav ?? {};
  const dashT = templates?.dashboard ?? {};
  const lessonsT = templates?.lessons ?? {};
  const practiceT = templates?.practice ?? {};

  return {
    ...base,
    common: Object.fromEntries(
      Object.entries(base.common).map(([key, value]) => [
        key,
        preferSafeString(templates?.common?.[key], value),
      ]),
    ) as Dict["common"],
    nav: {
      ...base.nav,
      dashboard: preferSafeString(navT.dashboard, base.nav.dashboard),
      lessons: preferSafeString(navT.lessons, base.nav.lessons),
      lessonBuilder: preferSafeString(navT.lessonBuilder, base.nav.lessonBuilder),
      practice: preferSafeString(navT.practice, base.nav.practice),
      profile: preferSafeString(navT.profile, base.nav.profile),
      teacherBadge: preferSafeString(navT.teacherBadge, base.nav.teacherBadge),
      appName: preferSafeString(navT.appName, base.nav.appName),
      appSubtitle: preferSafeString(navT.appSubtitle, base.nav.appSubtitle),
      mbobadge: preferSafeString(navT.mbobadge, base.nav.mbobadge),
      erkLabel: preferSafeString(navT.erkLabel, base.nav.erkLabel),
      language: preferSafeString(navT.language, base.nav.language),
      sector: preferSafeString(navT.sector, base.nav.sector),
      sectorChooseTitle: preferSafeString(
        navT.sectorChooseTitle,
        base.nav.sectorChooseTitle,
      ),
      menu: {
        viewProfile: preferSafeString(
          navT.menu?.viewProfile,
          base.nav.menu.viewProfile,
        ),
        logOut: preferSafeString(navT.menu?.logOut, base.nav.menu.logOut),
      },
      streakDays: (d: number) =>
        applyTemplate(preferSafeString(navT.streakDays, "{d} Day Streak"), { d }),
      xpLabel: (xp: string) =>
        applyTemplate(preferSafeString(navT.xpLabel, "{xp} XP"), { xp }),
      searchNoResults: (query: string) =>
        applyTemplate(preferSafeString(navT.searchNoResults, "No results for “{query}”"), {
          query,
        }),
    },
    footer: Object.fromEntries(
      Object.entries(base.footer).map(([key, value]) => [
        key,
        preferSafeString(templates?.footer?.[key], value),
      ]),
    ) as Dict["footer"],
    dashboard: {
      ...base.dashboard,
      welcomeBack: preferSafeString(dashT.welcomeBack, base.dashboard.welcomeBack),
      heroCta1: preferSafeString(dashT.heroCta1, base.dashboard.heroCta1),
      heroCta2: preferSafeString(dashT.heroCta2, base.dashboard.heroCta2),
      stat7day: preferSafeString(dashT.stat7day, base.dashboard.stat7day),
      statXp: preferSafeString(dashT.statXp, base.dashboard.statXp),
      recommendedLessons: preferSafeString(
        dashT.recommendedLessons,
        base.dashboard.recommendedLessons,
      ),
      stageSimulation: preferSafeString(
        dashT.stageSimulation,
        base.dashboard.stageSimulation,
      ),
      stageSimulationCta: preferSafeString(
        dashT.stageSimulationCta,
        base.dashboard.stageSimulationCta,
      ),
      stageSimulationSubtitle: preferSafeString(
        dashT.stageSimulationSubtitle,
        base.dashboard.stageSimulationSubtitle,
      ),
      recentActivity: preferSafeString(
        dashT.recentActivity,
        base.dashboard.recentActivity,
      ),
      viewAllActivity: preferSafeString(
        dashT.viewAllActivity,
        base.dashboard.viewAllActivity,
      ),
      wordOfDay: preferSafeString(dashT.wordOfDay, base.dashboard.wordOfDay),
      wordOfDayTitle: preferSafeString(
        dashT.wordOfDayTitle,
        base.dashboard.wordOfDayTitle,
      ),
      wordOfDayExample: preferSafeString(
        dashT.wordOfDayExample,
        base.dashboard.wordOfDayExample,
      ),
      wordOfDayCta: preferSafeString(
        dashT.wordOfDayCta,
        base.dashboard.wordOfDayCta,
      ),
      weeklyGoals: preferSafeString(
        dashT.weeklyGoals,
        base.dashboard.weeklyGoals,
      ),
      needHelp: preferSafeString(dashT.needHelp, base.dashboard.needHelp),
      needHelpTitle: preferSafeString(
        dashT.needHelpTitle,
        base.dashboard.needHelpTitle,
      ),
      needHelpSubtitle: preferSafeString(
        dashT.needHelpSubtitle,
        base.dashboard.needHelpSubtitle,
      ),
      needHelpCta: preferSafeString(dashT.needHelpCta, base.dashboard.needHelpCta),
      sectorHeaderTagline: preferSafeString(
        dashT.sectorHeaderTagline,
        base.dashboard.sectorHeaderTagline,
      ),
      sectorHeaderTitlePrefix: preferSafeString(
        dashT.sectorHeaderTitlePrefix,
        base.dashboard.sectorHeaderTitlePrefix,
      ),
      sectorHeaderTitleSuffix: preferSafeString(
        dashT.sectorHeaderTitleSuffix,
        base.dashboard.sectorHeaderTitleSuffix,
      ),
      sectorHeaderSubtitle: preferSafeString(
        dashT.sectorHeaderSubtitle,
        base.dashboard.sectorHeaderSubtitle,
      ),
      welcome: (name: string) =>
        applyTemplate(preferSafeString(dashT.welcome, "Welcome back, {name}!"), { name }),
      statLevel: (lv: number) =>
        applyTemplate(preferSafeString(dashT.statLevel, "Level {lv}"), { lv }),
      statLevelProgress: (current: number, xpToNext: number, next: number) =>
        applyTemplate(
          preferSafeString(
            dashT.statLevelProgress,
            "Level {current} — {xpToNext} XP to {next}",
          ),
          { current, xpToNext, next },
        ),
    },
    lessons: {
      ...base.lessons,
      title: preferSafeString(lessonsT.title, base.lessons.title),
      subtitle: preferSafeString(lessonsT.subtitle, base.lessons.subtitle),
      newLessonCta: preferSafeString(
        lessonsT.newLessonCta,
        base.lessons.newLessonCta,
      ),
      filterErk: preferSafeString(lessonsT.filterErk, base.lessons.filterErk),
      filterSector: preferSafeString(
        lessonsT.filterSector,
        base.lessons.filterSector,
      ),
      filterSkill: preferSafeString(
        lessonsT.filterSkill,
        base.lessons.filterSkill,
      ),
      conceptBadge: preferSafeString(
        lessonsT.conceptBadge,
        base.lessons.conceptBadge,
      ),
      conceptCardTitle: preferSafeString(
        lessonsT.conceptCardTitle,
        base.lessons.conceptCardTitle,
      ),
      conceptCardSubtitle: preferSafeString(
        lessonsT.conceptCardSubtitle,
        base.lessons.conceptCardSubtitle,
      ),
      conceptCardCta: preferSafeString(
        lessonsT.conceptCardCta,
        base.lessons.conceptCardCta,
      ),
      recommendedPath: preferSafeString(
        lessonsT.recommendedPath,
        base.lessons.recommendedPath,
      ),
      recommendedPathTitle: preferSafeString(
        lessonsT.recommendedPathTitle,
        base.lessons.recommendedPathTitle,
      ),
      recommendedPathSubtitle: preferSafeString(
        lessonsT.recommendedPathSubtitle,
        base.lessons.recommendedPathSubtitle,
      ),
      recommendedPathCta: preferSafeString(
        lessonsT.recommendedPathCta,
        base.lessons.recommendedPathCta,
      ),
      loadMore: preferSafeString(lessonsT.loadMore, base.lessons.loadMore),
      sortBy: preferSafeString(lessonsT.sortBy, base.lessons.sortBy),
      tabAll: (n: number) =>
        applyTemplate(preferSafeString(lessonsT.tabAll, "All lessons ({n})"), { n }),
      tabMine: (n: number) =>
        applyTemplate(preferSafeString(lessonsT.tabMine, "My lessons ({n})"), { n }),
      tabFavs: (n: number) =>
        applyTemplate(preferSafeString(lessonsT.tabFavs, "Favorites ({n})"), { n }),
      tabDrafts: (n: number) =>
        applyTemplate(preferSafeString(lessonsT.tabDrafts, "Drafts ({n})"), { n }),
    },
    lessonBuilder: {
      topBar: {
        preview: preferSafeString(
          templates?.lessonBuilder?.topBar?.preview,
          base.lessonBuilder.topBar.preview,
        ),
        saveDraft: preferSafeString(
          templates?.lessonBuilder?.topBar?.saveDraft,
          base.lessonBuilder.topBar.saveDraft,
        ),
        publish: preferSafeString(
          templates?.lessonBuilder?.topBar?.publish,
          base.lessonBuilder.topBar.publish,
        ),
      },
      step1Title: preferSafeString(
        templates?.lessonBuilder?.step1Title,
        base.lessonBuilder.step1Title,
      ),
      step2Title: preferSafeString(
        templates?.lessonBuilder?.step2Title,
        base.lessonBuilder.step2Title,
      ),
      step3Title: preferSafeString(
        templates?.lessonBuilder?.step3Title,
        base.lessonBuilder.step3Title,
      ),
      step1Subtitle: preferSafeString(
        templates?.lessonBuilder?.step1Subtitle,
        base.lessonBuilder.step1Subtitle,
      ),
      step2Subtitle: preferSafeString(
        templates?.lessonBuilder?.step2Subtitle,
        base.lessonBuilder.step2Subtitle,
      ),
      step3Subtitle: preferSafeString(
        templates?.lessonBuilder?.step3Subtitle,
        base.lessonBuilder.step3Subtitle,
      ),
      fieldLessonTitle: preferSafeString(
        templates?.lessonBuilder?.fieldLessonTitle,
        base.lessonBuilder.fieldLessonTitle,
      ),
      fieldEducation: preferSafeString(
        templates?.lessonBuilder?.fieldEducation,
        base.lessonBuilder.fieldEducation,
      ),
      fieldErk: preferSafeString(
        templates?.lessonBuilder?.fieldErk,
        base.lessonBuilder.fieldErk,
      ),
      fieldKeywords: preferSafeString(
        templates?.lessonBuilder?.fieldKeywords,
        base.lessonBuilder.fieldKeywords,
      ),
      fieldDescription: preferSafeString(
        templates?.lessonBuilder?.fieldDescription,
        base.lessonBuilder.fieldDescription,
      ),
      placeholderLessonTitle: preferSafeString(
        templates?.lessonBuilder?.placeholderLessonTitle,
        base.lessonBuilder.placeholderLessonTitle,
      ),
      placeholderDescription: preferSafeString(
        templates?.lessonBuilder?.placeholderDescription,
        base.lessonBuilder.placeholderDescription,
      ),
      placeholderKeywords: preferSafeString(
        templates?.lessonBuilder?.placeholderKeywords,
        base.lessonBuilder.placeholderKeywords,
      ),
      goalAddLabel: preferSafeString(
        templates?.lessonBuilder?.goalAddLabel,
        base.lessonBuilder.goalAddLabel,
      ),
      goalAddPlaceholder: preferSafeString(
        templates?.lessonBuilder?.goalAddPlaceholder,
        base.lessonBuilder.goalAddPlaceholder,
      ),
      goalChipExample: preferSafeString(
        templates?.lessonBuilder?.goalChipExample,
        base.lessonBuilder.goalChipExample,
      ),
      coverTitle: preferSafeString(
        templates?.lessonBuilder?.coverTitle,
        base.lessonBuilder.coverTitle,
      ),
      coverSubtitle: preferSafeString(
        templates?.lessonBuilder?.coverSubtitle,
        base.lessonBuilder.coverSubtitle,
      ),
      coverCta: preferSafeString(
        templates?.lessonBuilder?.coverCta,
        base.lessonBuilder.coverCta,
      ),
      exercisesTitle: preferSafeString(
        templates?.lessonBuilder?.exercisesTitle,
        base.lessonBuilder.exercisesTitle,
      ),
      exercisesSubtitle: preferSafeString(
        templates?.lessonBuilder?.exercisesSubtitle,
        base.lessonBuilder.exercisesSubtitle,
      ),
      exercisesAddCta: preferSafeString(
        templates?.lessonBuilder?.exercisesAddCta,
        base.lessonBuilder.exercisesAddCta,
      ),
      exercisesOpenAiCta: preferSafeString(
        templates?.lessonBuilder?.exercisesOpenAiCta,
        base.lessonBuilder.exercisesOpenAiCta,
      ),
      aiPanelTitle: preferSafeString(
        templates?.lessonBuilder?.aiPanelTitle,
        base.lessonBuilder.aiPanelTitle,
      ),
      aiPanelPrompt: preferSafeString(
        templates?.lessonBuilder?.aiPanelPrompt,
        base.lessonBuilder.aiPanelPrompt,
      ),
      aiPanelCount: preferSafeString(
        templates?.lessonBuilder?.aiPanelCount,
        base.lessonBuilder.aiPanelCount,
      ),
      aiPanelTypes: preferSafeString(
        templates?.lessonBuilder?.aiPanelTypes,
        base.lessonBuilder.aiPanelTypes,
      ),
      aiPanelContext: preferSafeString(
        templates?.lessonBuilder?.aiPanelContext,
        base.lessonBuilder.aiPanelContext,
      ),
      aiPanelGenerate: preferSafeString(
        templates?.lessonBuilder?.aiPanelGenerate,
        base.lessonBuilder.aiPanelGenerate,
      ),
    },
    practice: {
      ...base.practice,
      ctaNext: preferSafeString(practiceT.ctaNext, base.practice.ctaNext),
      ctaTip: preferSafeString(practiceT.ctaTip, base.practice.ctaTip),
      speed: preferSafeString(practiceT.speed, base.practice.speed),
      feedbackExcellent: preferSafeString(
        practiceT.feedbackExcellent,
        base.practice.feedbackExcellent,
      ),
      feedbackGood: preferSafeString(
        practiceT.feedbackGood,
        base.practice.feedbackGood,
      ),
      feedbackRetry: preferSafeString(
        practiceT.feedbackRetry,
        base.practice.feedbackRetry,
      ),
      newTerm: preferSafeString(practiceT.newTerm, base.practice.newTerm),
      glossaryCard: preferSafeString(
        practiceT.glossaryCard,
        base.practice.glossaryCard,
      ),
      questionNr: (q: number, total: number) =>
        applyTemplate(preferSafeString(practiceT.questionNr, "Question {q} of {total}"), {
          q,
          total,
        }),
      rewardXp: (xp: number) =>
        applyTemplate(preferSafeString(practiceT.rewardXp, "+{xp} XP"), { xp }),
    },
  };
}
