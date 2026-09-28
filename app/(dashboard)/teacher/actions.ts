"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { requireTeacher } from "@/auth";
import { db } from "@/lib/db/prisma";
import { createStudentSchema } from "@/lib/validations/teacher";

type TeacherResult =
  | { ok: true; message: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createStudentAction(
  raw: Record<string, unknown>,
): Promise<TeacherResult> {
  try {
    const teacher = await requireTeacher();
    const parsed = createStudentSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Controleer de ingevulde gegevens.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const existing = await db.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true },
    });
    if (existing) {
      return { ok: false, error: "Dit e-mailadres is al in gebruik." };
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    await db.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
        role: "STUDENT",
        teacherId: teacher.id,
        profile: {
          create: {
            languageLevel: parsed.data.languageLevel,
          },
        },
        streaks: { create: {} },
      },
    });

    revalidatePath("/teacher");
    return {
      ok: true,
      message: "Studentaccount aangemaakt en aan jou gekoppeld.",
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Student aanmaken is niet gelukt.",
    };
  }
}
