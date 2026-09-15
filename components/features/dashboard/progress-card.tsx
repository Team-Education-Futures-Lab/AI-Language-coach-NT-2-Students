import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3 } from "lucide-react";
import type { Progress as ProgressRow } from "@prisma/client";

interface Props {
  progresses?: ProgressRow[];
}

const fallback = [
  { topic: "De/het woorden", accuracy: null, completed: 0, total: 0 },
  { topic: "Werkwoordspelling", accuracy: null, completed: 0, total: 0 },
  { topic: "Inversie", accuracy: null, completed: 0, total: 0 },
  { topic: "Woordvolgorde", accuracy: null, completed: 0, total: 0 },
];

export function ProgressCard({ progresses }: Props) {
  const rows = (progresses && progresses.length > 0
    ? progresses.slice(0, 4)
    : fallback
  ).map((p) => ({
    topic: (p as ProgressRow).topic ?? "Algemeen",
    progress:
      typeof (p as ProgressRow).accuracy === "number"
        ? Math.round((p as ProgressRow).accuracy!)
        : (p as ProgressRow).total > 0
        ? Math.round(
            100 *
              ((p as ProgressRow).completed / (p as ProgressRow).total)
          )
        : 0,
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-base font-semibold">
            Voortgang per onderwerp
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Waar sta je met de belangrijkste NT2-onderwerpen?
          </p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
          <BarChart3 className="h-5 w-5" />
        </span>
      </CardHeader>
      <CardContent className="space-y-5">
        {rows.map((t) => (
          <div key={t.topic} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{t.topic}</span>
              <span className="text-muted-foreground">{t.progress}%</span>
            </div>
            <Progress value={t.progress} aria-label={`${t.topic} progress`} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
