import type { Metadata } from "next";
import { VoiceCoachHub } from "@/components/features/chat/VoiceCoachHub";

export const metadata: Metadata = {
  title: "AI Voice Coach",
  description:
    "Practice Dutch with a structured NT2 voice coach built around roleplays, review, vocabulary capture and micro-lessons.",
};

export default function ChatPage() {
  return <VoiceCoachHub />;
}
