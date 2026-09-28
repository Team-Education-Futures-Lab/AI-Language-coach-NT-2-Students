import { redirect } from "next/navigation";
import { getCurrentUser, isTeacherRole } from "@/auth";
import { db } from "@/lib/db/prisma";
import { ModuleWorkspace } from "@/components/features/lessons/ModuleWorkspace";

export const metadata = { title: "AI-lesbouwer" };

export default async function LessonBuilderPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isTeacherRole(user.role)) redirect("/dashboard");
  const [modules, worker] = await Promise.all([
    db.lessonModule.findMany({
      where: user.role === "ADMIN" ? {} : { createdById: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        lessons: { orderBy: [{ order: "asc" }, { createdAt: "asc" }], select: { id: true, title: true, published: true } },
        generations: { orderBy: { createdAt: "desc" }, take: 8, select: { id: true, status: true, error: true, lessonId: true, createdAt: true, availableAt: true } },
      },
    }),
    db.lessonWorker.findUnique({ where: { id: "lesson-worker" } }),
  ]);
  return <ModuleWorkspace
    workerOnline={!!worker && Date.now() - worker.heartbeatAt.getTime() < 60000}
    modules={modules.map((module) => ({
      id: module.id, title: module.title, description: module.description,
      sector: module.sector, languageLevel: module.languageLevel,
      instructions: module.instructions, exerciseCount: module.exerciseCount,
      cadence: module.cadence, enabled: module.enabled,
      nextRunAt: module.nextRunAt?.toISOString() ?? null, lessons: module.lessons,
      generations: module.generations.map((job) => ({ ...job, createdAt: job.createdAt.toISOString(), availableAt: job.availableAt.toISOString() })),
    }))}
  />;
}
