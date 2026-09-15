"use server";

import { db } from "./db/prisma";
import { GoalType } from "@/types";
import { XP_REWARDS, levelFromTotalXp } from "./constants";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysBetween(a: Date, b: Date) {
  const aD = startOfDay(a);
  const bD = startOfDay(b);
  const ms = bD.getTime() - aD.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export async function ensureProfile(userId: string) {
  const profile = await db.profile.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
  return profile;
}

export async function awardXpAndLevelUp(
  userId: string,
  xpDelta: number,
  tx: Omit<typeof db, never> = db as any
): Promise<{
  level: number;
  previousLevel: number;
  previousXp: number;
  newTotalXp: number;
  leveledUp: boolean;
}> {
  const client = (tx ?? db) as typeof db;
  const profile = await client.profile.upsert({
    where: { userId },
    update: {},
    create: { userId },
    select: { totalXp: true, level: true },
  });
  const previousLevel = profile.level;
  const previousXp = profile.totalXp;
  const newTotalXp = previousXp + xpDelta;
  const calc = levelFromTotalXp(newTotalXp);
  const leveledUp = calc.level > previousLevel;
  await client.profile.update({
    where: { userId },
    data: { totalXp: newTotalXp, level: calc.level },
  });
  return {
    level: calc.level,
    previousLevel,
    previousXp,
    newTotalXp,
    leveledUp,
  };
}

export async function updateDailyGoal(
  userId: string,
  xpEarned: number,
  exercisesCompletedDelta: number = 1,
  goalType: GoalType = "XP"
) {
  const today = startOfDay(new Date());
  const existing = await db.dailyGoal.findUnique({
    where: { userId_date: { userId, date: today } },
  });

  if (goalType === "XP") {
    if (existing) {
      const next = existing.current + xpEarned;
      return db.dailyGoal.update({
        where: { id: existing.id },
        data: {
          current: next,
          completed: next >= existing.target,
        },
      });
    }
    return db.dailyGoal.create({
      data: {
      userId,
      date: today,
      goalType: "XP",
      target: 50,
      current: xpEarned,
      completed: xpEarned >= 50,
    },
  } as any);
  }

  if (goalType === "EXERCISES") {
    if (existing) {
      const next = existing.current + exercisesCompletedDelta;
      return db.dailyGoal.update({
        where: { id: existing.id },
        data: {
          current: next,
          completed: next >= existing.target,
        },
      });
    }
    return db.dailyGoal.create({
      data: {
        userId,
        date: today,
        goalType: "EXERCISES",
        target: 5,
        current: exercisesCompletedDelta,
        completed: exercisesCompletedDelta >= 5,
      } as any,
    });
  }

  return existing ?? null;
}

export async function updateStreak(userId: string) {
  const today = startOfDay(new Date());

  let streak = await db.streak.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (!streak) {
    return db.streak.create({
      data: {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveAt: today,
      },
    });
  }

  const last = startOfDay(streak.lastActiveAt ?? streak.updatedAt);
  const diff = daysBetween(last, today);

  if (diff <= 0) {
    return streak;
  }
  if (diff === 1) {
    const next = streak.currentStreak + 1;
    return db.streak.update({
      where: { id: streak.id },
      data: {
        currentStreak: next,
        longestStreak: Math.max(streak.longestStreak ?? 1, next),
        lastActiveAt: today,
      },
    });
  }
  return db.streak.update({
    where: { id: streak.id },
    data: {
      currentStreak: 1,
      longestStreak: streak.longestStreak ?? 1,
      lastActiveAt: today,
    },
  });
}

export async function updateProgressOnAttempt(params: {
  userId: string;
  topic: string | null | undefined;
  lessonId: string | null | undefined;
  correct: boolean;
  score: number;
}) {
  const safeTopic =
    params.topic && params.topic.length > 0 ? params.topic : "Algemeen";
  const now = new Date();

  const row = await db.progress.upsert({
    where: {
      userId_topic: { userId: params.userId, topic: safeTopic },
    },
    update: {},
    create: {
      userId: params.userId,
      topic: safeTopic,
      lessonId: params.lessonId ?? undefined,
    },
  });

  const total = row.total + 1;
  const completed = row.completed + (params.correct ? 1 : 0);
  const prevAcc = row.accuracy ?? 0;
  const newAcc =
    total > 0
      ? Math.round((prevAcc * row.total + params.score) / total)
      : params.score;

  return db.progress.update({
    where: { id: row.id },
    data: {
      total,
      completed,
      accuracy: newAcc,
      lastActiveAt: now,
      lessonId: params.lessonId ?? undefined,
    },
  });
}

export type RecordExerciseAttemptInput = {
  userId: string;
  exerciseId: string;
  lessonId?: string | null;
  score: number;
  correct: boolean;
  mistakes?: unknown | null;
  timeSpent?: number | null;
  topic?: string | null;
  baseXpReward?: number;
};

export async function recordExerciseAttempt({
  userId,
  exerciseId,
  lessonId,
  score,
  correct,
  mistakes,
  timeSpent,
  topic,
  baseXpReward,
}: RecordExerciseAttemptInput) {
  const safeScore = Math.max(0, Math.min(100, Math.round(score)));
  const base =
    typeof baseXpReward === "number"
      ? baseXpReward
      : correct
      ? XP_REWARDS.MULTIPLE_CHOICE
      : Math.round(XP_REWARDS.MULTIPLE_CHOICE * 0.3);

  const ratio = safeScore / 100;
  const xpEarned = Math.max(0, Math.round(base * ratio));

  return db.$transaction(async (tx) => {
    const attempt = await tx.exerciseAttempt.create({
      data: {
        userId,
        exerciseId,
        lessonId: lessonId ?? undefined,
        score: safeScore,
        correct,
        mistakes: (mistakes ?? null) as any,
        timeSpent: timeSpent ?? null,
        xpEarned,
      },
    });

    const { level, leveledUp, newTotalXp } = await awardXpAndLevelUp(
      userId,
      xpEarned,
      tx as any
    );

    const daily = await updateDailyGoal(
      userId,
      xpEarned,
      correct ? 1 : 0
    );
    const streak = await updateStreak(userId);
    const progress = await updateProgressOnAttempt({
      userId,
      topic,
      lessonId: lessonId ?? undefined,
      correct,
      score: safeScore,
    });

    return {
      attempt,
      xp: { xpEarned, level, leveledUp, newTotalXp },
      daily,
      streak,
      progress,
    };
  });
}
