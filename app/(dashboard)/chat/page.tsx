import type { Metadata } from "next";
import { CoachLearningPage } from "@/components/features/chat/CoachLearningPage";
import { getCurrentUser } from "@/auth";
import { getMission } from "@/lib/learning/missions";

export const metadata: Metadata = {
  title: "AI Voice Coach",
  description:
    "Practice Dutch with a structured NT2 voice coach built around roleplays, review, vocabulary capture and micro-lessons.",
};

export default async function ChatPage({ searchParams }: { searchParams: Promise<{ scenario?: string; mission?: string }> }) {
  const [user, query] = await Promise.all([getCurrentUser(), searchParams]);
  return <CoachLearningPage level={user?.profile?.languageLevel ?? "A1"} scenario={query.scenario} mission={getMission(query.mission)} />;
}
