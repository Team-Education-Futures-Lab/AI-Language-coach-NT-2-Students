import { z } from "zod";
import type { VocabularyStatus } from "@/types";

export const vocabResultSchema = z.enum(["again", "hard", "easy"]);
export type VocabResult = z.infer<typeof vocabResultSchema>;

export { type VocabularyStatus };
