"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2, XCircle, ChevronRight } from "lucide-react";
import type { ParsedMultipleChoice } from "@/lib/validations/exercise";
import { submitExerciseAction } from "@/app/(dashboard)/exercise/[id]/actions";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { nlSources } from "@/lib/i18n/nlSources";
import { Bilingual } from "@/components/ui/bilingual";
import { useTranslatedPayload } from "@/lib/i18n/useTranslatedPayload";

interface Props {
  exercise: ParsedMultipleChoice;
  nextExerciseId?: string | null;
}

export function MultipleChoiceExerciseClient({
  exercise,
  nextExerciseId,
}: Props) {
  const router = useRouter();
  const { t, showNlRef } = useLocale();
  const translatedExercise = useTranslatedPayload(
    {
      title: exercise.title,
      question: exercise.content.question,
      options: exercise.content.options,
    },
    { source: "auto" },
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<null | {
    correct: boolean;
    score: number;
    xpEarned: number;
    correctAnswer?: string;
    explanation?: string | null;
    leveledUp?: boolean;
    newLevel?: number;
  }>(null);
  const [isPending, startTransition] = useTransition();
  const translatedResult = useTranslatedPayload(
    result
      ? {
          correctAnswer: result.correctAnswer ?? "",
          explanation: result.explanation ?? "",
        }
      : {
          correctAnswer: "",
          explanation: "",
        },
    { source: "auto" },
  );

  const correctIndex = exercise.content.correctIndex;

  function handleSubmit() {
    if (selected === null || isPending) return;
    startTransition(async () => {
      const r = await submitExerciseAction(exercise.id, {
        type: "MULTIPLE_CHOICE",
        selectedIndex: selected,
      });
      if (!r.ok) {
        toast.error(r.error ?? (showNlRef ? nlSources.practice.submitFailed : "Submit failed."));
        return;
      }
      setResult({
        correct: r.correct,
        score: r.score,
        xpEarned: r.xpEarned,
        correctAnswer: r.correctAnswer,
        explanation: r.explanation,
        leveledUp: r.leveledUp,
        newLevel: r.newLevel,
      });
      toast(
        r.correct ? (showNlRef ? nlSources.practice.feedbackGood : t.practice.feedbackGood) : (showNlRef ? nlSources.practice.feedbackAlmost : t.practice.feedbackRetry),
        {
          description: (showNlRef
                ? `${nlSources.practice.xpEarned(r.xpEarned)}${r.leveledUp ? ` — ${nlSources.practice.levelUp(r.newLevel!)}` : ""}.`
                : `${t.practice.rewardXp(r.xpEarned).replace("+", "")} earned${r.leveledUp ? ` — Level up to ${r.newLevel}!` : ""}.`),
        }
      );
      router.refresh();
    });
  }

  function reset() {
    setSelected(null);
    setResult(null);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">
            {showNlRef ? (
              <Bilingual nl={nlSources.practice.multipleChoiceBadge} size="sm" variant="inline">
                Multiple choice
              </Bilingual>
            ) : "Multiple choice"}
          </Badge>
          <Badge variant="success">+{exercise.xpReward} XP</Badge>
        </div>
        <CardTitle className="pt-2 text-lg">
          {showNlRef ? (
            <Bilingual nl={exercise.title} size="lg">
              {translatedExercise.title}
            </Bilingual>
          ) : (
            translatedExercise.title
          )}
        </CardTitle>
        <p className="mt-2 rounded-xl border bg-muted/40 p-4 text-base">
          {showNlRef ? (
            <Bilingual nl={exercise.content.question} size="sm">
              {translatedExercise.question}
            </Bilingual>
          ) : (
            translatedExercise.question
          )}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ol className="grid gap-2">
          {exercise.content.options.map((opt, i) => {
            const isSelected = selected === i;
            const isCorrect = i === correctIndex;
            const showState = result !== null;
            return (
              <li key={i}>
                <Button
                  type="button"
                  variant={
                    showState
                      ? isCorrect
                        ? "default"
                        : isSelected && !result.correct
                        ? "destructive"
                        : "outline"
                      : isSelected
                      ? "default"
                      : "outline"
                  }
                  className={
                    "h-auto w-full !justify-start !px-4 !py-3 text-left font-normal"
                  }
                  disabled={result !== null || isPending}
                  onClick={() => setSelected(i)}
                >
                  <span className="mr-3 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-background text-xs font-bold text-muted-foreground">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="min-w-0 flex-1">
                    {showNlRef ? (
                      <Bilingual nl={opt} size="sm">
                        {translatedExercise.options?.[i] ?? opt}
                      </Bilingual>
                    ) : (
                      translatedExercise.options?.[i] ?? opt
                    )}
                  </span>
                  {showState && isCorrect && (
                    <CheckCircle2 className="ml-2 h-5 w-5 shrink-0 text-emerald-500" />
                  )}
                  {showState && isSelected && !result.correct && (
                    <XCircle className="ml-2 h-5 w-5 shrink-0 text-rose-500" />
                  )}
                </Button>
              </li>
            );
          })}
        </ol>

        {result && (
          <div
            className={
              "rounded-xl border p-4 " +
              (result.correct
                ? "border-emerald-500/40 bg-emerald-500/10"
                : "border-rose-500/40 bg-rose-500/10")
            }
          >
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
              <Badge variant={result.correct ? "success" : "warning"}>
                {showNlRef ? (
                  <Bilingual nl={nlSources.practice.scorePercent(result.score)} size="sm" variant="inline">
                    {`Score ${result.score}%`}
                  </Bilingual>
                ) : `Score ${result.score}%`}
              </Badge>
              <Badge variant="outline">
                {showNlRef ? (
                  <Bilingual nl={nlSources.practice.rewardXp(result.xpEarned)} size="sm" variant="inline">
                    {t.practice.rewardXp(result.xpEarned)}
                  </Bilingual>
                ) : t.practice.rewardXp(result.xpEarned)}
              </Badge>
              {result.leveledUp && (
                <Badge variant="default">
                {showNlRef ? (
                  <Bilingual nl={nlSources.practice.levelUp(result.newLevel!)} size="sm" variant="inline">
                    {t.practice.rewardXp(0).replace("+0 XP", `Level up to ${result.newLevel}!`)}
                  </Bilingual>
                ) : `Level up to ${result.newLevel}!`}
              </Badge>
              )}
            </div>
            {!result.correct && result.correctAnswer && (
              <p className="mt-3 text-sm">
                <span className="font-semibold">
                  {showNlRef ? (
                    <Bilingual nl={nlSources.practice.correctAnswer} size="sm" variant="inline">
                      Correct answer:
                    </Bilingual>
                  ) : "Correct answer:"}
                </span>{" "}
                {showNlRef ? (
                  <Bilingual nl={result.correctAnswer} size="sm">
                    {translatedResult.correctAnswer}
                  </Bilingual>
                ) : (
                  translatedResult.correctAnswer
                )}
              </p>
            )}
            {result.explanation && (
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {showNlRef ? (
                    <Bilingual nl={nlSources.practice.explanationLabel} size="sm" variant="inline">
                      Explanation:
                    </Bilingual>
                  ) : "Explanation:"}
                </span>{" "}
                {showNlRef ? (
                  <Bilingual nl={result.explanation} size="sm">
                    {translatedResult.explanation}
                  </Bilingual>
                ) : (
                  translatedResult.explanation
                )}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
          {!result ? (
            <>
              <Button
                onClick={handleSubmit}
                disabled={selected === null || isPending}
              >
                {isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {showNlRef ? (
                  <Bilingual nl={nlSources.practice.ctaCheckAnswer} size="md" variant="inline">
                    Check answer
                  </Bilingual>
                ) : "Check answer"}
              </Button>
              <span className="text-xs text-muted-foreground">
                {showNlRef ? (
                  <Bilingual nl={nlSources.practice.serverSavedHint} size="sm">
                    Your score and XP are saved on the server.
                  </Bilingual>
                ) : "Your score and XP are saved on the server."}
              </span>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={reset}>
                {showNlRef ? (
                  <Bilingual nl={nlSources.practice.ctaRetry} size="md" variant="inline">
                    Try again
                  </Bilingual>
                ) : "Try again"}
              </Button>
              {nextExerciseId && (
                <Button asChild>
                  <Link href={`/exercise/${nextExerciseId}`}>
                    {showNlRef ? (
                      <Bilingual nl={nlSources.practice.ctaNextExercise} size="md" variant="inline">
                        Next exercise
                      </Bilingual>
                    ) : "Next exercise"}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
