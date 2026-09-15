import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/auth";
import { db } from "@/lib/db/prisma";
import { LessonEditor } from "@/components/features/lessons/LessonEditor";
import { ExerciseBuilder } from "@/components/features/lessons/ExerciseBuilder";
import { Separator } from "@/components/ui/separator";
import type { ExerciseType, LanguageLevel, LessonCategory } from "@/types";

export const metadata: Metadata = {
  title: "Les bewerken",
  description: "Pas een les aan en beheer de oefeningen.",
};

export default async function EditLessonPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const lesson = await db.lesson.findUnique({
    where: { id },
    include: {
      exercises: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          type: true,
          title: true,
          description: true,
          difficulty: true,
          xpReward: true,
          order: true,
          hint: true,
          content: true,
        },
      },
    },
  });

  if (!lesson) notFound();

  if (lesson.createdById && lesson.createdById !== user.id) {
    redirect("/lessons");
  }

  const goals = Array.isArray(lesson.goals)
    ? (lesson.goals.filter((g): g is string => typeof g === "string") as string[])
    : [];

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <LessonEditor
        mode="edit"
        lessonId={lesson.id}
        initial={{
          title: lesson.title,
          description: lesson.description,
          topic: lesson.topic,
          category: lesson.category as LessonCategory,
          languageLevel: lesson.languageLevel as LanguageLevel,
          goals,
          order: lesson.order,
          published: lesson.published,
          coverImage: lesson.coverImage,
        }}
      />
      <Separator className="my-4" />
      <ExerciseBuilder
        lessonId={lesson.id}
        initialExercises={lesson.exercises.map((e) => ({
          ...e,
          type: e.type as ExerciseType,
          content:
            e.content && typeof e.content === "object"
              ? (e.content as Record<string, unknown>)
              : {},
        }))}
      />
    </div>
  );
}
