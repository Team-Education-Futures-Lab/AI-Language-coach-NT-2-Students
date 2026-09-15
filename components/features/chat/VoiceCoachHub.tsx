"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  AudioLines,
  Brain,
  CheckCircle2,
  ClipboardList,
  Ear,
  Gauge,
  GraduationCap,
  Lock,
  Mic,
  Radio,
  Target,
  Volume2,
  Wand2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bilingual } from "@/components/ui/bilingual";
import { VoiceCoachSession } from "@/components/features/chat/VoiceCoachSession";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useSector } from "@/lib/sector/SectorProvider";
import { getSectorLabel } from "@/lib/i18n/dictionaries";
import { useTranslatedPayload } from "@/lib/i18n/useTranslatedPayload";

export function VoiceCoachHub() {
  const { locale, showNlRef } = useLocale();
  const { sector } = useSector();
  const sectorLabel = getSectorLabel(locale, sector.dictKey);
  const [activeTab, setActiveTab] = useState("live");

  function triggerCoachAction(
    action: "start-roleplay" | "start-capture" | "finish-session" | "reset-session",
  ) {
    setActiveTab("live");
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("taalcozy-voice-coach", {
        detail: { action },
      }),
    );
  }

  const source = useMemo(
    () => ({
      hero: {
        eyebrow: "AI Voice Coach",
        title: "Your NT2 coach for realistic speaking practice",
        description:
          "Not a random chatbot, but a structured learning system around speaking. Live roleplays stay short and safe, while the real learning happens in the review, vocabulary capture, and micro-lessons afterwards.",
        primaryCta: "Start live roleplay",
        secondaryCta: "Open practice",
      },
      chips: {
        mvp: "MVP foundation: live + roleplay",
        stack: "whisper.cpp + Ollama",
        local: "Local-first where possible",
        currentSector: "Current sector",
      },
      tabs: {
        live: "Live Session",
        review: "Session Review",
        vocab: "Vocabulary Capture",
        goals: "Coach Goals",
        settings: "Coach Settings",
      },
      live: {
        title: "Live Session",
        description:
          "During the conversation, the coach keeps feedback light so the student does not freeze. One short correction, one better sentence, then back into the dialogue.",
        scenarioTitle: "Roleplay scenarios",
        controlTitle: "Voice controls",
        whatYouSaid: "What you said",
        betterSentence: "Better sentence",
        keyMistake: "Key mistake",
        pronunciation: "Pronunciation",
        xpCard: "Session momentum",
        pronunciationHint:
          "Later phase: pronunciation scoring should be careful and evidence-based, not a fake certainty score.",
        xpHint:
          "Reward clarity, courage and consistency. Do not turn the coach into a punishment machine.",
        controls: {
          holdToTalk: "Hold to talk",
          autoListen: "Auto listen",
          slowerCoach: "Coach slower",
          endSession: "End session",
        },
      },
      review: {
        title: "Session Review",
        description:
          "The deep learning happens after speaking. The student sees what went well, what to fix next, and gets small follow-up exercises instead of a wall of theory.",
        transcriptTitle: "Transcript highlights",
        mistakesTitle: "Focus points",
        exercisesTitle: "Suggested micro-lessons",
      },
      vocab: {
        title: "Vocabulary Capture",
        description:
          "Useful words from the session are saved immediately, including sector context and a simple example sentence. This turns speaking practice into long-term retention.",
        listTitle: "Words from this session",
        deckTitle: "Next repetition deck",
      },
      goals: {
        title: "Coach Principles",
        description:
          "This section keeps the AI grounded in didactics: safe speaking flow first, targeted feedback second, and measurable follow-up practice third.",
        roadmapTitle: "Recommended roadmap",
        principlesTitle: "Teaching rules for the coach",
      },
      settings: {
        title: "Coach Settings",
        description:
          "Personalize the coach for NT2 students by level, sector, privacy preferences and coaching strictness. The settings should feel educational, not technical.",
        stackTitle: "AI architecture",
        safetyTitle: "Privacy and guidance",
      },
      liveScenarios: [
        {
          title: "Internship handover",
          subtitle: "Healthcare / workplace Dutch",
          level: "B1",
          goal: "Report what happened clearly to a supervisor at the end of a shift.",
        },
        {
          title: "Workshop status update",
          subtitle: "Engineering / technical Dutch",
          level: "A2-B1",
          goal: "Explain a delay, name the problem, and ask for the next step.",
        },
        {
          title: "Customer question",
          subtitle: "Retail / service Dutch",
          level: "A1-A2",
          goal: "Answer politely, give simple directions, and confirm understanding.",
        },
      ],
      conversation: [
        {
          speaker: "Coach",
          text: "Good morning. You are at your internship in the workshop. Can you explain what is finished and what still needs to happen?",
          ref: "Goedemorgen. Je bent op stage in de werkplaats. Kun je uitleggen wat klaar is en wat nog moet gebeuren?",
        },
        {
          speaker: "Student",
          text: "The cable is ready, but the machine gives still one error and I need help from my supervisor.",
          ref: "De kabel is klaar, maar de machine geeft nog een fout en ik heb hulp van mijn begeleider nodig.",
        },
        {
          speaker: "Coach",
          text: "Good. Better sentence: The cable is ready, but the machine still shows an error, so I need help from my supervisor.",
          ref: "Goed. Beter zo: De kabel is klaar, maar de machine geeft nog een fout, dus ik heb hulp van mijn begeleider nodig.",
        },
      ],
      livePanels: [
        {
          title: "What you said",
          value: "The machine gives still one error.",
          note: "The message is understandable, so the coach keeps the correction small.",
        },
        {
          title: "Better sentence",
          value: "The machine still shows one error.",
          note: "Short reformulation the student can repeat immediately.",
        },
        {
          title: "Key mistake",
          value: "Word order",
          note: "In Dutch and English, 'still' needs a more natural position here.",
        },
      ],
      reviewTranscript: [
        {
          time: "00:18",
          title: "Strong communication",
          text: "You named the problem directly and asked for help clearly.",
        },
        {
          time: "00:46",
          title: "One repeating pattern",
          text: "Word order became unstable when you explained technical steps.",
        },
      ],
      reviewMistakes: [
        {
          title: "Word order under pressure",
          text: "Focus on short sentence frames: subject + verb + rest.",
        },
        {
          title: "Professional phrasing",
          text: "Use calm workplace language: 'I need help from my supervisor' instead of a literal translation.",
        },
        {
          title: "Confidence booster",
          text: "You stayed understandable. The next step is smoothness, not perfection.",
        },
      ],
      reviewExercises: [
        "2-minute reorder drill for workplace sentences",
        "Mini roleplay: explain a technical problem in 3 steps",
        "Flashcards for supervisor, delay, error, ready, still",
      ],
      vocabulary: [
        {
          word: "handover",
          translation: "overdracht",
          context: "Use during shift changes or when reporting to a colleague.",
        },
        {
          word: "supervisor",
          translation: "begeleider",
          context: "Useful in MBO internship conversations.",
        },
        {
          word: "delay",
          translation: "vertraging",
          context: "Important for logistics, engineering and service scenarios.",
        },
      ],
      repetitionDeck: [
        "Repeat tomorrow: handover, supervisor",
        "Repeat in 3 days: delay, report, error",
        "Repeat next week: explain, confirm, finished",
      ],
      roadmap: [
        {
          phase: "Phase 1",
          title: "Live voice coach + sector roleplays",
          text: "WebAudio -> whisper.cpp -> Ollama -> structured coach reply with one better sentence and one tip.",
        },
        {
          phase: "Phase 2",
          title: "Session review + vocabulary capture",
          text: "Store transcript highlights, extract useful words, and connect them to the practice area.",
        },
        {
          phase: "Phase 3",
          title: "Error-driven micro-lessons",
          text: "Generate 5-minute follow-up exercises based on repeated mistakes from previous sessions.",
        },
      ],
      principles: [
        "Do not correct every sentence during live speaking.",
        "Always match CEFR level and sector context.",
        "Prefer one repeatable better sentence over long explanations.",
        "Turn repeated errors into exercises, not shame.",
      ],
      settingsCards: [
        {
          title: "Student profile",
          items: ["Level: A2-B1", "Sector: active sector", "Coach style: calm and practical"],
        },
        {
          title: "Session behavior",
          items: ["Short replies", "One correction per turn", "Extra help when student gets stuck"],
        },
        {
          title: "Review defaults",
          items: ["Save transcript highlights", "Extract vocabulary automatically", "Generate one micro-lesson suggestion"],
        },
      ],
      stack: [
        "Audio input in browser via WebAudio",
        "Speech recognition via whisper.cpp",
        "Coach reasoning and feedback via Ollama",
        "Session review and word extraction stored in app database",
      ],
      safety: [
        "Local-first if possible for privacy-sensitive schools",
        "Do not present unreliable pronunciation scores too early",
        "Explain why a correction matters in simple language",
        "Keep the coach encouraging and concrete",
      ],
      summaryCards: [
        {
          title: "Foundation",
          text: "Live voice + roleplay is the product core. Everything else should make that loop stronger, not distract from it.",
        },
        {
          title: "Retention",
          text: "Vocabulary capture and micro-lessons convert one good session into long-term learning progress.",
        },
        {
          title: "MBO fit",
          text: "Roleplays stay practical: workplace Dutch, stage conversations, handovers, customer questions and professional phrasing.",
        },
      ],
    }),
    [],
  );

  const content = useTranslatedPayload(source, { source: "auto" });

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-cozy-sand/50 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_rgba(255,247,237,0.88)_35%,_rgba(240,253,250,0.82)_100%)] px-6 py-7 shadow-cozy sm:px-8 sm:py-8">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.16),transparent_38%,rgba(255,255,255,0.08)_70%,transparent)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <Badge variant="sunset" className="w-fit">
              <AudioLines className="h-3.5 w-3.5" />
              {content.hero.eyebrow}
            </Badge>
            <h1 className="max-w-3xl font-display text-3xl font-bold tracking-tight text-cozy-ink sm:text-4xl">
              {showNlRef ? (
                <Bilingual
                  nl="Jouw NT2-coach voor realistische spreektraining"
                  size="xl"
                >
                  {content.hero.title}
                </Bilingual>
              ) : (
                content.hero.title
              )}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-cozy-ink/75 sm:text-base">
              {showNlRef ? (
                <Bilingual
                  nl="Geen random chatbot, maar een gestructureerd leersysteem rondom spreken. De live rolspellen blijven kort en veilig, terwijl het echte leren daarna gebeurt in review, woordopvang en micro-lessons."
                  size="sm"
                >
                  {content.hero.description}
                </Bilingual>
              ) : (
                content.hero.description
              )}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Badge variant="secondary">{content.chips.mvp}</Badge>
              <Badge variant="outline">{content.chips.stack}</Badge>
              <Badge variant="outline">{content.chips.local}</Badge>
              <Badge variant="success">
                {content.chips.currentSector}: {sectorLabel}
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="sunset"
              size="lg"
              onClick={() => triggerCoachAction("start-roleplay")}
            >
              <Mic className="h-4 w-4" />
              {content.hero.primaryCta}
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/practice">
                {content.hero.secondaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-[1.25rem] bg-[hsl(202_60%_96%)] p-2 text-cozy-ink/70">
          <TabsTrigger value="live" className="rounded-full px-4 py-2">
            {content.tabs.live}
          </TabsTrigger>
          <TabsTrigger value="review" className="rounded-full px-4 py-2">
            {content.tabs.review}
          </TabsTrigger>
          <TabsTrigger value="vocab" className="rounded-full px-4 py-2">
            {content.tabs.vocab}
          </TabsTrigger>
          <TabsTrigger value="goals" className="rounded-full px-4 py-2">
            {content.tabs.goals}
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-full px-4 py-2">
            {content.tabs.settings}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          <VoiceCoachSession />
          <div className="grid gap-4 xl:grid-cols-[1.55fr_0.95fr]">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>{content.live.title}</CardTitle>
                <CardDescription>{content.live.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-3">
                  {content.liveScenarios.map((scenario: any) => (
                    <div
                      key={scenario.title}
                      className="rounded-2xl border border-cozy-sand/40 bg-white/70 p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="sand">{scenario.level}</Badge>
                        <span className="text-xs font-semibold text-cozy-ink/55">
                          {scenario.subtitle}
                        </span>
                      </div>
                      <p className="mt-3 font-display text-lg font-bold text-cozy-ink">
                        {scenario.title}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-cozy-ink/70">
                        {scenario.goal}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="rounded-[1.6rem] border border-cozy-sand/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(244,251,250,0.88))] p-4 sm:p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        <Radio className="h-3.5 w-3.5" /> live
                      </Badge>
                      <Badge variant="success">{sectorLabel}</Badge>
                    </div>
                    <span className="text-xs font-semibold text-cozy-ink/55">
                      {"whisper.cpp -> Ollama -> review"}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {content.conversation.map((message: any) => {
                      const coach = message.speaker === "Coach";
                      return (
                        <div
                          key={`${message.speaker}-${message.text}`}
                          className={`max-w-[85%] rounded-[1.4rem] px-4 py-3 ${
                            coach
                              ? "rounded-tl-sm bg-cozy-teal/12 text-cozy-ink"
                              : "ml-auto rounded-tr-sm bg-[hsl(31_85%_88%)] text-cozy-ink"
                          }`}
                        >
                          <div className="mb-1 text-[11px] font-black uppercase tracking-[0.18em] text-cozy-ink/45">
                            {message.speaker}
                          </div>
                          <div className="text-sm leading-6">{message.text}</div>
                          {showNlRef && (
                            <div className="mt-1 text-xs font-semibold text-cozy-ink/45">
                              {message.ref}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-[1.4rem] border border-cozy-sand/45 bg-white/85 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-cozy-ink/45">
                        {content.live.controlTitle}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          variant="sunset"
                          onClick={() => triggerCoachAction("start-capture")}
                        >
                          <Mic className="h-4 w-4" />
                          {content.live.controls.holdToTalk}
                        </Button>
                        <Button
                          variant="teal"
                          onClick={() => triggerCoachAction("start-capture")}
                        >
                          <Ear className="h-4 w-4" />
                          {content.live.controls.autoListen}
                        </Button>
                        <Button variant="outline">
                          <Volume2 className="h-4 w-4" />
                          {content.live.controls.slowerCoach}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => triggerCoachAction("finish-session")}
                        >
                          {content.live.controls.endSession}
                        </Button>
                      </div>
                    </div>
                    <div className="min-w-[220px] rounded-[1.2rem] bg-[hsl(202_60%_96%)] px-4 py-3">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-cozy-ink/45">
                        Live waveform
                      </p>
                      <div className="mt-3 flex h-10 items-end gap-1.5">
                        {[12, 24, 18, 28, 34, 22, 16, 30, 20, 12, 26, 15].map((h, i) => (
                          <span
                            key={i}
                            className="w-2 rounded-full bg-gradient-to-t from-cozy-teal via-cozy-orange to-cozy-sand"
                            style={{ height: `${h}px` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {content.livePanels.map((panel: any) => (
                <Card key={panel.title}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{panel.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-2xl bg-[hsl(202_60%_96%)] p-4 text-sm font-semibold text-cozy-ink">
                      {panel.value}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-cozy-ink/65">
                      {panel.note}
                    </p>
                  </CardContent>
                </Card>
              ))}

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{content.live.pronunciation}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Badge variant="warning">
                    <Gauge className="h-3.5 w-3.5" /> later phase
                  </Badge>
                  <p className="text-sm leading-6 text-cozy-ink/70">
                    {content.live.pronunciationHint}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{content.live.xpCard}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-cozy-teal/12 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-cozy-ink/45">
                        XP
                      </p>
                      <p className="mt-2 text-2xl font-display font-bold text-cozy-ink">+35</p>
                    </div>
                    <div className="rounded-2xl bg-cozy-sand/35 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-cozy-ink/45">
                        Streak
                      </p>
                      <p className="mt-2 text-2xl font-display font-bold text-cozy-ink">5</p>
                    </div>
                    <div className="rounded-2xl bg-cozy-orange/15 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-cozy-ink/45">
                        Focus
                      </p>
                      <p className="mt-2 text-2xl font-display font-bold text-cozy-ink">B1</p>
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-cozy-ink/70">
                    {content.live.xpHint}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="review" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{content.review.title}</CardTitle>
              <CardDescription>{content.review.description}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 xl:grid-cols-[1.15fr_0.9fr_0.95fr]">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-cozy-teal" />
                  <p className="text-sm font-bold text-cozy-ink">{content.review.transcriptTitle}</p>
                </div>
                {content.reviewTranscript.map((item: any) => (
                  <div key={item.time} className="rounded-2xl border border-cozy-sand/35 bg-white/80 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-cozy-ink">{item.title}</p>
                      <Badge variant="outline">{item.time}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-cozy-ink/70">{item.text}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-cozy-teal" />
                  <p className="text-sm font-bold text-cozy-ink">{content.review.mistakesTitle}</p>
                </div>
                {content.reviewMistakes.map((item: any) => (
                  <div key={item.title} className="rounded-2xl bg-[hsl(202_60%_96%)] p-4">
                    <p className="font-semibold text-cozy-ink">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-cozy-ink/70">{item.text}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-cozy-teal" />
                  <p className="text-sm font-bold text-cozy-ink">{content.review.exercisesTitle}</p>
                </div>
                {content.reviewExercises.map((item: string) => (
                  <div key={item} className="flex gap-3 rounded-2xl border border-cozy-sand/35 bg-white/80 p-4">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cozy-teal" />
                    <p className="text-sm leading-6 text-cozy-ink/75">{item}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vocab" className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <Card>
              <CardHeader>
                <CardTitle>{content.vocab.title}</CardTitle>
                <CardDescription>{content.vocab.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm font-bold text-cozy-ink">{content.vocab.listTitle}</p>
                {content.vocabulary.map((item: any) => (
                  <div key={item.word} className="rounded-2xl border border-cozy-sand/35 bg-white/80 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="sunset">{item.word}</Badge>
                      <Badge variant="outline">{item.translation}</Badge>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-cozy-ink/70">{item.context}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{content.vocab.deckTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {content.repetitionDeck.map((item: string) => (
                  <div key={item} className="rounded-2xl bg-[hsl(202_60%_96%)] p-4 text-sm font-medium text-cozy-ink/80">
                    {item}
                  </div>
                ))}
                <div className="rounded-2xl border border-dashed border-cozy-teal/30 bg-cozy-teal/8 p-4">
                  <p className="text-sm leading-6 text-cozy-ink/70">
                    Words collected here should feed straight into the existing practice area and flashcards.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <Card>
              <CardHeader>
                <CardTitle>{content.goals.title}</CardTitle>
                <CardDescription>{content.goals.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm font-bold text-cozy-ink">{content.goals.roadmapTitle}</p>
                {content.roadmap.map((item: any) => (
                  <div key={item.phase} className="rounded-2xl border border-cozy-sand/35 bg-white/80 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{item.phase}</Badge>
                      <p className="font-semibold text-cozy-ink">{item.title}</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-cozy-ink/70">{item.text}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{content.goals.principlesTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {content.principles.map((item: string) => (
                  <div key={item} className="flex gap-3 rounded-2xl bg-[hsl(202_60%_96%)] p-4">
                    <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-cozy-teal" />
                    <p className="text-sm leading-6 text-cozy-ink/75">{item}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>{content.settings.title}</CardTitle>
                <CardDescription>{content.settings.description}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {content.settingsCards.map((item: any) => (
                  <div key={item.title} className="rounded-2xl border border-cozy-sand/35 bg-white/80 p-4">
                    <p className="font-semibold text-cozy-ink">{item.title}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.items.map((label: string) => (
                        <Badge key={label} variant="outline">
                          {label === "Sector: active sector" ? `Sector: ${sectorLabel}` : label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{content.settings.stackTitle}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {content.stack.map((item: string) => (
                    <div key={item} className="flex gap-3 rounded-2xl bg-[hsl(202_60%_96%)] p-4">
                      <Brain className="mt-0.5 h-4 w-4 shrink-0 text-cozy-teal" />
                      <p className="text-sm leading-6 text-cozy-ink/75">{item}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{content.settings.safetyTitle}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {content.safety.map((item: string) => (
                    <div key={item} className="flex gap-3 rounded-2xl border border-cozy-sand/35 bg-white/85 p-4">
                      <Lock className="mt-0.5 h-4 w-4 shrink-0 text-cozy-teal" />
                      <p className="text-sm leading-6 text-cozy-ink/75">{item}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <section className="grid gap-4 lg:grid-cols-3">
        {content.summaryCards.map((item: any) => (
          <Card key={item.title}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-cozy-ink/70">
              {item.text}
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
