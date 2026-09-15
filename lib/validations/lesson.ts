import { z } from "zod";
import {
  LanguageLevel as LanguageLevelValues,
  LessonCategory as LessonCategoryValues,
  ExerciseType as ExerciseTypeValues,
} from "@/types";

const LANGUAGE_LEVEL_KEYS = Object.values(LanguageLevelValues) as [
  string,
  ...string[],
];
const CATEGORY_KEYS = Object.values(LessonCategoryValues) as [
  string,
  ...string[],
];
const EXERCISE_TYPE_KEYS = Object.values(ExerciseTypeValues) as [
  string,
  ...string[],
];

export const lessonCreateSchema = z.object({
  title: z
    .string({ required_error: "Titel is verplicht" })
    .min(3, "Titel moet minimaal 3 tekens zijn")
    .max(255, "Titel mag maximaal 255 tekens zijn"),
  description: z
    .string()
    .max(4000, "Beschrijving mag maximaal 4000 tekens zijn")
    .optional()
    .or(z.literal("")),
  topic: z
    .string()
    .max(255, "Onderwerp mag maximaal 255 tekens zijn")
    .optional()
    .or(z.literal("")),
  category: z.enum(CATEGORY_KEYS, {
    required_error: "Kies een categorie",
    invalid_type_error: "Ongeldige categorie",
  }),
  languageLevel: z.enum(LANGUAGE_LEVEL_KEYS, {
    required_error: "Kies een taalniveau",
    invalid_type_error: "Ongeldig taalniveau",
  }),
  goals: z
    .array(z.string().max(255, "Een doel mag max 255 tekens zijn"))
    .max(15, "Maximaal 15 doelen per les")
    .default([]),
  order: z.coerce.number().int().min(0).default(0),
  published: z.boolean().default(false),
  coverImage: z
    .string()
    .max(1024, "URL afbeelding mag max 1024 tekens zijn")
    .optional()
    .or(z.literal("")),
});
export type LessonCreateInput = z.infer<typeof lessonCreateSchema>;

export const lessonUpdateSchema = lessonCreateSchema.partial();
export type LessonUpdateInput = z.infer<typeof lessonUpdateSchema>;

export const exerciseEditorSchema = z.object({
  id: z.string().optional(),
  type: z.enum(EXERCISE_TYPE_KEYS, {
    required_error: "Kies een oefeningtype",
    invalid_type_error: "Ongeldig oefeningtype",
  }),
  title: z
    .string({ required_error: "Titel is verplicht" })
    .min(2, "Titel moet minimaal 2 tekens zijn")
    .max(255),
  description: z
    .string()
    .max(2000, "Beschrijving max 2000 tekens")
    .optional()
    .or(z.literal("")),
  difficulty: z.coerce.number().int().min(1).max(5).default(1),
  xpReward: z.coerce.number().int().min(1).max(500).default(10),
  order: z.coerce.number().int().min(0).default(0),
  hint: z
    .string()
    .max(500, "Hint max 500 tekens")
    .optional()
    .or(z.literal("")),
  content: z.record(z.unknown()).default({}),
});
export type ExerciseEditorInput = z.infer<typeof exerciseEditorSchema>;

export const aiGenerateExercisesSchema = z.object({
  lessonId: z.string().cuid({ message: "Ongeldige les-id" }),
  count: z.coerce.number().int().min(1).max(15).default(5),
  topicOverride: z.string().optional().or(z.literal("")),
  typeHint: z.enum(EXERCISE_TYPE_KEYS).optional(),
});
export type AiGenerateExercisesInput = z.infer<
  typeof aiGenerateExercisesSchema
>;

export const lessonIdSchema = z.object({
  lessonId: z.string().cuid({ message: "Ongeldige les-id" }),
});

export const exerciseIdSchema = z.object({
  lessonId: z.string().cuid({ message: "Ongeldige les-id" }),
  exerciseId: z.string().cuid({ message: "Ongeldige oefening-id" }),
});

export const exerciseReorderSchema = z.object({
  lessonId: z.string().cuid(),
  orderedIds: z.array(z.string().cuid()).min(0),
});
export type ExerciseReorderInput = z.infer<typeof exerciseReorderSchema>;
