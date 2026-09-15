// AI Exercise generator — Lesson Builder versie
// Biedt twee paden:
//  1) Echte OpenAI JSON-mode call als OPENAI_API_KEY is ingesteld
//  2) Fallback: offline template-generator per les-categorie (werkt altijd, ook zonder internet)

import { z } from "zod";
import type { ExerciseType, LanguageLevel, LessonCategory } from "@/types";
import {
  ExerciseType as ExerciseTypeValues,
  LanguageLevel as LanguageLevelValues,
  LessonCategory as LessonCategoryValues,
} from "@/types";
import { aiClient, openaiModel } from "@/lib/ai/client";
import { SYSTEM_PROMPTS } from "@/lib/ai/prompts";

const EXERCISE_TYPES = Object.values(ExerciseTypeValues) as ExerciseType[];
const LANGUAGE_LEVELS = Object.values(LanguageLevelValues) as LanguageLevel[];

export const GeneratedExerciseSchema = z.object({
  type: z.enum(EXERCISE_TYPES as [ExerciseType, ...ExerciseType[]]) as z.ZodType<ExerciseType>,
  title: z.string().min(2).max(255),
  description: z.string().max(2000).optional(),
  difficulty: z.number().int().min(1).max(5).default(1),
  xpReward: z.number().int().min(1).default(10),
  order: z.number().int().min(0).default(0),
  hint: z.string().max(500).optional(),
  content: z.record(z.unknown()),
});
export type GeneratedExercise = z.infer<typeof GeneratedExerciseSchema>;

export interface GenerationOptions {
  languageLevel: LanguageLevel;
  category?: LessonCategory;
  topic?: string;
  type?: ExerciseType;
  focusAreas?: string[];
  nativeLanguage?: string;
  count?: number;
  lessonTitle?: string;
}

export { EXERCISE_TYPES, LANGUAGE_LEVELS };

/* =====================================================================
   OFFLINE FALLBACK GENERATOR (werkt altijd, ook zonder API key)
   Elke categorie produceert een vast aantal NT2 templates.
   ===================================================================== */

const DE_WOORDEN = [
  "man", "vrouw", "jongen", "meisje", "hond", "kat", "fiets", "bus",
  "trein", "school", "klas", "klaslokaal", "docent", "student", "tafel",
  "stoel", "pen", "potlood", "krant", "pagina", "radio", "telefoon",
] as const;

const HET_WOORDEN = [
  "huis", "boek", "kind", "meisje", "geld", "brood", "water", "glas",
  "vliegtuig", "museum", "station", "centrum", "ziekenhuis", "restaurant",
  "café", "bureau", "werkwoord", "lidwoord", "antwoord", "dier", "paard",
] as const;

const WERKWOORDEN_TT = [
  { stam: "werk", tt: "werkt", ik: "werk", jĳ: "werkt", hy: "werkt", wĳ: "werken", ul: "werken", ze: "werken" },
  { stam: "woon", tt: "woont", ik: "woon", jĳ: "woont", hy: "woont", wĳ: "wonen", ul: "wonen", ze: "wonen" },
  { stam: "spreek", tt: "spreekt", ik: "spreek", jĳ: "spreekt", hy: "spreekt", wĳ: "spreken", ul: "spreken", ze: "spreken" },
  { stam: "ga", tt: "gaat", ik: "ga", jĳ: "gaat", hy: "gaat", wĳ: "gaan", ul: "gaan", ze: "gaan" },
  { stam: "doe", tt: "doet", ik: "doe", jĳ: "doet", hy: "doet", wĳ: "doen", ul: "doen", ze: "doen" },
  { stam: "heef", tt: "heeft", ik: "heb", jĳ: "hebt", hy: "heeft", wĳ: "hebben", ul: "hebben", ze: "hebben" },
  { stam: "zĳ", tt: "is", ik: "ben", jĳ: "bent", hy: "is", wĳ: "zĳn", ul: "zĳt", ze: "zĳn" },
] as const;

const WINKEL_WOORDEN: { nl: string; vert: string; zin: string }[] = [
  { nl: "appel", vert: "appel (fruit)", zin: "Ik eet elke dag een appel." },
  { nl: "brood", vert: "brood", zin: "Wij kopen brood bij de bakker." },
  { nl: "melk", vert: "melk", zin: "Hij drinkt een glas melk." },
  { nl: "kaas", vert: "kaas", zin: "Nederland staat bekend om de kaas." },
  { nl: "ei", vert: "ei", zin: "Ze maakt een eitje als ontbijt." },
  { nl: "banaan", vert: "banaan", zin: "Neem je een banaan mee?" },
  { nl: "winkel", vert: "winkel", zin: "De winkel is vandaag gesloten." },
  { nl: "kassa", vert: "kassa", zin: "U betaalt aan de kassa." },
  { nl: "bon", vert: "bonnetje", zin: "Wilt u een bonnetje?" },
  { nl: "euro", vert: "euro", zin: "Dat kost vijf euro." },
  { nl: "cent", vert: "cent", zin: "Houdt u de centen maar." },
  { nl: "tas", vert: "tas", zin: "Ik stop alles in een tas." },
];

function pickN<T>(arr: readonly T[], n: number): T[] {
  const copy = [...arr];
  const result: T[] = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}

function rand<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function diffForLevel(level: LanguageLevel, base = 1): number {
  const idx = LANGUAGE_LEVELS.indexOf(level);
  return Math.max(1, Math.min(5, base + Math.round(idx * 4 / (LANGUAGE_LEVELS.length - 1))));
}

function xpForType(t: ExerciseType): number {
  switch (t) {
    case "MULTIPLE_CHOICE":
      return 10;
    case "FILL_IN_BLANK":
      return 15;
    case "TRANSLATION":
      return 20;
    case "VOCABULARY":
      return 8;
    case "SENTENCE_CORRECTION":
      return 18;
    case "CONVERSATION":
      return 30;
  }
}

/* ------------- GRAMMAR: lidwoorden + werkwoordspelling -------------- */

function genGrammarExercises(n: number, level: LanguageLevel, topic?: string): GeneratedExercise[] {
  const out: GeneratedExercise[] = [];
  const needDeHet = Math.max(1, Math.round(n * 0.55));
  const needWorkwoord = n - needDeHet;

  // De/het multiple choice: "___ huis"
  for (let i = 0; i < needDeHet; i++) {
    const useHet = Math.random() > 0.5;
    const word = useHet ? rand(HET_WOORDEN) : rand(DE_WOORDEN);
    const correct = useHet ? 1 : 0;
    out.push({
      type: "MULTIPLE_CHOICE",
      title: `Lidwoord: _____ ${word}`,
      description: topic ?? "Kies het juiste lidwoord",
      difficulty: diffForLevel(level, 1),
      xpReward: 10,
      order: out.length,
      content: {
        question: `Welk lidwoord hoort erbij? _____ ${word}`,
        options: ["de", "het", "een", "geen"],
        correctIndex: correct,
        explanation: useHet
          ? `Het ${word} is een het-woord (onzijdig).`
          : `De ${word} is een de-woord (mannelijk/vrouwelijk).`,
      },
    });
  }

  // Werkwoordspelling invuloefeningen
  for (let i = 0; i < needWorkwoord; i++) {
    const w = rand(WERKWOORDEN_TT);
    const vorm = rand(["ik", "jĳ", "hy", "wĳ", "ul", "ze"] as const);
    const answer = w[vorm];
    out.push({
      type: "FILL_IN_BLANK",
      title: `Werkwoord: ${w.stam} (${vorm})`,
      description: topic ?? "Vul de juiste vorm van het werkwoord in",
      difficulty: diffForLevel(level, 2),
      xpReward: 15,
      order: out.length,
      hint: `Denk aan de persoon: ${vorm}`,
      content: {
        sentence: `Vandaag [BLANK] ${vorm} naar school.`,
        blanks: [answer],
        explanation: `${vorm} ${answer} — Vervoeging van ${w.stam}/${w.tt}.`,
      },
    });
  }

  return out;
}

/* ------------- SPELLING: Welke zin is correct? -------------------- */

function genSpellingExercises(n: number, level: LanguageLevel, topic?: string): GeneratedExercise[] {
  const templates = [
    {
      q: "Welke zin heeft de juiste werkwoordspelling?",
      options: [
        "Jij gaat vandaag naar school.",
        "Jij ga vandaag naar school.",
        "Jij gaan vandaag naar school.",
        "Jij gaat-vandaag-naar-school.",
      ],
      correct: 0,
    },
    {
      q: "Welke zin heeft de juiste hoofdletter?",
      options: [
        "ik woon in Amsterdam.",
        "Ik woon in amsterdam.",
        "Ik woon in Amsterdam.",
        "ik Woon in Amsterdam.",
      ],
      correct: 2,
    },
    {
      q: "Welke spelling is juist?",
      options: ["werkelijk", "werkelijk", "werkelik", "werkelyk"],
      correct: 0,
    },
    {
      q: "Welke zin heeft de juiste dt/tt spellling?",
      options: [
        "Hij wordt vandaag verwacht.",
        "Hij word vandaag verwacht.",
        "Hij wordt vandaag verwacht.",
        "Hij worddt vandaag verwacht.",
      ],
      correct: 2,
    },
    {
      q: "Welke zin is juist gespeld?",
      options: [
        "Wij hebben vandaag veel geleert.",
        "Wij hebben vandaag veel geleerd.",
        "Wij heben vandaag veel geleerd.",
        "Wij hebben vandag veel geleerd.",
      ],
      correct: 1,
    },
    {
      q: "Welke spelling is juist?",
      options: ["het huis", "het huys", "het huisje is groot", "de huis"],
      correct: 0,
    },
  ];
  const out: GeneratedExercise[] = [];
  const chosen = pickN(templates, Math.min(n, templates.length));
  chosen.forEach((t, i) => {
    out.push({
      type: "MULTIPLE_CHOICE",
      title: `Spelling: ${String(i + 1)}`,
      description: topic ?? "Kies de juiste spelling",
      difficulty: diffForLevel(level, 2),
      xpReward: 10,
      order: i,
      content: {
        question: t.q,
        options: t.options,
        correctIndex: t.correct,
        explanation: `De juiste spelling is: ${t.options[t.correct]}`,
      },
    });
  });
  while (out.length < n) {
    out.push({
      type: "SENTENCE_CORRECTION",
      title: `Zin corrigeren (${out.length + 1})`,
      description: topic ?? "Corrigeer de spellingsfout",
      difficulty: diffForLevel(level, 3),
      xpReward: 18,
      order: out.length,
      content: {
        incorrectSentence: "Ik gaat elke dag fiets naar school.",
        correctSentence: "Ik ga elke dag met de fiets naar school.",
        explanation:
          "Bij ik gaat stam + geen t: ik ga. En je fiets NIET naar school — je GAAT met de fiets.",
      },
    });
  }
  return out;
}

/* ------------- VOCABULARY: winkel / thema ------------------------ */

function genVocabExercises(n: number, level: LanguageLevel, topic?: string): GeneratedExercise[] {
  const pool = WINKEL_WOORDEN;
  const chosen = pickN(pool, Math.min(n, pool.length));
  const out: GeneratedExercise[] = [];
  chosen.forEach((w, i) => {
    out.push({
      type: "VOCABULARY",
      title: `Woord: ${w.nl}`,
      description: topic ?? "Leer dit woord",
      difficulty: diffForLevel(level, 1),
      xpReward: 8,
      order: i,
      content: {
        dutchWord: w.nl,
        translation: w.vert,
        partOfSpeech: "zelfstandig naamwoord",
        exampleSentence: w.zin,
      },
    });
  });
  while (out.length < n) {
    const idx = out.length;
    out.push({
      type: "TRANSLATION",
      title: `Vertaling (${idx + 1})`,
      description: topic ?? "Vertaal naar het Nederlands",
      difficulty: diffForLevel(level, 2),
      xpReward: 20,
      order: out.length,
      content: {
        sourceSentence: "I would like to buy a ticket to the station",
        targetLanguage: "NL",
        correctTranslations: [
          "Ik wil graag een kaartje naar het station kopen.",
          "Ik wil een kaartje naar het station kopen.",
        ],
      },
    });
  }
  return out;
}

/* ------------- READING: korte tekst + vragen --------------------- */

function genReadingExercises(n: number, level: LanguageLevel, topic?: string): GeneratedExercise[] {
  const tekst = `De familie Bakker gaat elke zondag naar het park. Vader pakt een kleed en moeder brengt brood met kaas. De kinderen Lisa (8) en Tom (6) spelen met een bal. Ze blijven tot drie uur en drinken daarna koffie en thee in een cafénetje bij het meer.`;
  const qs = [
    {
      question: "Wanneer gaat familie Bakker naar het park?",
      options: ["Elke maandag", "Elke zondag", "Elke zaterdag", "Alleen in vakantie"],
      correct: 1,
    },
    {
      question: "Wat eten ze in het park?",
      options: ["Brood met kaas", "Pizza", "Frietjes", "Alleen fruit"],
      correct: 0,
    },
    {
      question: "Hoe oud is Lisa?",
      options: ["6 jaar", "7 jaar", "8 jaar", "9 jaar"],
      correct: 2,
    },
    {
      question: "Waar drinken ze koffie en thee?",
      options: ["Thuis", "In een hotel", "In een cafénetje bij het meer", "Op het werk"],
      correct: 2,
    },
  ];
  const out: GeneratedExercise[] = [];
  out.push({
    type: "FILL_IN_BLANK",
    title: "Leestekst: Familie Bakker in het park",
    description: topic ?? "Gebruik de tekst om de volgende vragen te beantwoorden",
    difficulty: diffForLevel(level, 2),
    xpReward: 15,
    order: 0,
    content: {
      sentence: `Leestekst: ${tekst} — Familie Bakker gaat elke [BLANK] naar het park.`,
      blanks: ["zondag"],
      explanation: "Zie de tekst: 'gaat elke zondag naar het park'.",
    },
  });
  const max = Math.min(qs.length, Math.max(0, n - 1));
  for (let i = 0; i < max; i++) {
    out.push({
      type: "MULTIPLE_CHOICE",
      title: `Lezen vraag ${i + 1}`,
      description: topic ?? `Beantwoord de vraag over de tekst`,
      difficulty: diffForLevel(level, 3),
      xpReward: 12,
      order: out.length,
      content: {
        question: `${qs[i].question}\n\n${tekst}`,
        options: qs[i].options,
        correctIndex: qs[i].correct,
        explanation: `Kijk terug in de tekst voor het juiste antwoord.`,
      },
    });
  }
  while (out.length < n) {
    out.push({
      type: "TRANSLATION",
      title: `Vertaling (${out.length + 1})`,
      description: topic ?? "Vertaal de zin",
      difficulty: diffForLevel(level, 3),
      xpReward: 20,
      order: out.length,
      content: {
        sourceSentence: "The children play with a ball until three o'clock.",
        targetLanguage: "NL",
        correctTranslations: [
          "De kinderen spelen tot drie uur met een bal.",
          "De kinderen spelen met een bal tot drie uur.",
        ],
      },
    });
  }
  return out;
}

/* ------------- LISTENING: transcriptie + MC-vragen (geen audio) -- */

function genListeningExercises(n: number, level: LanguageLevel, topic?: string): GeneratedExercise[] {
  const lines = [
    {
      title: "Luchthaven: aankondiging",
      prompt:
        "Goedemiddag passagiers. De vlucht KL 1020 naar Madrid vertrekt vandaag om 17:30 uur vanaf gate D42.",
      q: "Vanaf welke gate vertrekt vlucht KL 1020?",
      options: ["D40", "D41", "D42", "D43"],
      correct: 2,
    },
    {
      title: "Station: omroeper",
      prompt:
        "De intercity naar Amsterdam Centraal vertrekt over vijf minuten vanaf spoor 4b.",
      q: "Waar vertrekt de intercity naar Amsterdam?",
      options: ["Spoor 4", "Spoor 4a", "Spoor 4b", "Spoor 5"],
      correct: 2,
    },
    {
      title: "Winkel: mededeling",
      prompt:
        "Beste klanten, op de tweede verdieping kunt u tot 18:00 uur vandaag alle jassen met 30 procent korting kopen.",
      q: "Hoeveel procent korting krijgen jassen vandaag?",
      options: ["10%", "20%", "30%", "50%"],
      correct: 2,
    },
  ];
  const out: GeneratedExercise[] = [];
  const chosen = pickN(lines, Math.min(n, lines.length));
  chosen.forEach((l, i) => {
    out.push({
      type: "MULTIPLE_CHOICE",
      title: `${l.title}`,
      description: topic ?? "Luister-achtige oefening (lees de tekst en kies)",
      difficulty: diffForLevel(level, 2),
      xpReward: 10,
      order: i,
      hint: "Lees de 'mededeling' eerst rustig door.",
      content: {
        question: `Mededeling:\n"${l.prompt}"\n\n${l.q}`,
        options: l.options,
        correctIndex: l.correct,
        explanation: `Antwoord: ${l.options[l.correct]}.`,
      },
    });
  });
  while (out.length < n) {
    out.push({
      type: "FILL_IN_BLANK",
      title: `Luisterzin ${out.length + 1}`,
      description: topic ?? "Vul het ontbrekende woord in",
      difficulty: diffForLevel(level, 2),
      xpReward: 15,
      order: out.length,
      content: {
        sentence: "De trein vertrekt vanaf [BLANK] 12.",
        blanks: ["spoor", "Spoor"],
        explanation: "Correct antwoord: spoor 12.",
      },
    });
  }
  return out;
}

/* ------------- WRITING: SENTENCE_CORRECTION ---------------------- */

function genWritingExercises(n: number, level: LanguageLevel, topic?: string): GeneratedExercise[] {
  const pairs = [
    {
      wrong: "Ik gaan elke dag naar de school.",
      good: "Ik ga elke dag naar school.",
      exp: "Bij de persoon ik gebruik je de werkwoordstam (ik ga). En naar school — geen lidwoord nodig.",
    },
    {
      wrong: "Wij zitten in de huis.",
      good: "Wij zitten in het huis.",
      exp: "Huis is een het-woord.",
    },
    {
      wrong: "Ze heeft vandaag heel veel huiswerk maken.",
      good: "Ze heeft vandaag heel veel huiswerk gemaakt.",
      exp: "Voltooid deelwoord: gemaakt — niet maken.",
    },
    {
      wrong: "Mijn vriendinnen komen uit de Spanje.",
      good: "Mijn vriendinnen komen uit Spanje.",
      exp: "Landnamen krijgen geen lidwoord.",
    },
  ];
  const out: GeneratedExercise[] = [];
  const chosen = pickN(pairs, Math.min(n, pairs.length));
  chosen.forEach((p, i) => {
    out.push({
      type: "SENTENCE_CORRECTION",
      title: `Corrigeer de zin (${i + 1})`,
      description: topic ?? "Schrijf de zin foutloos op",
      difficulty: diffForLevel(level, 3),
      xpReward: 18,
      order: i,
      content: {
        incorrectSentence: p.wrong,
        correctSentence: p.good,
        explanation: p.exp,
      },
    });
  });
  while (out.length < n) {
    out.push({
      type: "FILL_IN_BLANK",
      title: `Zin aanvullen (${out.length + 1})`,
      description: topic ?? "Vul de zin aan",
      difficulty: diffForLevel(level, 3),
      xpReward: 15,
      order: out.length,
      content: {
        sentence: "Ik zou graag meer Nederlands [BLANK] willen leren.",
        blanks: ["willen leren", "leren"],
        explanation: "Het werkwoord 'willen' + 'leren' samen met 'graag'.",
      },
    });
  }
  return out;
}

/* ------------- CONVERSATION: prompts & dialoog ------------------- */

function genConversationExercises(
  n: number,
  level: LanguageLevel,
  topic?: string,
): GeneratedExercise[] {
  const prompts = [
    "Stel jezelf voor: vertel je naam, leeftijd, woonplaats en je hobby's.",
    "Bestel een koffie en een gebakje bij een café in Amsterdam.",
    "Vraag de weg naar het centraal station in een onbekende stad.",
    "Vertel wat je gisteren hebt gedaan, in het Nederlands.",
    "Praat met een nieuwe medestudent over je studie en je Nederlands leren.",
    "Bel de huisarts en maak een afspraak voor vandaag.",
  ];
  const out: GeneratedExercise[] = [];
  const chosen = pickN(prompts, Math.min(n, prompts.length));
  chosen.forEach((p, i) => {
    out.push({
      type: "CONVERSATION",
      title: `Dialoog (${i + 1})`,
      description: topic ?? "Conversatie-oefening",
      difficulty: diffForLevel(level, 3),
      xpReward: 30,
      order: i,
      content: {
        prompt: p,
        context: `Niveau: ${level} — Praat zo veel mogelijk hardop.`,
      },
    });
  });
  return out;
}

/* ------------- CULTURE: weetjes & feitjes ------------------------ */

function genCultureExercises(n: number, level: LanguageLevel, topic?: string): GeneratedExercise[] {
  const qs = [
    {
      q: "Welke stad is de hoofdstad van Nederland?",
      options: ["Rotterdam", "Den Haag", "Amsterdam", "Utrecht"],
      c: 2,
    },
    {
      q: "Hoeveel inwoners heeft Nederland ongeveer (2024)?",
      options: ["5 miljoen", "10 miljoen", "18 miljoen", "40 miljoen"],
      c: 2,
    },
    {
      q: "Welke taal spreken mensen in Vlaanderen?",
      options: ["Vlaams", "Nederlands", "Frans", "Duits"],
      c: 1,
    },
    {
      q: "Welke Nederlandse feestdag is op 27 april?",
      options: ["Sinterklaas", "Kerstmis", "Koningsdag", "Bevrijdingsdag"],
      c: 2,
    },
    {
      q: "Wat is het populairste vervoermiddel in Nederland?",
      options: ["Auto", "Trein", "Fiets", "Bus"],
      c: 2,
    },
  ];
  const out: GeneratedExercise[] = [];
  const chosen = pickN(qs, Math.min(n, qs.length));
  chosen.forEach((q, i) => {
    out.push({
      type: "MULTIPLE_CHOICE",
      title: `Cultuur vraag ${i + 1}`,
      description: topic ?? "Nederlandse taal & cultuur",
      difficulty: diffForLevel(level, 2),
      xpReward: 10,
      order: i,
      content: {
        question: q.q,
        options: q.options,
        correctIndex: q.c,
        explanation: `Correct antwoord: ${q.options[q.c]}`,
      },
    });
  });
  return out;
}

/* ------------- EXAM & OTHER: mix van alle types ------------------ */

function genMixExercises(n: number, level: LanguageLevel, topic?: string): GeneratedExercise[] {
  return [
    ...genGrammarExercises(Math.max(1, Math.round(n * 0.3)), level, topic),
    ...genSpellingExercises(Math.max(1, Math.round(n * 0.2)), level, topic),
    ...genVocabExercises(Math.max(1, Math.round(n * 0.2)), level, topic),
    ...genReadingExercises(Math.max(1, Math.round(n * 0.2)), level, topic),
    ...genWritingExercises(Math.max(1, Math.round(n * 0.1)), level, topic),
  ].slice(0, n);
}

function generateOfflineExercises(options: GenerationOptions): GeneratedExercise[] {
  const n = Math.max(1, Math.min(15, options.count ?? 5));
  const lvl = options.languageLevel ?? LanguageLevelValues.A1;
  const topic = options.topic || options.lessonTitle;

  // If user specified a type, produce a simple set of that type.
  if (options.type) {
    const t = options.type;
    const diff = diffForLevel(lvl, 2);
    const pool: GeneratedExercise[] = genMixExercises(n, lvl, topic);
    return pool
      .filter((e) => e.type === t)
      .concat(pool)
      .slice(0, n)
      .map((e, i) => ({ ...e, order: i, difficulty: diff, xpReward: xpForType(t) }));
  }

  switch (options.category) {
    case "GRAMMAR":
      return genGrammarExercises(n, lvl, topic);
    case "SPELLING":
      return genSpellingExercises(n, lvl, topic);
    case "VOCABULARY":
      return genVocabExercises(n, lvl, topic);
    case "READING":
      return genReadingExercises(n, lvl, topic);
    case "LISTENING":
      return genListeningExercises(n, lvl, topic);
    case "WRITING":
      return genWritingExercises(n, lvl, topic);
    case "CONVERSATION":
      return genConversationExercises(n, lvl, topic);
    case "CULTURE":
      return genCultureExercises(n, lvl, topic);
    case "EXAM":
      return genMixExercises(n, lvl, topic);
    case "OTHER":
    default:
      return genMixExercises(n, lvl, topic);
  }
}

/* =====================================================================
   AI GENERATOR (OPENAI JSON MODE)
   Vraagt om een JSON-array van GeneratedExercise[] — validatie met ZOD.
   Als iets faalt, valt het terug naar offline generator.
   ===================================================================== */

async function generateWithAI(
  options: GenerationOptions,
): Promise<GeneratedExercise[]> {
  if (!aiClient) {
    return generateOfflineExercises(options);
  }
  const count = Math.max(1, Math.min(15, options.count ?? 5));
  const schemaShape = {
    type: "object",
    properties: {
      exercises: {
        type: "array",
        minItems: 1,
        maxItems: count,
        items: {
          type: "object",
          required: ["type", "title", "difficulty", "xpReward", "content"],
          properties: {
            type: {
              type: "string",
              enum: EXERCISE_TYPES,
            },
            title: { type: "string", minLength: 2, maxLength: 255 },
            description: { type: "string", maxLength: 2000 },
            difficulty: { type: "integer", minimum: 1, maximum: 5 },
            xpReward: { type: "integer", minimum: 1, maximum: 500 },
            order: { type: "integer", minimum: 0 },
            hint: { type: "string", maxLength: 500 },
            content: {
              type: "object",
              description:
                "MULTIPLE_CHOICE: { question, options: string[4], correctIndex: 0..3, explanation } " +
                "FILL_IN_BLANK: { sentence (with [BLANK] placeholders), blanks: string[], explanation } " +
                "TRANSLATION: { sourceSentence, targetLanguage, correctTranslations: string[] } " +
                "VOCABULARY: { dutchWord, translation, partOfSpeech, exampleSentence } " +
                "SENTENCE_CORRECTION: { incorrectSentence, correctSentence, explanation } " +
                "CONVERSATION: { prompt, context? }",
            },
          },
        },
      },
    },
    required: ["exercises"],
    additionalProperties: false,
  } as const;

  const level = options.languageLevel;
  const userPrompt = `
Les titel: ${options.lessonTitle ?? "(geen)"}
Onderwerp / topic: ${options.topic ?? "(geen)"}
Categorie: ${options.category ?? "OTHER"}
Niveau ERK: ${level}
Type hint (optioneel): ${options.type ?? "mix"}
Aantal gewenste oefeningen: ${count}
Focusgebieden: ${(options.focusAreas ?? []).join(", ") || "(geen)"}
Moedertaal van de student: ${options.nativeLanguage ?? "(onbekend)"}

Genereer ${count} originele NT2-oefeningen op niveau ${level}.
Gebruik ALLEEN toegestane types: ${EXERCISE_TYPES.join(", ")}.
Zorg per type voor het juiste "content"-formaat (zie eerder).
Zet alle fouten, uitleg en vragen IN HET NEDERLANDS, tenzij het een vertaling is.`.trim();

  try {
    const completion = await aiClient.chat.completions.create({
      model: openaiModel,
      temperature: 0.7,
      response_format: { type: "json_schema", json_schema: { name: "generated_exercises", schema: schemaShape as any } },
      messages: [
        { role: "system", content: SYSTEM_PROMPTS.exerciseGenerator(level) },
        { role: "user", content: userPrompt },
      ],
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return generateOfflineExercises(options);
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return generateOfflineExercises(options);
    }
    const arr = Array.isArray(parsed?.exercises) ? parsed.exercises : [];
    const validated: GeneratedExercise[] = [];
    for (const [i, item] of arr.entries()) {
      const r = GeneratedExerciseSchema.safeParse({
        ...item,
        order: typeof item?.order === "number" ? item.order : i,
      });
      if (r.success) validated.push({ ...r.data, order: i });
    }
    if (validated.length === 0) return generateOfflineExercises(options);
    return validated.slice(0, count);
  } catch {
    return generateOfflineExercises(options);
  }
}

/* =====================================================================
   HOOFDFUNCTIE
   ===================================================================== */

export async function generateExercises(
  options: GenerationOptions,
): Promise<GeneratedExercise[]> {
  if (options.type && !EXERCISE_TYPES.includes(options.type)) {
    options.type = undefined;
  }
  if (options.category && !Object.values(LessonCategoryValues).includes(options.category)) {
    options.category = "OTHER";
  }
  if (!options.languageLevel) {
    options.languageLevel = "A1";
  }
  return generateWithAI(options);
}

export function generateOfflineFallback(
  options: GenerationOptions,
): GeneratedExercise[] {
  return generateOfflineExercises(options);
}
