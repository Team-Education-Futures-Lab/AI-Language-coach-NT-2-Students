// OpenAI client placeholder - server-only module
// In Fase 2+: wordt gebruikt voor echte aanroepen
// Zet NODE_ENV check of 'use server' pattern om lekken te voorkomen

import { OpenAI } from "openai";

export const openaiModel =
  process.env.OPENAI_MODEL || "gpt-4o-mini";

function getOpenAiClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "" || apiKey.includes("placeholder")) {
    return null;
  }
  return new OpenAI({ apiKey });
}

export const aiClient = getOpenAiClient();

export async function ensureAiClient(): Promise<OpenAI> {
  const client = getOpenAiClient();
  if (!client) {
    throw new Error(
      "OpenAI API client niet geconfigureerd. Stel OPENAI_API_KEY in.",
    );
  }
  return client;
}
