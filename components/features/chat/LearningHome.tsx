"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Check, Map, MessageCircle, Sparkles, Clock3 } from "lucide-react";
import { useSector } from "@/lib/sector/SectorProvider";
import { getLearningScenarios } from "@/lib/ai/learning-scenarios";
import { useTranslatedPayload } from "@/lib/i18n/useTranslatedPayload";
import type { LearningMission } from "@/lib/learning/missions";

export type LearningHomeData = {
  name: string;
  level: string;
  attempts: number;
  conversations: number;
  words: number;
  lessons: { id: string; title: string; languageLevel: string; exercises: number }[];
  mission: LearningMission;
  missionCompleted: boolean;
  dailyXp: { current: number; target: number };
  streak: number;
  focusAreas: string[];
};

export function LearningHome({ data }: { data: LearningHomeData }) {
  const { sector, sectors, setSectorCode } = useSector();
  const scenarios = getLearningScenarios(sector.code);
  const text = useTranslatedPayload({
    hello: "Fijn dat je er bent", title: "Jouw woorden.\nJouw toekomst.",
    description: "Oefen Nederlands voor je opleiding. Rustig, stap voor stap. Hier mag je fouten maken.",
    start: "Praat met je taalcoach", choose: "Wat wil je vandaag oefenen?",
    subtitle: "Een paar minuten is al een goed begin.", education: "Mijn opleiding",
    progress: "Elke oefening telt", lessons: "Verder leren", all: "Bekijk alle lessen",
    calm: "Geen toets. Geen tijdsdruk.", level: "Jouw taalniveau",
  }, { source: "nl" });
  return (
    <div className="learning-home mx-auto max-w-6xl space-y-10 pb-12">
      <section className="learning-hero relative isolate grid gap-8 overflow-hidden rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl p-7 text-white shadow-2xl sm:p-12 lg:grid-cols-[1.4fr_1fr]">
        <div className="relative z-10">
          <p className="mb-6 text-sm font-semibold text-fuchsia-400">{text.hello}, {data.name.split(" ")[0]}.</p>
          <h1 className="whitespace-pre-line text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl">{text.title}</h1>
          <p className="mb-8 mt-6 max-w-md text-base leading-7 text-white/70">{text.description}</p>
          <Link href="/missions" className="inline-flex min-h-12 items-center gap-3 rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-6 py-3 font-bold text-white shadow-lg ring-1 ring-inset ring-white/20 transition-all hover:brightness-110">
            <Map size={20} /> Bekijk mijn missions <ArrowRight size={18} />
          </Link>
          <p className="mt-4 flex items-center gap-2 text-xs text-white/50"><Check size={14} /> {text.calm}</p>
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-900/30 via-transparent to-fuchsia-900/30 blur-2xl" />
        <div className="relative hidden items-center justify-center lg:flex" aria-hidden="true">
          <svg viewBox="0 0 340 300" className="w-full max-w-sm opacity-80 mix-blend-screen">
            <circle cx="172" cy="150" r="130" fill="none" stroke="rgba(255,255,255,0.1)" strokeDasharray="4 9" />
            <circle cx="172" cy="150" r="100" fill="rgba(255,255,255,0.05)" />
            <rect x="33" y="65" width="228" height="75" rx="12" fill="rgba(255,255,255,0.1)" />
            <path d="M70 134v23l27-23" fill="rgba(255,255,255,0.1)" />
            <rect x="92" y="164" width="226" height="75" rx="12" fill="rgba(255,255,255,0.05)" />
            <path d="M276 230v25l-29-25" fill="rgba(255,255,255,0.05)" />
            <g stroke="rgba(255,255,255,0.3)" strokeWidth="6" strokeLinecap="round">
              <path d="M63 96h159M63 115h107M122 195h157M122 214h90" />
            </g>
          </svg>
        </div>
      </section>

      <section className="learning-reveal flex flex-wrap items-center justify-between gap-5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-lg">
        <label className="flex flex-wrap items-center gap-4 font-semibold text-white">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/10"><BookOpen size={20} /></span>
          {text.education}
          <select aria-label={text.education} value={sector.code} onChange={(e) => setSectorCode(e.target.value as typeof sector.code)} className="max-w-full rounded-lg border border-white/10 bg-black/40 p-3 text-sm text-white focus:ring-2 focus:ring-indigo-500">
            {sectors.map((item) => <option key={item.code} value={item.code} className="bg-black text-white">{item.label}</option>)}
          </select>
        </label>
        <Link className="text-sm text-white/70 underline underline-offset-4 hover:text-white transition-colors" href="/profile">{text.level}: {data.level}</Link>
      </section>

      <section className="learning-reveal grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-indigo-950/20 backdrop-blur-xl p-7 sm:p-9 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-fuchsia-500/10" />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-white/80">
              <span className="rounded-md bg-white/10 px-3 py-1 text-white border border-white/10">Vandaag</span>
              <span className="text-white/60">{data.mission.mode.replace("_", " ").toLowerCase()}</span>
              <span className="text-fuchsia-300">+{data.mission.xp} XP</span>
              <span className="text-indigo-300">{data.mission.minutes} minuten</span>
            </div>
            <p className="mt-6 text-sm font-bold uppercase tracking-[0.16em] text-fuchsia-400">Daily mission</p>
            <h2 className="mt-2 max-w-xl text-3xl font-bold text-white sm:text-4xl">{data.mission.title}</h2>
            <p className="mt-4 max-w-xl leading-7 text-white/70">{data.mission.situation}</p>
            <p className="mt-3 max-w-xl font-medium text-white">Doel: {data.mission.goal}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {data.mission.vocabulary.map((word) => (
                <span key={word} className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-bold text-white/70">
                  {word}
                </span>
              ))}
            </div>
            <Link href={`/chat?mission=${data.mission.id}`} className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-lg bg-white/10 px-6 py-3 font-bold text-white shadow-lg ring-1 ring-inset ring-white/20 transition-all hover:bg-white/20">
              {data.missionCompleted ? "Nog eens oefenen" : "Start de missie"} <ArrowRight size={18} />
            </Link>
          </div>
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border-[18px] border-indigo-500/10 blur-2xl" aria-hidden="true" />
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-7 shadow-lg">
          <div className="flex items-center justify-between gap-3">
            <div><p className="learning-eyebrow">Jouw journey</p><h2 className="mt-2 text-2xl font-bold text-white">Eerste weken op het mbo</h2></div>
            <span className="text-2xl" aria-hidden="true">🗺️</span>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-white/10 bg-black/20 p-4"><p className="text-2xl font-bold text-white">{data.streak}</p><p className="mt-1 text-white/60">dagen geoefend</p></div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4"><p className="text-2xl font-bold text-white">{data.dailyXp.current}/{data.dailyXp.target}</p><p className="mt-1 text-white/60">XP vandaag</p></div>
          </div>
          <p className="mt-6 text-sm font-semibold text-white/80">Jouw huidige focus</p>
          <div className="mt-3 flex flex-wrap gap-2">{data.focusAreas.map((area) => <span key={area} className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/90">{area}</span>)}</div>
          <Link href="/progress" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-fuchsia-400 hover:text-fuchsia-300 transition-colors">Bekijk mijn journey <ArrowRight size={16} /></Link>
          <Link href="/missions" className="ml-5 mt-6 inline-flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white transition-colors">Alle missions <ArrowRight size={16} /></Link>
        </div>
      </section>

      <section className="learning-reveal">
        <div className="mb-6"><p className="learning-eyebrow">Kleine stappen, echte gesprekken</p><h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">{text.choose}</h2><p className="mt-2 text-white/60">{text.subtitle}</p></div>
        <div className="grid gap-4 md:grid-cols-3">
          {scenarios.map((scenario) => (
            <Link key={scenario.id} href={`/chat?scenario=${scenario.id}`} className="learning-tile group flex flex-col rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-lg">
              <span className={`mb-6 grid h-12 w-12 place-items-center rounded-lg border border-white/10 bg-black/20 text-white`}><MessageCircle size={23} /></span>
              <h3 className="text-xl font-bold text-white">{scenario.title}</h3>
              <p className="mb-7 mt-3 flex-1 leading-6 text-white/70">{scenario.goal}</p>
              <div className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-white/50"><Clock3 size={15} /> {scenario.minutes} minuten</span><ArrowRight size={20} className="text-white/50 transition-transform group-hover:translate-x-1 group-hover:text-white" /></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="learning-reveal grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-md p-7 shadow-lg">
          <Sparkles size={23} className="mb-4 text-fuchsia-400" /><h2 className="text-2xl font-bold text-white">{text.progress}</h2>
          <p className="mt-2 text-white/70">Dit heb je al gedaan. Je hoeft niet perfect te zijn.</p>
          <dl className="mt-7 grid grid-cols-3 gap-3">
            {[["Oefeningen", data.attempts], ["Gesprekken", data.conversations], ["Woorden", data.words]].map(([label, value]) => <div key={label}><dd className="text-3xl font-bold text-white">{value}</dd><dt className="mt-2 text-xs text-white/60 sm:text-sm">{label}</dt></div>)}
          </dl>
          <Link href="/progress" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-fuchsia-400 hover:text-fuchsia-300 transition-colors">Mijn terugblikken <ArrowRight size={16} /></Link>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-7 shadow-lg">
          <div className="flex items-center justify-between gap-3"><h2 className="text-2xl font-bold text-white">{text.lessons}</h2><Link href="/lessons" className="text-sm text-white/60 underline underline-offset-4 hover:text-white transition-colors">{text.all}</Link></div>
          <div className="mt-5 divide-y divide-white/10">
            {data.lessons.length ? data.lessons.map((lesson) => <Link key={lesson.id} href={`/lessons/${lesson.id}`} className="flex items-center gap-4 py-4 group">
              <BookOpen className="shrink-0 text-white/50 group-hover:text-fuchsia-400 transition-colors" size={20} /><div className="min-w-0 flex-1"><h3 className="font-bold text-white group-hover:text-fuchsia-300 transition-colors">{lesson.title}</h3><p className="mt-1 text-sm text-white/50">{lesson.languageLevel} · {lesson.exercises} oefeningen</p></div><ArrowRight size={18} className="text-white/30 group-hover:text-fuchsia-400 transition-transform group-hover:translate-x-1" />
            </Link>) : <p className="py-4 text-white/60">Je docent heeft nog geen les gepubliceerd. Je kunt wel met je taalcoach oefenen.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
