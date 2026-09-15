"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Award,
  BookOpen,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  EXERCISE_TYPE_LABELS,
  LANGUAGE_LEVEL_LABELS,
  DIFFICULTY_LABELS,
} from "@/lib/constants";
import { useTranslatedPayload } from "@/lib/i18n/useTranslatedPayload";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { Bilingual } from "@/components/ui/bilingual";

type LessonDetail = {
  id: string;
  title: string;
  description: string | null;
  topic: string | null;
  languageLevel: string;
  exercises: Array<{
    id: string;
    type: string;
    title: string;
    description: string | null;
    difficulty: number;
    xpReward: number;
  }>;
};

export function LessonDetailClient({
  lesson,
  totalXp,
}: {
  lesson: LessonDetail;
  totalXp: number;
}) {
  const { showNlRef } = useLocale();
  const translated = useTranslatedPayload(
    {
      back: "Lessen",
      totalXpLabel: `+${totalXp} XP totaal`,
      exercisesCount: `${lesson.exercises.length} oefeningen`,
      firstExercise: "Eerste oefening",
      sectionTitle: "Oefeningen in deze les",
      emptyTitle: "Nog geen oefeningen",
      emptyDescription: "Binnenkort verschijnen hier oefeningen bij deze les.",
      ready: "Klaar om te maken",
      later: "Wordt later geactiveerd",
      practice: "Oefenen",
      levelLabel: "Niveau",
      lesson: {
        title: lesson.title,
        description: lesson.description ?? "",
        topic: lesson.topic ?? "",
      },
      exercises: lesson.exercises.map((ex) => ({
        title: ex.title,
        description: ex.description ?? "",
      })),
    },
    { source: "auto" },
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/lessons">
            <ArrowLeft className="mr-1 h-4 w-4" />
            {showNlRef ? (
              <Bilingual nl="Lessen" size="sm" variant="inline">
                {translated.back}
              </Bilingual>
            ) : (
              translated.back
            )}
          </Link>
        </Button>
      </div>

      <header className="rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:p-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-start">
          <div className="flex items-start gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary shadow-sm">
              <BookOpen className="h-7 w-7" />
            </span>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  {LANGUAGE_LEVEL_LABELS[lesson.languageLevel as keyof typeof LANGUAGE_LEVEL_LABELS] ??
                    lesson.languageLevel}
                </Badge>
                {lesson.topic && (
                  <Badge variant="outline">
                    {showNlRef ? (
                      <Bilingual nl={lesson.topic} size="sm" variant="inline">
                        {translated.lesson.topic}
                      </Bilingual>
                    ) : (
                      translated.lesson.topic
                    )}
                  </Badge>
                )}
                <Badge variant="success">
                  {showNlRef ? (
                    <Bilingual
                      nl={`+${totalXp} XP totaal`}
                      size="sm"
                      variant="inline"
                    >
                      {translated.totalXpLabel}
                    </Bilingual>
                  ) : (
                    translated.totalXpLabel
                  )}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {showNlRef ? (
                  <Bilingual nl={lesson.title} size="xl">
                    {translated.lesson.title}
                  </Bilingual>
                ) : (
                  translated.lesson.title
                )}
              </h1>
              {lesson.description && (
                <p className="max-w-2xl text-muted-foreground">
                  {showNlRef ? (
                    <Bilingual nl={lesson.description} size="sm">
                      {translated.lesson.description}
                    </Bilingual>
                  ) : (
                    translated.lesson.description
                  )}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="h-4 w-4" />
              {showNlRef ? (
                <Bilingual
                  nl={`${lesson.exercises.length} oefeningen`}
                  size="sm"
                  variant="inline"
                >
                  {translated.exercisesCount}
                </Bilingual>
              ) : (
                translated.exercisesCount
              )}
            </div>
            {lesson.exercises.length > 0 && (
              <Button asChild>
                <Link href={`/exercise/${lesson.exercises[0].id}`}>
                  {showNlRef ? (
                    <Bilingual nl="Eerste oefening" size="sm" variant="inline">
                      {translated.firstExercise}
                    </Bilingual>
                  ) : (
                    translated.firstExercise
                  )}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          {showNlRef ? (
            <Bilingual nl="Oefeningen in deze les" size="lg">
              {translated.sectionTitle}
            </Bilingual>
          ) : (
            translated.sectionTitle
          )}
        </h2>
        {lesson.exercises.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="h-8 w-8" />}
            title={translated.emptyTitle}
            description={translated.emptyDescription}
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {lesson.exercises.map((ex, idx) => (
              <Card key={ex.id} className="transition hover:shadow-sm">
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Badge variant="outline">
                      {EXERCISE_TYPE_LABELS[ex.type as keyof typeof EXERCISE_TYPE_LABELS] ??
                        ex.type}
                    </Badge>
                    <Badge variant="secondary">
                      {DIFFICULTY_LABELS[ex.difficulty as keyof typeof DIFFICULTY_LABELS] ??
                        `${translated.levelLabel} ${ex.difficulty}`}
                    </Badge>
                    <Badge variant="success">+{ex.xpReward} XP</Badge>
                  </div>
                  <CardTitle className="pt-2 text-base">
                    {idx + 1}.{" "}
                    {showNlRef ? (
                      <Bilingual nl={ex.title} size="md">
                        {translated.exercises[idx]?.title ?? ex.title}
                      </Bilingual>
                    ) : (
                      translated.exercises[idx]?.title ?? ex.title
                    )}
                  </CardTitle>
                  {ex.description && (
                    <CardDescription className="line-clamp-3">
                      {showNlRef ? (
                        <Bilingual nl={ex.description} size="sm">
                          {translated.exercises[idx]?.description ?? ex.description}
                        </Bilingual>
                      ) : (
                        translated.exercises[idx]?.description ?? ex.description
                      )}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {ex.type === "MULTIPLE_CHOICE" ||
                      ex.type === "FILL_IN_BLANK"
                        ? translated.ready
                        : translated.later}
                    </span>
                    <Button
                      asChild
                      size="sm"
                      disabled={
                        ex.type !== "MULTIPLE_CHOICE" &&
                        ex.type !== "FILL_IN_BLANK"
                      }
                    >
                      <Link href={`/exercise/${ex.id}`}>
                        {translated.practice}{" "}
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
