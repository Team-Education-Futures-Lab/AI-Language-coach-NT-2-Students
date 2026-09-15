export const XP_REWARDS = {
  MULTIPLE_CHOICE: 10,
  FILL_IN_BLANK: 15,
  TRANSLATION: 20,
  VOCABULARY: 8,
  SENTENCE_CORRECTION: 18,
  CONVERSATION: 30,
  DAILY_GOAL_BONUS: 25,
  STREAK_DAY_BONUS: 5,
} as const;

export const LEVELS = {
  XP_PER_LEVEL_BASE: 100,
  XP_GROWTH_FACTOR: 1.25,
  MAX_LEVEL: 50,
} as const;

export function xpToNextLevel(level: number): number {
  if (level <= 0) return 0;
  const raw =
    LEVELS.XP_PER_LEVEL_BASE *
    Math.pow(LEVELS.XP_GROWTH_FACTOR, level - 1);
  return Math.max(LEVELS.XP_PER_LEVEL_BASE, Math.round(raw / 5) * 5);
}

export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i <= level - 1; i++) total += xpToNextLevel(i);
  return total;
}

export function levelFromTotalXp(totalXp: number): {
  level: number;
  currentXpInLevel: number;
  xpNeededForNext: number;
} {
  if (totalXp <= 0) {
    return {
      level: 1,
      currentXpInLevel: 0,
      xpNeededForNext: xpToNextLevel(1),
    };
  }
  let remaining = totalXp;
  let level = 1;
  while (level < LEVELS.MAX_LEVEL) {
    const nextCost = xpToNextLevel(level);
    if (remaining < nextCost) break;
    remaining -= nextCost;
    level++;
  }
  return {
    level,
    currentXpInLevel: remaining,
    xpNeededForNext: xpToNextLevel(level),
  };
}

export const STREAK = {
  MAX_ACTIVE_HOURS_GAP: 36,
} as const;

export const DAILY_GOAL_DEFAULTS = {
  DEFAULT_XP_TARGET: 50,
  DEFAULT_EXERCISE_TARGET: 5,
} as const;

export const FLASHCARD = {
  CORRECT_TO_MASTERED: 3,
  CORRECT_TO_REVIEWING: 1,
  INCORRECT_RESET_TO_LEARNING_THRESHOLD: 2,
} as const;

export const EXERCISE_TYPE_LABELS: Record<string, string> = {
  MULTIPLE_CHOICE: "Multiple choice",
  FILL_IN_BLANK: "Invuloefening",
  TRANSLATION: "Vertaling",
  VOCABULARY: "Woordenschat",
  SENTENCE_CORRECTION: "Zin verbeteren",
  CONVERSATION: "Conversatie",
};

export const DIFFICULTY_LABELS: Record<number, string> = {
  1: "Makkelijk",
  2: "Redelijk",
  3: "Gemiddeld",
  4: "Moeilijk",
  5: "Uitdagend",
};

export const LANGUAGE_LEVEL_LABELS: Record<string, string> = {
  A1: "Beginner (A1)",
  A2: "Elementair (A2)",
  B1: "Onafhankelijk (B1)",
  B2: "Vloeiend (B2)",
  C1: "Gevorderd (C1)",
  C2: "Vaardig (C2)",
};
