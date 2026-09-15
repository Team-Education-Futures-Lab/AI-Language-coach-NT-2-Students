// Eigen type-constanten voor het NT2-platform.
// Omdat we geen gebruik (meer) maken van PostgreSQL-native enums (de app werkt
// ook op MySQL), definiëren we deze waarden hier als as-const objecten met
// bijbehorende literal-types. Op de database slaan we alles op als VARCHAR of
// JSON; de applicatielaag valideert met ZOD dat alleen deze waarden voorkomen.

export const LanguageLevel = {
  A1: "A1",
  A2: "A2",
  B1: "B1",
  B2: "B2",
  C1: "C1",
  C2: "C2",
} as const;
export type LanguageLevel = typeof LanguageLevel[keyof typeof LanguageLevel];

export const LANGUAGE_LEVEL_LABELS: Record<LanguageLevel, string> = {
  A1: "Beginner (A1)",
  A2: "Starter (A2)",
  B1: "Gemiddeld (B1)",
  B2: "Goed (B2)",
  C1: "Gevorderd (C1)",
  C2: "Vloeiend (C2)",
};

export const ExerciseType = {
  MULTIPLE_CHOICE: "MULTIPLE_CHOICE",
  FILL_IN_BLANK: "FILL_IN_BLANK",
  TRANSLATION: "TRANSLATION",
  VOCABULARY: "VOCABULARY",
  SENTENCE_CORRECTION: "SENTENCE_CORRECTION",
  CONVERSATION: "CONVERSATION",
} as const;
export type ExerciseType = typeof ExerciseType[keyof typeof ExerciseType];

export const EXERCISE_TYPE_LABELS: Record<ExerciseType, string> = {
  MULTIPLE_CHOICE: "Meerkeuze",
  FILL_IN_BLANK: "Invuloefening",
  TRANSLATION: "Vertaling",
  VOCABULARY: "Woordjes",
  SENTENCE_CORRECTION: "Zin corrigeren",
  CONVERSATION: "Conversatie",
};

export const VocabularyStatus = {
  NEW: "NEW",
  LEARNING: "LEARNING",
  REVIEWING: "REVIEWING",
  MASTERED: "MASTERED",
} as const;
export type VocabularyStatus =
  typeof VocabularyStatus[keyof typeof VocabularyStatus];

export const VOCAB_STATUS_LABELS: Record<VocabularyStatus, string> = {
  NEW: "Nieuw",
  LEARNING: "Aan het leren",
  REVIEWING: "Herhalen",
  MASTERED: "Kent ik",
};

export const GoalType = {
  XP: "XP",
  LESSONS: "LESSONS",
  MINUTES: "MINUTES",
  EXERCISES: "EXERCISES",
} as const;
export type GoalType = typeof GoalType[keyof typeof GoalType];

export const Severity = {
  low: "low",
  medium: "medium",
  high: "high",
} as const;
export type Severity = typeof Severity[keyof typeof Severity];

export const LessonCategory = {
  GRAMMAR: "GRAMMAR",
  SPELLING: "SPELLING",
  READING: "READING",
  LISTENING: "LISTENING",
  VOCABULARY: "VOCABULARY",
  WRITING: "WRITING",
  CONVERSATION: "CONVERSATION",
  CULTURE: "CULTURE",
  EXAM: "EXAM",
  OTHER: "OTHER",
} as const;
export type LessonCategory =
  typeof LessonCategory[keyof typeof LessonCategory];

export const LESSON_CATEGORY_LABELS: Record<LessonCategory, string> = {
  GRAMMAR: "Grammatica",
  SPELLING: "Spelling",
  READING: "Lezen",
  LISTENING: "Luisteren",
  VOCABULARY: "Woordenschat",
  WRITING: "Schrijven",
  CONVERSATION: "Conversatie",
  CULTURE: "Cultuur & Landen",
  EXAM: "Examenvoorbereiding",
  OTHER: "Algemeen",
};

export const LESSON_CATEGORY_DESCRIPTIONS: Record<LessonCategory, string> = {
  GRAMMAR: "Werkwoorden, de/het, zinsbouw, tijden en meer.",
  SPELLING: "Juiste spelling, werkwoordspelling en hoofdletters.",
  READING: "Begrijpend lezen, teksten en samenvatten.",
  LISTENING: "Oefeningen met audio, begrijpend luisteren.",
  VOCABULARY: "Nieuwe woorden, synoniemen en tegenstellingen.",
  WRITING: "Zinnen schrijven, e-mails, brieven en teksten.",
  CONVERSATION: "Spreekoefeningen, dialoog en durven praten.",
  CULTURE: "Nederlandse cultuur, gewoontes en omgangsvormen.",
  EXAM: "Oefeningen om te oefenen voor een officieel examen.",
  OTHER: "Mix van verschillende vaardigheden.",
};

// --- DOMEIN OBJECTEN ---

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface DashboardStats {
  totalXp: number;
  level: number;
  xpForNextLevel: number;
  currentLevelProgress: number;
  streak: number;
  languageLevel: LanguageLevel;
  dailyGoal: {
    target: number;
    current: number;
    type: string;
  };
  weakAreas: Array<{ topic: string; score: number }>;
  recentActivity: Array<{
    id: string;
    title: string;
    type: string;
    xpEarned: number;
    timestamp: Date;
  }>;
  recommendedExercise?: {
    id: string;
    title: string;
    description?: string;
    type: string;
    xpReward: number;
  };
}

export type NavItem = {
  title: string;
  href: string;
  icon?: string;
  disabled?: boolean;
  external?: boolean;
};
