import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy } from "lucide-react";

interface Props {
  level?: number;
  currentXp?: number;
  xpForNextLevel?: number;
  languageLevel?: string;
}

export function LevelCard({
  level = 1,
  currentXp = 0,
  xpForNextLevel = 100,
  languageLevel = "A1",
}: Props) {
  const pct = Math.min(
    100,
    xpForNextLevel > 0 ? Math.round((currentXp / xpForNextLevel) * 100) : 0,
  );

  return (
    <Card className="col-span-full sm:col-span-2 lg:col-span-1">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Level & XP
          </CardTitle>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{level}</span>
            <Badge variant="secondary" className="text-xs">
              ERK {languageLevel}
            </Badge>
          </div>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-300">
          <Trophy className="h-5 w-5" />
        </span>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={pct} aria-label="XP voortgang" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{currentXp.toLocaleString("nl-NL")} XP</span>
          <span>{xpForNextLevel.toLocaleString("nl-NL")} XP naar level {level + 1}</span>
        </div>
      </CardContent>
    </Card>
  );
}
