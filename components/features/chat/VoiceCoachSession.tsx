"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Loader2,
  Mic,
  RotateCcw,
  SendHorizonal,
  Square,
  Sparkles,
  Volume2,
  VolumeX,
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

const PREMIUM_VOICE_HINTS = [
  "siri",
  "premium",
  "enhanced",
  "neural",
  "natural",
  "xander",
  "claire",
  "ellen",
  "femke",
  "google nederlands",
  "microsoft hanne",
];

const AI_TTS_TIMEOUT_MS = 5000;
const VOICE_MIN_SPEECH_MS = 250;
const VOICE_SILENCE_MS = 550;
const VOICE_MAX_TURN_MS = 10000;
const VOICE_SILENCE_RMS_THRESHOLD = 0.02;

function normalizeSpeechText(input: string) {
  return input
    .replace(/\s+/g, " ")
    .replace(/\bNT2\b/g, "en tee twee")
    .replace(/\bMBO\b/g, "em bee oo")
    .replace(/->/g, " naar ")
    .replace(/[“”]/g, "\"")
    .replace(/[‘’]/g, "'")
    .trim();
}

function splitIntoSpeechChunks(input: string) {
  return normalizeSpeechText(input)
    .split(/(?<=[.!?])\s+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .slice(0, 4);
}

function scoreVoice(voice: SpeechSynthesisVoice) {
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase();

  let score = 0;
  if (lang === "nl-nl") score += 90;
  else if (lang.startsWith("nl")) score += 75;
  if (voice.localService) score += 12;
  if (voice.default) score += 8;

  for (const hint of PREMIUM_VOICE_HINTS) {
    if (name.includes(hint)) score += 18;
  }

  if (name.includes("compact")) score -= 10;
  if (name.includes("eloquence")) score -= 25;

  return score;
}

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
        voiceOutput: "Coach voice",
        feedback: "Live coaching",
        review: "Session review",
        vocabulary: "Useful words",
        selectedVoice: "Selected voice",
      },
      actions: {
        startMic: "Start mic",
        stopMic: "Stop mic",
        autoListenOn: "Auto listen on",
        autoListenOff: "Auto listen off",
        replayCoach: "Replay coach",
        stopCoach: "Stop voice",
        autoSpeakOn: "Auto speak on",
        autoSpeakOff: "Auto speak off",
        send: "Send turn",
        finish: "Finish session",
        reset: "Reset",
      },
      notes: {
        speechReady: "Browser speech input is available.",
        speechMissing:
          "Lokale voice capture is hier nog niet beschikbaar. Typen werkt al, en deze sessie is nu ingericht voor een faster-whisper runtime.",
        autoListen:
          "Handsfree mode listens for one turn, stops automatically after silence, and starts the next turn again after the coach reply.",
        voiceReady: "AI voice output is ready, with browser voice as fallback.",
        voiceMissing:
          "Audio playback is not available here. The coach still replies in text.",
        voiceQuality:
          "De coach gebruikt nu de lokale voice runtime voor transcriptie en Piper-audio, met browserstem als fallback als dat nodig is.",
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
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [browserVoiceSupported, setBrowserVoiceSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [handsFreeMode, setHandsFreeMode] = useState(true);
  const [selectedVoiceLabel, setSelectedVoiceLabel] = useState<string>("nl_NL-alex-medium (Piper)");
  const [error, setError] = useState<string | null>(null);
  const [voicePhase, setVoicePhase] = useState<string | null>(null);
  const [turnData, setTurnData] = useState<CoachTurnResponse | null>(null);
  const [reviewData, setReviewData] = useState<CoachReviewResponse | null>(null);
  const [isTurnLoading, setIsTurnLoading] = useState(false);
  const [isReviewLoading, setIsReviewLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const silenceStartedAtRef = useRef<number | null>(null);
  const captureStartedAtRef = useRef<number>(0);
  const hasSpokenRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const transcriptRef = useRef("");
  const manualStopRef = useRef(false);
  const pendingAutoListenRef = useRef(false);

  const selectedScenario =
    scenarios.find((scenario) => scenario.id === selectedId) ?? scenarios[0];

  function resetSession(nextScenarioId = selectedScenario.id) {
    const scenario =
      scenarios.find((item) => item.id === nextScenarioId) ?? scenarios[0];
    stopSpeaking();
    setMessages([{ role: "assistant", content: scenario.starter }]);
    setDraft("");
    setTurnData(null);
    setReviewData(null);
    setError(null);
    setVoicePhase(null);
  }

  useEffect(() => {
    resetSession(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const canUseBrowserVoice =
      "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

    setSpeechSupported(
      typeof window.MediaRecorder !== "undefined" &&
        typeof navigator !== "undefined" &&
        !!navigator.mediaDevices?.getUserMedia,
    );
    setVoiceSupported(typeof window.Audio !== "undefined" || canUseBrowserVoice);
    setBrowserVoiceSupported(canUseBrowserVoice);

    if ("speechSynthesis" in window) {
      const loadVoices = () => {
        voicesRef.current = window.speechSynthesis.getVoices();
      };
      loadVoices();
      window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

      return () => {
        stopListening(true);
        window.speechSynthesis.cancel();
        audioRef.current?.pause();
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
          audioUrlRef.current = null;
        }
        window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      };
    }

    return () => {
      stopListening(true);
      audioRef.current?.pause();
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
    };
  }, []);

  function stopSpeaking() {
    pendingAutoListenRef.current = false;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }

  function cleanupListeningResources() {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    sourceNodeRef.current?.disconnect();
    analyserRef.current?.disconnect();
    sourceNodeRef.current = null;
    analyserRef.current = null;

    if (audioContextRef.current) {
      void audioContextRef.current.close().catch(() => undefined);
      audioContextRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  }

  async function transcribeCapturedAudio(audioBlob: Blob) {
    const formData = new FormData();
    setVoicePhase("Ik zet je antwoord om naar tekst...");
    formData.set("audio", audioBlob, "voice-turn.webm");
    formData.set("language", locale.startsWith("nl") ? "nl" : locale);

    const response = await fetch("/api/voice/transcribe", {
      method: "POST",
      body: formData,
      cache: "no-store",
    });
    const raw = await response.text();
    const json = raw ? JSON.parse(raw) : null;
    if (!response.ok || !json?.ok || !json?.data?.text) {
      throw new Error(json?.error ?? "Could not transcribe voice input.");
    }

    const transcript = String(json.data.text).trim();
    if (!transcript) {
      throw new Error("Er werd geen duidelijke spraak herkend.");
    }

    setDraft(transcript);
    await submitTurn(transcript);
  }

  function speakWithBrowserVoice(text: string) {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window) ||
      !("SpeechSynthesisUtterance" in window)
    ) {
      return;
    }

    const content = text.trim();
    if (!content) return;

    window.speechSynthesis.cancel();

    const speechChunks = splitIntoSpeechChunks(content);
    const preferredVoice =
      [...voicesRef.current].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0] ??
      voicesRef.current.find((voice) => voice.lang.toLowerCase().startsWith("nl")) ??
      voicesRef.current.find((voice) => voice.default) ??
      null;

    if (preferredVoice) {
      setSelectedVoiceLabel(`${preferredVoice.name} (${preferredVoice.lang}, browser fallback)`);
    }

    setVoicePhase("De coach spreekt...");
    setSpeaking(true);

    speechChunks.forEach((chunk, index) => {
      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.lang = preferredVoice?.lang ?? "nl-NL";
      utterance.rate = 0.93;
      utterance.pitch = 1.02;
      utterance.volume = 1;

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        if (index === speechChunks.length - 1) {
          setSpeaking(false);
          setVoicePhase(null);
            if (pendingAutoListenRef.current) {
              pendingAutoListenRef.current = false;
              window.setTimeout(() => {
                startListening();
              }, 250);
            }
        }
      };
      utterance.onerror = () => {
        setSpeaking(false);
        setVoicePhase(null);
        setError("De coachstem kon niet worden afgespeeld.");
          if (pendingAutoListenRef.current) {
            pendingAutoListenRef.current = false;
            window.setTimeout(() => {
              startListening();
            }, 250);
          }
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  async function speakText(text: string) {
    if (typeof window === "undefined") {
      return;
    }

    const content = text.trim();
    if (!content) return;

    if (typeof window.Audio === "undefined") {
      if (browserVoiceSupported) {
        speakWithBrowserVoice(content);
        return;
      }
      setError("Deze browser ondersteunt geen audioweergave voor de coachstem.");
      return;
    }

    stopSpeaking();
    setError(null);
    setVoicePhase("Ik maak de coachstem klaar...");

    let timeoutId: number | null = null;

    try {
      const abortController = new AbortController();
      timeoutId = window.setTimeout(() => {
        abortController.abort();
      }, AI_TTS_TIMEOUT_MS);

      const response = await fetch("/api/voice/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        signal: abortController.signal,
        body: JSON.stringify({
          text: content,
          locale,
        }),
      });
      window.clearTimeout(timeoutId);
      timeoutId = null;

      if (!response.ok) {
        const json = await response.json().catch(() => null);
        throw new Error(json?.error ?? "Could not load AI voice.");
      }

      const audioBlob = await response.blob();
      if (!audioBlob.size) {
        throw new Error("Empty audio response.");
      }

      const nextAudioUrl = URL.createObjectURL(audioBlob);
      const nextAudio = new Audio(nextAudioUrl);

      audioUrlRef.current = nextAudioUrl;
      audioRef.current = nextAudio;
      setSelectedVoiceLabel(
        `${response.headers.get("X-TTS-Voice-Label") ?? "Fenna Neural"} (AI)`,
      );

      nextAudio.onended = () => {
        setSpeaking(false);
        setVoicePhase(null);
        if (audioUrlRef.current === nextAudioUrl) {
          URL.revokeObjectURL(nextAudioUrl);
          audioUrlRef.current = null;
        }
        if (audioRef.current === nextAudio) {
          audioRef.current = null;
        }
        if (pendingAutoListenRef.current) {
          pendingAutoListenRef.current = false;
          window.setTimeout(() => {
            startListening();
          }, 250);
        }
      };

      nextAudio.onerror = () => {
        setSpeaking(false);
        setVoicePhase(null);
        if (audioUrlRef.current === nextAudioUrl) {
          URL.revokeObjectURL(nextAudioUrl);
          audioUrlRef.current = null;
        }
        if (audioRef.current === nextAudio) {
          audioRef.current = null;
        }
        if (browserVoiceSupported) {
          speakWithBrowserVoice(content);
          return;
        }
        if (pendingAutoListenRef.current) {
          pendingAutoListenRef.current = false;
          window.setTimeout(() => {
            startListening();
          }, 250);
        }
        setError("De AI-stem kon niet worden afgespeeld.");
      };

      setSpeaking(true);
      await nextAudio.play();
    } catch (err) {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      stopSpeaking();
      if (browserVoiceSupported) {
        speakWithBrowserVoice(content);
        if (err instanceof DOMException && err.name === "AbortError") {
          setError("AI-stem was te traag, daarom is de browserstem gebruikt.");
        }
        return;
      }
      setSpeaking(false);
      setVoicePhase(null);
      setError(err instanceof Error ? err.message : "Could not load AI voice.");
    }
  }

  function continueHandsFreeLoop() {
    if (!handsFreeMode || listening || isTurnLoading || isReviewLoading) {
      pendingAutoListenRef.current = false;
      return;
    }

    if (autoSpeak && voiceSupported) {
      pendingAutoListenRef.current = true;
      return;
    }

    pendingAutoListenRef.current = false;
    window.setTimeout(() => {
      startListening();
    }, 250);
  }

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
        stopSpeaking();
        textareaRef.current?.focus();
        if (speechSupported) {
          startListening();
        } else {
          setError(
            "Je browser ondersteunt hier nog geen lokale voice capture. Typ je antwoord hieronder of gebruik de voice runtime setup.",
          );
        }
        return;
      }

      if (action === "start-capture") {
        stopSpeaking();
        if (speechSupported) {
          startListening();
        } else {
          textareaRef.current?.focus();
          setError(
              "Je browser ondersteunt hier nog geen lokale voice capture. Typ je antwoord hieronder of gebruik de voice runtime setup.",
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
    if (listening || isTurnLoading || isReviewLoading) return;
    if (
      typeof window.MediaRecorder === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setError("Je browser ondersteunt hier nog geen lokale voice capture.");
      return;
    }

    stopSpeaking();
    manualStopRef.current = false;
    transcriptRef.current = "";
    silenceStartedAtRef.current = null;
    hasSpokenRef.current = false;
    audioChunksRef.current = [];
    setVoicePhase("Ik luister...");

    void (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        mediaStreamRef.current = stream;

        const mimeType = [
          "audio/webm;codecs=opus",
          "audio/webm",
          "audio/mp4",
        ].find((candidate) => window.MediaRecorder.isTypeSupported(candidate));
        const mediaRecorder = new MediaRecorder(
          stream,
          mimeType ? { mimeType } : undefined,
        );
        mediaRecorderRef.current = mediaRecorder;

        const audioContext = new AudioContext();
        const sourceNode = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        sourceNode.connect(analyser);
        audioContextRef.current = audioContext;
        sourceNodeRef.current = sourceNode;
        analyserRef.current = analyser;
        captureStartedAtRef.current = performance.now();

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onerror = () => {
          cleanupListeningResources();
          setListening(false);
          setVoicePhase(null);
          setError("Voice capture stopped unexpectedly.");
        };

        mediaRecorder.onstop = () => {
          cleanupListeningResources();
          setListening(false);
          setVoicePhase("Ik zet je antwoord om naar tekst...");
          const audioBlob = new Blob(audioChunksRef.current, {
            type: mediaRecorder.mimeType || "audio/webm",
          });
          audioChunksRef.current = [];

          if (manualStopRef.current || audioBlob.size === 0) {
            return;
          }

          void transcribeCapturedAudio(audioBlob).catch((err) => {
            setError(
              err instanceof Error
                ? err.message
                : "Could not transcribe voice input.",
            );
          });
        };

        const sampleBuffer = new Uint8Array(analyser.frequencyBinCount);
        const monitorSilence = () => {
          if (!analyserRef.current || !mediaRecorderRef.current) return;
          analyserRef.current.getByteTimeDomainData(sampleBuffer);

          let sumSquares = 0;
          for (const sample of sampleBuffer) {
            const normalized = (sample - 128) / 128;
            sumSquares += normalized * normalized;
          }

          const rms = Math.sqrt(sumSquares / sampleBuffer.length);
          const now = performance.now();

          if (rms > VOICE_SILENCE_RMS_THRESHOLD) {
            hasSpokenRef.current = true;
            silenceStartedAtRef.current = null;
          } else if (
            hasSpokenRef.current &&
            now - captureStartedAtRef.current > VOICE_MIN_SPEECH_MS
          ) {
            if (silenceStartedAtRef.current === null) {
              silenceStartedAtRef.current = now;
            } else if (now - silenceStartedAtRef.current > VOICE_SILENCE_MS) {
              stopListening(false);
              return;
            }
          }

          if (now - captureStartedAtRef.current > VOICE_MAX_TURN_MS) {
            stopListening(false);
            return;
          }

          animationFrameRef.current = window.requestAnimationFrame(monitorSilence);
        };

        mediaRecorder.start(150);
        setListening(true);
        setError(null);
        animationFrameRef.current = window.requestAnimationFrame(monitorSilence);
      } catch (err) {
        cleanupListeningResources();
        setListening(false);
        setVoicePhase(null);
        setError(
          err instanceof Error
            ? err.message
            : "Microfoon kon niet worden gestart.",
        );
      }
    })();
  }

  function stopListening(manual = true) {
    manualStopRef.current = manual;
    pendingAutoListenRef.current = false;
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      return;
    }

    cleanupListeningResources();
    setListening(false);
    setVoicePhase(null);
  }

  async function submitTurn(userText: string) {
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
    setVoicePhase("De coach denkt na...");

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
      const raw = await response.text();
      const json = raw ? JSON.parse(raw) : null;
      if (!response.ok || !json?.ok || !json?.data) {
        throw new Error(json?.error ?? "Could not send coach turn.");
      }

      const data = json.data as CoachTurnResponse;
      setTurnData(data);
      const coachText = `${data.coachReply} ${data.nextQuestion}`.trim();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: coachText,
        },
      ]);
      if (autoSpeak && voiceSupported) {
        void speakText(coachText);
        continueHandsFreeLoop();
      } else if (handsFreeMode) {
        setVoicePhase(null);
        continueHandsFreeLoop();
      } else {
        setVoicePhase(null);
      }
    } catch (err) {
      setVoicePhase(null);
      setError(err instanceof Error ? err.message : "Could not send coach turn.");
    } finally {
      setIsTurnLoading(false);
    }
  }

  async function sendTurn() {
    const userText = draft.trim();
    await submitTurn(userText);
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
                <Button type="button" variant="outline" onClick={() => stopListening(true)}>
                  <Square className="h-4 w-4" />
                  {ui.actions.stopMic}
                </Button>
              )}
              <Button
                type="button"
                variant={handsFreeMode ? "sunset" : "outline"}
                onClick={() => {
                  setHandsFreeMode((current) => {
                    const nextValue = !current;
                    if (!nextValue) {
                      pendingAutoListenRef.current = false;
                    }
                    return nextValue;
                  });
                }}
                disabled={!speechSupported}
              >
                {handsFreeMode ? ui.actions.autoListenOn : ui.actions.autoListenOff}
              </Button>
            </div>
            <p className="mt-3 text-sm leading-6 text-cozy-ink/70">
              {ui.notes.autoListen}
            </p>
              {voicePhase && (
                <p className="mt-2 text-sm font-medium text-cozy-teal">
                  {voicePhase}
                </p>
              )}
          </div>

          <div className="rounded-[1.4rem] border border-cozy-sand/35 bg-white/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cozy-ink/45">
                {ui.labels.voiceOutput}
              </p>
              <Badge variant={voiceSupported ? "success" : "warning"}>
                {voiceSupported ? ui.notes.voiceReady : ui.notes.voiceMissing}
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                variant={autoSpeak ? "sunset" : "outline"}
                onClick={() => setAutoSpeak((current) => !current)}
                disabled={!voiceSupported}
              >
                {autoSpeak ? ui.actions.autoSpeakOn : ui.actions.autoSpeakOff}
              </Button>
              <Button
                type="button"
                variant="teal"
                onClick={() => void speakText(messages.filter((item) => item.role === "assistant").at(-1)?.content ?? "")}
                disabled={!voiceSupported || messages.filter((item) => item.role === "assistant").length === 0}
              >
                <Volume2 className="h-4 w-4" />
                {ui.actions.replayCoach}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={stopSpeaking}
                disabled={!voiceSupported || !speaking}
              >
                <VolumeX className="h-4 w-4" />
                {ui.actions.stopCoach}
              </Button>
            </div>
            <div className="mt-3 rounded-2xl bg-[hsl(202_60%_96%)] p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  <Sparkles className="h-3.5 w-3.5" />
                  {ui.labels.selectedVoice}
                </Badge>
                <span className="text-sm font-semibold text-cozy-ink">
                  {selectedVoiceLabel}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-cozy-ink/70">
                {ui.notes.voiceQuality}
              </p>
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
