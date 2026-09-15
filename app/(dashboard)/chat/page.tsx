import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Chat met AI",
  description: "Praat met je AI-taalcoach en oefen Nederlands in de vorm van een gesprek.",
};

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Chat met je AI-taalcoach
          </h1>
          <p className="mt-1 text-muted-foreground">
            Stel vragen, oefen conversaties en krijg achteraf feedback op Nederlands gebruik.
          </p>
        </div>
        <Badge variant="secondary" className="w-fit">
          <Sparkles className="mr-1 h-3 w-3" /> AI-taalcoach · Fase 3
        </Badge>
      </div>
      <Card className="min-h-[420px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-5 w-5 text-primary" />
            Gesprek
          </CardTitle>
          <CardDescription>
            De echte AI-chat integreren we in Fase 3. Hieronder zie je alvast de toekomstige layout.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl bg-primary/5 p-4 text-sm">
            <span className="font-semibold">AI-coach:</span> Goedemiddag! Vandaag gaan we
            oefenen met een dagje winkelen. Kun je vertellen wat je afgelopen week hebt gedaan?
          </div>
          <div className="rounded-xl bg-muted p-4 text-sm">
            <span className="font-semibold">Jij:</span> (Typ hier je antwoord... / Spraak later
            in Fase 5)
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
