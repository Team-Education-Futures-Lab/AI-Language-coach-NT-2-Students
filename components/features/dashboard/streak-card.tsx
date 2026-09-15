import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame } from "lucide-react";

interface Props {
  streak?: number;
}

export function StreakCard({ streak = 0 }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Streak
          </CardTitle>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-bold">{streak}</span>
            <span className="text-sm text-muted-foreground">dagen</span>
          </div>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-300">
          <Flame className="h-5 w-5" />
        </span>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 7 }).map((_, i) => {
            const active = i < Math.min(streak, 7);
            return (
              <Badge
                key={i}
                variant={active ? "default" : "outline"}
                className={`h-7 w-7 p-0 ${active ? "bg-rose-500" : "text-muted-foreground/60"}`}
              >
                {["M", "D", "W", "D", "V", "Z", "Z"][i]}
              </Badge>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
