import { z } from "zod";
import type { Exercise, Lesson } from "@prisma/client";
import type { ExerciseType } from "@/types";

export const MultipleChoiceContentSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string()).min(2),
  correctIndex: z.number().int().nonnegative(),
  explanation: z.string().optional(),
});
export type MultipleChoiceContent = z.infer<
  typeof MultipleChoiceContentSchema
>;

export const FillInBlankContentSchema = z.object({
  sentence: z.string().min(1),
  placeholder: z.string().default("___"),
  correctAnswers: z.array(z.string()).min(1),
  explanation: z.string().optional(),
});
export type FillInBlankContent = z.infer<typeof FillInBlankContentSchema>;

export const TranslationContentSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  prompt: z.string().optional(),
  sentence: z.string().min(1),
  correctAnswers: z.array(z.string()).min(1),
});
export type TranslationContent = z.infer<typeof TranslationContentSchema>;

export const VocabularyContentSchema = z.object({
  word: z.string().min(1),
  translation: z.string().min(1),
  partOfSpeech: z.string().optional(),
  example: z.string().optional(),
});
export type VocabularyContent = z.infer<typeof VocabularyContentSchema>;

export const SentenceCorrectionContentSchema = z.object({
  incorrect: z.string().min(1),
  correct: z.string().min(1),
  category: z.string().optional(),
  explanation: z.string().optional(),
});
export type SentenceCorrectionContent = z.infer<
  typeof SentenceCorrectionContentSchema
>;

export const ConversationContentSchema = z.object({
  role: z.string().optional(),
  prompt: z.string().min(1),
  context: z.record(z.unknown()).optional(),
});
export type ConversationContent = z.infer<typeof ConversationContentSchema>;

export type ParsedExerciseBase = {
  id: string;
  lessonId: string;
  type: ExerciseType;
  title: string;
  description: string | null;
  difficulty: number;
  xpReward: number;
  lesson?: Lesson | null;
};

export type ParsedMultipleChoice = ParsedExerciseBase & {
  type: "MULTIPLE_CHOICE";
  content: MultipleChoiceContent;
};
export type ParsedFillInBlank = ParsedExerciseBase & {
  type: "FILL_IN_BLANK";
  content: FillInBlankContent;
};
export type ParsedTranslation = ParsedExerciseBase & {
  type: "TRANSLATION";
  content: TranslationContent;
};
export type ParsedVocabulary = ParsedExerciseBase & {
  type: "VOCABULARY";
  content: VocabularyContent;
};
export type ParsedSentenceCorrection = ParsedExerciseBase & {
  type: "SENTENCE_CORRECTION";
  content: SentenceCorrectionContent;
};
export type ParsedConversation = ParsedExerciseBase & {
  type: "CONVERSATION";
  content: ConversationContent;
};

export type ParsedExercise =
  | ParsedMultipleChoice
  | ParsedFillInBlank
  | ParsedTranslation
  | ParsedVocabulary
  | ParsedSentenceCorrection
  | ParsedConversation;

function parserFor(type: ExerciseType): z.ZodTypeAny {
  switch (type) {
    case "MULTIPLE_CHOICE":
      return MultipleChoiceContentSchema;
    case "FILL_IN_BLANK":
      return FillInBlankContentSchema;
    case "TRANSLATION":
      return TranslationContentSchema;
    case "VOCABULARY":
      return VocabularyContentSchema;
    case "SENTENCE_CORRECTION":
      return SentenceCorrectionContentSchema;
    case "CONVERSATION":
      return ConversationContentSchema;
    default:
      return z.unknown();
  }
}

export function parseExercise(exercise: Exercise): ParsedExercise {
  const parser = parserFor(exercise.type as ExerciseType);
  const parsedContent = parser.safeParse(exercise.content);
  if (!parsedContent.success) {
    const issues = parsedContent.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(
      `Ongeldige exercise-content voor type ${exercise.type} (id ${exercise.id}). Issues: ${issues}`
    );
  }
  return {
    id: exercise.id,
    lessonId: exercise.lessonId,
    type: exercise.type as ExerciseType,
    title: exercise.title,
    description: exercise.description,
    difficulty: exercise.difficulty,
    xpReward: exercise.xpReward,
    content: parsedContent.data as never,
  };
}

export type ParsedExerciseWithLesson = ParsedExercise & { lesson: Lesson };
