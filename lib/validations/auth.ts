import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Voer een geldig e-mailadres in."),
  password: z
    .string()
    .min(1, "Voer je wachtwoord in."),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(2, "Naam is verplicht (minimaal 2 tekens).").max(80),
    email: z.string().email("Voer een geldig e-mailadres in."),
    password: z
      .string()
      .min(8, "Wachtwoord moet minimaal 8 tekens bevatten.")
      .max(128),
    confirmPassword: z.string().min(1, "Bevestig je wachtwoord."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Wachtwoorden komen niet overeen.",
  });

export type RegisterInput = z.infer<typeof registerSchema>;
