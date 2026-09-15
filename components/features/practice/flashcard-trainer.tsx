"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Shuffle,
  Sparkles,
  XCircle,
} from "lucide-react";
import type { UserVocabulary, VocabularyWord } from "@prisma/client";
import type { VocabularyStatus } from "@/types";
import {
  getPracticeVocabBatch,
  reviewVocabCardAction,
} from "@/app/(dashboard)/practice/actions";
import type { VocabResult } from "@/lib/validations/vocabulary";
import { EmptyState } from "@/components/ui/empty-state";
import { useTranslatedPayload } from "@/lib/i18n/useTranslatedPayload";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { Bilingual } from "@/components/ui/bilingual";

type QueueItem = UserVocabulary & { vocabulary: VocabularyWord };

const STATUS_LABELS: Record<VocabularyStatus, string> = {
  NEW: "Nieuw",
  LEARNING: "Aan het leren",
  REVIEWING: "Bijhouden",
  MASTERED: "Kent het",
};

export function FlashcardTrainer({
  initial,
}: {
  initial: QueueItem[];
}) {
  const { showNlRef } = useLocale();
  const router = useRouter();
  const [queue, setQueue] = useState<QueueItem[]>(initial ?? []);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [totalReviewed, setTotalReviewed] = useState(0);
  const [correctToday, setCorrectToday] = useState(0);

  useEffect(() => {
    setQueue(initial ?? []);
    setIndex(0);
    setFlipped(false);
    setTotalReviewed(0);
    setCorrectToday(0);
  }, [initial]);

  const current = queue[index];
  const progress = useMemo(
    () => (queue.length > 0 ? Math.round(((index) / queue.length) * 100) : 0),
    [queue.length, index]
  );
  const translated = useTranslatedPayload(
    {
      title: "Woordenschat trainer",
      description:
        'Oefen Nederlandse woorden in flashcard-stijl. Klik op "Draai kaart" om de vertaling te zien, en geef aan hoe makkelijk je het woord kent.',
      newSet: "Nieuwe set",
      progress: `Voortgang: ${Math.min(index, queue.length)} / ${queue.length}`,
      today: `Vandaag: ${correctToday} goed / ${totalReviewed} bekeken`,
      progressAria: "Flashcards voortgang",
      completedTitle: "Deze set is afgerond!",
      completedDescription:
        "Goed gewerkt. Start een nieuwe set of oefen verder met andere lessen.",
      newWords: "Nieuwe woorden",
      emptyTitle: "Nog geen woorden",
      emptyDescription:
        "Zodra er woorden in de database staan, verschijnen ze hier. Klik op Nieuwe set om te starten.",
      load: "Laden",
      flipBack: "Klik om terug te draaien",
      seeTranslation: "Klik om vertaling te zien",
      flipCard: "Draai kaart",
      learnAgain: "Weer leren",
      doubt: "Twijfel",
      knowIt: "Ken ik",
      saving: "Voortgang opslaan...",
    },
    { source: "auto" },
  );

  const handleAction = useCallback(
    (result: VocabResult) => {
      if (!current || isPending) return;
      startTransition(async () => {
        const res = await reviewVocabCardAction(current.id, result);
        if (!res.ok) {
          toast.error(res.error ?? "Actie mislukt.");
          return;
        }
        if (result !== "again") setCorrectToday((c) => c + 1);
        setTotalReviewed((t) => t + 1);
        const isCorrect = result === "easy" || result === "hard";
        toast(
          isCorrect
            ? `Goed! "${res.word}" onthouden.`
            : `Oeps, "${res.word}" nog een keer leren.`,
          {
            description: `Status: ${
              STATUS_LABELS[res.status as VocabularyStatus] ?? res.status
            }`,
          }
        );

        const nextIndex = index + 1;
        if (nextIndex >= queue.length) {
          setIndex(nextIndex);
          router.refresh();
          return;
        }
        setIndex(nextIndex);
        setFlipped(false);
        router.refresh();
      });
    },
    [current, index, queue.length, isPending, router]
  );

  async function reshuffle() {
    startTransition(async () => {
      const fresh = await getPracticeVocabBatch(15);
      if (fresh.length === 0) {
        toast.error("Geen woorden gevonden.");
        return;
      }
      const shuffled = [...fresh].sort(() => Math.random() - 0.5);
      setQueue(shuffled);
      setIndex(0);
      setFlipped(false);
      setTotalReviewed(0);
      setCorrectToday(0);
          toast.success("Nieuwe set woorden geladen.");
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-primary" />
            {showNlRef ? (
              <Bilingual nl="Woordenschat trainer" size="lg">
                {translated.title}
              </Bilingual>
            ) : (
              translated.title
            )}
          </CardTitle>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            {showNlRef ? (
              <Bilingual
                nl='Oefen Nederlandse woorden in flashcard-stijl. Klik op "Draai kaart" om de vertaling te zien, en geef aan hoe makkelijk je het woord kent.'
                size="sm"
              >
                {translated.description}
              </Bilingual>
            ) : (
              translated.description
            )}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={reshuffle} disabled={isPending}>
          <Shuffle className="mr-1 h-4 w-4" />
          {translated.newSet}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{translated.progress}</span>
            <span>{translated.today}</span>
          </div>
          <Progress value={progress} aria-label={translated.progressAria} />
        </div>

        {!current ? (
          index > 0 ? (
            <EmptyState
              icon={<Sparkles className="h-8 w-8" />}
              title={translated.completedTitle}
              description={translated.completedDescription}
              action={
                <Button onClick={reshuffle}>
                  <Shuffle className="mr-1 h-4 w-4" /> {translated.newWords}
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={<Sparkles className="h-8 w-8" />}
              title={translated.emptyTitle}
              description={translated.emptyDescription}
              action={
                <Button onClick={reshuffle}>
                  <Shuffle className="mr-1 h-4 w-4" /> {translated.load}
                </Button>
              }
            />
          )
        ) : (
          <>
            <div className="group perspective-1000 min-h-[220px]">
              <div
                className={
                  "relative h-56 w-full cursor-pointer select-none rounded-2xl border p-6 shadow-sm transition-all " +
                  (flipped
                    ? "bg-gradient-to-br from-primary/10 via-background to-primary/5"
                    : "bg-gradient-to-br from-background via-muted/20 to-background")
                }
                onClick={() => setFlipped((f) => !f)}
              >
                <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
                  <Badge variant="outline">
                    {STATUS_LABELS[current.status as VocabularyStatus]}
                  </Badge>
                  <Badge variant="secondary">
                    ERK {current.vocabulary.languageLevel}
                  </Badge>
                  {current.vocabulary.partOfSpeech && (
                    <Badge variant="outline">
                      {current.vocabulary.partOfSpeech}
                    </Badge>
                  )}
                </div>
                <div className="absolute right-4 top-4 text-xs text-muted-foreground">
                  {current.correctCount}✓ / {current.incorrectCount}✗
                </div>
                <div className="flex h-full flex-col items-center justify-center gap-3 pt-4">
                  <p className="text-center text-3xl font-bold tracking-tight">
                    {flipped
                      ? current.vocabulary.translation
                      : current.vocabulary.dutchWord}
                  </p>
                  {flipped && current.vocabulary.exampleSentence && (
                    <p className="max-w-xl text-center text-sm italic text-muted-foreground">
                      &ldquo;{current.vocabulary.exampleSentence}&rdquo;
                    </p>
                  )}
                  <p className="pt-4 text-xs text-muted-foreground">
                    {flipped ? translated.flipBack : translated.seeTranslation}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-4">
              <Button
                variant="outline"
                onClick={() => setFlipped((f) => !f)}
                disabled={isPending}
              >
                <RotateCcw className="mr-1 h-4 w-4" />
                {translated.flipCard}
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleAction("again")}
                disabled={isPending}
              >
                <XCircle className="mr-1 h-4 w-4" />
                {translated.learnAgain}
              </Button>
              <Button
                onClick={() => handleAction("hard")}
                disabled={isPending || !flipped}
                className="bg-amber-500 text-white shadow-sm hover:bg-amber-500/90"
              >
                <Sparkles className="mr-1 h-4 w-4" />
                {translated.doubt}
              </Button>
              <Button
                onClick={() => handleAction("easy")}
                disabled={isPending || !flipped}
                className="bg-emerald-500 text-white hover:bg-emerald-500/90"
              >
                <CheckCircle2 className="mr-1 h-4 w-4" />
                {translated.knowIt}
              </Button>
            </div>
            {isPending && (
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {translated.saving}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
