import type { Metadata } from "next";
import { getCurrentUser } from "@/auth";
import { LearningHome } from "@/components/features/chat/LearningHome";
import { db } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { getPersonalMission } from "@/lib/learning/missions";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Je persoonlijke NT2-dashboard.",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const profileWeakAreas = Array.isArray(user.profile?.weakAreas)
    ? user.profile.weakAreas.filter((value): value is string => typeof value === "string")
    : [];
  const profileInterests = Array.isArray(user.profile?.interests)
    ? user.profile.interests.filter((value): value is string => typeof value === "string")
    : [];
  const [attempts, conversations, words, lessons, dailyGoal, streak, recentConversations] = await Promise.all([
    db.exerciseAttempt.count({ where: { userId: user.id } }),
    db.conversation.count({ where: { userId: user.id } }),
    db.userVocabulary.count({ where: { userId: user.id } }),
    db.lesson.findMany({
      where: { published: true, languageLevel: user.profile?.languageLevel ?? "A1" },
      take: 3, orderBy: { order: "asc" },
      select: { id: true, title: true, languageLevel: true, _count: { select: { exercises: true } } },
    }),
    db.dailyGoal.findUnique({ where: { userId_date: { userId: user.id, date: today } } }),
    db.streak.findUnique({ where: { userId: user.id }, select: { currentStreak: true } }),
    db.conversation.findMany({ where: { userId: user.id }, select: { context: true }, take: 40, orderBy: { createdAt: "desc" } }),
  ]);
  const completedMissionIds = recentConversations
    .map((conversation) => (
      (conversation.context as { missionId?: unknown } | null)?.missionId
    ))
    .filter((id): id is string => typeof id === "string");
  const mission = getPersonalMission(
    today,
    profileWeakAreas,
    profileInterests,
    completedMissionIds,
  );
  const missionCompleted = recentConversations.some((conversation) => (
    (conversation.context as { missionId?: unknown } | null)?.missionId === mission.id
  ));
  const focusAreas = Array.from(new Set([mission.focus, ...profileWeakAreas])).slice(0, 3);
  return <LearningHome data={{
    name: user.name ?? "student", level: user.profile?.languageLevel ?? "A1",
    attempts, conversations, words,
    lessons: lessons.map(({ _count, ...lesson }) => ({ ...lesson, exercises: _count.exercises })),
    mission,
    missionCompleted,
    dailyXp: { current: dailyGoal?.current ?? 0, target: dailyGoal?.target ?? 50 },
    streak: streak?.currentStreak ?? 0,
    focusAreas,
  }} />;
}
