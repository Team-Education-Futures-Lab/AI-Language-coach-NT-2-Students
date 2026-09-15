"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Loader2,
  Mic,
  RotateCcw,
  SendHorizonal,
  Square,
  Wand2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { getSectorLabel } from "@/lib/i18n/dictionaries";
import { useTranslatedPayload } from "@/lib/i18n/useTranslatedPayload";
import { useSector } from "@/lib/sector/SectorProvider";
import type {
  CoachMessage,
  CoachReviewResponse,
  CoachTurnResponse,
} from "@/lib/ai/voice-coach";

type Scenario = {
  id: string;
  title: string;
  goal: string;
  level: "A1" | "A2" | "B1";
  starter: string;
};

type CoachUiAction = "start-roleplay" | "start-capture" | "finish-session" | "reset-session";

export function VoiceCoachSession() {
  const { locale } = useLocale();
  const { sector } = useSector();
  const sectorLabel = getSectorLabel(locale, sector.dictKey);

  const scenarios = useMemo<Scenario[]>(
    () => [
      {
        id: "handover",
        title: "Internship handover",
        goal: "Explain what is finished, what is blocked, and what still needs to happen.",
        level: "B1",
        starter:
          "Goedemorgen. We oefenen een overdracht op je stage. Vertel kort wat al klaar is en wat nog moet gebeuren.",
      },
      {
        id: "workshop",
        title: "Workshop status update",
        goal: "Explain a technical problem and ask clearly for the next step.",
        level: "A2",
        starter:
          "Je staat in de werkplaats. Leg uit welk probleem je ziet en welke hulp je nodig hebt.",
      },
      {
        id: "service",
        title: "Customer question",
        goal: "Answer politely, check understanding, and stay calm under pressure.",
        level: "A1",
        starter:
          "Een klant stelt een simpele vraag. Geef een beleefd antwoord en controleer of de klant je begrijpt.",
      },
    ],
    [],
  );

  const ui = useTranslatedPayload(
    {
      title: "Try the coach session",
      subtitle:
        "This is the first working MVP loop: choose a roleplay, speak or type, get one focused correction, then finish with a session review.",
      labels: {
        scenario: "Scenario",
        transcript: "Your answer",
        speech: "Voice input",
        feedback: "Live coaching",
        review: "Session review",
        vocabulary: "Useful words",
      },
      actions: {
        startMic: "Start mic",
        stopMic: "Stop mic",
        send: "Send turn",
        finish: "Finish session",
        reset: "Reset",
      },
      notes: {
        speechReady: "Browser speech input is available.",
        speechMissing:
          "Browser speech input is not available here yet. Type works already, and this panel is ready for a whisper.cpp bridge next.",
        ollamaFallback:
          "If Ollama is not available, the coach still returns a safe fallback so the flow keeps working.",
      },
    },
    { source: "auto" },
  );

  const translatedScenarios = useTranslatedPayload(
    scenarios.map(({ id, title, goal, level }) => ({ id, title, goal, level })),
    { source: "auto" },
  );

  const [selectedId, setSelectedId] = useState(scenarios[0].id);
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [speechSupported, setSpeechSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnData, setTurnData] = useState<CoachTurnResponse | null>(null);
  const [reviewData, setReviewData] = useState<CoachReviewResponse | null>(null);
  const [isTurnLoading, setIsTurnLoading] = useState(false);
  const [isReviewLoading, setIsReviewLoading] = useState(false);
  const recognitionRef = useRef<any>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const selectedScenario =
    scenarios.find((scenario) => scenario.id === selectedId) ?? scenarios[0];

  function resetSession(nextScenarioId = selectedScenario.id) {
    const scenario =
      scenarios.find((item) => item.id === nextScenarioId) ?? scenarios[0];
    setMessages([{ role: "assistant", content: scenario.starter }]);
    setDraft("");
    setTurnData(null);
    setReviewData(null);
    setError(null);
  }

  useEffect(() => {
    resetSession(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setSpeechSupported(
      "webkitSpeechRecognition" in window || "SpeechRecognition" in window,
    );
    return () => {
      recognitionRef.current?.stop?.();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    function handleAction(event: Event) {
      const customEvent = event as CustomEvent<{ action?: CoachUiAction }>;
      const action = customEvent.detail?.action;
      if (!action) return;

      rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

      if (action === "reset-session") {
        resetSession();
        textareaRef.current?.focus();
        return;
      }

      if (action === "finish-session") {
        void finishSession();
        return;
      }

      if (action === "start-roleplay") {
        textareaRef.current?.focus();
        if (speechSupported) {
          startListening();
        } else {
          setError(
            "Je browser ondersteunt hier nog geen spraakinvoer. Typ je antwoord hieronder of gebruik straks de whisper.cpp stap.",
          );
        }
        return;
      }

      if (action === "start-capture") {
        if (speechSupported) {
          startListening();
        } else {
          textareaRef.current?.focus();
          setError(
            "Je browser ondersteunt hier nog geen spraakinvoer. Typ je antwoord hieronder of gebruik straks de whisper.cpp stap.",
          );
        }
      }
    }

    window.addEventListener(
      "taalcozy-voice-coach",
      handleAction as EventListener,
    );
    return () => {
      window.removeEventListener(
        "taalcozy-voice-coach",
        handleAction as EventListener,
      );
    };
  }, [speechSupported, messages.length]);

  function startListening() {
    if (typeof window === "undefined") return;
    const RecognitionCtor =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!RecognitionCtor) return;

    recognitionRef.current?.stop?.();
    const recognition = new RecognitionCtor();
    recognition.lang = "nl-NL";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        transcript += event.results[i][0]?.transcript ?? "";
      }
      setDraft(transcript.trim());
    };

    recognition.onerror = () => {
      setListening(false);
      setError("Voice capture stopped unexpectedly.");
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function stopListening() {
    recognitionRef.current?.stop?.();
    setListening(false);
  }

  async function sendTurn() {
    const userText = draft.trim();
    if (!userText || isTurnLoading) return;

    const nextMessages: CoachMessage[] = [
      ...messages,
      { role: "user", content: userText },
    ];

    setMessages(nextMessages);
    setDraft("");
    setError(null);
    setReviewData(null);
    setIsTurnLoading(true);

    try {
      const response = await fetch("/api/coach/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          mode: "turn",
          level: selectedScenario.level,
          sector: sectorLabel,
          scenarioTitle: selectedScenario.title,
          scenarioGoal: selectedScenario.goal,
          nativeLocale: locale,
          userText,
          messages: nextMessages,
        }),
      });
      const json = await response.json();
      if (!response.ok || !json?.ok || !json?.data) {
        throw new Error(json?.error ?? "Could not send coach turn.");
      }

      const data = json.data as CoachTurnResponse;
      setTurnData(data);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `${data.coachReply} ${data.nextQuestion}`.trim(),
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send coach turn.");
    } finally {
      setIsTurnLoading(false);
    }
  }

  async function finishSession() {
    if (isReviewLoading || messages.length < 2) return;

    setError(null);
    setIsReviewLoading(true);
    try {
      const response = await fetch("/api/coach/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          mode: "review",
          level: selectedScenario.level,
          sector: sectorLabel,
          scenarioTitle: selectedScenario.title,
          nativeLocale: locale,
          messages,
        }),
      });
      const json = await response.json();
      if (!response.ok || !json?.ok || !json?.data) {
        throw new Error(json?.error ?? "Could not build session review.");
      }
      setReviewData(json.data as CoachReviewResponse);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not build session review.",
      );
    } finally {
      setIsReviewLoading(false);
    }
  }

  return (
    <Card ref={rootRef} id="voice-coach-session" className="overflow-hidden">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle>{ui.title}</CardTitle>
            <p className="mt-1 text-sm leading-6 text-cozy-ink/70">
              {ui.subtitle}
            </p>
          </div>
          <Badge variant="outline">MVP loop</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="rounded-[1.4rem] border border-cozy-sand/35 bg-white/80 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cozy-ink/45">
              {ui.labels.scenario}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {translatedScenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => setSelectedId(scenario.id)}
                  className={`rounded-full border px-3 py-2 text-left text-sm font-semibold transition ${
                    selectedId === scenario.id
                      ? "border-cozy-teal/40 bg-cozy-teal/12 text-cozy-ink"
                      : "border-cozy-sand/40 bg-white text-cozy-ink/80"
                  }`}
                >
                  {scenario.title}
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm leading-6 text-cozy-ink/70">
              {
                translatedScenarios.find((item) => item.id === selectedId)?.goal
              }
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-cozy-sand/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(245,251,250,0.9))] p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{selectedScenario.level}</Badge>
              <Badge variant="success">{sectorLabel}</Badge>
              <Badge variant="outline">Ollama coach</Badge>
            </div>

            <div className="space-y-3">
              {messages.map((message, index) => {
                const assistant = message.role === "assistant";
                return (
                  <div
                    key={`${message.role}-${index}-${message.content}`}
                    className={`max-w-[88%] rounded-[1.35rem] px-4 py-3 text-sm leading-6 ${
                      assistant
                        ? "rounded-tl-sm bg-cozy-teal/12 text-cozy-ink"
                        : "ml-auto rounded-tr-sm bg-[hsl(31_85%_88%)] text-cozy-ink"
                    }`}
                  >
                    <div className="mb-1 text-[11px] font-black uppercase tracking-[0.18em] text-cozy-ink/45">
                      {assistant ? "Coach" : "You"}
                    </div>
                    {message.content}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[1.4rem] border border-cozy-sand/35 bg-white/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cozy-ink/45">
                {ui.labels.speech}
              </p>
              <Badge variant={speechSupported ? "success" : "warning"}>
                {speechSupported ? ui.notes.speechReady : ui.notes.speechMissing}
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {!listening ? (
                <Button
                  type="button"
                  variant="teal"
                  onClick={startListening}
                  disabled={!speechSupported}
                >
                  <Mic className="h-4 w-4" />
                  {ui.actions.startMic}
                </Button>
              ) : (
                <Button type="button" variant="outline" onClick={stopListening}>
                  <Square className="h-4 w-4" />
                  {ui.actions.stopMic}
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-[1.4rem] border border-cozy-sand/35 bg-white/80 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cozy-ink/45">
              {ui.labels.transcript}
            </p>
            <Textarea
              ref={textareaRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="mt-3 min-h-[120px] rounded-2xl border-cozy-sand/40 bg-[hsl(202_60%_97%)]"
              placeholder="Typ of spreek hier je antwoord in het Nederlands..."
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button onClick={sendTurn} disabled={!draft.trim() || isTurnLoading}>
                {isTurnLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <SendHorizonal className="h-4 w-4" />
                )}
                {ui.actions.send}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={finishSession}
                disabled={messages.length < 2 || isReviewLoading}
              >
                {isReviewLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                {ui.actions.finish}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => resetSession()}
              >
                <RotateCcw className="h-4 w-4" />
                {ui.actions.reset}
              </Button>
            </div>
            {error && (
              <p className="mt-3 text-sm font-medium text-cozy-terracotta">
                {error}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{ui.labels.feedback}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-2xl bg-[hsl(202_60%_96%)] p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cozy-ink/45">
                  Better sentence
                </p>
                <p className="mt-2 text-sm leading-6 text-cozy-ink">
                  {turnData?.betterSentence ?? "Nog geen beurt verzonden."}
                </p>
              </div>
              <div className="rounded-2xl bg-[hsl(202_60%_96%)] p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cozy-ink/45">
                  Tip
                </p>
                <p className="mt-2 text-sm leading-6 text-cozy-ink">
                  {turnData?.tip ?? "De coach geeft hier na je beurt een korte tip."}
                </p>
              </div>
              <div className="rounded-2xl bg-[hsl(202_60%_96%)] p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cozy-ink/45">
                  Focus
                </p>
                <p className="mt-2 text-sm leading-6 text-cozy-ink">
                  {turnData?.detectedFocus ?? "Kies een scenario en stuur je eerste antwoord."}
                </p>
              </div>
              <p className="text-sm leading-6 text-cozy-ink/70">
                {ui.notes.ollamaFallback}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{ui.labels.vocabulary}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(turnData?.vocabulary ?? []).length > 0 ? (
                turnData?.vocabulary.map((item) => (
                  <div
                    key={`${item.word}-${item.meaning}`}
                    className="rounded-2xl border border-cozy-sand/35 bg-white/80 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="sunset">{item.word}</Badge>
                      <Badge variant="outline">{item.meaning}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-cozy-ink/70">
                  Na je beurt verschijnen hier woorden die we later in practice
                  of flashcards kunnen herhalen.
                </p>
              )}
            </CardContent>
          </Card>

          {reviewData && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{ui.labels.review}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl bg-[hsl(202_60%_96%)] p-4 text-sm leading-6 text-cozy-ink">
                  {reviewData.summary}
                </div>
                <div className="space-y-2">
                  {reviewData.strengths.map((item) => (
                    <div key={item} className="rounded-2xl bg-white/80 p-3 text-sm text-cozy-ink/80">
                      {item}
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {reviewData.focusPoints.map((item) => (
                    <div key={item} className="rounded-2xl bg-white/80 p-3 text-sm text-cozy-ink/80">
                      {item}
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {reviewData.microLessons.map((item) => (
                    <div key={item} className="rounded-2xl border border-cozy-sand/35 bg-white/80 p-3 text-sm text-cozy-ink/80">
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
