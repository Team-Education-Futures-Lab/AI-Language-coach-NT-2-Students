import { OpenAI } from "openai";

const DEFAULT_OLLAMA_BASE_URL = "http://127.0.0.1:11434/v1";
const DEFAULT_OLLAMA_MODEL = "qwen2.5:1.5b-instruct";
const COACH_REQUEST_TIMEOUT_MS = 6500;

type MiraJsonResult = {
  provider: string;
  model: string;
  parsed: unknown;
};

function stripJsonFences(input: string) {
  return input
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function getMiraConfig() {
  const baseURL =
    process.env.MIRA_CONVERSE_API_BASE?.trim() ||
    process.env.OLLAMA_OPENAI_URL?.trim() ||
    DEFAULT_OLLAMA_BASE_URL;
  const model =
    process.env.MIRA_CONVERSE_MODEL?.trim() ||
    process.env.OLLAMA_MODEL?.trim() ||
    DEFAULT_OLLAMA_MODEL;
  const apiKey =
    process.env.MIRA_CONVERSE_API_KEY?.trim() ||
    process.env.OPENAI_API_KEY?.trim() ||
    "ollama";

  return { apiKey, baseURL, model };
}

function getMiraClient() {
  const { apiKey, baseURL } = getMiraConfig();
  return new OpenAI({
    apiKey,
    baseURL,
    maxRetries: 0,
    timeout: COACH_REQUEST_TIMEOUT_MS,
  });
}

export async function warmMiraConverse() {
  const config = getMiraConfig();
  const { baseURL } = config;
  const model = process.env.COACH_MODEL?.trim() || config.model;
  const url = new URL(baseURL);
  if (!["127.0.0.1", "localhost"].includes(url.hostname) || url.port !== "11434") return { warmed: false, model };

  const nativeBaseUrl = baseURL.replace(/\/v1\/?$/, "");
  const response = await fetch(`${nativeBaseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, keep_alive: "30m" }),
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });

  return { warmed: response.ok, model };
}

export async function askMiraConverseJson(input: {
  system: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  outputSchema?: Record<string, unknown>;
  model?: string;
  throwOnError?: boolean;
}): Promise<MiraJsonResult | null> {
  const config = getMiraConfig();
  const model = input.model ?? config.model;
  const { baseURL } = config;

  try {
    const client = getMiraClient();
    const completion = await client.chat.completions.create({
      model,
      temperature: input.temperature ?? 0.4,
      max_tokens: input.maxTokens ?? 700,
      response_format: input.outputSchema
        ? { type: "json_schema", json_schema: { name: "coach_response", strict: true, schema: input.outputSchema } }
        : { type: "json_object" },
      messages: [
        {
          role: "system",
          content: input.system,
        },
        {
          role: "user",
          content: input.prompt,
        },
      ],
    }, { timeout: input.timeoutMs ?? COACH_REQUEST_TIMEOUT_MS });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) return null;

    return {
      provider: baseURL.includes("11434") ? "mira_converse+ollama" : "mira_converse",
      model,
      parsed: JSON.parse(stripJsonFences(content)) as unknown,
    };
  } catch (error) {
    if (input.throwOnError) throw error;
    return null;
  }
}
