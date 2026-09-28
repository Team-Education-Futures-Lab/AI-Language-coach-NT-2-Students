"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, CalendarClock, Layers3, Loader2, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SECTORS } from "@/lib/sector/types";
import { cancelGenerationAction, queueLessonAction, saveModuleAction, saveScheduleAction } from "@/app/(dashboard)/lesson-builder/actions";

type ModuleView = {
  id: string; title: string; description: string; sector: string; languageLevel: string;
  instructions: string; exerciseCount: number; cadence: string; enabled: boolean; nextRunAt: string | null;
  lessons: { id: string; title: string; published: boolean }[];
  generations: { id: string; status: string; error: string | null; lessonId: string | null; createdAt: string; availableAt: string }[];
};
const selectStyle = "min-h-11 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-xl";
const statusLabels: Record<string, string> = {
  PENDING: "In de wachtrij", RUNNING: "AI schrijft de les", COMPLETED: "Concept klaar", FAILED: "Mislukt", CANCELLED: "Geannuleerd",
};
const dateLabel = (value: string) => new Date(value).toLocaleString("nl-NL", { dateStyle: "medium", timeStyle: "short" });

export function ModuleWorkspace({ modules, workerOnline }: { modules: ModuleView[]; workerOnline: boolean }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(modules[0]?.id ?? null);
  const [creating, setCreating] = useState(modules.length === 0);
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const selected = modules.find((module) => module.id === selectedId);
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 5000);
    return () => clearInterval(timer);
  }, [router]);

  function save(form: HTMLFormElement, id: string | null) {
    const values = new FormData(form);
    startTransition(async () => {
      const result = await saveModuleAction(id, Object.fromEntries(values));
      if (!result.ok) { setNotice(result.error); return; }
      setSelectedId(result.data.id);
      setCreating(false);
      setNotice("Module opgeslagen. Je kunt nu lessen toevoegen.");
      router.refresh();
    });
  }

  return <div className="mx-auto max-w-6xl space-y-7 pb-12">
    <header className="learning-reveal rounded-[2rem] bg-black/40 backdrop-blur-2xl border border-white/10 p-7 text-white sm:p-10">
      <p className="text-sm text-white/70">Werkplek voor docenten</p>
      <h1 className="mt-3 flex items-center gap-3 text-3xl font-semibold sm:text-4xl"><Layers3 aria-hidden="true" className="text-fuchsia-400" /> AI-lesbouwer</h1>
      <p className="mt-4 max-w-2xl leading-7 text-white/70">Jouw leerplan, met hulp van AI. Bundel lessen in modules en laat nieuwe conceptlessen op vaste momenten klaarzetten.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white hover:brightness-110" onClick={() => { setCreating(true); setNotice(""); }}><Plus size={18} /> Nieuwe module</Button>
        <Button variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10" asChild><Link href="/lessons/new">Losse les schrijven</Link></Button>
      </div>
    </header>
    <div className={`rounded-2xl border p-4 text-sm backdrop-blur-md ${workerOnline ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-100" : "border-amber-500/20 bg-amber-500/10 text-amber-100"}`}>
      <p className="font-semibold">{workerOnline ? "Automatische leswerker is actief" : "Automatische leswerker is niet actief"}</p>
      <p className="mt-1 opacity-80">{workerOnline ? "Nieuwe taken worden op de achtergrond verwerkt. Je mag deze pagina sluiten." : "Taken blijven bewaard. Start op de server npm run lessons:worker om AI-lessen te laten maken."} AI-lessen worden nooit vanzelf gepubliceerd.</p>
    </div>
    {notice && <p role="status" className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-4 text-white">{notice}</p>}
    <div className="grid items-start gap-6 lg:grid-cols-[250px_1fr]">
      <aside className="space-y-3" aria-label="Jouw modules">
        <h2 className="font-semibold text-white">Modules ({modules.length})</h2>
        {modules.map((module) => <button key={module.id} onClick={() => { setSelectedId(module.id); setCreating(false); setNotice(""); }}
          aria-pressed={!creating && selectedId === module.id}
          className={`w-full rounded-2xl border p-4 text-left transition backdrop-blur-md ${!creating && selectedId === module.id ? "border-fuchsia-500/50 bg-fuchsia-500/10 text-white shadow-[0_0_15px_rgba(217,70,239,0.15)]" : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"}`}>
          <span className="block font-semibold">{module.title}</span>
          <span className="mt-2 block text-sm opacity-70">{module.languageLevel} · {module.lessons.length} lessen{module.enabled ? " · Automatisch" : ""}</span>
        </button>)}
        {!modules.length && <p className="text-sm text-white/60">Begin met een module, zoals Nederlands op stage.</p>}
      </aside>
      <div className="min-w-0 space-y-6">
        {(creating || selected) && <section className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl p-6 sm:p-7 text-white">
          <h2 className="mb-5 text-2xl font-semibold">{creating ? "Een nieuwe module" : "Module-instellingen"}</h2>
          <form key={creating ? "new" : selected?.id} ref={formRef} onSubmit={(event) => { event.preventDefault(); save(event.currentTarget, creating ? null : selected!.id); }} className="space-y-4">
            <fieldset disabled={pending} className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 sm:col-span-2"><span>Titel</span><Input name="title" required minLength={3} maxLength={255} placeholder="Nederlands op stage" defaultValue={creating ? "" : selected?.title} /></label>
              <label className="space-y-2"><span>Vakgebied</span><select name="sector" className={selectStyle} defaultValue={creating ? "ALGEMEEN" : selected?.sector}>{SECTORS.map((sector) => <option key={sector.code} value={sector.code}>{sector.label}</option>)}</select></label>
              <label className="space-y-2"><span>Taalniveau</span><select name="languageLevel" className={selectStyle} defaultValue={creating ? "A2" : selected?.languageLevel}>{["A1", "A2", "B1", "B2", "C1", "C2"].map((level) => <option key={level}>{level}</option>)}</select></label>
              <label className="space-y-2 sm:col-span-2"><span>Beschrijving voor studenten</span><Textarea name="description" maxLength={2000} defaultValue={creating ? "" : selected?.description} placeholder="In deze module oefen je gesprekken met je stagebegeleider." /></label>
              <label className="space-y-2 sm:col-span-2"><span>Leerdoelen en instructies voor AI</span><Textarea name="instructions" required minLength={10} maxLength={2000} rows={4} defaultValue={creating ? "" : selected?.instructions} placeholder="Leer studenten om hulp te vragen, een opdracht te bespreken en hun werkdag uit te leggen. Gebruik korte zinnen en concrete voorbeelden." /></label>
              <label className="space-y-2"><span>Oefeningen per AI-les</span><select name="exerciseCount" className={selectStyle} defaultValue={creating ? 4 : selected?.exerciseCount}>{[2, 3, 4, 5, 6].map((count) => <option key={count}>{count}</option>)}</select></label>
            </fieldset>
            <p className="text-sm text-white/50">Deze instellingen gelden voor nieuwe AI-lessen. Bestaande lessen blijven ongewijzigd.</p>
            <Button disabled={pending} className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white hover:brightness-110">{pending && <Loader2 className="mr-2 animate-spin" size={16} />} {creating ? "Module maken" : "Instellingen opslaan"}</Button>
          </form>
        </section>}
        {!creating && selected && <>
          <section className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl p-6 sm:p-7 text-white">
            <h2 className="flex items-center gap-2 text-xl font-semibold"><Sparkles size={21} className="text-fuchsia-400" /> Een les toevoegen</h2>
            <p className="mt-2 text-sm leading-6 text-white/70">De AI gebruikt de opgeslagen module-instellingen en eerdere lestitels. Je krijgt uitleg, leerdoelen en meerkeuzeoefeningen. Controleer inhoud en antwoorden in de editor.</p>
            <form key={selected.id} className="mt-5 space-y-4" onSubmit={(event) => {
              event.preventDefault();
              const topic = String(new FormData(event.currentTarget).get("topic") ?? "");
              startTransition(async () => {
                const result = await queueLessonAction({ moduleId: selected.id, topic });
                setNotice(result.ok ? "Je les staat in de wachtrij. Zodra deze klaar is, kun je het concept openen." : result.error);
                router.refresh();
              });
            }}>
              <label className="block space-y-2"><span>Onderwerp van deze les (optioneel)</span><Input name="topic" maxLength={255} placeholder="Bijvoorbeeld: vragen om uitleg bij een opdracht" /></label>
              <div className="flex flex-wrap gap-3">
                <Button className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white hover:brightness-110" disabled={pending || selected.generations.some((job) => ["PENDING", "RUNNING"].includes(job.status))}><Sparkles size={17} className="mr-2" /> Laat AI een concept maken</Button>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" asChild><Link href={`/lessons/new?moduleId=${selected.id}`}><BookOpen size={17} className="mr-2" /> Zelf schrijven</Link></Button>
              </div>
            </form>
          </section>
          <SchedulePanel key={`${selected.id}:${selected.enabled}:${selected.nextRunAt}`} module={selected} onNotice={setNotice} />
          <section className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl p-6 sm:p-7 text-white">
            <h2 className="text-xl font-semibold">Lessen in deze module</h2>
            <p className="mt-2 text-sm text-white/70">Gebruik het veld Volgorde in de leseditor om je leerroute in te delen.</p>
            <ol className="mt-4 divide-y divide-white/10">{selected.lessons.map((lesson, index) => <li key={lesson.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div><p className="font-medium">{index + 1}. {lesson.title}</p><span className="text-sm text-white/50">{lesson.published ? "Gepubliceerd" : "Concept · alleen voor docenten"}</span></div>
              <Link className="font-semibold text-fuchsia-400 hover:text-fuchsia-300 underline underline-offset-4" href={`/lessons/${lesson.id}/edit`}>Bewerken</Link>
            </li>)}</ol>
            {!selected.lessons.length && <p className="mt-5 text-white/50">Nog geen lessen. Schrijf zelf of laat AI de eerste les maken.</p>}
          </section>
          <section className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl p-6 sm:p-7 text-white">
            <h2 className="text-xl font-semibold">Recente AI-taken</h2>
            {!selected.generations.length && <p className="mt-4 text-white/50">Hier zie je straks de voortgang van je AI-lessen.</p>}
            <div className="mt-4 space-y-4">{selected.generations.map((job) => <div key={job.id} className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <div className="flex flex-wrap justify-between gap-2"><p className="flex items-center gap-2 font-semibold">{job.status === "RUNNING" && <Loader2 size={16} className="animate-spin" />}{statusLabels[job.status] ?? job.status}</p><time className="text-sm text-white/50">{dateLabel(job.createdAt)}</time></div>
              {job.error && <p className="mt-2 text-sm text-amber-400">{job.error}{job.status === "PENDING" ? ` Nieuwe poging vanaf ${dateLabel(job.availableAt)}.` : ""}</p>}
              {job.lessonId && <Link className="mt-3 inline-block text-sm font-semibold text-fuchsia-400 hover:text-fuchsia-300 underline" href={`/lessons/${job.lessonId}/edit`}>Controleer conceptles</Link>}
              {["PENDING", "RUNNING"].includes(job.status) && <Button variant="ghost" size="sm" className="mt-2 text-white hover:bg-white/10" disabled={pending} onClick={() => startTransition(async () => {
                const result = await cancelGenerationAction(job.id);
                setNotice(result.ok ? "Generatie geannuleerd." : result.error);
                router.refresh();
              })}>Annuleren</Button>}
            </div>)}</div>
          </section>
        </>}
      </div>
    </div>
  </div>;
}

function SchedulePanel({ module, onNotice }: { module: ModuleView; onNotice: (text: string) => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const initial = new Date(module.nextRunAt && Date.parse(module.nextRunAt) > Date.now() ? module.nextRunAt : Date.now() + 86400000);
  const localInput = new Date(initial.getTime() - initial.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  return <section className="rounded-3xl border border-fuchsia-500/30 bg-fuchsia-500/10 backdrop-blur-2xl p-6 sm:p-7 text-white">
    <h2 className="flex items-center gap-2 text-xl font-semibold"><CalendarClock size={21} className="text-fuchsia-400" /> Automatisch nieuwe lessen</h2>
    <p className="mt-2 text-sm leading-6 text-white/70">Per gepland moment maakt AI een nieuwe conceptles. Na een onderbreking wordt maximaal een gemist moment ingehaald, niet de hele achterstand.</p>
    <p className="mt-3 font-medium">{module.enabled && module.nextRunAt ? `Volgende les: ${dateLabel(module.nextRunAt)}` : "Planning staat uit"}</p>
    <form className="mt-5 space-y-4" onSubmit={(event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      startTransition(async () => {
        const result = await saveScheduleAction(module.id, {
          enabled: true, cadence: form.get("cadence"), firstRunAt: new Date(String(form.get("start"))).toISOString(),
        });
        onNotice(result.ok ? "Planning opgeslagen. Nieuwe lessen komen als concept klaar te staan." : result.error);
        router.refresh();
      });
    }}>
      <fieldset disabled={pending} className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2"><span>Hoe vaak?</span><select name="cadence" defaultValue={module.cadence} className={selectStyle}><option value="WEEKLY">Elke week</option><option value="MONTHLY">Elke maand</option></select></label>
        <label className="min-w-0 space-y-2"><span>Eerste moment (lokale tijd)</span><Input className="max-w-full bg-black/40" type="datetime-local" name="start" required defaultValue={localInput} /></label>
      </fieldset>
      <p className="text-xs leading-5 text-white/50">De planning houdt een vaste UTC-tijd aan. Bij zomer- of wintertijd kan de lokale tijd een uur verschuiven. De laatste dag van een korte maand vervangt een niet-bestaande dag.</p>
      <div className="flex flex-wrap gap-3">
        <Button disabled={pending} className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white hover:brightness-110">{module.enabled ? "Planning bijwerken" : "Planning inschakelen"}</Button>
        {module.enabled && <Button type="button" variant="outline" className="border-white/20 text-white hover:bg-white/10" disabled={pending} onClick={() => startTransition(async () => {
          const result = await saveScheduleAction(module.id, { enabled: false, cadence: module.cadence });
          onNotice(result.ok ? "Planning gepauzeerd. Bestaande taken kun je hieronder annuleren." : result.error);
          router.refresh();
        })}>Pauzeren</Button>}
      </div>
    </form>
  </section>;
}
