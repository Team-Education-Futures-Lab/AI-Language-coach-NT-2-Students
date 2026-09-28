"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Mic,
  RotateCcw,
  SendHorizonal,
  Square,
  Sparkles,
  Trophy,
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
import { getLearningScenarios } from "@/lib/ai/learning-scenarios";
import type { LearningMission } from "@/lib/learning/missions";
import type {
  CoachMessage,
  CoachReviewResponse,
  CoachTurnResponse,
} from "@/lib/ai/voice-coach";

type CoachUiAction = "start-roleplay" | "start-capture" | "finish-session" | "reset-session";
type CoachProgressReward = {
  xpEarned: number;
  level: number;
  leveledUp: boolean;
  alreadySaved: boolean;
};

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

export function VoiceCoachSession({ initialLevel = "A2", initialScenario, initialMission }: { initialLevel?: string; initialScenario?: string; initialMission?: LearningMission | null }) {
  const router = useRouter();
  const { locale } = useLocale();
  const { sector } = useSector();
  const sectorLabel = getSectorLabel(locale, sector.dictKey);
  const dutchSectorLabel = getSectorLabel("nl", sector.dictKey);

  const [level, setLevel] = useState<"A1" | "A2" | "B1">(
    initialLevel === "A1" ? "A1" : initialLevel === "A2" ? "A2" : "B1",
  );
  const scenarios = useMemo(() => {
    const base = getLearningScenarios(sector.code).map((item) => ({ ...item, level }));
    if (!initialMission) return base;
    return [{
      id: initialMission.id,
      title: initialMission.shortTitle,
      goal: initialMission.goal,
      starter: initialMission.starter,
      example: initialMission.example,
      minutes: initialMission.minutes,
      level,
    }];
  }, [initialMission, sector.code, level]);

  const ui = useTranslatedPayload(
    {
      title: "Jouw oefengesprek",
      subtitle:
        "Kies een situatie. Spreek of typ een antwoord. Fouten maken mag.",
      labels: {
        scenario: "Wat wil je oefenen?",
        transcript: "Jouw antwoord",
        speech: "Spreken",
        voiceOutput: "Luisteren",
        feedback: "Een kleine stap vooruit",
        review: "Jouw terugblik",
        vocabulary: "Woorden voor jouw opleiding",
        selectedVoice: "Stem",
      },
      actions: {
        startMic: "Ik wil spreken",
        stopMic: "Klaar met spreken",
        autoListenOn: "Gesprek automatisch voortzetten",
        autoListenOff: "Zelf de microfoon starten",
        replayCoach: "Nog eens luisteren",
        stopCoach: "Stop de stem",
        autoSpeakOn: "Voorlezen aan",
        autoSpeakOff: "Voorlezen uit",
        send: "Verstuur",
        finish: "Afronden",
        reset: "Opnieuw",
      },
      notes: {
        speechReady: "Je microfoon is beschikbaar.",
        speechMissing:
          "Spreken kan hier niet. Je kunt je antwoord typen.",
        autoListen:
          "Praat rustig. Na een stilte versturen we je antwoord.",
        voiceReady: "Je kunt naar de coach luisteren.",
        voiceMissing:
          "Geluid kan hier niet. Lees het antwoord hieronder.",
        voiceQuality:
          "Luister zo vaak als je wilt. Je hoeft niet snel te antwoorden.",
        ollamaFallback:
          "De coach is AI en kan fouten maken. Vraag je docent als je twijfelt.",
      },
    },
    { source: "nl" },
  );

  const translatedScenarios = useTranslatedPayload(
    scenarios.map(({ title, goal }) => ({ title, goal })),
    { source: "nl" },
  );

  const [selectedId, setSelectedId] = useState(scenarios.find((item) => item.id === initialScenario)?.id ?? scenarios[0].id);
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
  const [progressReward, setProgressReward] = useState<CoachProgressReward | null>(null);
  const [isTurnLoading, setIsTurnLoading] = useState(false);
  const [isReviewLoading, setIsReviewLoading] = useState(false);
  const [saveProgress, setSaveProgress] = useState(false);
  const [reviewSaved, setReviewSaved] = useState(false);
  const sessionIdRef = useRef<string>("");
  const generationRef = useRef(0);
  const busyRef = useRef(false);
  const speechJobRef = useRef(0);
  const speechRequestRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startListeningRef = useRef<() => void>(() => {});
  const submitRef = useRef<(text: string) => Promise<void>>(async () => {});
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
    generationRef.current += 1;
    sessionIdRef.current = crypto.randomUUID();
    stopListening(true);
    stopSpeaking();
    busyRef.current = false;
    setIsTurnLoading(false);
    setIsReviewLoading(false);
    setMessages([{ role: "assistant", content: scenario.starter }]);
    setDraft("");
    setTurnData(null);
    setReviewData(null);
    setProgressReward(null);
    setReviewSaved(false);
    setError(null);
    setVoicePhase(null);
  }

  useEffect(() => {
    resetSession(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, sector.code, level]);

  useEffect(() => {
    const log = messagesEndRef.current?.parentElement;
    if (log) {
      log.scrollTo({
        top: log.scrollHeight,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
    }
  }, [messages.length, isTurnLoading]);

  useEffect(() => {
    mountedRef.current = true;
    const controller = new AbortController();
    void fetch("/api/coach/warmup", {
      method: "POST",
      cache: "no-store",
      signal: controller.signal,
    }).catch(() => {});

    return () => {
      mountedRef.current = false;
      generationRef.current += 1;
      speechJobRef.current += 1;
      speechRequestRef.current?.abort();
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      controller.abort();
    };
  }, []);

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
    speechJobRef.current += 1;
    speechRequestRef.current?.abort();
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
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
    formData.set("language", "nl");
    const generation = generationRef.current;

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

    if (generation !== generationRef.current) return;
    setDraft(transcript);
    await submitRef.current(transcript);
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
    const speechJob = speechJobRef.current;
    setError(null);
    setVoicePhase("Ik maak de coachstem klaar...");

    let timeoutId: number | null = null;

    try {
      const abortController = new AbortController();
      speechRequestRef.current = abortController;
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
      if (!mountedRef.current || speechJob !== speechJobRef.current) return;
      if (!audioBlob.size) {
        throw new Error("Empty audio response.");
      }

      const nextAudioUrl = URL.createObjectURL(audioBlob);
      const nextAudio = new Audio(nextAudioUrl);

      audioUrlRef.current = nextAudioUrl;
      audioRef.current = nextAudio;
      setSelectedVoiceLabel(
        `${response.headers.get("X-Voice-Label") ?? "Nederlandse coach"} (AI)`,
      );

      nextAudio.onended = () => {
        if (speechJob !== speechJobRef.current) return;
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
          resumeListening();
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
      if (!mountedRef.current || speechJob !== speechJobRef.current) return;
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

  function resumeListening() {
    resumeTimerRef.current = setTimeout(() => {
      if (mountedRef.current && !busyRef.current) startListeningRef.current();
    }, 250);
  }

  function continueHandsFreeLoop() {
    if (!handsFreeMode || isReviewLoading) {
      pendingAutoListenRef.current = false;
      return;
    }

    if (autoSpeak && voiceSupported) {
      pendingAutoListenRef.current = true;
      return;
    }

    pendingAutoListenRef.current = false;
    resumeListening();
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
    if (listening || busyRef.current || isReviewLoading) return;
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

  async function submitTurn(userText: string, supportMode: "normal" | "simpler" | "example" = "normal") {
    if (!userText || busyRef.current || !mountedRef.current) return;
    busyRef.current = true;
    const generation = generationRef.current;
    stopSpeaking();
    if (reviewData) sessionIdRef.current = crypto.randomUUID();
    setReviewSaved(false);

    const nextMessages: CoachMessage[] = [
      ...messages,
      { role: "user", content: userText },
    ];

    setMessages(nextMessages);
    setDraft("");
    setError(null);
    setReviewData(null);
    setProgressReward(null);
    setIsTurnLoading(true);
    setVoicePhase("De coach denkt na...");

    try {
      const response = await fetch("/api/coach/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
        body: JSON.stringify({
          mode: "turn",
          level: selectedScenario.level,
          sector: dutchSectorLabel,
          scenarioTitle: selectedScenario.title,
          missionId: initialMission?.id,
          scenarioGoal: selectedScenario.goal,
          nativeLocale: locale,
          userText,
          messages: nextMessages.slice(-20),
          supportMode,
        }),
      });
      const raw = await response.text();
      const json = raw ? JSON.parse(raw) : null;
      if (!response.ok || !json?.ok || !json?.data) {
        throw new Error(json?.error ?? "Could not send coach turn.");
      }
      if (generation !== generationRef.current) return;

      const data = json.data as CoachTurnResponse;
      setTurnData(data);
      const correction = data.hasCorrection && data.betterSentence
        ? ` Je kunt zeggen: "${data.betterSentence}".` : "";
      const coachText = `${data.coachReply}${correction} ${data.nextQuestion}`.trim();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: coachText,
        },
      ]);
      if (autoSpeak && voiceSupported) {
        void speakText(coachText.slice(0, 850));
        continueHandsFreeLoop();
      } else if (handsFreeMode) {
        setVoicePhase(null);
        continueHandsFreeLoop();
      } else {
        setVoicePhase(null);
      }
    } catch (err) {
      if (generation !== generationRef.current) return;
      setVoicePhase(null);
      setError(err instanceof Error ? err.message : "Could not send coach turn.");
    } finally {
      if (generation === generationRef.current) {
        busyRef.current = false;
        setIsTurnLoading(false);
      }
    }
  }
  startListeningRef.current = startListening;
  submitRef.current = submitTurn;

  async function sendTurn() {
    const userText = draft.trim();
    await submitTurn(userText);
  }

  async function finishSession() {
    if (isReviewLoading || busyRef.current || messages.length < 2) return;
    busyRef.current = true;
    stopListening(true);
    stopSpeaking();
    const generation = generationRef.current;

    setError(null);
    setIsReviewLoading(true);
    try {
      const response = await fetch("/api/coach/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(25000),
        body: JSON.stringify({
          mode: "review",
          level: selectedScenario.level,
          sector: dutchSectorLabel,
          scenarioTitle: selectedScenario.title,
          missionId: initialMission?.id,
          nativeLocale: locale,
          messages: messages.slice(-30),
          saveProgress,
          sessionId: sessionIdRef.current,
        }),
      });
      const json = await response.json();
      if (!response.ok || !json?.ok || !json?.data) {
        throw new Error(json?.error ?? "Could not build session review.");
      }
      if (generation === generationRef.current) {
        setReviewData(json.data as CoachReviewResponse);
        setProgressReward((json.progress as CoachProgressReward | undefined) ?? null);
        setReviewSaved(saveProgress);
        if (saveProgress) router.refresh();
      }
    } catch (err) {
      if (generation !== generationRef.current) return;
      setError(
        err instanceof Error ? err.message : "Could not build session review.",
      );
    } finally {
      if (generation === generationRef.current) {
        busyRef.current = false;
        setIsReviewLoading(false);
      }
    }
  }

  return (
    <Card ref={rootRef} id="voice-coach-session" className="learning-session overflow-hidden border-white/10 shadow-2xl">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle>{ui.title}</CardTitle>
            <p className="mt-1 text-sm leading-6 text-white/70">
              {ui.subtitle}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl p-4 shadow-lg">
            <h3 className="font-bold text-white">Sessie opties</h3>
            <div className="mt-4 space-y-4">
              <label className="block text-sm font-semibold text-white/80">Taalniveau AI
                <select aria-label="Mijn oefenniveau" className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-white" value={level}
                  onChange={(event) => setLevel(event.target.value as "A1" | "A2" | "B1")} disabled={listening || speaking}>
                  <option value="A1" className="bg-black text-white">A1</option>
                  <option value="A2" className="bg-black text-white">A2</option>
                  <option value="B1" className="bg-black text-white">B1</option>
                </select>
              </label>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl p-4 shadow-lg">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/50">
              {ui.labels.scenario}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {scenarios.map((scenario, index) => (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => setSelectedId(scenario.id)}
                  disabled={isTurnLoading || listening || isReviewLoading}
                  aria-pressed={selectedId === scenario.id}
                  className={`rounded-lg border px-3 py-2 text-left text-sm font-semibold transition ${
                    selectedId === scenario.id
                      ? "border-indigo-500/50 bg-indigo-500/20 text-white"
                      : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {translatedScenarios[index]?.title ?? scenario.title}
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm leading-6 text-white/70">
              {translatedScenarios[scenarios.findIndex((item) => item.id === selectedId)]?.goal}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{selectedScenario.level}</Badge>
              <Badge variant="success">{sectorLabel}</Badge>
              <Badge variant="outline">AI-taalcoach</Badge>
            </div>

            <div role="log" aria-label="Jouw gesprek" aria-live="polite" className="max-h-[420px] space-y-4 overflow-y-auto overscroll-contain py-2">
              {messages.map((message, index) => {
                const assistant = message.role === "assistant";
                return (
                  <div
                    key={`${message.role}-${index}-${message.content}`}
                    className={`max-w-[88%] rounded-[1.35rem] px-4 py-3 text-sm leading-6 ${
                      assistant
                        ? "rounded-tl-sm border border-indigo-400/20 bg-indigo-500/10 text-white"
                        : "ml-auto rounded-tr-sm border border-fuchsia-400/20 bg-fuchsia-500/15 text-white"
                    }`}
                  >
                    <div className="mb-1 text-[11px] font-black uppercase tracking-[0.18em] text-white/45">
                      {assistant ? "Coach" : "Jij"}
                    </div>
                    {message.content}
                  </div>
                );
              })}
              {isTurnLoading && <p role="status" className="flex items-center gap-2 p-3 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Ik lees je antwoord...</p>}
              <div ref={messagesEndRef} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
              <Button variant="outline" disabled={isTurnLoading || listening || isReviewLoading} onClick={() => void submitTurn("Ik begrijp de vraag niet.", "simpler")}>Leg het eenvoudiger uit</Button>
              <Button variant="outline" disabled={isTurnLoading || listening || isReviewLoading} onClick={() => void submitTurn("Kun je een voorbeeld geven?", "example")}>Geef een voorbeeld</Button>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/50">
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
                  disabled={!speechSupported || isTurnLoading || isReviewLoading}
                >
                  <Mic className="h-4 w-4" />
                  {ui.actions.startMic}
                </Button>
              ) : (
                <Button type="button" variant="outline" onClick={() => stopListening(false)}>
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
            <p className="mt-3 text-sm leading-6 text-white/70">
              {ui.notes.autoListen}
            </p>
              {voicePhase && (
                <p className="mt-2 text-sm font-medium text-fuchsia-300">
                  {voicePhase}
                </p>
              )}
          </div>

          <details className="rounded-xl border border-white/10 bg-black/40 p-4 text-white backdrop-blur-xl">
            <summary className="cursor-pointer font-semibold text-white">Stem en luisteren</summary>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/50">
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
            <div className="mt-3 rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  <Sparkles className="h-3.5 w-3.5" />
                  {ui.labels.selectedVoice}
                </Badge>
                <span className="text-sm font-semibold text-white">
                  {selectedVoiceLabel}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-white/70">
                {ui.notes.voiceQuality}
              </p>
            </div>
          </details>

          <div className="rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/50">
              {ui.labels.transcript}
            </p>
            <Textarea
              ref={textareaRef}
              value={draft}
              aria-label="Jouw antwoord"
              maxLength={500}
              disabled={isTurnLoading || isReviewLoading || listening}
              onChange={(event) => setDraft(event.target.value)}
              className="mt-3 min-h-[120px] rounded-lg border-white/10 bg-black/40 text-white"
              placeholder="Typ of spreek hier je antwoord in het Nederlands..."
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button onClick={sendTurn} disabled={!draft.trim() || isTurnLoading || isReviewLoading || listening}>
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
                disabled={messages.length < 2 || isReviewLoading || isTurnLoading || listening}
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
            <label className="mt-4 flex items-start gap-3 text-sm leading-6 text-white/75">
              <input type="checkbox" className="mt-1 h-4 w-4 accent-fuchsia-500" checked={saveProgress} disabled={isReviewLoading} onChange={(event) => setSaveProgress(event.target.checked)} />
              Bewaar mijn gesprek en voortgang. Alleen dan tellen de missie, XP, streak en skill-activiteit mee. Audio wordt nooit bewaard.
            </label>
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
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/50">
                  {turnData?.hasCorrection ? "Zo kun je het zeggen" : "Jouw volgende stap"}
                </p>
                <p className="mt-2 text-sm leading-6 text-white">
                  {turnData?.betterSentence || turnData?.nextQuestion || "Geef eerst een antwoord. Je krijgt daarna een kleine tip."}
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/50">
                  Tip
                </p>
                <p className="mt-2 text-sm leading-6 text-white">
                  {turnData?.tip ?? "De coach geeft hier na je beurt een korte tip."}
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/50">
                  Focus
                </p>
                <p className="mt-2 text-sm leading-6 text-white">
                  {turnData?.detectedFocus ?? "Kies een scenario en stuur je eerste antwoord."}
                </p>
              </div>
              <p className="text-sm leading-6 text-white/70">
                {turnData?.meta.usedFallback ? "De AI is even niet beschikbaar. Je ziet vaste oefenhulp, geen beoordeling van jouw Nederlands." : ui.notes.ollamaFallback}
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
                    className="rounded-lg border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="sunset">{item.word}</Badge>
                      <Badge variant="outline">{item.meaning}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-white/70">
                  Na je antwoord zie je hier woorden voor jouw opleiding.
                  Lees ze en probeer er zelf een zin mee te maken.
                </p>
              )}
            </CardContent>
          </Card>

          {reviewData && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{ui.labels.review} {reviewSaved ? "· Bewaard" : ""}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {progressReward && (
                  <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-white">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-400/15 text-emerald-200">
                        <Trophy size={20} />
                      </span>
                      <div>
                        <p className="font-bold">
                          {progressReward.alreadySaved
                            ? "Deze missie was al bewaard"
                            : `+${progressReward.xpEarned} XP verdiend`}
                        </p>
                        <p className="text-sm text-white/65">
                          Level {progressReward.level}
                          {progressReward.leveledUp ? " · Nieuw level bereikt" : " · Je journey is bijgewerkt"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {reviewData.meta.usedFallback && (
                  <p className="text-sm text-white/60">De AI kon geen terugblik maken. Hieronder zie je jouw oefenactiviteit en vaste oefentips, geen taalbeoordeling.</p>
                )}
                <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl p-4 shadow-lg">
                  <h3 className="mb-2 flex items-center gap-2 font-bold text-white"><Sparkles className="h-5 w-5 text-fuchsia-400" /> Over jouw gesprek</h3>
                  <p className="text-sm leading-6 text-white/70">{reviewData.summary}</p>
                </div>
                {reviewData.strengths.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-indigo-300">Sterke punten</h4>
                    {reviewData.strengths.map((item) => (
                      <div key={item} className="rounded-xl border border-white/10 bg-indigo-500/10 p-3 text-sm text-white shadow-lg">
                        {item}
                      </div>
                    ))}
                  </div>
                )}
                {reviewData.focusPoints.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-fuchsia-400">Wat kun je de volgende keer doen?</h4>
                    {reviewData.focusPoints.map((item) => (
                      <div key={item} className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl p-3 text-sm text-white/80 shadow-lg">
                        {item}
                      </div>
                    ))}
                  </div>
                )}
                {reviewData.microLessons.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-fuchsia-400">Micro-lessen</h4>
                    {reviewData.microLessons.map((item) => (
                      <div key={item} className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl p-3 text-sm text-white/80 shadow-lg">
                        {item}
                      </div>
                    ))}
                  </div>
                )}
                <Link
                  href="/missions"
                  className="inline-flex items-center gap-2 text-sm font-bold text-fuchsia-300 hover:text-fuchsia-200"
                >
                  Kies je volgende missie
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
