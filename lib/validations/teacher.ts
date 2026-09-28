import { z } from "zod";

export const createStudentSchema = z.object({
  name: z.string().trim().min(2, "Vul minimaal twee letters in.").max(80),
  email: z.string().trim().email("Voer een geldig e-mailadres in."),
  password: z
    .string()
    .min(8, "Het tijdelijke wachtwoord moet minimaal 8 tekens bevatten.")
    .max(128),
  languageLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).default("A1"),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
