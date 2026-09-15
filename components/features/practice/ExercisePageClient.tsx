"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Construction,
  Ear,
  Heart,
  HelpCircle,
  NotebookPen,
  Smile,
  Star,
  Volume2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useTranslatedPayload } from "@/lib/i18n/useTranslatedPayload";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { Bilingual } from "@/components/ui/bilingual";

type MC = {
  key: "A" | "B" | "C" | "D";
  text: string;
  state?: "wrong" | "selected-correct" | "neutral";
};

export function ExercisePageClient({
  userName,
  answers,
}: {
  userName: string;
  answers: MC[];
}) {
  const { showNlRef } = useLocale();
  const translated = useTranslatedPayload(
    {
      back: "Lesoverzicht",
      questionProgress: "Vraag 3 van 6",
      completed: "50% voltooid",
      listenQuestion: "Luister naar de vraag",
      context:
        "De afdelingsmanager vraagt tijdens je stagebeoordeling in het woonzorgcentrum:",
      question:
        "Wat doe je als een bewoner plotseling duizelig wordt tijdens het opstaan?",
      chooseBest:
        "Kies het meest professionele en duidelijke antwoord:",
      selectedAnswer: "JOUW GEKOZEN ANTWOORD",
      excellent: `Uitstekend gedaan, ${userName}!`,
      feedback:
        "Je antwoord is veilig, collegiaal en toont initiatief. Je gebruikt de juiste vaktermen ('rustig laten zitten', 'stagebegeleider waarschuwen'). Dit is precies wat er in een MBO zorgstage van je verwacht wordt!",
      vocabTerm:
        "Vakterm: 'waarschuwen' (attenderen op gevaar of urgentie)",
      xpEarned: "+25 XP verdiend!",
      stageTip: "Bekijk Stage Tip",
      normal: "1.0x Normaal",
      calm: "0.8x Rustig",
      nextQuestion: "Volgende vraag",
      glossaryTitle: "Woordenlijst voor deze situatie",
      glossaryDesc:
        "3 nuttige termen: afdelingsmanager, duizelig, verpleegkundige",
      openTerms: "Open vaktermen",
      answers,
    },
    { source: "auto" },
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="tc-card !rounded-[1.35rem] px-5 py-4 sm:px-7 sm:py-5">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/lessons"
            className="tc-ghost-btn"
            aria-label={translated.back}
          >
            <ArrowLeft className="h-4 w-4" />
            {showNlRef ? (
              <Bilingual nl="Lesoverzicht" size="sm" variant="inline">
                {translated.back}
              </Bilingual>
            ) : (
              translated.back
            )}
          </Link>

          <div className="mx-auto flex min-w-[240px] flex-1 flex-col items-center gap-2 sm:max-w-md">
            <div className="flex w-full items-center justify-between text-[11px] font-black">
              <span className="text-cozy-ink/65">
                {showNlRef ? (
                  <Bilingual nl="Vraag 3 van 6" size="sm" variant="inline">
                    {translated.questionProgress}
                  </Bilingual>
                ) : (
                  translated.questionProgress
                )}
              </span>
              <span className="text-cozy-teal">
                {showNlRef ? (
                  <Bilingual nl="50% voltooid" size="sm" variant="inline">
                    {translated.completed}
                  </Bilingual>
                ) : (
                  translated.completed
                )}
              </span>
            </div>
            <div className="tc-progress-terracotta tc-progress w-full">
              <span style={{ width: "50%" }} />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2 sm:ml-0">
            <span className="tc-chip-pink">
              <FireIcon /> 7
            </span>
            <span className="tc-chip-teal">
              <Star className="h-3.5 w-3.5" /> +30 XP
            </span>
            <span className="tc-chip-sand">
              <Heart className="h-3.5 w-3.5 fill-cozy-terracotta text-cozy-terracotta" />{" "}
              3/3
            </span>
          </div>
        </div>
      </section>

      <section className="tc-card space-y-8 p-5 sm:p-8 lg:p-10">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="tc-chip-teal-strong">
              <Construction className="h-3 w-3" /> Zorg & Welzijn • Stagegesprek
            </span>
            <span className="tc-chip-sand">ERK B1</span>
          </div>
          <button className="tc-outline-btn !py-2 text-xs">
            <Ear className="h-3.5 w-3.5" />
            {showNlRef ? (
              <Bilingual nl="Luister naar de vraag" size="sm" variant="inline">
                {translated.listenQuestion}
              </Bilingual>
            ) : (
              translated.listenQuestion
            )}
            <Volume2 className="h-3.5 w-3.5 text-cozy-teal" />
          </button>
        </header>

        <div className="space-y-4">
          <p className="text-[14.5px] leading-relaxed text-cozy-ink/80">
            {showNlRef ? (
              <Bilingual
                nl="De afdelingsmanager vraagt tijdens je stagebeoordeling in het woonzorgcentrum:"
                size="sm"
              >
                {translated.context}
              </Bilingual>
            ) : (
              translated.context
            )}
          </p>
          <div className="rounded-[1.4rem] border border-cozy-teal/35 bg-cozy-teal/10 p-5 sm:p-6">
            <p className="heading-display text-[clamp(1.1rem,1.6vw,1.45rem)] font-bold leading-[1.25] text-cozy-ink">
              {showNlRef ? (
                <Bilingual
                  nl="Wat doe je als een bewoner plotseling duizelig wordt tijdens het opstaan?"
                  size="lg"
                >
                  {translated.question}
                </Bilingual>
              ) : (
                translated.question
              )}
            </p>
          </div>
          <p className="text-xs font-black text-cozy-ink/70">
            {showNlRef ? (
              <Bilingual
                nl="Kies het meest professionele en duidelijke antwoord:"
                size="sm"
                variant="inline"
              >
                {translated.chooseBest}
              </Bilingual>
            ) : (
              translated.chooseBest
            )}
          </p>
        </div>

        <div className="space-y-3">
          {translated.answers.map((a: MC, index: number) => {
            const original = answers[index];
            const stateClass =
              a.state === "wrong"
                ? "tc-mc-wrong"
                : a.state === "selected-correct"
                  ? "tc-mc-correct"
                  : "hover:border-cozy-teal/30";
            const circleBg =
              a.state === "wrong"
                ? "bg-cozy-terracotta text-white"
                : a.state === "selected-correct"
                  ? "bg-cozy-terracotta text-white"
                  : "bg-[hsl(202_60%_96%)] text-cozy-ink/60 ring-1 ring-[hsl(198_35%_88%)]";
            return (
              <button key={a.key} className={`tc-mc ${stateClass} items-start`}>
                <span
                  className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12px] font-black ${circleBg}`}
                >
                  {a.key}
                </span>
                <div className="min-w-0 flex-1 space-y-1 pt-0.5">
                  {a.state === "selected-correct" && (
                    <span className="tc-chip-teal-strong text-[10px]">
                      <CheckCircle2 className="h-3 w-3" /> {translated.selectedAnswer}
                    </span>
                  )}
                  <p className="text-[14.5px] font-semibold leading-relaxed text-cozy-ink">
                    {showNlRef ? (
                      <Bilingual nl={original.text} size="sm">
                        {a.text}
                      </Bilingual>
                    ) : (
                      a.text
                    )}
                  </p>
                </div>
                {a.state === "wrong" && (
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-cozy-terracotta/10 text-cozy-terracotta ring-1 ring-cozy-terracotta/40">
                    <XCircle className="h-4 w-4" />
                  </span>
                )}
                {a.state === "selected-correct" && (
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-cozy-teal text-white ring-1 ring-white shadow-tc-soft">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="rounded-[1.4rem] border border-cozy-teal/40 bg-cozy-teal/10 p-5 sm:p-7">
          <div className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-start">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-cozy-teal text-white ring-4 ring-white shadow-tc-soft sm:mx-0">
              <Smile className="h-7 w-7" />
            </div>
            <div className="min-w-0 space-y-2.5 text-center sm:text-left">
              <h3 className="heading-display text-xl font-bold text-cozy-ink sm:text-2xl">
                {showNlRef ? (
                  <Bilingual
                    nl={`Uitstekend gedaan, ${userName}!`}
                    size="lg"
                  >
                    {translated.excellent}
                  </Bilingual>
                ) : (
                  translated.excellent
                )}
              </h3>
              <p className="text-[13.5px] leading-relaxed text-cozy-ink/80">
                {showNlRef ? (
                  <Bilingual
                    nl="Je antwoord is veilig, collegiaal en toont initiatief. Je gebruikt de juiste vaktermen ('rustig laten zitten', 'stagebegeleider waarschuwen'). Dit is precies wat er in een MBO zorgstage van je verwacht wordt!"
                    size="sm"
                  >
                    {translated.feedback}
                  </Bilingual>
                ) : (
                  translated.feedback
                )}
              </p>
              <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                <span className="tc-chip-sand">
                  <NotebookPen className="h-3 w-3" />
                  {showNlRef ? (
                    <Bilingual
                      nl="Vakterm: 'waarschuwen' (attenderen op gevaar of urgentie)"
                      size="sm"
                      variant="inline"
                    >
                      {translated.vocabTerm}
                    </Bilingual>
                  ) : (
                    translated.vocabTerm
                  )}
                </span>
              </div>
            </div>
            <div className="flex justify-center sm:justify-end">
              <span className="tc-chip-sand !px-3.5 !py-1.5 text-[11px] font-black">
                <Star className="h-3.5 w-3.5" /> {translated.xpEarned}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button className="tc-outline-btn !py-2.5 text-xs sm:text-sm">
            <HelpCircle className="h-4 w-4 text-cozy-teal" />
            {translated.stageTip}
          </button>
          <div className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[11px] font-black shadow-tc-soft ring-1 ring-inset ring-[hsl(198_35%_88%)]">
            <span className="rounded-full bg-cozy-ink/5 px-2 py-1">
              {translated.normal}
            </span>
            <span className="rounded-full px-2 py-1 text-cozy-ink/65 hover:bg-[hsl(202_60%_97%)]">
              {translated.calm}
            </span>
          </div>
          <button className="tc-sunset-btn !rounded-[1.15rem] !px-6 !py-3 text-sm">
            {translated.nextQuestion}
            <div className="relative h-5 w-5">
              <ChevronRight className="absolute inset-0 h-5 w-5 text-cozy-ink transition-transform" />
              <ChevronRight className="absolute inset-0 h-5 w-5 translate-x-1 text-cozy-teal" />
            </div>
          </button>
        </div>
      </section>

      <section className="tc-card flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-7 sm:py-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-cozy-teal/15 ring-1 ring-cozy-teal/30">
            <NotebookPen className="h-4.5 w-4.5 text-cozy-teal" />
          </div>
          <div className="min-w-0 leading-tight">
            <p className="text-xs font-black text-cozy-ink/70">
              {translated.glossaryTitle}
            </p>
            <p className="mt-0.5 text-[12px] font-semibold text-cozy-ink/60">
              {translated.glossaryDesc}
            </p>
          </div>
        </div>
        <button className="inline-flex items-center gap-1.5 text-xs font-black text-cozy-teal hover:text-cozy-teal/85">
          {translated.openTerms}
          <ChevronRight className="h-4 w-4" />
        </button>
      </section>
    </div>
  );
}

function FireIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}
