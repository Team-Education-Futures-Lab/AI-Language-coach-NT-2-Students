"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/prisma";
import { getCurrentUser } from "@/auth";
import {
  ensureProfile,
  awardXpAndLevelUp,
  updateDailyGoal,
  updateStreak,
} from "@/lib/gamification";
import { FLASHCARD } from "@/lib/constants";
import {
  vocabResultSchema,
  type VocabResult,
} from "@/lib/validations/vocabulary";
import { VocabularyStatus, LanguageLevel } from "@/types";

function computeStatus(
  current: VocabularyStatus,
  correctCount: number,
  incorrectCount: number,
  result: VocabResult
): { status: VocabularyStatus; correctDelta: number; incorrectDelta: number } {
  if (result === "again") {
    return {
      status: "LEARNING",
      correctDelta: 0,
      incorrectDelta: 1,
    };
  }
  if (result === "hard") {
    const nextCorrect = correctCount + 1;
    const status: VocabularyStatus =
      nextCorrect >= FLASHCARD.CORRECT_TO_REVIEWING
        ? "REVIEWING"
        : "LEARNING";
    return { status, correctDelta: 1, incorrectDelta: 0 };
  }
  const nextCorrect = correctCount + 1;
  let status: VocabularyStatus = "LEARNING";
  if (nextCorrect >= FLASHCARD.CORRECT_TO_MASTERED) {
    status = "MASTERED";
  } else if (nextCorrect >= FLASHCARD.CORRECT_TO_REVIEWING) {
    status = "REVIEWING";
  }
  return { status, correctDelta: 1, incorrectDelta: 0 };
}

export async function getPracticeVocabBatch(limit: number = 15) {
  const user = await getCurrentUser();
  if (!user) return [];
  await ensureProfile(user.id);

  const profile = await db.profile.findUnique({
    where: { userId: user.id },
    select: { languageLevel: true },
  });

  const preferredLevels: LanguageLevel[] = [LanguageLevel.A1, LanguageLevel.A2];
  if (profile?.languageLevel)
    preferredLevels.unshift(profile.languageLevel as LanguageLevel);

  const words = await db.vocabularyWord.findMany({
    where: { languageLevel: { in: preferredLevels } },
    orderBy: [
      { languageLevel: "asc" },
      { dutchWord: "asc" },
    ],
    take: limit * 3,
  });

  for (const w of words) {
    await db.userVocabulary.upsert({
      where: {
        userId_vocabularyId: { userId: user.id, vocabularyId: w.id },
      },
      update: {},
      create: { userId: user.id, vocabularyId: w.id },
    });
  }

  const queue = await db.userVocabulary.findMany({
    where: {
      userId: user.id,
      vocabulary: {
        id: { in: words.map((w) => w.id) },
      },
      status: { notIn: ["MASTERED"] },
    },
    include: { vocabulary: true },
    orderBy: [
      { lastReviewedAt: "asc" },
      { correctCount: "asc" },
      { incorrectCount: "desc" },
    ],
    take: limit,
  });

  if (queue.length > 0) return queue;

  return db.userVocabulary.findMany({
    where: { userId: user.id },
    include: { vocabulary: true },
    orderBy: [{ lastReviewedAt: "asc" }, { id: "asc" }],
    take: limit,
  });
}

export async function reviewVocabCardAction(
  userVocabularyId: string,
  rawResult: VocabResult
) {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "Je bent niet ingelogd." };
  }
  const parsed = vocabResultSchema.safeParse(rawResult);
  if (!parsed.success) {
    return { ok: false, error: "Ongeldig antwoordtype." };
  }
  const result = parsed.data;

  const row = await db.userVocabulary.findUnique({
    where: { id: userVocabularyId },
  });
  if (!row || row.userId !== user.id) {
    return { ok: false, error: "Deze kaart is niet van jou." };
  }

  const { status, correctDelta, incorrectDelta } = computeStatus(
    row.status as VocabularyStatus,
    row.correctCount,
    row.incorrectCount,
    result
  );

  const updated = await db.userVocabulary.update({
    where: { id: row.id },
    data: {
      status,
      correctCount: row.correctCount + correctDelta,
      incorrectCount: row.incorrectCount + incorrectDelta,
      lastReviewedAt: new Date(),
    },
    include: { vocabulary: true },
  });

  if (correctDelta > 0) {
    const xpGain = result === "easy" ? 5 : result === "hard" ? 3 : 0;
    if (xpGain > 0) {
      await awardXpAndLevelUp(user.id, xpGain);
      await updateDailyGoal(user.id, xpGain, correctDelta);
      await updateStreak(user.id);
    }
  }

  revalidatePath("/practice");
  revalidatePath("/dashboard");

  return {
    ok: true,
    status: updated.status,
    correctCount: updated.correctCount,
    incorrectCount: updated.incorrectCount,
    word: updated.vocabulary.dutchWord,
  };
}
