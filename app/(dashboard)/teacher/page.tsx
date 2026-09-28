import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BookOpen, GraduationCap, UsersRound } from "lucide-react";
import { getCurrentUser, isTeacherRole } from "@/auth";
import { db } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateStudentForm } from "./_CreateStudentForm";

export const metadata: Metadata = {
  title: "Studentenbeheer",
  description: "Beheer je studenten en bekijk hun leeractiviteit.",
};

export default async function TeacherPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isTeacherRole(user.role)) redirect("/dashboard");

  const students = await db.user.findMany({
    where: user.role === "ADMIN"
      ? { role: "STUDENT" }
      : { role: "STUDENT", teacherId: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      profile: {
        select: {
          languageLevel: true,
          totalXp: true,
        },
      },
      attempts: {
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-cozy-teal">
            <GraduationCap className="h-4 w-4" /> Docentomgeving
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-cozy-ink">
            Studentenbeheer
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Maak studentaccounts aan en houd hun activiteit bij. Dit is de plek
            voor dagelijks beheer; Prisma Studio blijft alleen een ontwikkeltool.
          </p>
        </div>
        <div className="rounded-2xl bg-cozy-sand/40 px-4 py-3 text-sm font-bold text-cozy-ink">
          {students.length} {students.length === 1 ? "student" : "studenten"}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)]">
        <Card className="border-cozy-sand/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersRound className="h-5 w-5 text-cozy-teal" />
              Jouw studenten
            </CardTitle>
            <CardDescription>
              Nieuwe accounts worden automatisch aan jou gekoppeld.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-cozy-sand p-8 text-center text-sm text-muted-foreground">
                Nog geen studenten. Voeg rechts je eerste student toe.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b bg-muted/40 px-4 py-2.5 text-xs font-semibold text-muted-foreground sm:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
                  <span>Student</span>
                  <span className="hidden sm:block">Niveau</span>
                  <span className="hidden sm:block">Oefeningen</span>
                  <span>XP</span>
                </div>
                {students.map((student) => (
                  <div key={student.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b px-4 py-3 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{student.name || "Naamloze student"}</p>
                      <p className="truncate text-xs text-muted-foreground">{student.email}</p>
                    </div>
                    <Badge variant="outline" className="hidden sm:inline-flex">
                      {student.profile?.languageLevel ?? "A1"}
                    </Badge>
                    <span className="hidden text-sm text-muted-foreground sm:block">
                      {student.attempts.length}
                    </span>
                    <span className="text-sm font-semibold">
                      {student.profile?.totalXp ?? 0}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-cozy-teal/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-cozy-terracotta" />
              Student toevoegen
            </CardTitle>
            <CardDescription>
              De student kan daarna direct inloggen met dit e-mailadres en tijdelijke wachtwoord.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateStudentForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
