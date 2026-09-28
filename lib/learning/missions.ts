import type { SectorCode } from "@/lib/sector/types";

export type MissionFocus =
  | "Spreken"
  | "Schooltaal"
  | "Luisteren"
  | "Samenwerken"
  | "Woordenschat";

export type MissionCategory = "SCHOOL" | "STAGE" | "DAGELIJKS" | "SOCIAAL";
export type MissionMode = "ROLEPLAY" | "REAL_LIFE" | "STORY" | "SURVIVAL";

export type LearningMission = {
  id: string;
  title: string;
  shortTitle: string;
  situation: string;
  goal: string;
  starter: string;
  example: string;
  focus: MissionFocus;
  category: MissionCategory;
  mode: MissionMode;
  chapter: number;
  minutes: number;
  xp: number;
  level: "A1" | "A2" | "B1";
  vocabulary: string[];
  interestTags?: string[];
  sector?: SectorCode;
};

export const MISSION_CATEGORY_LABELS: Record<MissionCategory, string> = {
  SCHOOL: "School",
  STAGE: "Stage & werk",
  DAGELIJKS: "Dagelijks leven",
  SOCIAAL: "Sociaal",
};

export const MISSION_MODE_LABELS: Record<MissionMode, string> = {
  ROLEPLAY: "Roleplay",
  REAL_LIFE: "Real life",
  STORY: "Verhaal",
  SURVIVAL: "Survival",
};

const MISSIONS: LearningMission[] = [
  {
    id: "school-introduction",
    title: "Je eerste dag op school",
    shortTitle: "Jezelf voorstellen",
    situation:
      "Je bent nieuw op een Nederlandse mbo-school. De docent vraagt wie je bent en waarom je deze opleiding hebt gekozen.",
    goal: "Stel jezelf voor en vertel in een paar zinnen welke opleiding je doet.",
    starter:
      "Welkom in de klas. Ik ben je docent. Kun je jezelf kort voorstellen en vertellen welke opleiding je doet?",
    example: "Hallo, ik ben Parsa. Ik doe de opleiding ICT omdat ik graag met computers werk.",
    focus: "Spreken",
    category: "SCHOOL",
    mode: "ROLEPLAY",
    chapter: 1,
    minutes: 4,
    xp: 40,
    level: "A1",
    vocabulary: ["opleiding", "voorstellen", "klasgenoot"],
    interestTags: ["games", "sport", "muziek", "technologie", "koken"],
  },
  {
    id: "school-schedule",
    title: "Waar is mijn lokaal?",
    shortTitle: "Je rooster begrijpen",
    situation:
      "Je eerste les begint bijna. Je zoekt lokaal B2 en wilt controleren hoe laat de les start.",
    goal: "Stel twee duidelijke vragen en herhaal de belangrijkste informatie.",
    starter:
      "Hoi, ik ben je klasgenoot. Je kijkt een beetje zoekend naar je rooster. Kan ik je helpen?",
    example: "Ja graag. Weet jij waar lokaal B2 is en hoe laat de les begint?",
    focus: "Luisteren",
    category: "SCHOOL",
    mode: "STORY",
    chapter: 2,
    minutes: 4,
    xp: 45,
    level: "A1",
    vocabulary: ["rooster", "lokaal", "lesuur"],
  },
  {
    id: "school-ask-help",
    title: "Je begrijpt de opdracht niet",
    shortTitle: "Om uitleg vragen",
    situation:
      "De docent heeft een opdracht uitgelegd. Je begrijpt een paar woorden niet en weet niet wat je eerst moet doen.",
    goal: "Vraag beleefd om uitleg, een voorbeeld of extra tijd.",
    starter:
      "Ik ben je docent. Iedereen begint met de opdracht, maar jij weet nog niet precies wat je moet doen. Wat zeg je?",
    example: "Kunt u de eerste stap nog een keer uitleggen en een voorbeeld geven?",
    focus: "Schooltaal",
    category: "SCHOOL",
    mode: "REAL_LIFE",
    chapter: 3,
    minutes: 4,
    xp: 50,
    level: "A2",
    vocabulary: ["opdracht", "toelichten", "inleveren"],
  },
  {
    id: "school-group-work",
    title: "Samen een opdracht maken",
    shortTitle: "Taken verdelen",
    situation:
      "Je werkt met een klasgenoot aan een presentatie. Jullie moeten afspraken maken en het werk eerlijk verdelen.",
    goal: "Doe een voorstel, reageer op de ander en maak een concrete afspraak.",
    starter:
      "We moeten vrijdag samen presenteren. Hoe zullen we het werk verdelen?",
    example: "Ik kan de inleiding maken. Wil jij de voorbeelden zoeken?",
    focus: "Samenwerken",
    category: "SCHOOL",
    mode: "ROLEPLAY",
    chapter: 4,
    minutes: 5,
    xp: 55,
    level: "A2",
    vocabulary: ["overleggen", "taakverdeling", "afspreken"],
  },
  {
    id: "school-mentor",
    title: "Praten met je mentor",
    shortTitle: "Vertellen wat je nodig hebt",
    situation:
      "Je vindt een onderdeel van je opleiding moeilijk en hebt een gesprek met je mentor.",
    goal: "Leg uit wat lastig is en spreek samen een haalbare volgende stap af.",
    starter:
      "Fijn dat je er bent. Hoe gaat het met je opleiding en waar kan ik je bij helpen?",
    example: "Ik begrijp de vaktaal nog niet goed. Kunnen we afspreken hoe ik die kan oefenen?",
    focus: "Schooltaal",
    category: "SCHOOL",
    mode: "ROLEPLAY",
    chapter: 5,
    minutes: 6,
    xp: 60,
    level: "A2",
    vocabulary: ["mentor", "voortgang", "leerdoel"],
  },
  {
    id: "school-presentation",
    title: "Je eerste presentatie",
    shortTitle: "Een onderwerp toelichten",
    situation:
      "Je presenteert een onderwerp dat bij jouw opleiding of interesse past. Daarna stelt een klasgenoot een vraag.",
    goal: "Gebruik een duidelijke opening, twee kernpunten en een afsluiting.",
    starter:
      "Je staat voor de klas. Ik luister als klasgenoot. Waar gaat jouw presentatie over?",
    example: "Vandaag vertel ik over technologie. Eerst leg ik uit waarom dit onderwerp belangrijk is.",
    focus: "Spreken",
    category: "SCHOOL",
    mode: "ROLEPLAY",
    chapter: 6,
    minutes: 6,
    xp: 65,
    level: "B1",
    vocabulary: ["toelichten", "onderwerp", "concluderen"],
    interestTags: ["games", "sport", "muziek", "films", "technologie", "auto's", "reizen"],
  },
  {
    id: "stage-first-day",
    title: "Je eerste dag op stage",
    shortTitle: "Een taak controleren",
    situation:
      "Je stagebegeleider legt je eerste taak uit. Je wilt controleren of je alles goed hebt begrepen.",
    goal: "Vat de opdracht samen en stel één gerichte controlevraag.",
    starter:
      "Ik ben je stagebegeleider. Je mag vandaag beginnen met je eerste taak. Kun je herhalen wat je gaat doen?",
    example: "Ik begin met de voorbereiding en meld het als ik klaar ben. Klopt dat?",
    focus: "Luisteren",
    category: "STAGE",
    mode: "REAL_LIFE",
    chapter: 7,
    minutes: 5,
    xp: 60,
    level: "A2",
    vocabulary: ["stagebegeleider", "werkinstructie", "controleren"],
  },
  {
    id: "stage-feedback",
    title: "Feedback krijgen op stage",
    shortTitle: "Doorvragen bij feedback",
    situation:
      "Je begeleider zegt dat je nauwkeuriger moet werken. Je wilt begrijpen wat je anders kunt doen.",
    goal: "Reageer professioneel en vraag om een concreet voorbeeld.",
    starter:
      "Je inzet is goed, maar je werk mag soms nauwkeuriger. Hoe reageer je?",
    example: "Bedankt voor de feedback. Kunt u een voorbeeld geven van wat ik beter kan controleren?",
    focus: "Samenwerken",
    category: "STAGE",
    mode: "ROLEPLAY",
    chapter: 8,
    minutes: 6,
    xp: 70,
    level: "B1",
    vocabulary: ["feedback", "nauwkeurig", "verbeterpunt"],
  },
  {
    id: "daily-station",
    title: "Je trein is uitgevallen",
    shortTitle: "Een alternatief vinden",
    situation:
      "Je trein naar school is uitgevallen. Je moet zelf uitzoeken hoe je op tijd op school komt.",
    goal: "Vraag naar de oorzaak, een alternatief en de juiste vertrektijd.",
    starter:
      "Ik werk bij de servicebalie. Je trein is uitgevallen en er staat een lange rij achter je. Wat wil je weten?",
    example: "Welke trein kan ik nu het beste nemen om op tijd in Utrecht te zijn?",
    focus: "Spreken",
    category: "DAGELIJKS",
    mode: "SURVIVAL",
    chapter: 9,
    minutes: 6,
    xp: 75,
    level: "A2",
    vocabulary: ["uitgevallen", "vertraging", "overstappen"],
  },
  {
    id: "daily-municipality",
    title: "Een afspraak bij de gemeente",
    shortTitle: "Informatie controleren",
    situation:
      "Je wilt je inschrijven bij de gemeente, maar weet niet welke documenten je moet meenemen.",
    goal: "Leg uit waarvoor je komt en controleer welke documenten nodig zijn.",
    starter:
      "Goedemiddag, u spreekt met de gemeente. Waarmee kan ik u helpen?",
    example: "Ik wil mij inschrijven. Kunt u vertellen welke documenten ik moet meenemen?",
    focus: "Woordenschat",
    category: "DAGELIJKS",
    mode: "REAL_LIFE",
    chapter: 10,
    minutes: 5,
    xp: 60,
    level: "A2",
    vocabulary: ["inschrijven", "identiteitsbewijs", "afspraak"],
  },
  {
    id: "social-new-classmate",
    title: "Een nieuwe klasgenoot leren kennen",
    shortTitle: "Smalltalk in de pauze",
    situation:
      "In de pauze zit een nieuwe klasgenoot alleen. Je begint een gesprek en zoekt iets wat jullie allebei leuk vinden.",
    goal: "Stel open vragen, reageer op het antwoord en vertel iets over jouw interesse.",
    starter:
      "Hoi, ik ben vandaag nieuw in de klas. Is deze stoel nog vrij?",
    example: "Ja hoor. Welke opleiding deed je hiervoor en wat doe je graag na school?",
    focus: "Spreken",
    category: "SOCIAAL",
    mode: "STORY",
    chapter: 11,
    minutes: 5,
    xp: 55,
    level: "A2",
    vocabulary: ["kennismaken", "vrije tijd", "gemeenschappelijk"],
    interestTags: ["games", "voetbal", "sport", "muziek", "films", "koken", "fashion"],
  },
  {
    id: "stage-job-interview",
    title: "Solliciteren voor een stage",
    shortTitle: "Jezelf professioneel presenteren",
    situation:
      "Je hebt een gesprek voor een mbo-stage. De praktijkbegeleider vraagt naar je motivatie en sterke punten.",
    goal: "Geef een concreet voorbeeld, leg je motivatie uit en stel zelf een vraag.",
    starter:
      "Welkom. Waarom wil je juist bij ons stage lopen en wat wil je hier leren?",
    example: "Deze stage past bij mijn opleiding. Ik wil vooral leren hoe ik zelfstandig met klanten werk.",
    focus: "Schooltaal",
    category: "STAGE",
    mode: "SURVIVAL",
    chapter: 12,
    minutes: 8,
    xp: 90,
    level: "B1",
    vocabulary: ["motivatie", "werkervaring", "verantwoordelijkheid"],
  },
];

export function getAllMissions() {
  return MISSIONS;
}

export function getLearningMissions(date = new Date()): LearningMission[] {
  const day = Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000,
  );
  const start = day % MISSIONS.length;
  return [...MISSIONS.slice(start), ...MISSIONS.slice(0, start)];
}

export function getMission(id?: string | null) {
  return MISSIONS.find((mission) => mission.id === id) ?? null;
}

export function getMissionForToday(date = new Date()) {
  return getLearningMissions(date)[0];
}

function normalize(values: string[]) {
  return values.map((value) => value.trim().toLowerCase()).filter(Boolean);
}

export function getPersonalMission(
  date: Date,
  weakAreas: string[] = [],
  interests: string[] = [],
  completedMissionIds: string[] = [],
) {
  const missions = getLearningMissions(date);
  const weak = normalize(weakAreas).join(" ");
  const interestValues = normalize(interests);
  const preferredFocus: MissionFocus | null =
    weak.includes("uitspraak") || weak.includes("spreek")
      ? "Spreken"
      : weak.includes("school") || weak.includes("grammatica") || weak.includes("woordvolgorde")
        ? "Schooltaal"
        : weak.includes("luister")
          ? "Luisteren"
          : weak.includes("woord")
            ? "Woordenschat"
            : weak.includes("samen")
              ? "Samenwerken"
              : null;

  const unfinished = missions.filter(
    (mission) => !completedMissionIds.includes(mission.id),
  );
  const candidates = unfinished.length > 0 ? unfinished : missions;
  const selected =
    (preferredFocus
      ? candidates.find((mission) => mission.focus === preferredFocus)
      : undefined) ??
    candidates.find((mission) =>
      mission.interestTags?.some((tag) =>
        interestValues.some((interest) => interest.includes(tag) || tag.includes(interest)),
      ),
    ) ??
    candidates[0];

  const interest = interests.find((value) => value.trim().length > 1)?.trim();
  if (!interest || !selected.interestTags?.length) return selected;
  return {
    ...selected,
    situation: `${selected.situation} Gebruik gerust een voorbeeld rond ${interest}.`,
  };
}

export function getNextMission(currentId: string, completedMissionIds: string[] = []) {
  const current = getMission(currentId);
  const later = MISSIONS.filter(
    (mission) =>
      mission.id !== currentId &&
      !completedMissionIds.includes(mission.id) &&
      mission.chapter >= (current?.chapter ?? 0),
  );
  return later[0] ?? MISSIONS.find((mission) => mission.id !== currentId) ?? null;
}
