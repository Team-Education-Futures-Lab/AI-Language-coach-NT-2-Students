import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Sparkles } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { EXERCISE_TYPE_LABELS } from "@/lib/constants";
import type { ExerciseType } from "@/types";

interface Activity {
  id: string;
  title: string;
  type: ExerciseType | string;
  xp: number;
  time: Date;
  correct?: boolean | null;
}

export function RecentActivityCard({ items }: { items: Activity[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-base font-semibold">
            Recente activiteit
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Wat heb je de afgelopen dagen gedaan?
          </p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-300">
          <Clock className="h-5 w-5" />
        </span>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {items.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={
                    "grid h-9 w-9 shrink-0 place-items-center rounded-lg " +
                    (a.correct === false
                      ? "bg-rose-500/15 text-rose-600"
                      : "bg-primary/10 text-primary")
                  }
                >
                  <Sparkles className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {(EXERCISE_TYPE_LABELS[a.type] ?? a.type)} ·{" "}
                    {formatDate(a.time)}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="shrink-0">
                +{a.xp} XP
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
