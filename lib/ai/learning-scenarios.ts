import type { SectorCode } from "@/lib/sector/types";

export type LearningScenario = {
  id: string;
  title: string;
  goal: string;
  starter: string;
  example: string;
  minutes: number;
};

type SectorContext = {
  place: string;
  person: string;
  task: string;
  words: Array<{ word: string; meaning: string }>;
};

export const SECTOR_CONTEXTS: Record<SectorCode, SectorContext> = {
  ALGEMEEN: { place: "je opleiding", person: "je docent", task: "een opdracht maken", words: [{ word: "opdracht", meaning: "iets wat je moet doen of maken" }, { word: "uitleg", meaning: "informatie die iets duidelijk maakt" }] },
  ZORG: { place: "de zorg", person: "je begeleider", task: "een overdracht geven", words: [{ word: "overdracht", meaning: "informatie doorgeven aan een collega" }, { word: "afspraak", meaning: "iets wat je samen hebt afgesproken" }] },
  SPORT: { place: "het sportcentrum", person: "de trainer", task: "een training voorbereiden", words: [{ word: "training", meaning: "oefenen om iets beter te kunnen" }, { word: "deelnemer", meaning: "iemand die meedoet" }] },
  ICT: { place: "de ICT-afdeling", person: "je collega", task: "een probleem met inloggen melden", words: [{ word: "inloggen", meaning: "toegang krijgen met je account" }, { word: "melding", meaning: "een bericht over iets wat gebeurt" }] },
  HORECA: { place: "het restaurant", person: "een gast", task: "een bestelling opnemen", words: [{ word: "bestelling", meaning: "wat een gast wil eten of drinken" }, { word: "reservering", meaning: "een plek die vooraf is afgesproken" }] },
  BOUW: { place: "de bouwplaats", person: "je begeleider", task: "de planning bespreken", words: [{ word: "planning", meaning: "een overzicht van wat je wanneer gaat doen" }, { word: "materiaal", meaning: "iets wat je gebruikt om iets te maken" }] },
  HANDEL: { place: "het magazijn", person: "je collega", task: "een levering bespreken", words: [{ word: "levering", meaning: "goederen die worden bezorgd" }, { word: "voorraad", meaning: "producten die beschikbaar zijn" }] },
  ONDERWIJS: { place: "de kinderopvang", person: "een ouder", task: "vertellen hoe de dag is gegaan", words: [{ word: "activiteit", meaning: "iets wat je samen doet" }, { word: "begeleiden", meaning: "iemand helpen bij wat die doet" }] },
  TECHNIEK: { place: "de werkplaats", person: "je begeleider", task: "een storing melden", words: [{ word: "storing", meaning: "een probleem waardoor iets niet goed werkt" }, { word: "gereedschap", meaning: "hulpmiddelen waarmee je werk uitvoert" }] },
  UITERLIJKE_VERZORGING: { place: "de salon", person: "een klant", task: "de wensen van een klant bespreken", words: [{ word: "wens", meaning: "iets wat iemand graag wil" }, { word: "afspraak", meaning: "een afgesproken tijd om te komen" }] },
};

export function getLearningScenarios(code: SectorCode): LearningScenario[] {
  const context = SECTOR_CONTEXTS[code];
  return [
    {
      id: "help", title: "Hulp vragen", minutes: 3,
      goal: `Vraag ${context.person} om uitleg bij ${context.task}.`,
      starter: `We oefenen in ${context.place}. Je wilt ${context.task}, maar je begrijpt de opdracht niet. Hoe vraag je om hulp?`,
      example: "Kunt u dat nog een keer uitleggen?",
    },
    {
      id: "work", title: "Vertel over je werk", minutes: 5,
      goal: `Vertel ${context.person} wat je hebt gedaan en wat nog moet gebeuren.`,
      starter: `Je bent in ${context.place}. Ik ben ${context.person}. Wat heb je vandaag gedaan?`,
      example: "Vandaag heb ik ... Daarna wil ik ...",
    },
    {
      id: "presentation", title: "Oefen een presentatie", minutes: 5,
      goal: `Vertel in drie stappen over ${context.task}: begin, uitleg en afsluiting.`,
      starter: `Je vertelt je klas over ${context.task}. Begin met een korte zin: waar gaat je presentatie over?`,
      example: `Ik ga vertellen over ${context.task}.`,
    },
  ];
}
