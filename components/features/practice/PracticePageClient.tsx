"use client";

import Link from "next/link";
import {
  Brain,
  CheckSquare,
  Dumbbell,
  MessageSquareText,
  Pencil,
  Languages,
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
import { FlashcardTrainer } from "@/components/features/practice/flashcard-trainer";
import { useTranslatedPayload } from "@/lib/i18n/useTranslatedPayload";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { Bilingual } from "@/components/ui/bilingual";

const ICONS: Record<string, typeof Dumbbell> = {
  MULTIPLE_CHOICE: CheckSquare,
  FILL_IN_BLANK: Pencil,
  TRANSLATION: Languages,
  VOCABULARY: Brain,
  SENTENCE_CORRECTION: Pencil,
  CONVERSATION: MessageSquareText,
};

type PracticeType = {
  key: string;
  title: string;
  desc: string;
  level: string;
  status: "ready" | "soon";
};

type Props = {
  batch: any[];
  recommendedId: string | null;
};

const TYPES: PracticeType[] = [
  {
    key: "MULTIPLE_CHOICE",
    title: "Multiple choice",
    desc: "Kies het juiste antwoord.",
    level: "A1-B2",
    status: "ready",
  },
  {
    key: "FILL_IN_BLANK",
    title: "Invuloefening",
    desc: "Vul het ontbrekende woord in.",
    level: "A1-B2",
    status: "ready",
  },
  {
    key: "TRANSLATION",
    title: "Vertaling",
    desc: "Vertaal zinnen naar het Nederlands.",
    level: "A2-C1",
    status: "soon",
  },
  {
    key: "VOCABULARY",
    title: "Woordenschat",
    desc: "Leer en herhaal nieuwe woorden.",
    level: "A1-C1",
    status: "soon",
  },
  {
    key: "SENTENCE_CORRECTION",
    title: "Zinscorrectie",
    desc: "Verbeter fouten in zinnen.",
    level: "A2-C1",
    status: "soon",
  },
  {
    key: "CONVERSATION",
    title: "Conversatie",
    desc: "Chat met de AI-taalcoach.",
    level: "A2-C2",
    status: "soon",
  },
];

export function PracticePageClient({ batch, recommendedId }: Props) {
  const { showNlRef } = useLocale();
  const translated = useTranslatedPayload(
    {
      pageTitle: "Oefenen",
      pageDescription:
        "Kies een oefentype en begin direct. Niveau en onderwerp worden automatisch afgestemd zodra je profiel volledig is ingevuld.",
      quickStart: "Snel starten",
      sectionTitle: "Oefentypes",
      soon: "Binnenkort",
      start: "Beginnen",
      soonAvailable: "Binnenkort beschikbaar",
      vocabTitle: "Woordenschat trainer",
      vocabDescription:
        "Flashcards met woorden van jouw niveau — direct hieronder beschikbaar.",
      types: TYPES,
    },
    { source: "auto" },
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {showNlRef ? (
              <Bilingual nl="Oefenen" size="xl">
                {translated.pageTitle}
              </Bilingual>
            ) : (
              translated.pageTitle
            )}
          </h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            {showNlRef ? (
              <Bilingual
                nl="Kies een oefentype en begin direct. Niveau en onderwerp worden automatisch afgestemd zodra je profiel volledig is ingevuld."
                size="sm"
              >
                {translated.pageDescription}
              </Bilingual>
            ) : (
              translated.pageDescription
            )}
          </p>
        </div>
        {recommendedId && (
          <Button asChild>
            <Link href={`/exercise/${recommendedId}`}>
              <Sparkles className="mr-1 h-4 w-4" />
              {showNlRef ? (
                <Bilingual nl="Snel starten" size="sm" variant="inline">
                  {translated.quickStart}
                </Bilingual>
              ) : (
                translated.quickStart
              )}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">
          {showNlRef ? (
            <Bilingual nl="Oefentypes" size="lg">
              {translated.sectionTitle}
            </Bilingual>
          ) : (
            translated.sectionTitle
          )}
        </h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {translated.types.map((item: PracticeType, index: number) => {
            const Icon = ICONS[item.key] ?? Dumbbell;
            const original = TYPES[index];
            const isReady = item.status === "ready";
            const destination =
              item.key === "VOCABULARY"
                ? "#woordenschat-trainer"
                : recommendedId &&
                    (item.key === "MULTIPLE_CHOICE" ||
                      item.key === "FILL_IN_BLANK")
                  ? `/exercise/${recommendedId}`
                  : "/lessons";
            return (
              <Card
                key={item.key}
                className={
                  "transition-all " +
                  (isReady
                    ? "hover:-translate-y-0.5 hover:shadow-md"
                    : "opacity-80")
                }
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div className="flex items-start gap-2">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <CardTitle className="text-base">
                        {showNlRef ? (
                          <Bilingual nl={original.title} size="md">
                            {item.title}
                          </Bilingual>
                        ) : (
                          item.title
                        )}
                      </CardTitle>
                      <CardDescription>
                        {showNlRef ? (
                          <Bilingual nl={original.desc} size="sm">
                            {item.desc}
                          </Bilingual>
                        ) : (
                          item.desc
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline">ERK {item.level}</Badge>
                    {!isReady && (
                      <Badge variant="warning" className="text-[10px]">
                        {showNlRef ? (
                          <Bilingual nl="Binnenkort" size="sm" variant="inline">
                            {translated.soon}
                          </Bilingual>
                        ) : (
                          translated.soon
                        )}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    asChild={isReady}
                    variant={isReady ? "default" : "outline"}
                    size="sm"
                    disabled={!isReady}
                    className="w-full"
                  >
                    {isReady ? (
                      <Link href={destination}>
                        <Dumbbell className="mr-1 h-4 w-4" />
                        {showNlRef ? (
                          <Bilingual nl="Beginnen" size="sm" variant="inline">
                            {translated.start}
                          </Bilingual>
                        ) : (
                          translated.start
                        )}
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <span>
                        {showNlRef ? (
                          <Bilingual
                            nl="Binnenkort beschikbaar"
                            size="sm"
                            variant="inline"
                          >
                            {translated.soonAvailable}
                          </Bilingual>
                        ) : (
                          translated.soonAvailable
                        )}
                      </span>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section id="woordenschat-trainer" className="scroll-mt-20">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {showNlRef ? (
                <Bilingual nl="Woordenschat trainer" size="lg">
                  {translated.vocabTitle}
                </Bilingual>
              ) : (
                translated.vocabTitle
              )}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {showNlRef ? (
                <Bilingual
                  nl="Flashcards met woorden van jouw niveau — direct hieronder beschikbaar."
                  size="sm"
                >
                  {translated.vocabDescription}
                </Bilingual>
              ) : (
                translated.vocabDescription
              )}
            </p>
          </div>
        </div>
        <FlashcardTrainer initial={batch as any} />
      </section>
    </div>
  );
}
