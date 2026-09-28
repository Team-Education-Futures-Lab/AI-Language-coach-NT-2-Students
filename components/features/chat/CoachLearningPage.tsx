"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { VoiceCoachSession } from "./VoiceCoachSession";
import { useSector } from "@/lib/sector/SectorProvider";
import type { LearningMission } from "@/lib/learning/missions";

export function CoachLearningPage({ level, scenario, mission }: { level: string; scenario?: string; mission?: LearningMission | null }) {
  const { sector } = useSector();
  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"><ArrowLeft size={16} /> Terug naar mijn leerplek</Link>
      <header className="learning-reveal flex flex-wrap items-end justify-between gap-6 py-3">
        <div><p className="learning-eyebrow text-fuchsia-400">{mission ? "Vandaag op het mbo" : "Jouw persoonlijke oefenplek"}</p><h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">{mission?.title ?? "Samen vinden we de woorden."}</h1><p className="mt-4 max-w-xl text-lg leading-7 text-white/70">{mission?.situation ?? `Nederlands voor ${sector.label}. Neem je tijd. Je mag opnieuw proberen.`}</p></div>
        <span className="inline-flex items-center gap-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30 px-4 py-2 text-sm text-indigo-200"><ShieldCheck size={17} /> Oefenen, niet toetsen</span>
      </header>
      <VoiceCoachSession key={`${sector.code}:${mission?.id ?? scenario ?? "default"}`} initialLevel={level} initialScenario={mission ? undefined : scenario} initialMission={mission} />
    </div>
  );
}
