import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";

interface Props {
  target?: number;
  current?: number;
  goalType?: string;
}

function describeGoal(type: string, target: number, current: number) {
  switch (type) {
    case "XP":
      return { unit: "XP", currentLabel: `${current} XP`, targetLabel: `${target} XP` };
    case "LESSONS":
      return { unit: "lessen", currentLabel: `${current} les`, targetLabel: `${target} lessen` };
    case "MINUTES":
      return { unit: "minuten", currentLabel: `${current} min.`, targetLabel: `${target} min.` };
    default:
      return { unit: "oefeningen", currentLabel: `${current} oef.`, targetLabel: `${target} oef.` };
  }
}

export function DailyGoalCard({
  target = 50,
  current = 0,
  goalType = "XP",
}: Props) {
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const labels = describeGoal(goalType, target, current);
  const done = current >= target;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Dagelijks doel
          </CardTitle>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-bold">{pct}%</span>
            {done ? (
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                Behaald
              </span>
            ) : null}
          </div>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-300">
          <Target className="h-5 w-5" />
        </span>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={pct} />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{labels.currentLabel}</span>
          <span>Doel: {labels.targetLabel}</span>
        </div>
      </CardContent>
    </Card>
  );
}
