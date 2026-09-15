import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LineChart, Target, Trophy } from "lucide-react";

export const metadata: Metadata = {
  title: "Voortgang",
  description: "Bekijk je voortgang per onderwerp en behaalde badges.",
};

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Voortgang</h1>
        <p className="mt-1 text-muted-foreground">
          Een overzicht van wat je al geleerd hebt. Uitgebreide statistieken volgen in latere fases.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Totaal XP
              </CardTitle>
              <p className="mt-1 text-3xl font-bold">1.240</p>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-300">
              <Trophy className="h-5 w-5" />
            </span>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Placeholder</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Voltooide oefeningen
              </CardTitle>
              <p className="mt-1 text-3xl font-bold">32</p>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-300">
              <Target className="h-5 w-5" />
            </span>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Placeholder</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Gemiddelde score
              </CardTitle>
              <p className="mt-1 text-3xl font-bold">76%</p>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
              <LineChart className="h-5 w-5" />
            </span>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Placeholder</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Voortgang per onderwerp</CardTitle>
          <CardDescription>Uitgebreidere grafieken komen in Fase 2/4.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {[
            ["Lidwoorden (de/het)", 58],
            ["Werkwoordspelling", 44],
            ["Inversie", 26],
            ["Woordvolgorde", 61],
            ["Woordenschat - Winkel", 72],
          ].map(([topic, pct]) => (
            <div key={topic as string} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{topic as string}</span>
                <span className="text-muted-foreground">{pct as number}%</span>
              </div>
              <Progress value={pct as number} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
