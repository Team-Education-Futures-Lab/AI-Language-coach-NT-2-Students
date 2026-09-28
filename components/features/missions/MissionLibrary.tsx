"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock3,
  GraduationCap,
  Map,
  MessageCircle,
  Sparkles,
  Trophy,
} from "lucide-react";
import {
  MISSION_CATEGORY_LABELS,
  MISSION_MODE_LABELS,
  type LearningMission,
  type MissionCategory,
} from "@/lib/learning/missions";
import { cn } from "@/lib/utils";

type Props = {
  missions: LearningMission[];
  recommendedId: string;
  completedIds: string[];
};

const categories: Array<"ALL" | MissionCategory> = [
  "ALL",
  "SCHOOL",
  "STAGE",
  "DAGELIJKS",
  "SOCIAAL",
];

const modeStyles = {
  ROLEPLAY: "border-indigo-400/30 bg-indigo-500/10 text-indigo-200",
  REAL_LIFE: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
  STORY: "border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-200",
  SURVIVAL: "border-amber-400/30 bg-amber-500/10 text-amber-100",
} as const;

export function MissionLibrary({ missions, recommendedId, completedIds }: Props) {
  const [category, setCategory] = useState<"ALL" | MissionCategory>("ALL");
  const visible = useMemo(
    () =>
      category === "ALL"
        ? missions
        : missions.filter((mission) => mission.category === category),
    [category, missions],
  );
  const completed = new Set(completedIds);
  const recommended = missions.find((mission) => mission.id === recommendedId);

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <header className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40 p-7 backdrop-blur-2xl sm:p-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-transparent to-fuchsia-600/20" />
        <div className="relative max-w-3xl">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-fuchsia-300">
            <Map size={16} /> Leren door te doen
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Missions
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-white/70">
            Oefen echte situaties uit school, stage en het dagelijks leven.
            De AI speelt de andere persoon; jij bepaalt hoe het gesprek loopt.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/70">
            <span className="rounded-md border border-white/10 bg-white/5 px-3 py-2">
              {completed.size} afgerond
            </span>
            <span className="rounded-md border border-white/10 bg-white/5 px-3 py-2">
              {missions.length} situaties
            </span>
            <span className="rounded-md border border-white/10 bg-white/5 px-3 py-2">
              Tekst of volledig handsfree
            </span>
          </div>
        </div>
      </header>

      {recommended && (
        <section className="grid gap-5 rounded-xl border border-fuchsia-500/25 bg-fuchsia-500/10 p-6 backdrop-blur-xl lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-fuchsia-300">
              <Sparkles size={15} /> Aanbevolen voor jou
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              {recommended.title}
            </h2>
            <p className="mt-2 max-w-2xl leading-7 text-white/70">
              {recommended.situation}
            </p>
          </div>
          <Link
            href={`/chat?mission=${recommended.id}`}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 font-bold text-white shadow-lg"
          >
            Start missie <ArrowRight size={18} />
          </Link>
        </section>
      )}

      <nav aria-label="Mission-categorieën" className="flex flex-wrap gap-2">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            aria-pressed={category === item}
            className={cn(
              "rounded-lg border px-4 py-2 text-sm font-bold transition",
              category === item
                ? "border-white/20 bg-white/15 text-white"
                : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white",
            )}
          >
            {item === "ALL" ? "Alle missions" : MISSION_CATEGORY_LABELS[item]}
          </button>
        ))}
      </nav>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((mission) => {
          const isCompleted = completed.has(mission.id);
          return (
            <article
              key={mission.id}
              className="group flex min-h-[340px] flex-col rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:border-white/20"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-white/5 text-white">
                  {mission.category === "SCHOOL" ? (
                    <GraduationCap size={22} />
                  ) : mission.mode === "SURVIVAL" ? (
                    <Trophy size={22} />
                  ) : (
                    <MessageCircle size={22} />
                  )}
                </span>
                {isCompleted && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-200">
                    <Check size={13} /> Afgerond
                  </span>
                )}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <span
                  className={cn(
                    "rounded-md border px-2 py-1 text-[11px] font-black uppercase tracking-wide",
                    modeStyles[mission.mode],
                  )}
                >
                  {MISSION_MODE_LABELS[mission.mode]}
                </span>
                <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-bold text-white/70">
                  {mission.level}
                </span>
              </div>
              <h2 className="mt-4 text-xl font-bold text-white">
                {mission.title}
              </h2>
              <p className="mt-3 flex-1 text-sm leading-6 text-white/65">
                {mission.goal}
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-sm">
                <span className="flex items-center gap-2 text-white/50">
                  <Clock3 size={15} /> {mission.minutes} min · +{mission.xp} XP
                </span>
                <Link
                  href={`/chat?mission=${mission.id}`}
                  aria-label={`Start ${mission.title}`}
                  className="inline-flex items-center gap-1 font-bold text-fuchsia-300 transition group-hover:text-fuchsia-200"
                >
                  {isCompleted ? "Opnieuw" : "Start"} <ArrowRight size={17} />
                </Link>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
