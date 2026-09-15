import type { Metadata } from "next";
import { getCurrentUser } from "@/auth";
import { redirect } from "next/navigation";
import { getPracticeVocabBatch } from "./actions";
import { db } from "@/lib/db/prisma";
import { PracticePageClient } from "@/components/features/practice/PracticePageClient";

export const metadata: Metadata = {
  title: "Oefenen",
  description: "Kies een oefentype om te oefenen.",
};

export default async function PracticePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const batch = await getPracticeVocabBatch(15);

  const recommended = await db.exercise.findFirst({
    where: {
      OR: [{ type: "MULTIPLE_CHOICE" }, { type: "FILL_IN_BLANK" }],
      lesson: { published: true },
    },
    include: { lesson: true },
    orderBy: [{ difficulty: "asc" }, { xpReward: "asc" }],
  });

  return (
    <PracticePageClient
      batch={batch as any}
      recommendedId={recommended?.id ?? null}
    />
  );
}
