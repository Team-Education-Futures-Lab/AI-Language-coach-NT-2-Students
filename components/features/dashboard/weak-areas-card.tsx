import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface WeakArea {
  topic: string;
  accuracy: number | null;
  completed: number;
}

export function WeakAreasCard({ topics }: { topics: WeakArea[] }) {
  const mapped = topics.map((t) => ({
    topic: t.topic,
    score: typeof t.accuracy === "number" ? Math.round(t.accuracy) : 0,
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-base font-semibold">
            Zwakke onderwerpen
          </CardTitle>
          <CardDescription>
            Oefen deze om snel vooruitgang te boeken.
          </CardDescription>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-300">
          <AlertTriangle className="h-5 w-5" />
        </span>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {mapped.map((a) => (
            <li
              key={a.topic}
              className="flex items-center justify-between gap-3 rounded-lg border bg-card/50 p-3"
            >
              <span className="text-sm font-medium">{a.topic}</span>
              <Badge
                variant={a.score < 45 ? "destructive" : "warning"}
                className="shrink-0"
              >
                Score {a.score}%
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
