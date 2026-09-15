"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db/prisma";
import { getCurrentUser } from "@/auth";
import {
  MultipleChoiceContentSchema,
  FillInBlankContentSchema,
  parseExercise,
} from "@/lib/validations/exercise";
import {
  recordExerciseAttempt,
  ensureProfile,
} from "@/lib/gamification";

export type SubmitResult = {
  ok: boolean;
  correct: boolean;
  score: number;
  xpEarned: number;
  correctAnswer?: string;
  correctAnswers?: string[];
  explanation?: string | null;
  leveledUp?: boolean;
  newLevel?: number;
  error?: string;
  revalidate?: string[];
};

const McpPayloadSchema = z.object({
  type: z.literal("MULTIPLE_CHOICE"),
  selectedIndex: z.number().int().nonnegative(),
});

const FibPayloadSchema = z.object({
  type: z.literal("FILL_IN_BLANK"),
  answer: z.string().min(0),
});

const PayloadSchema = z.union([McpPayloadSchema, FibPayloadSchema]);

function normalizeAnswer(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.,!?;:'"]/g, "");
}

export async function submitExerciseAction(
  exerciseId: string,
  rawPayload: unknown
): Promise<SubmitResult> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      ok: false,
      correct: false,
      score: 0,
      xpEarned: 0,
      error: "Je moet ingelogd zijn om een oefening te maken.",
    };
  }
  await ensureProfile(user.id);

  const payloadResult = PayloadSchema.safeParse(rawPayload);
  if (!payloadResult.success) {
    return {
      ok: false,
      correct: false,
      score: 0,
      xpEarned: 0,
      error: "Ongeldige invoer. Probeer het opnieuw.",
    };
  }
  const payload = payloadResult.data;

  const raw = await db.exercise.findUnique({
    where: { id: exerciseId },
    include: { lesson: true },
  });
  if (!raw) {
    return {
      ok: false,
      correct: false,
      score: 0,
      xpEarned: 0,
      error: "Oefening niet gevonden.",
    };
  }

  let parsed;
  try {
    parsed = parseExercise(raw);
  } catch (e) {
    return {
      ok: false,
      correct: false,
      score: 0,
      xpEarned: 0,
      error:
        e instanceof Error ? e.message : "Oefening heeft ongeldige inhoud.",
    };
  }

  let correct = false;
  let score = 0;
  let mistakes: unknown = null;
  let correctAnswer: string | undefined;
  let correctAnswers: string[] | undefined;
  let explanation: string | null | undefined;

  if (payload.type === "MULTIPLE_CHOICE" && parsed.type === "MULTIPLE_CHOICE") {
    const content = MultipleChoiceContentSchema.parse(parsed.content);
    if (
      payload.selectedIndex < 0 ||
      payload.selectedIndex >= content.options.length
    ) {
      return {
        ok: false,
        correct: false,
        score: 0,
        xpEarned: 0,
        error: "Kies een geldig antwoord.",
      };
    }
    correct = payload.selectedIndex === content.correctIndex;
    score = correct ? 100 : 0;
    correctAnswer = content.options[content.correctIndex];
    explanation = content.explanation ?? null;
    mistakes = {
      selected: content.options[payload.selectedIndex],
      expected: correctAnswer,
    };
  } else if (
    payload.type === "FILL_IN_BLANK" &&
    parsed.type === "FILL_IN_BLANK"
  ) {
    const content = FillInBlankContentSchema.parse(parsed.content);
    const userNorm = normalizeAnswer(payload.answer);
    const matches = content.correctAnswers
      .map(normalizeAnswer)
      .filter((ans) => ans.length > 0);
    correct = matches.includes(userNorm);
    if (correct) {
      score = 100;
    } else {
      let closest = 0;
      for (const m of matches) {
        if (userNorm && m.includes(userNorm)) closest = 80;
      }
      score = closest;
    }
    correctAnswers = content.correctAnswers;
    correctAnswer = correctAnswers[0];
    explanation = content.explanation ?? null;
    mistakes = { userAnswer: payload.answer, expected: correctAnswers };
  } else {
    return {
      ok: false,
      correct: false,
      score: 0,
      xpEarned: 0,
      error:
        "Dit oefentype is (nog) niet beschikbaar om in te leveren. Probeer MULTIPLE_CHOICE of FILL_IN_BLANK.",
    };
  }

  const result = await recordExerciseAttempt({
    userId: user.id,
    exerciseId: raw.id,
    lessonId: raw.lessonId,
    score,
    correct,
    mistakes,
    topic: raw.lesson?.topic ?? undefined,
    baseXpReward: raw.xpReward,
  });

  const paths = [
    "/dashboard",
    "/lessons",
    `/lessons/${raw.lessonId}`,
    `/exercise/${raw.id}`,
    "/progress",
  ];
  paths.forEach((p) => revalidatePath(p));

  return {
    ok: true,
    correct,
    score,
    xpEarned: result.xp.xpEarned,
    correctAnswer,
    correctAnswers,
    explanation,
    leveledUp: result.xp.leveledUp,
    newLevel: result.xp.level,
    revalidate: paths,
  };
}
