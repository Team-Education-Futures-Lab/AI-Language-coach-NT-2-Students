import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Instellingen", description: "Account- en app-instellingen." };

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Instellingen</h1>
        <p className="mt-1 text-muted-foreground">
          Basisinstellingen voor je account. Uitgebreide opties volgen in latere fases.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Account</CardTitle>
            <CardDescription>
              Naam, e-mail en wachtwoord wijzigen (komt in Fase 2/5).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <PlaceholderRow label="Naam" value="Binnenkort aanpasbaar" />
            <PlaceholderRow label="E-mail" value="Binnenkort aanpasbaar" />
            <PlaceholderRow label="Wachtwoord" value="Binnenkort wijzigbaar" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Voorkeuren</CardTitle>
            <CardDescription>Thema, meldingen en taalkeuzes (placeholder).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <PlaceholderRow
              label="Thema"
              value="Systeem"
              badge={<Badge variant="outline">Auto</Badge>}
            />
            <PlaceholderRow
              label="Interface-taal"
              value="Nederlands"
              badge={<Badge variant="secondary">nl-NL</Badge>}
            />
            <PlaceholderRow label="Meldingen" value="Standaard" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PlaceholderRow({
  label,
  value,
  badge,
}: {
  label: string;
  value: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3">
      <div>
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{value}</p>
      </div>
      {badge}
    </div>
  );
}
