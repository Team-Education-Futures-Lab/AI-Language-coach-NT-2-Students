// Placeholder voor AI-tutor logica (Fase 3+)
// Bepaalt systeem-prompt, behoudt context, stuurt responses.

import type { LanguageLevel } from "@/types";

export interface TutorContext {
  userId?: string;
  languageLevel: LanguageLevel;
  nativeLanguage?: string | null;
  weakAreas?: string[];
  strongAreas?: string[];
  learningGoals?: string[];
  recentMistakes?: Array<{ category: string; message: string }>;
}

export interface TutorMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function buildTutorSystemPrompt(
  _context: TutorContext,
): Promise<string> {
  // Wordt in Fase 3+ ingevuld
  return "Je bent een vriendelijke NT2 taalcoach.";
}

export async function askTutor(
  _messages: TutorMessage[],
  _context: TutorContext,
): Promise<string> {
  throw new Error("Niet geïmplementeerd in Fase 1");
}
