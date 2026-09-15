// AI feedback module - Fase 3+
// Structurele feedback voor zinnen / conversatie

import { z } from "zod";
import type { Severity } from "@/types";
import { Severity as SeverityValues } from "@/types";

export const AiFeedbackSchema = z.object({
  originalText: z.string(),
  correctedText: z.string(),
  explanation: z.string(),
  category: z.string(),
  severity: z.enum([
    SeverityValues.low,
    SeverityValues.medium,
    SeverityValues.high,
  ]) as z.ZodType<Severity>,
  suggestions: z.array(z.string()).optional(),
  ruleReference: z.string().optional(),
});

export type AiFeedback = z.infer<typeof AiFeedbackSchema>;

export async function generateFeedback(
  _text: string,
  _opts: { languageLevel?: string; focus?: string[] } = {},
): Promise<AiFeedback> {
  throw new Error("Niet geïmplementeerd in Fase 1");
}

export async function validateFeedback(
  data: unknown,
): Promise<AiFeedback | null> {
  const res = AiFeedbackSchema.safeParse(data);
  return res.success ? res.data : null;
}
