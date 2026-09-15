"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/prisma";
import { getCurrentUser } from "@/auth";
import {
  lessonCreateSchema,
  lessonUpdateSchema,
  exerciseEditorSchema,
  aiGenerateExercisesSchema,
  exerciseIdSchema,
  lessonIdSchema,
  exerciseReorderSchema,
} from "@/lib/validations/lesson";
import { generateExercises } from "@/lib/ai/exercise-generator";
import type { GeneratedExercise } from "@/lib/ai/exercise-generator";

type ServerResult<T = unknown> =
  | { ok: true; data: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

async function getAuthUserIdOrThrow(): Promise<string> {
  const user = await getCurrentUser();
  if (!user?.id) {
    throw new Error("Je moet ingelogd zijn om lessen te beheren.");
  }
  return user.id;
}

function safeStrip<T extends Record<string, unknown>>(
  obj: T | undefined | null,
): Partial<T> {
  const out: Partial<T> = {};
  if (!obj) return out;
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    if (typeof v === "string" && v.trim() === "" && k !== "description" && k !== "coverImage" && k !== "topic" && k !== "hint") {
      continue;
    }
    (out as any)[k] = v;
  }
  return out;
}

export async function createLessonAction(
  raw: Record<string, unknown>,
): Promise<ServerResult<{ id: string }>> {
  try {
    const userId = await getAuthUserIdOrThrow();
    const parsed = lessonCreateSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Controleer de velden en probeer het opnieuw.",
        fieldErrors: parsed.error.flatten().fieldErrors as any,
      };
    }
    const stripped = safeStrip(parsed.data);
    const createData: any = {
      ...parsed.data,
      ...stripped,
      goals: Array.isArray(stripped.goals) && stripped.goals.length > 0 ? (stripped.goals as any) : [],
      createdById: userId,
    };
    const lesson = await db.lesson.create({
      data: createData,
      select: { id: true },
    });
    revalidatePath("/lessons");
    return {
      ok: true,
      data: { id: lesson.id },
      message: "Les aangemaakt — voeg nu oefeningen toe!",
    };
  } catch (e: any) {
    return {
      ok: false,
      error: e?.message ?? "Les aanmaken mislukt.",
    };
  }
}

export async function updateLessonAction(
  lessonIdRaw: string,
  raw: Record<string, unknown>,
): Promise<ServerResult<void>> {
  try {
    const userId = await getAuthUserIdOrThrow();
    const lessonParsed = lessonIdSchema.safeParse({ lessonId: lessonIdRaw });
    if (!lessonParsed.success) {
      return { ok: false, error: "Ongeldige les-id" };
    }
    const parsed = lessonUpdateSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Controleer de velden.",
        fieldErrors: parsed.error.flatten().fieldErrors as any,
      };
    }

    const existing = await db.lesson.findUnique({
      where: { id: lessonParsed.data.lessonId },
      select: { id: true, createdById: true },
    });
    if (!existing) return { ok: false, error: "Les niet gevonden." };
    if (existing.createdById && existing.createdById !== userId) {
      return {
        ok: false,
        error: "Je mag alleen je eigen lessen bewerken.",
      };
    }

    const data = safeStrip(parsed.data);
    await db.lesson.update({
      where: { id: lessonParsed.data.lessonId },
      data: {
        ...data,
        goals: Array.isArray(data.goals) ? data.goals as any : undefined,
        updatedAt: new Date(),
      },
    });
    revalidatePath(`/lessons/${lessonParsed.data.lessonId}`);
    revalidatePath(`/lessons/${lessonParsed.data.lessonId}/edit`);
    revalidatePath("/lessons");
    return { ok: true, data: undefined, message: "Les opgeslagen." };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Opslaan mislukt." };
  }
}

export async function deleteLessonAction(
  lessonIdRaw: string,
): Promise<ServerResult<void>> {
  try {
    const userId = await getAuthUserIdOrThrow();
    const lessonParsed = lessonIdSchema.safeParse({ lessonId: lessonIdRaw });
    if (!lessonParsed.success) {
      return { ok: false, error: "Ongeldige les-id" };
    }
    const existing = await db.lesson.findUnique({
      where: { id: lessonParsed.data.lessonId },
      select: { createdById: true },
    });
    if (!existing) return { ok: false, error: "Les niet gevonden." };
    if (existing.createdById && existing.createdById !== userId) {
      return {
        ok: false,
        error: "Je mag alleen je eigen lessen verwijderen.",
      };
    }
    await db.lesson.delete({ where: { id: lessonParsed.data.lessonId } });
    revalidatePath("/lessons");
    return { ok: true, data: undefined, message: "Les verwijderd." };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Verwijderen mislukt." };
  }
}

async function exerciseContentSanitize(data: any): Promise<any> {
  if (!data || typeof data !== "object") return {};
  return data;
}

export async function createExerciseAction(
  lessonIdRaw: string,
  raw: Record<string, unknown>,
): Promise<ServerResult<{ id: string }>> {
  try {
    const userId = await getAuthUserIdOrThrow();
    const lParsed = lessonIdSchema.safeParse({ lessonId: lessonIdRaw });
    if (!lParsed.success) return { ok: false, error: "Ongeldige les-id" };
    const parsed = exerciseEditorSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Controleer de velden van deze oefening.",
        fieldErrors: parsed.error.flatten().fieldErrors as any,
      };
    }
    const existing = await db.lesson.findUnique({
      where: { id: lParsed.data.lessonId },
      select: { createdById: true },
    });
    if (!existing) return { ok: false, error: "Les niet gevonden." };
    if (existing.createdById && existing.createdById !== userId) {
      return { ok: false, error: "Je mag alleen je eigen lessen bewerken." };
    }
    const content = await exerciseContentSanitize(parsed.data.content);
    const exc = await db.exercise.create({
      data: {
        lessonId: lParsed.data.lessonId,
        type: parsed.data.type,
        title: parsed.data.title,
        description: parsed.data.description || null,
        difficulty: parsed.data.difficulty,
        xpReward: parsed.data.xpReward,
        order: parsed.data.order,
        hint: parsed.data.hint || null,
        content,
      },
      select: { id: true },
    });
    revalidatePath(`/lessons/${lParsed.data.lessonId}/edit`);
    return { ok: true, data: { id: exc.id }, message: "Oefening toegevoegd." };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Oefening aanmaken mislukt." };
  }
}

export async function updateExerciseAction(
  lessonIdRaw: string,
  exerciseIdRaw: string,
  raw: Record<string, unknown>,
): Promise<ServerResult<void>> {
  try {
    const userId = await getAuthUserIdOrThrow();
    const ids = exerciseIdSchema.safeParse({
      lessonId: lessonIdRaw,
      exerciseId: exerciseIdRaw,
    });
    if (!ids.success) return { ok: false, error: "Ongeldige gegevens." };
    const parsed = exerciseEditorSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Controleer de velden.",
        fieldErrors: parsed.error.flatten().fieldErrors as any,
      };
    }
    const existingLesson = await db.lesson.findUnique({
      where: { id: ids.data.lessonId },
      select: { createdById: true },
    });
    if (!existingLesson) return { ok: false, error: "Les niet gevonden." };
    if (existingLesson.createdById && existingLesson.createdById !== userId) {
      return { ok: false, error: "Alleen je eigen lessen bewerken." };
    }
    const existingExc = await db.exercise.findUnique({
      where: { id: ids.data.exerciseId },
      select: { lessonId: true },
    });
    if (!existingExc || existingExc.lessonId !== ids.data.lessonId) {
      return { ok: false, error: "Oefening hoort niet bij deze les." };
    }
    const content = await exerciseContentSanitize(parsed.data.content);
    const data: any = {
      type: parsed.data.type,
      title: parsed.data.title,
      description: parsed.data.description || null,
      difficulty: parsed.data.difficulty,
      xpReward: parsed.data.xpReward,
      order: parsed.data.order,
      hint: parsed.data.hint || null,
      content,
    };
    await db.exercise.update({
      where: { id: ids.data.exerciseId },
      data,
    });
    revalidatePath(`/lessons/${ids.data.lessonId}/edit`);
    return { ok: true, data: undefined, message: "Oefening bijgewerkt." };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Bijwerken mislukt." };
  }
}

export async function deleteExerciseAction(
  lessonIdRaw: string,
  exerciseIdRaw: string,
): Promise<ServerResult<void>> {
  try {
    const userId = await getAuthUserIdOrThrow();
    const ids = exerciseIdSchema.safeParse({
      lessonId: lessonIdRaw,
      exerciseId: exerciseIdRaw,
    });
    if (!ids.success) return { ok: false, error: "Ongeldige gegevens." };
    const existingLesson = await db.lesson.findUnique({
      where: { id: ids.data.lessonId },
      select: { createdById: true },
    });
    if (!existingLesson) return { ok: false, error: "Les niet gevonden." };
    if (existingLesson.createdById && existingLesson.createdById !== userId) {
      return { ok: false, error: "Alleen je eigen lessen." };
    }
    const existingExc = await db.exercise.findUnique({
      where: { id: ids.data.exerciseId },
      select: { lessonId: true },
    });
    if (!existingExc || existingExc.lessonId !== ids.data.lessonId) {
      return { ok: false, error: "Oefening niet gevonden bij deze les." };
    }
    await db.exercise.delete({ where: { id: ids.data.exerciseId } });
    revalidatePath(`/lessons/${ids.data.lessonId}/edit`);
    return { ok: true, data: undefined, message: "Oefening verwijderd." };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Verwijderen mislukt." };
  }
}

export async function reorderExercisesAction(
  lessonIdRaw: string,
  orderedIds: string[],
): Promise<ServerResult<void>> {
  try {
    const userId = await getAuthUserIdOrThrow();
    const parsed = exerciseReorderSchema.safeParse({
      lessonId: lessonIdRaw,
      orderedIds,
    });
    if (!parsed.success) {
      return {
        ok: false,
        error: "Ongeldige invoer voor volgorde.",
        fieldErrors: parsed.error.flatten().fieldErrors as any,
      };
    }
    const lesson = await db.lesson.findUnique({
      where: { id: parsed.data.lessonId },
      select: { createdById: true },
    });
    if (!lesson) return { ok: false, error: "Les niet gevonden." };
    if (lesson.createdById && lesson.createdById !== userId) {
      return { ok: false, error: "Alleen je eigen lessen." };
    }
    await db.$transaction(
      parsed.data.orderedIds.map((id, idx) =>
        db.exercise.update({
          where: { id },
          data: { order: idx },
        }),
      ),
    );
    revalidatePath(`/lessons/${parsed.data.lessonId}/edit`);
    return {
      ok: true,
      data: undefined,
      message: "Volgorde opgeslagen.",
    };
  } catch (e: any) {
    return {
      ok: false,
      error: e?.message ?? "Volgorde opslaan mislukt.",
    };
  }
}

export async function aiGenerateExercisesAction(
  raw: Record<string, unknown>,
): Promise<ServerResult<{ count: number }>> {
  try {
    const userId = await getAuthUserIdOrThrow();
    const parsed = aiGenerateExercisesSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Ongeldige gegevens voor AI-generatie.",
        fieldErrors: parsed.error.flatten().fieldErrors as any,
      };
    }
    const lesson = await db.lesson.findUnique({
      where: { id: parsed.data.lessonId },
      select: {
        id: true,
        title: true,
        category: true,
        languageLevel: true,
        topic: true,
        createdById: true,
        exercises: { orderBy: { order: "asc" }, select: { order: true } },
      },
    });
    if (!lesson) return { ok: false, error: "Les niet gevonden." };
    if (lesson.createdById && lesson.createdById !== userId) {
      return { ok: false, error: "Alleen je eigen lessen." };
    }

    const user = await db.profile.findUnique({
      where: { userId },
      select: { nativeLanguage: true },
    });

    const nextOrder = lesson.exercises.length;

    const generated: GeneratedExercise[] = await generateExercises({
      lessonTitle: lesson.title,
      category: (lesson.category as any) || "OTHER",
      languageLevel: (lesson.languageLevel as any) || "A1",
      topic: parsed.data.topicOverride || lesson.topic || lesson.title,
      type: parsed.data.typeHint as any,
      nativeLanguage: user?.nativeLanguage || undefined,
      count: parsed.data.count,
    });

    if (generated.length === 0) {
      return {
        ok: false,
        error: "AI heeft geen geldige oefeningen kunnen produceren.",
      };
    }

    let order = nextOrder;
    const rows = generated.map((g) => {
      const difficulty = Math.max(1, Math.min(5, Number(g.difficulty) || 1));
      const xp = Math.max(1, Math.min(500, Number(g.xpReward) || 10));
      const content =
        g.content && typeof g.content === "object" ? g.content : {};
      return db.exercise.create({
        data: {
          lessonId: lesson.id,
          type: g.type,
          title: g.title,
          description: g.description || null,
          difficulty,
          xpReward: xp,
          order: order++,
          hint: g.hint || null,
          content: content as any,
        },
      });
    });

    await db.$transaction(rows);
    revalidatePath(`/lessons/${lesson.id}/edit`);
    revalidatePath(`/lessons/${lesson.id}`);
    return {
      ok: true,
      data: { count: generated.length },
      message: `${generated.length} oefening(en) toegevoegd!`,
    };
  } catch (e: any) {
    return {
      ok: false,
      error:
        e?.message ??
        "AI-generatie mislukt. Controleer je API-key of gebruik offline templates.",
    };
  }
}
