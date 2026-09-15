import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LANGUAGE_LEVEL_LABELS, LanguageLevel } from "@/types";
import { ProfileEditor } from "@/components/features/profile/profile-editor";

export const metadata: Metadata = {
  title: "Profiel",
  description: "Jouw profiel en instellingen.",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const profile = user.profile;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Mijn profiel
          </h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            Beheer je persoonlijke gegevens en leerprofiel. Deze informatie
            gebruiken we om je oefeningen en AI-coach te personaliseren.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3">
              <Avatar className="h-24 w-24">
                {user.image ? (
                  <AvatarImage src={user.image} alt={user.name ?? ""} />
                ) : null}
                <AvatarFallback className="text-2xl font-semibold">
                  {user.name?.charAt(0)?.toUpperCase() ??
                    user.email?.charAt(0)?.toUpperCase() ??
                    "?"}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>{user.name ?? "Gebruiker"}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <Badge variant="secondary">
                {LANGUAGE_LEVEL_LABELS[
                  (profile?.languageLevel as LanguageLevel) ??
                    LanguageLevel.A1
                ] ?? `ERK ${profile?.languageLevel ?? "A1"}`}
              </Badge>
              <Badge variant="outline">Level {profile?.level ?? 1}</Badge>
              <Badge variant="success">{profile?.totalXp ?? 0} XP</Badge>
            </div>
          </CardHeader>
          <CardContent className="border-t pt-5 text-sm text-muted-foreground">
            <div className="grid gap-3 text-xs sm:text-sm">
              <InfoRow label="Aangemaakt op" value={formatIso(user.createdAt)} />
              <InfoRow
                label="Laatste update profiel"
                value={formatIso(profile?.updatedAt)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Leerprofiel bewerken
            </CardTitle>
            <CardDescription>
              Vul je leerdoelen en sterke/zwakke punten in. De AI gebruikt deze
              gegevens om je opdrachten en feedback te personaliseren.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileEditor
              initial={{
                languageLevel:
                  (profile?.languageLevel as LanguageLevel) ??
                  LanguageLevel.A1,
                nativeLanguage: profile?.nativeLanguage ?? "",
                interests: (profile?.interests as unknown as string[]) ?? [],
                learningGoals:
                  (profile?.learningGoals as unknown as string[]) ?? [],
                weakAreas: (profile?.weakAreas as unknown as string[]) ?? [],
                strongAreas: (profile?.strongAreas as unknown as string[]) ?? [],
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">
        {value ?? "—"}
      </span>
    </div>
  );
}

function formatIso(d?: Date | string | null) {
  if (!d) return null;
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
