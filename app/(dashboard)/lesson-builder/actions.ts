"use server";

import { revalidatePath } from "next/cache";
import { requireTeacher } from "@/auth";
import { db } from "@/lib/db/prisma";
import { generationSchema, moduleSchema, scheduleSchema } from "@/lib/validations/lesson-module";
import { z } from "zod";

type Result<T = undefined> = { ok: true; data: T } | { ok: false; error: string };
const idSchema = z.string().cuid();
const errorMessage = (error: unknown) => error instanceof z.ZodError
  ? error.issues[0]?.message ?? "Controleer de velden."
  : error instanceof Error ? error.message : "Opslaan mislukt.";

async function managedModule(id: string) {
  const teacher = await requireTeacher();
  const lessonModule = await db.lessonModule.findUnique({ where: { id: idSchema.parse(id) } });
  if (!lessonModule || (teacher.role !== "ADMIN" && lessonModule.createdById !== teacher.id)) {
    throw new Error("Je mag deze module niet beheren.");
  }
  return { teacher, lessonModule };
}

export async function saveModuleAction(id: string | null, raw: unknown): Promise<Result<{ id: string }>> {
  try {
    const teacher = await requireTeacher();
    const data = moduleSchema.parse(raw);
    if (id) await managedModule(id);
    const lessonModule = id
      ? await db.lessonModule.update({ where: { id }, data })
      : await db.lessonModule.create({ data: { ...data, createdById: teacher.id } });
    revalidatePath("/lesson-builder");
    revalidatePath("/lessons");
    return { ok: true, data: { id: lessonModule.id } };
  } catch (error) { return { ok: false, error: errorMessage(error) }; }
}

export async function saveScheduleAction(id: string, raw: unknown): Promise<Result> {
  try {
    await managedModule(id);
    const data = scheduleSchema.parse(raw);
    await db.lessonModule.update({
      where: { id },
      data: {
        enabled: data.enabled, cadence: data.cadence,
        ...(data.enabled ? { scheduleAnchor: new Date(data.firstRunAt!), nextRunAt: new Date(data.firstRunAt!) } : {}),
      },
    });
    revalidatePath("/lesson-builder");
    return { ok: true, data: undefined };
  } catch (error) { return { ok: false, error: errorMessage(error) }; }
}

export async function queueLessonAction(raw: unknown): Promise<Result> {
  try {
    const input = generationSchema.parse(raw);
    await managedModule(input.moduleId);
    await db.$transaction(async (tx) => {
      // Serialize queue requests for this module, including rapid double clicks.
      await tx.lessonModule.update({ where: { id: input.moduleId }, data: { updatedAt: new Date() } });
      const pending = await tx.lessonGeneration.count({
        where: { moduleId: input.moduleId, status: { in: ["PENDING", "RUNNING"] } },
      });
      if (pending) throw new Error("Er staat al een les voor deze module in de wachtrij.");
      await tx.lessonGeneration.create({ data: input });
    });
    revalidatePath("/lesson-builder");
    return { ok: true, data: undefined };
  } catch (error) { return { ok: false, error: errorMessage(error) }; }
}

export async function cancelGenerationAction(id: string): Promise<Result> {
  try {
    await requireTeacher();
    const job = await db.lessonGeneration.findUnique({ where: { id: idSchema.parse(id) } });
    if (!job) throw new Error("Taak niet gevonden.");
    await managedModule(job.moduleId);
    await db.lessonGeneration.updateMany({
      where: { id, status: { in: ["PENDING", "RUNNING"] } },
      data: { status: "CANCELLED", claimToken: null, lockedUntil: null },
    });
    revalidatePath("/lesson-builder");
    return { ok: true, data: undefined };
  } catch (error) { return { ok: false, error: errorMessage(error) }; }
}
