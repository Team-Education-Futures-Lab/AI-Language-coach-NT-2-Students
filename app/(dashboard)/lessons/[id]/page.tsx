import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db/prisma";
import { LessonDetailClient } from "@/components/features/lessons/LessonDetailClient";

export const metadata: Metadata = {
  title: "Les",
  description: "Lesdetail met oefeningen.",
};

export default async function LessonDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const lesson = await db.lesson.findUnique({
    where: { id },
    include: {
      exercises: {
        orderBy: [{ difficulty: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!lesson) notFound();

  const totalXp = lesson.exercises.reduce((acc, e) => acc + e.xpReward, 0);

  return <LessonDetailClient lesson={lesson as any} totalXp={totalXp} />;
}
