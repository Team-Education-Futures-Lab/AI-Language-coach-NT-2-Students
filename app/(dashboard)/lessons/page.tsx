import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Layers3, Sparkles } from "lucide-react";
import { db } from "@/lib/db/prisma";
import { getCurrentUser, isTeacherRole } from "@/auth";

export const metadata: Metadata = {
  title: "Lessen & Modules",
  description: "NT2-lessen en leerroutes voor school en beroep.",
};

export default async function LessonsPage() {
  const user = await getCurrentUser();
  const lessons = await db.lesson.findMany({
    where: { published: true },
    orderBy: [{ languageLevel: "asc" }, { order: "asc" }],
    select: {
      id: true,
      title: true,
      description: true,
      languageLevel: true,
      moduleId: true,
      _count: { select: { exercises: true } },
    },
  });
  const modules = await db.lessonModule.findMany({
    where: { lessons: { some: { published: true } } },
    select: { id: true, title: true, description: true },
    orderBy: { title: "asc" },
  });
  const groups = [
    ...modules.map((module) => ({
      ...module,
      lessons: lessons.filter((lesson) => lesson.moduleId === module.id),
    })),
    {
      id: "standalone",
      title: "Losse lessen",
      description: "Korte lessen die je los van een leerroute kunt volgen.",
      lessons: lessons.filter((lesson) => !lesson.moduleId),
    },
  ].filter((group) => group.lessons.length > 0);

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <header className="flex flex-col gap-6 rounded-xl border border-white/10 bg-black/40 p-7 backdrop-blur-2xl sm:flex-row sm:items-end sm:justify-between sm:p-9">
        <div>
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-fuchsia-300">
            <BookOpen size={16} /> Nederlands, stap voor stap
          </p>
          <h1 className="mt-3 text-4xl font-bold text-white">Jouw lessen</h1>
          <p className="mt-3 max-w-2xl text-lg text-white/65">
            Verdiep wat je in missions oefent met uitleg en gerichte opdrachten
            op jouw eigen tempo.
          </p>
        </div>
        {user && isTeacherRole(user.role) && (
          <Link
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 py-2 font-bold text-white"
            href="/lesson-builder"
          >
            AI-lesbouwer <ArrowRight size={18} />
          </Link>
        )}
      </header>

      {!lessons.length && (
        <div className="rounded-xl border border-dashed border-white/15 bg-white/5 p-8 text-white backdrop-blur-xl">
          <Sparkles className="mb-4 text-fuchsia-300" />
          <p className="text-lg font-bold">Er staan nog geen lessen klaar.</p>
          <p className="mt-2 text-white/60">
            Je kunt ondertussen al echte situaties oefenen met je AI-coach.
          </p>
          <Link
            href="/missions"
            className="mt-5 inline-flex items-center gap-2 font-bold text-fuchsia-300"
          >
            Bekijk missions <ArrowRight size={18} />
          </Link>
        </div>
      )}

      {groups.map((group) => (
        <section key={group.id} className="space-y-5">
          <header>
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-white/45">
              <Layers3 size={15} /> Module
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">{group.title}</h2>
            {group.description && (
              <p className="mt-2 max-w-2xl text-white/60">{group.description}</p>
            )}
          </header>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {group.lessons.map((lesson) => (
              <Link
                href={`/lessons/${lesson.id}`}
                key={lesson.id}
                className="group flex min-h-[260px] flex-col rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:border-white/20"
              >
                <div className="mb-6 flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-lg border border-indigo-400/20 bg-indigo-500/10 text-indigo-200">
                    <BookOpen size={21} />
                  </span>
                  <span className="rounded-md border border-white/10 bg-white/5 px-3 py-1 text-sm font-bold text-white/70">
                    {lesson.languageLevel}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">{lesson.title}</h3>
                <p className="mb-6 mt-3 line-clamp-3 flex-1 leading-6 text-white/60">
                  {lesson.description ?? "Oefen Nederlands met deze les."}
                </p>
                <div className="flex items-center justify-between border-t border-white/10 pt-4 text-sm text-white/55">
                  <span>{lesson._count.exercises} oefeningen</span>
                  <ArrowRight
                    size={18}
                    className="transition group-hover:translate-x-1 group-hover:text-fuchsia-300"
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
