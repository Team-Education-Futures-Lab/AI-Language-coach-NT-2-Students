import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface Props {
  userName?: string | null;
  languageLevel?: string;
}

export function GreetingCard({ userName, languageLevel = "A1" }: Props) {
  const hour = new Date().getHours();
  const timeOfDay =
    hour < 6
      ? "Goedenacht"
      : hour < 12
        ? "Goedemorgen"
        : hour < 18
          ? "Goedemiddag"
          : "Goedenavond";

  return (
    <Card className="col-span-full lg:col-span-2 xl:col-span-3 overflow-hidden bg-gradient-to-br from-primary/10 via-card to-card">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {timeOfDay}, {userName ?? "student"} 👋
            </p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Laten we vandaag verder gaan met Nederlands!
            </h1>
            <p className="max-w-xl text-muted-foreground">
              Je werkt momenteel op niveau{" "}
              <span className="font-semibold text-foreground">{languageLevel}</span>.
              Elke kleine oefening brengt je dichter bij je doelen.
            </p>
          </div>
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-8 w-8" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
