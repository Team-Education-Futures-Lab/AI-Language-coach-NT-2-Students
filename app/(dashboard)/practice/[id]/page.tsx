import type { Metadata } from "next";
import { getCurrentUser } from "@/auth";
import { ExercisePageClient } from "@/components/features/practice/ExercisePageClient";

export const metadata: Metadata = {
  title: "Oefening",
  description: "Maak een NT2-oefening.",
};

type MC = {
  key: "A" | "B" | "C" | "D";
  text: string;
  state?: "wrong" | "selected-correct" | "neutral";
};

const answers: MC[] = [
  {
    key: "A",
    text: "Ik zeg dat ze rustig moeten blijven en ga meteen naar huis.",
    state: "wrong",
  },
  {
    key: "B",
    text:
      "Ik help de bewoner rustig terug te gaan zitten, blijf erbij en waarschuw direct mijn stagebegeleider of de verpleegkundige.",
    state: "selected-correct",
  },
  {
    key: "C",
    text: "Ik geef snel een glas water en ga verder met mijn andere taken op de gang.",
    state: "neutral",
  },
  {
    key: "D",
    text: "Ik wacht tot de volgende dienst begint om het te vertellen.",
    state: "neutral",
  },
];

export default async function ExercisePage() {
  const user = await getCurrentUser();
  const userName = user?.name?.split(/\s+/)[0] ?? "Amira";

  return <ExercisePageClient userName={userName} answers={answers} />;
}
