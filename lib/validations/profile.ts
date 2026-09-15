import { z } from "zod";
import type { LanguageLevel } from "@/types";
import { LanguageLevel as LanguageLevelValues } from "@/types";

const LEVELS: readonly [LanguageLevel, ...LanguageLevel[]] = [
  LanguageLevelValues.A1,
  LanguageLevelValues.A2,
  LanguageLevelValues.B1,
  LanguageLevelValues.B2,
  LanguageLevelValues.C1,
  LanguageLevelValues.C2,
];

export const profileUpdateSchema = z.object({
  languageLevel: z.enum(LEVELS),
  nativeLanguage: z
    .string()
    .max(64, "Moedertaal mag maximaal 64 tekens zijn.")
    .nullable()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" || v === null || v === undefined ? null : v)),
  interests: z.array(z.string().min(1)).default([]),
  learningGoals: z.array(z.string().min(1)).default([]),
  weakAreas: z.array(z.string().min(1)).default([]),
  strongAreas: z.array(z.string().min(1)).default([]),
});

export type ProfileUpdateInput = z.input<typeof profileUpdateSchema>;
export type { LanguageLevel };
