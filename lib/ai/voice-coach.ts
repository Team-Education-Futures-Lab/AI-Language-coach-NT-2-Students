import { z } from "zod";

export const runtime = "nodejs";

const OLLAMA_URL = "http://127.0.0.1:11434";

const LEVEL_VALUES = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
const ROLE_VALUES = ["user", "assistant"] as const;

export const CoachMessageSchema = z.object({
  role: z.enum(ROLE_VALUES),
  content: z.string().trim().min(1).max(1200),
});

export const CoachTurnRequestSchema = z.object({
  mode: z.literal("turn"),
  level: z.enum(LEVEL_VALUES).default("A2"),
  sector: z.string().trim().min(1).max(120).default("Algemeen NT2"),
  scenarioTitle: z.string().trim().min(1).max(160),
  scenarioGoal: z.string().trim().max(320).optional().default(""),
  nativeLocale: z.string().trim().max(16).optional().default("nl"),
  userText: z.string().trim().min(1).max(500),
  messages: z.array(CoachMessageSchema).max(20),
});

export const CoachReviewRequestSchema = z.object({
  mode: z.literal("review"),
  level: z.enum(LEVEL_VALUES).default("A2"),
  sector: z.string().trim().min(1).max(120).default("Algemeen NT2"),
  scenarioTitle: z.string().trim().min(1).max(160),
  nativeLocale: z.string().trim().max(16).optional().default("nl"),
  messages: z.array(CoachMessageSchema).min(1).max(30),
});

export const CoachTurnResponseSchema = z.object({
  coachReply: z.string().trim().min(1).max(500),
  betterSentence: z.string().trim().min(1).max(500),
  tip: z.string().trim().min(1).max(220),
  detectedFocus: z.string().trim().min(1).max(120),
  nextQuestion: z.string().trim().min(1).max(300),
  vocabulary: z
    .array(
      z.object({
        word: z.string().trim().min(1).max(80),
        meaning: z.string().trim().min(1).max(200),
      }),
    )
    .max(4)
    .default([]),
  meta: z
    .object({
      provider: z.string(),
      model: z.string().optional(),
      usedFallback: z.boolean().default(false),
    })
    .default({ provider: "fallback", usedFallback: true }),
});

export const CoachReviewResponseSchema = z.object({
  summary: z.string().trim().min(1).max(500),
  strengths: z.array(z.string().trim().min(1).max(200)).max(4).default([]),
  focusPoints: z.array(z.string().trim().min(1).max(200)).max(4).default([]),
  microLessons: z.array(z.string().trim().min(1).max(200)).max(4).default([]),
  vocabulary: z
    .array(
      z.object({
        word: z.string().trim().min(1).max(80),
        meaning: z.string().trim().min(1).max(200),
      }),
    )
    .max(6)
    .default([]),
  meta: z
    .object({
      provider: z.string(),
      model: z.string().optional(),
      usedFallback: z.boolean().default(false),
    })
    .default({ provider: "fallback", usedFallback: true }),
});

export type CoachMessage = z.infer<typeof CoachMessageSchema>;
export type CoachTurnRequest = z.infer<typeof CoachTurnRequestSchema>;
export type CoachReviewRequest = z.infer<typeof CoachReviewRequestSchema>;
export type CoachTurnResponse = z.infer<typeof CoachTurnResponseSchema>;
export type CoachReviewResponse = z.infer<typeof CoachReviewResponseSchema>;

async function getAvailableOllamaModel() {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      models?: Array<{ name?: string }>;
    };
    const preferred = process.env.OLLAMA_MODEL?.trim();
    if (preferred) {
      const found = json.models?.find((m) => m.name === preferred)?.name;
      if (found) return found;
    }
    return json.models?.[0]?.name ?? null;
  } catch {
    return null;
  }
}

async function askOllamaJson(prompt: string) {
  const model = await getAvailableOllamaModel();
  if (!model) return null;

  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      model,
      stream: false,
      format: "json",
      prompt,
    }),
  });

  if (!res.ok) return null;
  const json = (await res.json()) as { response?: string };
  if (!json.response) return null;

  try {
    return { model, parsed: JSON.parse(json.response) as unknown };
  } catch {
    return null;
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function normalizeSentence(input: string) {
  const trimmed = input.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  const first = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  return /[.!?]$/.test(first) ? first : `${first}.`;
}

function detectFocus(text: string) {
  const lowered = text.toLowerCase();
  if (/\b(de|het)\b/.test(lowered)) return "de/het";
  if (/\b(gisteren|morgen|vandaag)\b/.test(lowered)) return "werkwoordsvorm";
  if (/\b(still|give|need|ready)\b/.test(lowered)) return "woordvolgorde";
  if (lowered.split(/\s+/).length <= 4) return "meer detail geven";
  return "duidelijke zinsbouw";
}

function extractWords(text: string, limit = 3) {
  const seen = new Set<string>();
  const matches = text
    .toLowerCase()
    .match(/[a-zA-ZÀ-ÿ][a-zA-ZÀ-ÿ'-]{3,}/g) ?? [];
  const words: Array<{ word: string; meaning: string }> = [];
  for (const candidate of matches) {
    if (seen.has(candidate)) continue;
    seen.add(candidate);
    words.push({
      word: candidate,
      meaning: "Term from this session",
    });
    if (words.length >= limit) break;
  }
  return words;
}

function fallbackTurn(input: CoachTurnRequest): CoachTurnResponse {
  const betterSentence = normalizeSentence(input.userText);
  const focus = detectFocus(input.userText);
  return {
    coachReply:
      "Goed gedaan. Je boodschap is begrijpelijk. Probeer nu nog iets duidelijker te zeggen wat al klaar is en wat nog moet gebeuren.",
    betterSentence,
    tip:
      focus === "meer detail geven"
        ? "Geef een iets langer antwoord met wie, wat en wanneer."
        : `Let vooral op ${focus} in korte zinnen.`,
    detectedFocus: focus,
    nextQuestion:
      "Kun je hetzelfde nog een keer zeggen, maar dan in twee korte zinnen?",
    vocabulary: extractWords(input.userText),
    meta: {
      provider: "fallback",
      usedFallback: true,
    },
  };
}

function fallbackReview(input: CoachReviewRequest): CoachReviewResponse {
  const userTexts = input.messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join(" ");
  const focus = detectFocus(userTexts || input.scenarioTitle);
  return {
    summary:
      "Je bleef begrijpelijk en je hield het gesprek gaande. De volgende stap is natuurlijkere zinsbouw in werksituaties.",
    strengths: [
      "Je durfde informatie te geven zonder stil te vallen.",
      "Je bleef dicht bij de praktijksituatie van het rollenspel.",
    ],
    focusPoints: [
      `Werk verder aan ${focus}.`,
      "Gebruik korte, rustige zinnen als de situatie spannend wordt.",
    ],
    microLessons: [
      "2 minuten: bouw drie korte werkzinnen met onderwerp + werkwoord + rest.",
      "Herhaal de beste zin uit deze sessie drie keer hardop.",
      "Maak een mini-overdracht in twee stappen: klaar / nog doen.",
    ],
    vocabulary: extractWords(userTexts, 5),
    meta: {
      provider: "fallback",
      usedFallback: true,
    },
  };
}

export async function generateCoachTurn(
  input: CoachTurnRequest,
): Promise<CoachTurnResponse> {
  const transcript = input.messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");

  const prompt = [
    "You are TaalCozy Voice Coach for NT2 students in Dutch MBO education.",
    `Student level: ${input.level}. Sector: ${input.sector}.`,
    `Scenario: ${input.scenarioTitle}. Goal: ${input.scenarioGoal || "Keep the conversation practical."}`,
    "Return only valid JSON with this exact shape:",
    JSON.stringify({
      coachReply: "string",
      betterSentence: "string",
      tip: "string",
      detectedFocus: "string",
      nextQuestion: "string",
      vocabulary: [{ word: "string", meaning: "string" }],
    }),
    "Rules:",
    "- Write coachReply, betterSentence, tip, and nextQuestion in simple Dutch.",
    "- Keep coachReply to 1 or 2 short sentences.",
    "- Give only one main correction focus.",
    "- betterSentence must improve the student's last message into natural Dutch.",
    "- tip must be short and supportive.",
    "- nextQuestion must continue the roleplay.",
    "- vocabulary max 3 items, useful NT2 words from the student's last message or scenario.",
    "Conversation so far:",
    transcript,
    `Last student message: ${input.userText}`,
  ].join("\n");

  try {
    const result = await askOllamaJson(prompt);
    if (!result) return fallbackTurn(input);
    const candidate = asRecord(result.parsed);
    if (!candidate) return fallbackTurn(input);
    const parsed = CoachTurnResponseSchema.safeParse({
      ...candidate,
      meta: {
        provider: "ollama",
        model: result.model,
        usedFallback: false,
      },
    });
    if (!parsed.success) return fallbackTurn(input);
    return parsed.data;
  } catch {
    return fallbackTurn(input);
  }
}

export async function generateCoachReview(
  input: CoachReviewRequest,
): Promise<CoachReviewResponse> {
  const transcript = input.messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");

  const prompt = [
    "You are TaalCozy Session Review for NT2 students in Dutch MBO education.",
    `Student level: ${input.level}. Sector: ${input.sector}. Scenario: ${input.scenarioTitle}.`,
    "Return only valid JSON with this exact shape:",
    JSON.stringify({
      summary: "string",
      strengths: ["string"],
      focusPoints: ["string"],
      microLessons: ["string"],
      vocabulary: [{ word: "string", meaning: "string" }],
    }),
    "Rules:",
    "- Write everything in simple Dutch.",
    "- Be supportive and concrete, never harsh.",
    "- strengths max 3 items.",
    "- focusPoints max 3 items.",
    "- microLessons max 3 items with practical follow-up actions.",
    "- vocabulary max 5 useful words or phrases.",
    "Conversation transcript:",
    transcript,
  ].join("\n");

  try {
    const result = await askOllamaJson(prompt);
    if (!result) return fallbackReview(input);
    const candidate = asRecord(result.parsed);
    if (!candidate) return fallbackReview(input);
    const parsed = CoachReviewResponseSchema.safeParse({
      ...candidate,
      meta: {
        provider: "ollama",
        model: result.model,
        usedFallback: false,
      },
    });
    if (!parsed.success) return fallbackReview(input);
    return parsed.data;
  } catch {
    return fallbackReview(input);
  }
}
