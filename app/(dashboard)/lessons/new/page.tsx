import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Bot,
  ChevronRight,
  CloudUpload,
  Construction,
  Eye,
  FileText,
  GripVertical,
  Image as ImageIcon,
  Megaphone,
  NotebookPen,
  Pencil,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Volume2,
  Wand2,
  X,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Lesbouwer",
  description: "Bouw je eigen NT2-lessen voor jouw studenten.",
};

type ExerciseRow = {
  id: number;
  type: string;
  typeChip: string;
  title: string;
  xp: number;
  difficulty: "Makkelijk" | "Gemiddeld" | "Uitdagend";
};

const exercises: ExerciseRow[] = [
  {
    id: 1,
    type: "Luistervaardigheid",
    typeChip: "tc-chip-teal",
    title: "Audio & meerkeuze: Luister naar de stagebegeleider",
    xp: 25,
    difficulty: "Gemiddeld",
  },
  {
    id: 2,
    type: "Zinsbouw",
    typeChip: "tc-chip-orange",
    title: "Zinsbouw: Jezelf beleefd voorstellen",
    xp: 30,
    difficulty: "Makkelijk",
  },
  {
    id: 3,
    type: "Woordenschat",
    typeChip: "tc-chip-sunset",
    title: "Vocabulaire matching: Vaktermen roosters",
    xp: 20,
    difficulty: "Gemiddeld",
  },
  {
    id: 4,
    type: "Spreken",
    typeChip: "tc-chip-green",
    title: "Spreekopdracht: Neem je motivatie op",
    xp: 50,
    difficulty: "Uitdagend",
  },
];

const goals = [
  { label: "Kan eenvoudige werkervaring en opleiding toelichten", level: "B1" },
  { label: "Kan beleefd vragen naar werktijden en pauzeregeling", level: "A2" },
  { label: "Begrijpt veelvoorkomende vaktermen in het introductiegesprek", level: "B1" },
];

const keywords = ["Stage", "Beroepshouding", "Kennismaken", "Zorgsector"];

export default function LessonBuilderPage() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb + titel + top actions */}
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cozy-terracotta/85">
            <BookOpen className="h-3.5 w-3.5" />
            <Link href="/lessons" className="hover:underline">Lessen</Link>
            <ChevronRight className="h-3 w-3 text-cozy-terracotta/60" />
            <span className="text-cozy-ink/60">Nieuwe les ontwerpen</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="heading-display text-[clamp(1.6rem,2.4vw,2.4rem)] font-bold leading-[1.08] text-cozy-ink">
              Lesbouwer: Praktijkles samenstellen
            </h1>
            <span className="tc-chip-sand">Concept</span>
          </div>
          <p className="text-[14px] leading-relaxed text-cozy-ink/70">
            Ontwerp taaloefeningen afgestemd op MBO werkprocessen en ERK-criteria.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="tc-outline-btn !px-4 !py-2.5 text-sm">
            <Eye className="h-4 w-4" /> Voorvertoning
          </button>
          <button className="tc-outline-btn !px-4 !py-2.5 text-sm">
            <Save className="h-4 w-4" /> Concept opslaan
          </button>
          <button className="tc-sunset-btn !px-5 !py-2.5 text-sm">
            <Sparkles className="h-4 w-4" /> Publiceren naar studenten
          </button>
        </div>
      </section>

      {/* Builder 2koloms layout */}
      <section className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(340px,460px)]">
        <div className="space-y-5">
          {/* Sectie 1: Basisgegevens */}
          <article className="tc-step-card">
            <header className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="tc-number-bubble bg-gradient-to-br from-cozy-terracotta via-cozy-orange to-cozy-sand">1</span>
                <div>
                  <h2 className="heading-display text-lg sm:text-xl font-bold text-cozy-ink">
                    Basisgegevens van de les
                  </h2>
                </div>
              </div>
              <span className="text-[11px] font-black text-cozy-ink/60">
                Verplichte velden
              </span>
            </header>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="tc-field sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label>Les titel *</label>
                  <span className="text-[11px] font-bold text-cozy-ink/55">49 / 80 tekens</span>
                </div>
                <input
                  type="text"
                  defaultValue="Stagevoorbereiding: Het eerste intakegesprek"
                  className="tc-input-light"
                />
              </div>

              <div className="tc-field">
                <label>MBO Vakopleiding</label>
                <button className="tc-select-trigger">
                  <span className="font-medium text-cozy-ink">Zorg & Welzijn</span>
                  <ChevronRight className="h-4 w-4 rotate-90 text-cozy-ink/60" />
                </button>
              </div>
              <div className="tc-field">
                <div className="flex items-center justify-between">
                  <label>ERK Taalniveau</label>
                  <span className="tc-chip-teal text-[10px]">MBO Instroom</span>
                </div>
                <button className="tc-select-trigger">
                  <span className="font-medium text-cozy-ink">
                    B1 - Zelfstandig gebruiker
                  </span>
                  <span className="text-[11px] font-bold text-cozy-ink/55">(Vakbekwaam)</span>
                </button>
              </div>
            </div>

            {/* Trefwoorden */}
            <div className="mt-4 tc-field">
              <label>Vakcontext & Trefwoorden</label>
              <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[hsl(198_35%_88%)] bg-[hsl(202_60%_97%)] p-2.5">
                {keywords.map((k) => (
                  <span
                    key={k}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-cozy-ink ring-1 ring-cozy-teal/30 shadow-tc-soft"
                  >
                    {k}
                    <button className="grid h-4 w-4 place-items-center rounded-full text-cozy-ink/55 hover:bg-[hsl(202_60%_95%)] hover:text-cozy-ink/80">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <button className="inline-flex items-center gap-1.5 rounded-full bg-transparent px-2.5 py-1 text-[11px] font-black text-cozy-teal hover:bg-cozy-teal/10">
                  <Plus className="h-3 w-3" /> Voeg trefwoord toe…
                </button>
              </div>
            </div>

            {/* Beschrijving */}
            <div className="mt-4 tc-field">
              <div className="flex items-center justify-between">
                <label>Korte lesbeschrijving (voor studentenportaal)</label>
                <span className="tc-chip-teal text-[10px]">Nederlands NT2</span>
              </div>
              <textarea
                className="tc-textarea"
                defaultValue="In deze les leert de student zichzelf professioneel voorstellen tijdens het stagegesprek, motivatie toelichten en gerichte vragen stellen over werkroosters."
              />
            </div>
          </article>

          {/* Sectie 2: Leerdoelen */}
          <article className="tc-step-card">
            <header className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="tc-number-bubble bg-cozy-teal shadow-tc-soft">2</span>
                <div>
                  <h2 className="heading-display text-lg sm:text-xl font-bold text-cozy-ink">
                    Leerdoelen (ERK-gebaseerd)
                  </h2>
                </div>
              </div>
              <span className="tc-chip-teal text-[11px]">3 doelen gekoppeld</span>
            </header>

            <div className="mt-5 space-y-2.5">
              {goals.map((g, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-2xl border border-cozy-teal/35 bg-cozy-teal/10 px-4 py-3"
                >
                  <Target className="h-4 w-4 shrink-0 text-cozy-teal" />
                  <p className="flex-1 text-sm font-semibold text-cozy-ink">
                    {g.label}
                  </p>
                  <span className="tc-chip-teal-strong text-[10px]">{g.level}</span>
                  <button className="grid h-6 w-6 place-items-center rounded-full text-cozy-ink/50 hover:bg-white hover:text-cozy-terracotta">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              {/* Add goal */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <div className="relative flex-1 min-w-[240px]">
                  <Target className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cozy-ink/45" />
                  <input
                    type="text"
                    placeholder="Voeg een nieuw ERK-leerdoel toe…"
                    className="tc-input-light !pl-10"
                  />
                </div>
                <button className="tc-sunset-btn !px-5 !py-2.5 text-xs font-black">
                  <Plus className="h-3.5 w-3.5" /> Voeg toe
                </button>
              </div>
            </div>
          </article>

          {/* Sectie 3: Cover image */}
          <article className="tc-step-card">
            <header className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="tc-number-bubble bg-gradient-to-br from-cozy-orange to-cozy-sand text-cozy-ink">3</span>
                <div>
                  <h2 className="heading-display text-lg sm:text-xl font-bold text-cozy-ink">
                    Omslagafbeelding & Situatiebeeld
                  </h2>
                </div>
              </div>
              <span className="text-[11px] font-black text-cozy-ink/60">
                Aanbevolen: 1200×600 px
              </span>
            </header>

            <div className="mt-5 grid gap-4 md:grid-cols-[260px_minmax(0,1fr)]">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[1.25rem] border-2 border-white ring-1 ring-[hsl(198_35%_88%)] shadow-tc-card">
                <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-cozy-ink/60" />
                <span className="absolute left-9 top-3 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-black text-white backdrop-blur">
                  Huidige omslag
                </span>
                <img
                  alt="Omslag stagegesprek"
                  src="https://images.unsplash.com/photo-1580281657521-54d87c900524?w=900&h=600&fit=crop"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="rounded-[1.25rem] border-2 border-dashed border-[hsl(198_35%_88%)] bg-[hsl(202_60%_97%)/70] p-6 text-center">
                <button className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-white ring-1 ring-[hsl(198_35%_88%)] shadow-tc-soft">
                  <CloudUpload className="h-4.5 w-4.5 text-cozy-terracotta" />
                </button>
                <p className="mt-3 text-sm font-bold text-cozy-ink">
                  Sleep een nieuw praktijkbeeld hierheen
                </p>
                <p className="mt-1 text-[11.5px] font-semibold text-cozy-ink/60">
                  of{" "}
                  <button className="font-black text-cozy-teal underline underline-offset-2">
                    kies een bestand
                  </button>{" "}
                  vanaf je computer (PNG, JPG max 5MB)
                </p>
              </div>
            </div>
          </article>
        </div>

        {/* Right column: Oefeningen + AI panel */}
        <div className="space-y-5">
          {/* Sectie 4: Oefeningen in deze les */}
          <article className="tc-step-card">
            <header className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="tc-number-bubble bg-gradient-to-br from-cozy-terracotta via-cozy-orange to-cozy-sand">3</span>
                <div>
                  <h2 className="heading-display text-lg font-bold text-cozy-ink">
                    Oefeningen in deze les
                  </h2>
                  <p className="mt-0.5 text-[11.5px] font-semibold text-cozy-ink/60">
                    4 actieve modules samengesteld
                  </p>
                </div>
              </div>
              <span className="tc-chip-teal-strong text-[11px]">
                <Award className="h-3 w-3" /> 125 XP Totaal
              </span>
            </header>

            <div className="mt-5 space-y-3">
              {exercises.map((e) => (
                <div
                  key={e.id}
                  className="group flex items-start gap-3 rounded-2xl border border-[hsl(198_35%_90%)] bg-white p-3.5 transition hover:border-cozy-teal/50 hover:bg-[hsl(202_60%_98%)]"
                >
                  <span className="mt-1 grid h-6 w-5 shrink-0 place-items-center text-[11px] font-black text-cozy-ink/50">
                    {e.id}.
                  </span>
                  <GripVertical className="mt-1 h-4 w-4 shrink-0 cursor-grab text-cozy-ink/40 hover:text-cozy-ink/70" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="text-[14px] font-bold leading-snug text-cozy-ink">
                      {e.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={e.typeChip}>{e.type}</span>
                      <span className="tc-chip-sand">
                        <Award className="h-3 w-3" /> {e.xp} XP
                      </span>
                      <span className="tc-chip-orange">{e.difficulty}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white ring-1 ring-[hsl(198_35%_88%)] hover:bg-cozy-teal/10 hover:text-cozy-teal">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white ring-1 ring-[hsl(198_35%_88%)] hover:bg-cozy-terracotta/10 hover:text-cozy-terracotta">
                      <FileText className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button className="tc-teal-btn !py-2.5 text-xs font-black">
                <Plus className="h-3.5 w-3.5" /> Handmatig toevoegen
              </button>
              <button className="tc-sand-btn !py-2.5 text-xs font-black">
                <Wand2 className="h-3.5 w-3.5" /> Open AI Assistent
              </button>
            </div>
          </article>

          {/* AI Assistent */}
          <article className="tc-card p-5 sm:p-6 overflow-hidden relative border-t-0 before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-tc-sunset-btn">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-tc-ai-panel opacity-70"
            />
            <div className="relative space-y-5">
              <div className="flex items-start justify-between gap-3">
                <span className="tc-chip-teal-strong">
                  <Sparkles className="h-3.5 w-3.5" /> TaalCozy AI Assistent
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-cozy-teal">
                  <span className="h-1.5 w-1.5 rounded-full bg-cozy-teal animate-pulse" />
                  Gereed voor invoer
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="heading-display text-xl font-bold text-cozy-ink">
                  Genereer MBO Praktijkoefeningen
                </h2>
                <p className="text-[13px] leading-relaxed text-cozy-ink/75">
                  Genereert automatisch dialogen, spreekkaarten en woordenschat op basis van de 3
                  ingevoerde leerdoelen hiernaast.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-black">
                    <label className="text-cozy-ink/70">Aantal oefeningen</label>
                    <span className="text-cozy-terracotta">5 oefeningen</span>
                  </div>
                  <div className="tc-progress tc-progress-terracotta">
                    <span style={{ width: "33%" }} />
                  </div>
                </div>

                <div className="tc-field">
                  <label>Voorkeur voor oefenvormen</label>
                  <button className="tc-select-trigger !py-2.5">
                    <span className="font-medium text-cozy-ink">
                      Mix van Spreken, Luisteren en Woordenschat
                    </span>
                    <ChevronRight className="h-4 w-4 rotate-90 text-cozy-ink/60" />
                  </button>
                </div>

                <div className="tc-field">
                  <label>Vakcontext & Specifieke werkplek</label>
                  <input
                    type="text"
                    defaultValue="Ouderenzorg / Verpleeghuis 'De Lindehoeve'"
                    className="tc-input-light"
                  />
                  <p className="tc-field-help">
                    De AI stemt vakterminologie en omgangsvormen hier specifiek op af.
                  </p>
                </div>

                <button className="tc-sunset-btn-lg w-full !rounded-[1.1rem] text-sm">
                  <Sparkles className="h-4.5 w-4.5" />
                  Genereer 5 oefeningen met AI
                </button>

                <p className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-cozy-ink/55">
                  <ShieldCheck className="h-3.5 w-3.5 text-cozy-teal" />
                  Alle gegenereerde modules blijven 100% handmatig aanpasbaar.
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
