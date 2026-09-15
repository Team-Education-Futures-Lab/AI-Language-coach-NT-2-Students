import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/auth";
import { db } from "@/lib/db/prisma";
import { parseExercise } from "@/lib/validations/exercise";
import { ExerciseDetailClient } from "@/components/features/exercises/ExerciseDetailClient";

export const metadata: Metadata = {
  title: "Oefening",
  description: "Maak een NT2-oefening en verdien XP.",
};

export default async function ExercisePage(props: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await props.params;
  const raw = await db.exercise.findUnique({
    where: { id },
    include: {
      lesson: { select: { id: true, title: true, topic: true } },
    },
  });
  if (!raw) notFound();

  const siblings = raw.lessonId
    ? await db.exercise.findMany({
        where: { lessonId: raw.lessonId },
        select: { id: true },
        orderBy: [{ difficulty: "asc" }, { createdAt: "asc" }],
      })
    : [];
  const currentIndex = siblings.findIndex((s) => s.id === id);
  const nextExerciseId =
    currentIndex >= 0 && currentIndex < siblings.length - 1
      ? siblings[currentIndex + 1].id
      : null;

  let parsed;
  let parseError: string | null = null;
  try {
    parsed = parseExercise(raw);
  } catch (e) {
    parseError = e instanceof Error ? e.message : "Oefening is ongeldig.";
  }

  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="h-6 w-6 animate-pulse rounded-md bg-muted" />}>
        <ExerciseDetailClient
          raw={{
            type: raw.type,
            difficulty: raw.difficulty,
            xpReward: raw.xpReward,
            title: raw.title,
            description: raw.description,
            lessonId: raw.lessonId,
            lessonTitle: raw.lesson?.title ?? null,
            lessonTopic: raw.lesson?.topic ?? null,
          }}
          parsed={parsed ?? null}
          parseError={parseError}
          nextExerciseId={nextExerciseId}
        />
      </Suspense>
    </div>
  );
}
