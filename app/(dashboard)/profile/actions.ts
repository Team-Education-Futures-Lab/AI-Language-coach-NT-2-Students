"use server";

import { revalidatePath } from "next/cache";
import type { LanguageLevel } from "@/types";
import { getCurrentUser } from "@/auth";
import { db } from "@/lib/db/prisma";
import { ensureProfile } from "@/lib/gamification";
import {
  profileUpdateSchema,
  type ProfileUpdateInput,
} from "@/lib/validations/profile";

export async function updateProfileAction(raw: ProfileUpdateInput) {
  const user = await getCurrentUser();
  if (!user) {
    return {
      ok: false,
      error: "Je moet ingelogd zijn om je profiel te wijzigen.",
    };
  }
  const parsed = profileUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.errors[0];
    return {
      ok: false,
      error: first
        ? `${first.path.join(".")}: ${first.message}`
        : "Ongeldige invoer.",
    };
  }

  await ensureProfile(user.id);
  const data = parsed.data;
  await db.profile.update({
    where: { userId: user.id },
    data: {
      languageLevel: data.languageLevel as LanguageLevel,
      nativeLanguage: data.nativeLanguage ?? null,
      interests: (data.interests ?? []) as unknown as any,
      learningGoals: (data.learningGoals ?? []) as unknown as any,
      weakAreas: (data.weakAreas ?? []) as unknown as any,
      strongAreas: (data.strongAreas ?? []) as unknown as any,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { ok: true };
}
