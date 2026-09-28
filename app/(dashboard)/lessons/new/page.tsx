import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, isTeacherRole } from "@/auth";
import { LessonEditor } from "@/components/features/lessons/LessonEditor";
import { db } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Nieuwe les",
  description: "Bouw een NT2-les voor je studenten.",
};

export default async function NewLessonPage({ searchParams }: { searchParams: Promise<{ moduleId?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isTeacherRole(user.role)) redirect("/dashboard");

  const modules = await db.lessonModule.findMany({
    where: user.role === "ADMIN" ? {} : { createdById: user.id },
    select: { id: true, title: true }, orderBy: { title: "asc" },
  });
  const { moduleId } = await searchParams;
  return <LessonEditor mode="create" modules={modules} initialModuleId={modules.find((module) => module.id === moduleId)?.id} />;
}
