import { z } from "zod";
import { SECTORS } from "@/lib/sector/types";

export const moduleSchema = z.object({
  title: z.string().trim().min(3).max(255),
  description: z.string().trim().max(2000).default(""),
  sector: z.string().refine((value) => SECTORS.some((sector) => sector.code === value), "Kies een vakgebied."),
  languageLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
  instructions: z.string().trim().min(10).max(2000),
  exerciseCount: z.coerce.number().int().min(2).max(6).default(4),
});
export const scheduleSchema = z.object({
  enabled: z.boolean(),
  cadence: z.enum(["WEEKLY", "MONTHLY"]),
  firstRunAt: z.string().datetime().optional(),
}).superRefine((value, ctx) => {
  if (value.enabled && (!value.firstRunAt || Date.parse(value.firstRunAt) <= Date.now())) {
    ctx.addIssue({ code: "custom", path: ["firstRunAt"], message: "Kies een startmoment in de toekomst." });
  }
});
export const generationSchema = z.object({
  moduleId: z.string().cuid(),
  topic: z.string().trim().max(255).default(""),
});
export type ModuleInput = z.infer<typeof moduleSchema>;

/** Fixed UTC time; month-end schedules return to the original day in longer months. */
export function nextOccurrence(anchor: Date, cadence: string, after: Date): Date {
  if (anchor > after) return new Date(anchor);
  if (cadence === "WEEKLY") {
    const week = 7 * 24 * 60 * 60 * 1000;
    return new Date(anchor.getTime() + (Math.floor((after.getTime() - anchor.getTime()) / week) + 1) * week);
  }
  if (cadence !== "MONTHLY") throw new Error("Ongeldig planningsritme.");
  let month = after.getUTCFullYear() * 12 + after.getUTCMonth();
  for (;;) {
    const year = Math.floor(month / 12);
    const index = month % 12;
    const day = Math.min(anchor.getUTCDate(), new Date(Date.UTC(year, index + 1, 0)).getUTCDate());
    const candidate = new Date(Date.UTC(year, index, day, anchor.getUTCHours(), anchor.getUTCMinutes(), anchor.getUTCSeconds(), anchor.getUTCMilliseconds()));
    if (candidate > after) return candidate;
    month += 1;
  }
}
