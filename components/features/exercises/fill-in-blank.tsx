"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Loader2,
  XCircle,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import type { ParsedFillInBlank } from "@/lib/validations/exercise";
import { submitExerciseAction } from "@/app/(dashboard)/exercise/[id]/actions";
import { useTranslatedPayload } from "@/lib/i18n/useTranslatedPayload";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { Bilingual } from "@/components/ui/bilingual";

interface Props {
  exercise: ParsedFillInBlank;
  nextExerciseId?: string | null;
}

function renderSentence(
  sentence: string,
  placeholder: string,
  answer: string,
  onAnswerChange: (v: string) => void,
  disabled: boolean,
  inputPlaceholder: string,
  inputAriaLabel: string,
) {
  const parts = sentence.split(placeholder);
  return (
    <div className="flex flex-wrap items-center gap-2 leading-relaxed">
      {parts.map((part, i) => (
        <span key={i} className="contents">
          <span className="whitespace-pre-wrap text-base">{part}</span>
          {i < parts.length - 1 && (
            <Input
              key={`input-${i}`}
              value={answer}
              onChange={(e) => onAnswerChange(e.target.value)}
              disabled={disabled}
              className="!h-10 w-40 rounded-lg border-dashed text-center font-medium md:w-52"
              placeholder={inputPlaceholder}
              aria-label={inputAriaLabel}
            />
          )}
        </span>
      ))}
    </div>
  );
}

export function FillInBlankExerciseClient({
  exercise,
  nextExerciseId,
}: Props) {
  const { showNlRef } = useLocale();
  const router = useRouter();
  const translatedExercise = useTranslatedPayload(
    {
      title: exercise.title,
      description: exercise.description ?? "",
      sentence: exercise.content.sentence,
      hint:
        "Let op hoofdletters niet op de plaats van kleine letters is niet belangrijk. Punten en komma's worden ook genegeerd.",
      check: "Controleer",
      multiCorrect: "Er kunnen meerdere antwoorden correct zijn.",
      retry: "Opnieuw",
      next: "Volgende oefening",
      placeholderHint: "typ hier...",
      inputAria: "Het lege vakje van de zin",
    },
    { source: "auto" },
  );
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<null | {
    correct: boolean;
    score: number;
    xpEarned: number;
    correctAnswers: string[];
    explanation?: string | null;
    leveledUp?: boolean;
    newLevel?: number;
  }>(null);
  const [isPending, startTransition] = useTransition();
  const translatedResult = useTranslatedPayload(
    result
      ? {
          correctAnswers: result.correctAnswers,
          explanation: result.explanation ?? "",
          rightAnswersLabel: "Juiste antwoord(en):",
          explanationLabel: "Uitleg:",
          correct: "Juist",
          almost: `Bijna juist (${result.score}%)`,
          notYet: "Nog niet goed",
          levelUp: `Level up! Level ${result.newLevel}`,
        }
      : {
          correctAnswers: [],
          explanation: "",
          rightAnswersLabel: "Juiste antwoord(en):",
          explanationLabel: "Uitleg:",
          correct: "Juist",
          almost: "",
          notYet: "Nog niet goed",
          levelUp: "",
        },
    { source: "auto" },
  );

  function submit() {
    if (isPending) return;
    startTransition(async () => {
      const r = await submitExerciseAction(exercise.id, {
        type: "FILL_IN_BLANK",
        answer,
      });
      if (!r.ok) {
        toast.error(r.error ?? "Inzenden mislukt.");
        return;
      }
      setResult({
        correct: r.correct,
        score: r.score,
        xpEarned: r.xpEarned,
        correctAnswers: r.correctAnswers ?? [],
        explanation: r.explanation,
        leveledUp: r.leveledUp,
        newLevel: r.newLevel,
      });
      toast(
        r.correct
          ? "Perfect! Goed antwoord."
          : r.score > 0
          ? "Goed geprobeerd — bijna juist!"
          : "Niet goed. Kijk naar de juiste antwoorden en probeer het opnieuw.",
        {
          description: `+${r.xpEarned} XP${
            r.leveledUp ? ` — Level up: ${r.newLevel}!` : ""
          }`,
        }
      );
      router.refresh();
    });
  }

  function reset() {
    setAnswer("");
    setResult(null);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">
            {showNlRef ? (
              <Bilingual nl="Invuloefening" size="sm" variant="inline">
                Fill in the blank
              </Bilingual>
            ) : (
              "Fill in the blank"
            )}
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
        {exercise.description && (
          <CardDescription>
            {showNlRef ? (
              <Bilingual nl={exercise.description} size="sm">
                {translatedExercise.description}
              </Bilingual>
            ) : (
              translatedExercise.description
            )}
          </CardDescription>
        )}
        <div className="mt-3 rounded-xl border bg-muted/40 p-4">
          {renderSentence(
            translatedExercise.sentence,
            exercise.content.placeholder ?? "___",
            answer,
            setAnswer,
            result !== null || isPending,
            translatedExercise.placeholderHint,
            translatedExercise.inputAria,
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          <Sparkles className="mr-1 inline h-3.5 w-3.5 align-middle" />
          {showNlRef ? (
            <Bilingual
              nl="Let op hoofdletters niet op de plaats van kleine letters is niet belangrijk. Punten en komma's worden ook genegeerd."
              size="sm"
            >
              {translatedExercise.hint}
            </Bilingual>
          ) : (
            translatedExercise.hint
          )}
        </p>

        {result && (
          <div
            className={
              "rounded-xl border p-4 " +
              (result.correct
                ? "border-emerald-500/40 bg-emerald-500/10"
                : result.score > 0
                ? "border-amber-500/40 bg-amber-500/10"
                : "border-rose-500/40 bg-rose-500/10")
            }
          >
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
              {result.correct ? (
                <Badge variant="success">
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                  {translatedResult.correct}
                </Badge>
              ) : result.score > 0 ? (
                <Badge variant="warning">{translatedResult.almost}</Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="mr-1 h-3.5 w-3.5" />
                  {translatedResult.notYet}
                </Badge>
              )}
              <Badge variant="outline">+{result.xpEarned} XP</Badge>
              {result.leveledUp && (
                <Badge variant="default">
                  {translatedResult.levelUp}
                </Badge>
              )}
            </div>
            {!result.correct && result.correctAnswers.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-semibold">
                  {translatedResult.rightAnswersLabel}
                </p>
                <ul className="mt-1 list-inside list-disc text-sm text-muted-foreground">
                  {result.correctAnswers.map((a, i) => (
                    <li key={i}>
                      {translatedResult.correctAnswers?.[i] ?? a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.explanation && (
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {translatedResult.explanationLabel}
                </span>{" "}
                {translatedResult.explanation}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
          {!result ? (
            <>
              <Button onClick={submit} disabled={isPending}>
                {isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {translatedExercise.check}
              </Button>
              <span className="text-xs text-muted-foreground">
                {translatedExercise.multiCorrect}
              </span>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={reset}>
                {translatedExercise.retry}
              </Button>
              {nextExerciseId && (
                <Button asChild>
                  <Link href={`/exercise/${nextExerciseId}`}>
                    {translatedExercise.next}
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
