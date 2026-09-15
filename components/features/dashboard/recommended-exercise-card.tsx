import Link from "next/link";
import type { Exercise } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dumbbell, Zap } from "lucide-react";
import { EXERCISE_TYPE_LABELS } from "@/lib/constants";

type RecommendedExercise =
  | (Exercise & { lesson: { id: string; title: string; topic: string | null } })
  | null;

interface Props {
  exercise?: RecommendedExercise;
}

export function RecommendedExerciseCard({ exercise }: Props) {
  if (!exercise) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-xs font-medium text-primary">
            <Zap className="h-4 w-4" />
            AANBEVOLEN VOOR VANDAAG
          </div>
          <CardTitle className="pt-2 text-lg">Beginnen met oefenen</CardTitle>
          <CardDescription>
            Open de lessen om lesmateriaal te zien en je eerste oefening te maken.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button asChild size="sm" className="w-full sm:w-auto">
            <Link href="/lessons">
              <Dumbbell className="mr-1 h-4 w-4" />
              Lessen bekijken
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="w-full sm:w-auto">
            <Link href="/practice">Ga naar oefenen</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 text-xs font-medium text-primary">
          <Zap className="h-4 w-4" />
          AANBEVOLEN VOOR VANDAAG
        </div>
        <CardTitle className="pt-2 text-lg">{exercise.title}</CardTitle>
        <CardDescription>
          {exercise.description ??
            `Les: ${exercise.lesson.title}${
              exercise.lesson.topic ? ` (${exercise.lesson.topic})` : ""
            }`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">
            {EXERCISE_TYPE_LABELS[exercise.type] ?? "Oefening"}
          </Badge>
          <Badge variant="success">+{exercise.xpReward} XP</Badge>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button asChild size="sm" className="w-full sm:w-auto">
          <Link href={`/exercise/${exercise.id}`}>
            <Dumbbell className="mr-1 h-4 w-4" />
            Beginnen
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="w-full sm:w-auto">
          <Link href={`/lessons/${exercise.lesson.id}`}>Naar de les</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
