"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, Sparkles } from "lucide-react";
import {
  EXERCISE_TYPE_LABELS,
  DIFFICULTY_LABELS,
} from "@/lib/constants";
import { MultipleChoiceExerciseClient } from "@/components/features/exercises/multiple-choice";
import { FillInBlankExerciseClient } from "@/components/features/exercises/fill-in-blank";
import { EmptyState } from "@/components/ui/empty-state";
import { useTranslatedPayload } from "@/lib/i18n/useTranslatedPayload";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { Bilingual } from "@/components/ui/bilingual";
import type { ParsedExercise } from "@/lib/validations/exercise";

type RawExerciseHeader = {
  type: string;
  difficulty: number;
  xpReward: number;
  title: string;
  description: string | null;
  lessonId: string | null;
  lessonTitle: string | null;
  lessonTopic: string | null;
};

export function ExerciseDetailClient({
  raw,
  parsed,
  parseError,
  nextExerciseId,
}: {
  raw: RawExerciseHeader;
  parsed: ParsedExercise | null;
  parseError: string | null;
  nextExerciseId: string | null;
}) {
  const { showNlRef } = useLocale();
  const translated = useTranslatedPayload(
    {
      back:
        raw.lessonTitle && raw.lessonId
          ? `Les: ${raw.lessonTitle}`
          : "Lessen",
      title: raw.title,
      description: raw.description ?? "",
      topic: raw.lessonTopic ?? "",
      difficultyLabel: `Moeilijkheid ${raw.difficulty}`,
      topicLabel: raw.lessonTopic ? `Onderwerp: ${raw.lessonTopic}` : "",
      parseTitle: "Deze oefening kan niet geladen worden",
      unsupportedTitle: "Dit oefentype is nog niet geïmplementeerd",
      unsupportedDescription: `${
        EXERCISE_TYPE_LABELS[raw.type] ?? raw.type
      }-oefeningen komen in een volgende fase beschikbaar. Je kunt nu al wel multiple choice en invuloefeningen maken.`,
      soonTitle: "Binnenkort beschikbaar",
      soonDescription:
        "We werken aan AI-gestuurde vertalingen, zinscorrecties en conversatie-oefeningen.",
      otherLesson: "Andere les kiezen",
      backDashboard: "Terug naar dashboard",
    },
    { source: "auto" },
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={raw.lessonId ? `/lessons/${raw.lessonId}` : "/lessons"}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            {showNlRef ? (
              <Bilingual
                nl={
                  raw.lessonTitle && raw.lessonId
                    ? `Les: ${raw.lessonTitle}`
                    : "Lessen"
                }
                size="sm"
                variant="inline"
              >
                {translated.back}
              </Bilingual>
            ) : (
              translated.back
            )}
          </Link>
        </Button>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">
              {EXERCISE_TYPE_LABELS[raw.type] ?? raw.type}
            </Badge>
            <Badge variant="secondary">
              {DIFFICULTY_LABELS[raw.difficulty] ?? translated.difficultyLabel}
            </Badge>
            <Badge variant="success">+{raw.xpReward} XP</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {showNlRef ? (
              <Bilingual nl={raw.title} size="xl">
                {translated.title}
              </Bilingual>
            ) : (
              translated.title
            )}
          </h1>
          {raw.description && (
            <p className="max-w-3xl text-muted-foreground">
              {showNlRef ? (
                <Bilingual nl={raw.description} size="sm">
                  {translated.description}
                </Bilingual>
              ) : (
                translated.description
              )}
            </p>
          )}
          {raw.lessonTopic && (
            <Badge variant="outline" className="text-xs">
              {showNlRef ? (
                <Bilingual
                  nl={`Onderwerp: ${raw.lessonTopic}`}
                  size="sm"
                  variant="inline"
                >
                  {translated.topicLabel}
                </Bilingual>
              ) : (
                translated.topicLabel
              )}
            </Badge>
          )}
        </div>
      </header>

      {parseError ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{translated.parseTitle}</CardTitle>
            <CardDescription>{parseError}</CardDescription>
          </CardHeader>
        </Card>
      ) : parsed && parsed.type === "MULTIPLE_CHOICE" ? (
        <MultipleChoiceExerciseClient
          exercise={parsed}
          nextExerciseId={nextExerciseId}
        />
      ) : parsed && parsed.type === "FILL_IN_BLANK" ? (
        <FillInBlankExerciseClient
          exercise={parsed}
          nextExerciseId={nextExerciseId}
        />
      ) : (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-muted-foreground">
              <Lock className="h-5 w-5" />
              {translated.unsupportedTitle}
            </CardTitle>
            <CardDescription>{translated.unsupportedDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <EmptyState
                className="max-w-xl flex-1"
                icon={<Sparkles className="h-8 w-8" />}
                title={translated.soonTitle}
                description={translated.soonDescription}
              />
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href="/lessons">{translated.otherLesson}</Link>
                </Button>
                <Button asChild>
                  <Link href="/dashboard">{translated.backDashboard}</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
