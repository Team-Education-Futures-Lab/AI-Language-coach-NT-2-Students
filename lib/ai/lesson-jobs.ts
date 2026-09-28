import { randomUUID } from "node:crypto";
import { db } from "@/lib/db/prisma";
import { generateModuleLesson } from "./lesson-generator";
import { moduleSchema, nextOccurrence } from "@/lib/validations/lesson-module";

const teacherRoles = ["ADMIN", "TEACHER"];
const leaseMs = 5 * 60 * 1000;

export async function heartbeatLessonWorker() {
  const now = new Date();
  await db.lessonWorker.upsert({
    where: { id: "lesson-worker" },
    create: { id: "lesson-worker", heartbeatAt: now },
    update: { heartbeatAt: now },
  });
}

export async function enqueueScheduledLessons(now = new Date(), moduleId?: string) {
  const modules = await db.lessonModule.findMany({
    where: { id: moduleId, enabled: true, nextRunAt: { lte: now }, createdBy: { role: { in: teacherRoles } } },
    take: 25, orderBy: { nextRunAt: "asc" },
  });
  for (const lessonModule of modules) {
    if (!lessonModule.nextRunAt || !lessonModule.scheduleAnchor) continue;
    await db.$transaction(async (tx) => {
      // Compare-and-set prevents two workers from scheduling the same occurrence.
      const claimed = await tx.lessonModule.updateMany({
        where: { id: lessonModule.id, enabled: true, nextRunAt: lessonModule.nextRunAt },
        data: { nextRunAt: nextOccurrence(lessonModule.scheduleAnchor!, lessonModule.cadence, now) },
      });
      if (!claimed.count) return;
      await tx.lessonGeneration.create({
        data: {
          moduleId: lessonModule.id, topic: "",
          scheduleKey: `${lessonModule.id}:${lessonModule.nextRunAt!.toISOString()}`,
        },
      });
    });
  }
}

export async function processNextLessonJob(moduleId?: string): Promise<boolean> {
  const now = new Date();
  // A crashed final attempt must not leave an eternally "running" job.
  await db.lessonGeneration.updateMany({
    where: { moduleId, status: "RUNNING", lockedUntil: { lt: now }, attempts: { gte: 3 } },
    data: { status: "FAILED", claimToken: null, lockedUntil: null, error: "Generatie onderbroken. Probeer de les opnieuw te maken." },
  });
  const runnable = {
    moduleId,
    attempts: { lt: 3 },
    OR: [
      { status: "PENDING", availableAt: { lte: now } },
      { status: "RUNNING", lockedUntil: { lt: now } },
    ],
  };
  const job = await db.lessonGeneration.findFirst({
    where: runnable, orderBy: { createdAt: "asc" },
    include: { module: { include: { createdBy: { select: { role: true } } } } },
  });
  if (!job) return false;
  const token = randomUUID();
  const claimed = await db.lessonGeneration.updateMany({
    where: { id: job.id, ...runnable },
    data: { status: "RUNNING", claimToken: token, lockedUntil: new Date(now.getTime() + leaseMs), attempts: { increment: 1 }, error: null },
  });
  if (!claimed.count) return true;
  try {
    if (!teacherRoles.includes(job.module.createdBy.role)) throw new Error("De eigenaar heeft geen docentrechten meer.");
    const previous = await db.lesson.findMany({
      where: { moduleId: job.moduleId }, orderBy: { createdAt: "desc" }, take: 30, select: { title: true },
    });
    const generated = await generateModuleLesson(moduleSchema.parse(job.module), job.topic, previous.map((lesson) => lesson.title));
    await db.$transaction(async (tx) => {
      const owner = await tx.user.findUnique({ where: { id: job.module.createdById }, select: { role: true } });
      if (!owner || !teacherRoles.includes(owner.role)) throw new Error("De eigenaar heeft geen docentrechten meer.");
      // Lock the job before saving; a stale worker may never create a second lesson.
      const owned = await tx.lessonGeneration.updateMany({
        where: { id: job.id, claimToken: token, status: "RUNNING", lockedUntil: { gt: new Date() } },
        data: { status: "COMPLETED", lockedUntil: null },
      });
      if (!owned.count) return;
      const last = await tx.lesson.aggregate({ where: { moduleId: job.moduleId }, _max: { order: true } });
      const lesson = await tx.lesson.create({
        data: {
          title: generated.title, description: generated.description, goals: generated.goals,
          moduleId: job.moduleId, createdById: job.module.createdById,
          languageLevel: job.module.languageLevel, category: "OTHER",
          topic: job.topic || generated.title, order: (last._max.order ?? -1) + 1,
          published: false,
          exercises: {
            create: generated.exercises.map((content, order) => ({
              type: "MULTIPLE_CHOICE", title: `Oefening ${order + 1}`,
              order, content, difficulty: 1, xpReward: 10,
            })),
          },
        },
      });
      await tx.lessonGeneration.update({ where: { id: job.id }, data: { lessonId: lesson.id, claimToken: null } });
    });
  } catch (error) {
    await db.lessonGeneration.updateMany({
      where: { id: job.id, claimToken: token },
      data: {
        status: job.attempts + 1 >= 3 ? "FAILED" : "PENDING",
        availableAt: new Date(Date.now() + 5 * 60 * 1000),
        claimToken: null, lockedUntil: null,
        error: error instanceof Error ? error.message.slice(0, 1000) : "Lesgeneratie mislukt.",
      },
    });
  }
  return true;
}
