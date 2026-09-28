import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth";
import { db } from "@/lib/db/prisma";
import { MissionLibrary } from "@/components/features/missions/MissionLibrary";
import {
  getAllMissions,
  getPersonalMission,
} from "@/lib/learning/missions";

export const metadata: Metadata = {
  title: "Missions",
  description: "Oefen Nederlands in realistische situaties op school en stage.",
};

function stringList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export default async function MissionsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const conversations = await db.conversation.findMany({
    where: { userId: user.id },
    select: { context: true },
    orderBy: { createdAt: "desc" },
  });
  const completedIds = Array.from(
    new Set(
      conversations
        .map(
          ({ context }) =>
            (context as { missionId?: unknown } | null)?.missionId,
        )
        .filter((id): id is string => typeof id === "string"),
    ),
  );
  const recommended = getPersonalMission(
    new Date(),
    stringList(user.profile?.weakAreas),
    stringList(user.profile?.interests),
    completedIds,
  );

  return (
    <MissionLibrary
      missions={getAllMissions()}
      recommendedId={recommended.id}
      completedIds={completedIds}
    />
  );
}
