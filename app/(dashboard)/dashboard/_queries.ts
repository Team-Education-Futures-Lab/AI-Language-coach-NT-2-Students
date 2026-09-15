import { db } from "@/lib/db/prisma";
import type {
  Profile,
  Streak,
  DailyGoal,
  Progress,
  ExerciseAttempt,
  Exercise,
  User,
} from "@prisma/client";
import {
  XP_REWARDS,
  DIFFICULTY_LABELS,
  EXERCISE_TYPE_LABELS,
  LANGUAGE_LEVEL_LABELS,
  xpToNextLevel,
} from "@/lib/constants";

export type DashboardData = {
  user: User;
  profile: Profile;
  streak: Streak | null;
  dailyGoal: DailyGoal | null;
  progresses: (Progress & { lessonId?: string | null })[];
  recentActivity: (ExerciseAttempt & {
    exercise: Pick<Exercise, "id" | "title" | "type" | "xpReward"> | null;
    lessonId?: string | null;
  })[];
  recommendedExercise:
    | (Exercise & {
        lesson: { id: string; title: string; topic: string | null };
      })
    | null;
  weakTopics: { topic: string; accuracy: number | null; completed: number }[];
  nextLevelXpNeeded: number;
  currentLevelProgressXp: number;
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const [user, profile, streak, progresses, recentActivity, dailyGoalRaw] =
    await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
        },
      }),
      db.profile.upsert({
        where: { userId },
        update: {},
        create: { userId },
      }),
      db.streak.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
      db.progress.findMany({
        where: { userId },
        orderBy: [{ accuracy: "asc" }, { total: "asc" }],
      }),
      db.exerciseAttempt.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          exercise: {
            select: { id: true, title: true, type: true, xpReward: true },
          },
        },
      }),
      (async () => {
        const today = startOfDay(new Date());
        const row = await db.dailyGoal.findUnique({
          where: { userId_date: { userId, date: today } },
        });
        if (row) return row;
        return db.dailyGoal.create({
          data: {
            userId,
            date: today,
            goalType: "XP",
            target: 50,
            current: 0,
            completed: false,
          } as any,
        });
      })(),
    ]);

  if (!user) {
    throw new Error("Gebruiker niet gevonden");
  }

  const level = profile.level;
  const xpInLevel = profile.totalXp - (level > 1 ? levelSum(level - 1) : 0);
  const xpNeeded = xpToNextLevel(level);

  const weakTopics = [...progresses]
    .sort(
      (a, b) =>
        (a.accuracy ?? 0) - (b.accuracy ?? 0) || a.completed - b.completed
    )
    .slice(0, 4)
    .map((p) => ({
      topic: p.topic,
      accuracy: p.accuracy,
      completed: p.completed,
    }));

  if (weakTopics.length < 4) {
    const fallback: {
      topic: string;
      accuracy: number | null;
      completed: number;
    }[] = [
      { topic: "Kennismaken & De/Het", accuracy: null, completed: 0 },
      { topic: "Werkwoordspelling", accuracy: null, completed: 0 },
      { topic: "Winkel & Betalen", accuracy: null, completed: 0 },
      { topic: "Woordenschat", accuracy: null, completed: 0 },
    ];
    for (const f of fallback) {
      if (weakTopics.length >= 4) break;
      if (!weakTopics.find((w) => w.topic === f.topic)) weakTopics.push(f);
    }
  }

  const recommendedExercise = await findRecommendedExercise(
    userId,
    profile.languageLevel,
    weakTopics[0]?.topic ?? null
  );

  return {
    user: user as User,
    profile,
    streak,
    dailyGoal: dailyGoalRaw,
    progresses,
    recentActivity: recentActivity as DashboardData["recentActivity"],
    recommendedExercise,
    weakTopics,
    nextLevelXpNeeded: xpNeeded,
    currentLevelProgressXp: Math.max(0, xpInLevel),
  };
}

function levelSum(levelUpTo: number) {
  let total = 0;
  for (let i = 1; i <= levelUpTo; i++) total += xpToNextLevel(i);
  return total;
}

async function findRecommendedExercise(
  userId: string,
  languageLevel: Profile["languageLevel"],
  weakestTopic: string | null
) {
  try {
    const whereTopic = weakestTopic
      ? {
          lesson: {
            topic: {
              contains: weakestTopic.split(" ")[0],
            },
          },
        }
      : {};

    let exercises = await db.exercise.findMany({
      take: 10,
      where: {
        lesson: { published: true, languageLevel },
        ...whereTopic,
      },
      include: { lesson: { select: { id: true, title: true, topic: true } } },
      orderBy: [{ difficulty: "asc" }, { xpReward: "asc" }],
    });

    if (exercises.length === 0) {
      exercises = await db.exercise.findMany({
        take: 10,
        where: { lesson: { published: true } },
        include: { lesson: { select: { id: true, title: true, topic: true } } },
        orderBy: [{ difficulty: "asc" }, { xpReward: "asc" }],
      });
    }

    if (exercises.length === 0) return null;

    try {
      const attempts = await db.exerciseAttempt.findMany({
        where: {
          userId,
          exerciseId: { in: exercises.map((e) => e.id) },
        },
        select: { exerciseId: true, correct: true },
      });
      const attemptMap = new Map<string, { count: number; correct: number }>();
      for (const a of attempts) {
        const cur = attemptMap.get(a.exerciseId) ?? { count: 0, correct: 0 };
        cur.count += 1;
        if (a.correct) cur.correct += 1;
        attemptMap.set(a.exerciseId, cur);
      }
      exercises.sort((a, b) => {
        const sa = attemptMap.get(a.id) ?? { count: 0, correct: 0 };
        const sb = attemptMap.get(b.id) ?? { count: 0, correct: 0 };
        return sa.count - sb.count || sa.correct - sb.correct;
      });
    } catch {
      /* Fallback: als pogingen ophalen mislukt, blijf de gesorteerde exercises gebruiken */
    }
    return exercises[0] ?? null;
  } catch (_e) {
    // Uitgebreide fallback: grijp de eerste mogelijke exercise
    try {
      return (
        (await db.exercise.findFirst({
          where: { lesson: { published: true } },
          include: {
            lesson: { select: { id: true, title: true, topic: true } },
          },
        })) ?? null
      );
    } catch {
      return null;
    }
  }
}

export {
  DIFFICULTY_LABELS,
  EXERCISE_TYPE_LABELS,
  LANGUAGE_LEVEL_LABELS,
  XP_REWARDS,
};
