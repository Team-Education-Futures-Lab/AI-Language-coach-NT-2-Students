import { OpenAI } from "openai";

const DEFAULT_OLLAMA_BASE_URL = "http://127.0.0.1:11434/v1";
const DEFAULT_OLLAMA_MODEL = "llama3.1:8b";

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
  return new OpenAI({ apiKey, baseURL });
}

export async function askMiraConverseJson(input: {
  system: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<MiraJsonResult | null> {
  const { model, baseURL } = getMiraConfig();

  try {
    const client = getMiraClient();
    const completion = await client.chat.completions.create({
      model,
      temperature: input.temperature ?? 0.4,
      max_tokens: input.maxTokens ?? 700,
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
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) return null;

    return {
      provider: baseURL.includes("11434") ? "mira_converse+ollama" : "mira_converse",
      model,
      parsed: JSON.parse(stripJsonFences(content)) as unknown,
    };
  } catch {
    return null;
  }
}
