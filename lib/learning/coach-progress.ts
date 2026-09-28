import { Prisma } from "@prisma/client";
import { db } from "@/lib/db/prisma";
import { levelFromTotalXp } from "@/lib/constants";
import { getMission, type MissionFocus } from "@/lib/learning/missions";
import type { CoachMessage, CoachReviewResponse } from "@/lib/ai/voice-coach";

type SaveCoachProgressInput = {
  userId: string;
  conversationId: string;
  title: string;
  level: string;
  sector: string;
  missionId?: string;
  messages: CoachMessage[];
  review: CoachReviewResponse;
};

function startOfDay(date: Date) {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day;
}

function daysBetween(from: Date, to: Date) {
  return Math.round(
    (startOfDay(to).getTime() - startOfDay(from).getTime()) / 86_400_000,
  );
}

export async function saveCoachProgress(input: SaveCoachProgressInput) {
  const mission = getMission(input.missionId);
  const focus: MissionFocus = mission?.focus ?? "Spreken";
  const xpEarned = mission?.xp ?? 30;
  const now = new Date();
  const today = startOfDay(now);

  return db.$transaction(async (tx) => {
    const existing = await tx.conversation.findUnique({
      where: { id: input.conversationId },
      select: { context: true },
    });
    if (existing) {
      const context = existing.context as {
        reward?: { xpEarned?: number; level?: number; leveledUp?: boolean };
      } | null;
      return {
        xpEarned: context?.reward?.xpEarned ?? 0,
        level: context?.reward?.level ?? 1,
        leveledUp: context?.reward?.leveledUp ?? false,
        alreadySaved: true,
      };
    }

    const profile = await tx.profile.upsert({
      where: { userId: input.userId },
      update: {},
      create: { userId: input.userId },
      select: { totalXp: true, level: true },
    });
    const nextXp = profile.totalXp + xpEarned;
    const levelResult = levelFromTotalXp(nextXp);
    const reward = {
      xpEarned,
      level: levelResult.level,
      leveledUp: levelResult.level > profile.level,
    };

    await tx.profile.update({
      where: { userId: input.userId },
      data: { totalXp: nextXp, level: levelResult.level },
    });

    await tx.dailyGoal.upsert({
      where: { userId_date: { userId: input.userId, date: today } },
      update: {
        current: { increment: xpEarned },
      },
      create: {
        userId: input.userId,
        date: today,
        goalType: "XP",
        target: 50,
        current: xpEarned,
        completed: xpEarned >= 50,
      },
    });
    const dailyGoal = await tx.dailyGoal.findUniqueOrThrow({
      where: { userId_date: { userId: input.userId, date: today } },
    });
    if (!dailyGoal.completed && dailyGoal.current >= dailyGoal.target) {
      await tx.dailyGoal.update({
        where: { id: dailyGoal.id },
        data: { completed: true },
      });
    }

    const streak = await tx.streak.findUnique({
      where: { userId: input.userId },
    });
    if (!streak) {
      await tx.streak.create({
        data: {
          userId: input.userId,
          currentStreak: 1,
          longestStreak: 1,
          lastActiveAt: today,
        },
      });
    } else {
      const difference = daysBetween(streak.lastActiveAt ?? streak.updatedAt, today);
      if (difference > 0) {
        const currentStreak = difference === 1 ? streak.currentStreak + 1 : 1;
        await tx.streak.update({
          where: { id: streak.id },
          data: {
            currentStreak,
            longestStreak: Math.max(streak.longestStreak, currentStreak),
            lastActiveAt: today,
          },
        });
      }
    }

    await tx.progress.upsert({
      where: {
        userId_topic: {
          userId: input.userId,
          topic: focus,
        },
      },
      update: {
        total: { increment: 1 },
        completed: { increment: 1 },
        lastActiveAt: now,
      },
      create: {
        userId: input.userId,
        topic: focus,
        total: 1,
        completed: 1,
        lastActiveAt: now,
      },
    });

    await tx.conversation.create({
      data: {
        id: input.conversationId,
        userId: input.userId,
        title: input.title,
        languageLevel: input.level,
        context: JSON.parse(
          JSON.stringify({
            kind: "coach-review",
            sector: input.sector,
            missionId: mission?.id ?? null,
            missionFocus: focus,
            missionMode: mission?.mode ?? "ROLEPLAY",
            review: input.review,
            reward,
          }),
        ) as Prisma.InputJsonValue,
        messages: {
          create: input.messages.map(({ role, content }) => ({ role, content })),
        },
      },
    });

    return { ...reward, alreadySaved: false };
  });
}
