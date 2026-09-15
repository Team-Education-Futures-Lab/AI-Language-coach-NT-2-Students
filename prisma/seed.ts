import { PrismaClient } from "@prisma/client";
import type { ExerciseType, LanguageLevel } from "@/types";
import { XP_REWARDS } from "../lib/constants";

const prisma = new PrismaClient();

type LessonSeed = {
  slug: string;
  title: string;
  description: string;
  languageLevel: LanguageLevel;
  topic: string;
  order: number;
  published: boolean;
  exercises: ExerciseSeed[];
};

type ExerciseSeed = {
  slug: string;
  type: ExerciseType;
  title: string;
  description?: string;
  difficulty: number;
  xpReward: number;
  content: unknown;
};

const lessons: LessonSeed[] = [
  {
    slug: "kennismaken-de-het",
    title: "Kennismaken & lidwoorden (de/het)",
    description:
      "Leer jezelf voorstellen en oefen met de juiste lidwoorden 'de' en 'het' — typisch A1-onderwerp voor MBO.",
    languageLevel: "A1",
    topic: "Kennismaken & De/Het",
    order: 1,
    published: true,
    exercises: [
      {
        slug: "k1-mc-de-het-1",
        type: "MULTIPLE_CHOICE",
        title: "Kies het juiste lidwoord",
        difficulty: 1,
        xpReward: XP_REWARDS.MULTIPLE_CHOICE,
        content: {
          question: "... huis is groot.",
          options: ["De", "Het", "Een", "Geen"],
          correctIndex: 1,
          explanation: "'Huis' is een het-woord.",
        },
      },
      {
        slug: "k2-mc-de-het-2",
        type: "MULTIPLE_CHOICE",
        title: "Lidwoord: meisje",
        difficulty: 1,
        xpReward: XP_REWARDS.MULTIPLE_CHOICE,
        content: {
          question: "... meisje heet Lisa.",
          options: ["Het", "De", "Een", "Meneer"],
          correctIndex: 0,
          explanation: "Verkleinwoorden eindigend op -je krijgen altijd 'het'.",
        },
      },
      {
        slug: "k3-mc-begroeting",
        type: "MULTIPLE_CHOICE",
        title: "Begroeten: formeel",
        difficulty: 1,
        xpReward: XP_REWARDS.MULTIPLE_CHOICE,
        content: {
          question: "Hoe begroet je een docent formeel?",
          options: ["Hé!", "Goedemorgen.", "Hoi.", "Wat leuk!"],
          correctIndex: 1,
          explanation: "Formeel = Goedemorgen / Goedendag / Goedenavond.",
        },
      },
      {
        slug: "k4-fill-voorstellen",
        type: "FILL_IN_BLANK",
        title: "Zin afmaken: voorstellen",
        difficulty: 2,
        xpReward: XP_REWARDS.FILL_IN_BLANK,
        content: {
          sentence: "Goedendag, ik ___ Lars. Ik kom uit Polen.",
          placeholder: "___",
          correctAnswers: ["heet", "ben"],
          explanation: "Zowel 'ik heet Lars' als 'ik ben Lars' zijn juist.",
        },
      },
      {
        slug: "k5-fill-wonen",
        type: "FILL_IN_BLANK",
        title: "Waar woon je?",
        difficulty: 2,
        xpReward: XP_REWARDS.FILL_IN_BLANK,
        content: {
          sentence: "Ik woon ___ Amsterdam.",
          placeholder: "___",
          correctAnswers: ["in"],
          explanation: "Wonen doe je 'in' een stad of land.",
        },
      },
      {
        slug: "k6-trans-naar-eng",
        type: "TRANSLATION",
        title: "Vertaal naar Engels",
        difficulty: 2,
        xpReward: XP_REWARDS.TRANSLATION,
        content: {
          from: "nl",
          to: "en",
          prompt: "Vertaal de zin naar het Engels.",
          sentence: "Ik heet Fatima en ik kom uit Marokko.",
          correctAnswers: [
            "My name is Fatima and I come from Morocco.",
            "I am Fatima and I come from Morocco.",
            "I'm Fatima and I'm from Morocco.",
            "My name is Fatima and I'm from Morocco.",
          ],
        },
      },
      {
        slug: "k7-vocab-begroeting",
        type: "VOCABULARY",
        title: "Woord: welkom",
        difficulty: 1,
        xpReward: XP_REWARDS.VOCABULARY,
        content: {
          word: "welkom",
          translation: "welcome",
          partOfSpeech: "tussenwerpsel / zelfstandig naamwoord",
          example: "Welkom bij onze les Nederlands.",
        },
      },
      {
        slug: "k8-sc-zin-fix",
        type: "SENTENCE_CORRECTION",
        title: "Verbeter de zin",
        difficulty: 3,
        xpReward: XP_REWARDS.SENTENCE_CORRECTION,
        content: {
          incorrect: "Ik heet Ahmet en ik woon te Rotterdam.",
          correct: "Ik heet Ahmet en ik woon in Rotterdam.",
          category: "Voorzetsel",
          explanation:
            "Gebruik voor woonplaatsen 'in' (Rotterdam is een stad), niet 'te'.",
        },
      },
    ],
  },
  {
    slug: "werkwoordspelling-tegenwoordig",
    title: "Werkwoordspelling tegenwoordige tijd",
    description:
      "Oefen de juiste vorm van werkwoorden in de tegenwoordige tijd: stam + t, meervouden, DT-fouten.",
    languageLevel: "A2",
    topic: "Werkwoordspelling",
    order: 2,
    published: true,
    exercises: [
      {
        slug: "w1-mc-werkt",
        type: "MULTIPLE_CHOICE",
        title: "Werkwoord: werken",
        difficulty: 1,
        xpReward: XP_REWARDS.MULTIPLE_CHOICE,
        content: {
          question: "Hij ___ elke dag in de winkel.",
          options: ["werk", "werken", "werkt", "werkte"],
          correctIndex: 2,
          explanation:
            "Hij/zij/het + tegenwoordige tijd = stam + t. Werk + t = werkt.",
        },
      },
      {
        slug: "w2-mc-spelen",
        type: "MULTIPLE_CHOICE",
        title: "Werkwoord: spelen",
        difficulty: 1,
        xpReward: XP_REWARDS.MULTIPLE_CHOICE,
        content: {
          question: "Wij ___ samen voetbal op vrijdag.",
          options: ["speel", "speelt", "spelen", "speelde"],
          correctIndex: 2,
          explanation: "Wij/jullie/zij (meerv.) = hele werkwoord: spelen.",
        },
      },
      {
        slug: "w3-mc-komen",
        type: "MULTIPLE_CHOICE",
        title: "Uitzondering: komen",
        difficulty: 2,
        xpReward: XP_REWARDS.MULTIPLE_CHOICE,
        content: {
          question: "Zij ___ vandaag uit Brussel.",
          options: ["kom", "komt", "komen", "kwam"],
          correctIndex: 1,
          explanation:
            "Onregelmatig werkwoord: ik kom, jij/u komt, hij/zij komt, wij komen.",
        },
      },
      {
        slug: "w4-fill-lezen",
        type: "FILL_IN_BLANK",
        title: "Vul aan: lezen",
        difficulty: 2,
        xpReward: XP_REWARDS.FILL_IN_BLANK,
        content: {
          sentence: "Jij iedere avond ___ in een boek.",
          placeholder: "___",
          correctAnswers: ["leest"],
          explanation: "Jij/u (enkel) = stam + t: lees + t = leest.",
        },
      },
      {
        slug: "w5-fill-gaan",
        type: "FILL_IN_BLANK",
        title: "Vul aan: gaan",
        difficulty: 2,
        xpReward: XP_REWARDS.FILL_IN_BLANK,
        content: {
          sentence: "Zij ___ elke zondag naar de kerk.",
          placeholder: "___",
          correctAnswers: ["gaat", "gaan"],
          explanation:
            "Let op: 'zij' kan enkel (gaat) of meervoud (gaan) zijn. Juiste antwoord afhankelijk van de context — beide opties worden hier geaccepteerd.",
        },
      },
      {
        slug: "w6-trans-naar-nl",
        type: "TRANSLATION",
        title: "Vertaal naar Nederlands",
        difficulty: 3,
        xpReward: XP_REWARDS.TRANSLATION,
        content: {
          from: "en",
          to: "nl",
          prompt: "Gebruik de tegenwoordige tijd.",
          sentence: "I work in a restaurant and my sister studies at the MBO.",
          correctAnswers: [
            "Ik werk in een restaurant en mijn zus studeert aan het MBO.",
            "Ik werk in een restaurant en mijn zus studeert op het MBO.",
          ],
        },
      },
      {
        slug: "w7-vocab-beroepen",
        type: "VOCABULARY",
        title: "Woord: de beroep",
        difficulty: 2,
        xpReward: XP_REWARDS.VOCABULARY,
        content: {
          word: "beroep",
          translation: "profession / career",
          partOfSpeech: "het zelfstandig naamwoord (de/het — onzijdig: het beroep)",
          example: "Wat is jouw beroep? Ik ben kok.",
        },
      },
      {
        slug: "w8-sc-dt-fout",
        type: "SENTENCE_CORRECTION",
        title: "Verbeter de DT-fout",
        difficulty: 3,
        xpReward: XP_REWARDS.SENTENCE_CORRECTION,
        content: {
          incorrect: "De jongen werk heel hard in de keuken.",
          correct: "De jongen werkt heel hard in de keuken.",
          category: "DT-fout (tegenwoordige tijd)",
          explanation:
            "'De jongen' = hij: derde persoon enkelvoud. Stam 'werk' + t = 'werkt'.",
        },
      },
    ],
  },
  {
    slug: "winkel-en-betalen",
    title: "Winkel, boodschappen en betalen",
    description:
      "Praat over boodschappen doen, om prijs vragen, afrekenen en getallen in het Nederlands — MBO-praktijk boodschappen.",
    languageLevel: "A2",
    topic: "Winkel & Betalen",
    order: 3,
    published: true,
    exercises: [
      {
        slug: "s1-mc-hoeveel",
        type: "MULTIPLE_CHOICE",
        title: "Hoe vraag je naar de prijs?",
        difficulty: 1,
        xpReward: XP_REWARDS.MULTIPLE_CHOICE,
        content: {
          question: "Welke zin is NIET correct?",
          options: [
            "Hoeveel kost dit brood?",
            "Wat kost die melk?",
            "Wat is de prijs van deze kaas?",
            "Hoeveel geld ben jij?",
          ],
          correctIndex: 3,
          explanation:
            "Je vraagt naar de prijs, niet naar het geld van een persoon. De eerste drie zijn allemaal goed.",
        },
      },
      {
        slug: "s2-mc-afrekenen",
        type: "MULTIPLE_CHOICE",
        title: "Bij de kassa",
        difficulty: 2,
        xpReward: XP_REWARDS.MULTIPLE_CHOICE,
        content: {
          question: "Wat zegt de kassière meestal eerst?",
          options: [
            "Wilt u een tasje?",
            "Tot ziens.",
            "Ik heb geen geld.",
            "Mag ik 5 broden?",
          ],
          correctIndex: 0,
          explanation:
            "Eerst wordt gevraagd of je een tasje wilt, daarna het bedrag en tot slot 'tot ziens'.",
        },
      },
      {
        slug: "s3-mc-getallen",
        type: "MULTIPLE_CHOICE",
        title: "Getal: 87",
        difficulty: 2,
        xpReward: XP_REWARDS.MULTIPLE_CHOICE,
        content: {
          question: "Hoe schrijf je '87' in woorden?",
          options: [
            "tachtig-zeven",
            "zevenentachtig",
            "achtzeven",
            "zevenachttig",
          ],
          correctIndex: 1,
          explanation:
            "Tot 100: eenheden + en + tientallen. 7 + en + 80 = zevenentachtig.",
        },
      },
      {
        slug: "s4-fill-wilt-u",
        type: "FILL_IN_BLANK",
        title: "Wilt u nog iets ___?",
        difficulty: 2,
        xpReward: XP_REWARDS.FILL_IN_BLANK,
        content: {
          sentence: "Wilt u nog anders ___?",
          placeholder: "___",
          correctAnswers: ["mee", "toevoegen", "hebben", "kopen"],
          explanation:
            "Veel voorkomend in de winkel: 'Wilt u nog anders mee?'. Andere antwoorden zijn in bepaalde context ook mogelijk.",
        },
      },
      {
        slug: "s5-fill-pinnen",
        type: "FILL_IN_BLANK",
        title: "Betalen met de pin",
        difficulty: 2,
        xpReward: XP_REWARDS.FILL_IN_BLANK,
        content: {
          sentence: "Mag ik met de bank ___?",
          placeholder: "___",
          correctAnswers: ["passeren", "betalen", "pinnen"],
          explanation:
            "Met de bank passeren, met de bank betalen en pinnen betekenen alle drie ongeveer hetzelfde.",
        },
      },
      {
        slug: "s6-trans-klant",
        type: "TRANSLATION",
        title: "Vertaal het klantgesprek",
        difficulty: 3,
        xpReward: XP_REWARDS.TRANSLATION,
        content: {
          from: "nl",
          to: "en",
          prompt: "Vertaal deze hele korte dialoog als samenvatting.",
          sentence: "Goedemiddag. Ik wil graag 2 kilo appels en een pak melk.",
          correctAnswers: [
            "Good afternoon. I would like 2 kilos of apples and a carton of milk.",
            "Good afternoon. I want two kilos of apples and one pack of milk.",
          ],
        },
      },
      {
        slug: "s7-vocab-afrekenen",
        type: "VOCABULARY",
        title: "Woord: afrekenen",
        difficulty: 2,
        xpReward: XP_REWARDS.VOCABULARY,
        content: {
          word: "afrekenen",
          translation: "to check out / settle the bill",
          partOfSpeech: "werkwoord (onregelmatig: ik reken af)",
          example: "Bij de kassa kun je afrekenen met pin of contant.",
        },
      },
      {
        slug: "s8-sc-2x-fout",
        type: "SENTENCE_CORRECTION",
        title: "Verbeter de klantzin",
        difficulty: 3,
        xpReward: XP_REWARDS.SENTENCE_CORRECTION,
        content: {
          incorrect: "Ik wilt graag drie brood en een bottel water.",
          correct: "Ik wil graag drie broden en een fles water.",
          category: "Werkwoord + meervoud + spelling",
          explanation:
            "Ik 'wil' (niet 'wilt'). Drie → meervoud 'broden'. Bottel → 'fles' (wat/glas/fles).",
        },
      },
    ],
  },
];

type VocabSeed = {
  dutchWord: string;
  translation: string;
  pronunciation?: string;
  partOfSpeech?: string;
  exampleSentence?: string;
  languageLevel: LanguageLevel;
};

const vocabulary: VocabSeed[] = [
  // Thema 1: Kennismaken / De/Het / Begroetingen (20 woorden, A1)
  { dutchWord: "dag", translation: "day / bye", pronunciation: "dach", partOfSpeech: "znw. de", exampleSentence: "Tot ziens, nog een goede dag!", languageLevel: "A1" },
  { dutchWord: "hallo", translation: "hello", partOfSpeech: "tussenvw.", exampleSentence: "Hallo, welkom in de les.", languageLevel: "A1" },
  { dutchWord: "goede", translation: "good", partOfSpeech: "bn.", exampleSentence: "Goedemorgen, ik ben Chaima.", languageLevel: "A1" },
  { dutchWord: "morgen", translation: "morning / tomorrow", partOfSpeech: "znw. de", exampleSentence: "Tot morgen!", languageLevel: "A1" },
  { dutchWord: "avond", translation: "evening", partOfSpeech: "znw. de", exampleSentence: "Goeienavond, mevrouw.", languageLevel: "A1" },
  { dutchWord: "naam", translation: "name", partOfSpeech: "znw. de", exampleSentence: "Mijn naam is Daniel.", languageLevel: "A1" },
  { dutchWord: "land", translation: "country / land", partOfSpeech: "znw. het", exampleSentence: "Uit welk land kom jij?", languageLevel: "A1" },
  { dutchWord: "stad", translation: "city", partOfSpeech: "znw. de", exampleSentence: "Ik woon in een grote stad.", languageLevel: "A1" },
  { dutchWord: "huis", translation: "house", partOfSpeech: "znw. het", exampleSentence: "Ons huis staat in Utrecht.", languageLevel: "A1" },
  { dutchWord: "boek", translation: "book", partOfSpeech: "znw. het", exampleSentence: "Ik lees een boek over Nederland.", languageLevel: "A1" },
  { dutchWord: "kind", translation: "child", partOfSpeech: "znw. het", exampleSentence: "Het kind gaat naar de basisschool.", languageLevel: "A1" },
  { dutchWord: "meisje", translation: "girl", partOfSpeech: "znw. het (verkleinw.)", exampleSentence: "Het meisje is jarig vandaag.", languageLevel: "A1" },
  { dutchWord: "jongen", translation: "boy", partOfSpeech: "znw. de", exampleSentence: "De jongen speelt buiten.", languageLevel: "A1" },
  { dutchWord: "vriend", translation: "friend (m)", partOfSpeech: "znw. de", exampleSentence: "Hij is mijn beste vriend.", languageLevel: "A1" },
  { dutchWord: "vriendin", translation: "friend (v)", partOfSpeech: "znw. de", exampleSentence: "Zij is een nieuwe vriendin van mij.", languageLevel: "A1" },
  { dutchWord: "spreken", translation: "to speak", partOfSpeech: "ww.", exampleSentence: "Wij spreken Nederlands in de les.", languageLevel: "A1" },
  { dutchWord: "leren", translation: "to learn", partOfSpeech: "ww.", exampleSentence: "Ik leer elke dag woordjes.", languageLevel: "A1" },
  { dutchWord: "stellen", translation: "to ask / to put", partOfSpeech: "ww.", exampleSentence: "Mag ik een vraag stellen?", languageLevel: "A1" },
  { dutchWord: "antwoord", translation: "answer", partOfSpeech: "znw. het", exampleSentence: "Wat is het goede antwoord?", languageLevel: "A1" },
  { dutchWord: "welkom", translation: "welcome", partOfSpeech: "tussenvw.", exampleSentence: "Welkom in het klaslokaal.", languageLevel: "A1" },

  // Thema 2: Werkwoorden / School / Werk (20 woorden, A1–A2)
  { dutchWord: "werken", translation: "to work", partOfSpeech: "ww.", exampleSentence: "Mijn vader werkt in een ziekenhuis.", languageLevel: "A1" },
  { dutchWord: "studeren", translation: "to study", partOfSpeech: "ww.", exampleSentence: "Ik studeer voor mijn examen.", languageLevel: "A1" },
  { dutchWord: "school", translation: "school", partOfSpeech: "znw. de/het (meestal de)", exampleSentence: "De school begint om 9 uur.", languageLevel: "A1" },
  { dutchWord: "klas", translation: "class / classroom", partOfSpeech: "znw. de", exampleSentence: "De klas is stil.", languageLevel: "A1" },
  { dutchWord: "les", translation: "lesson", partOfSpeech: "znw. de", exampleSentence: "Vandaag les: werkwoordspelling.", languageLevel: "A1" },
  { dutchWord: "leraar", translation: "teacher (m)", partOfSpeech: "znw. de", exampleSentence: "De leraar geeft uitleg.", languageLevel: "A1" },
  { dutchWord: "lerares", translation: "teacher (v)", partOfSpeech: "znw. de", exampleSentence: "De lerares is heel aardig.", languageLevel: "A1" },
  { dutchWord: "student", translation: "student", partOfSpeech: "znw. de/het", exampleSentence: "De student doet een toets.", languageLevel: "A1" },
  { dutchWord: "toets", translation: "test / quiz", partOfSpeech: "znw. de", exampleSentence: "De toets was moeilijk.", languageLevel: "A1" },
  { dutchWord: "examen", translation: "exam", partOfSpeech: "znw. het", exampleSentence: "Voor het examen moet ik veel leren.", languageLevel: "A2" },
  { dutchWord: "beroep", translation: "profession / job", partOfSpeech: "znw. het", exampleSentence: "Wat is jouw beroep?", languageLevel: "A2" },
  { dutchWord: "koken", translation: "to cook", partOfSpeech: "ww.", exampleSentence: "'s Avonds kook ik graag pasta.", languageLevel: "A1" },
  { dutchWord: "helpen", translation: "to help", partOfSpeech: "ww.", exampleSentence: "Kan jij mij even helpen?", languageLevel: "A1" },
  { dutchWord: "spreken", translation: "to speak", partOfSpeech: "ww.", exampleSentence: "Spreekt u Engels?", languageLevel: "A1" },
  { dutchWord: "luisteren", translation: "to listen", partOfSpeech: "ww.", exampleSentence: "Luister goed naar de radio.", languageLevel: "A1" },
  { dutchWord: "schrijven", translation: "to write", partOfSpeech: "ww.", exampleSentence: "Zij schrijft een brief aan haar moeder.", languageLevel: "A1" },
  { dutchWord: "lezen", translation: "to read", partOfSpeech: "ww.", exampleSentence: "Ik lees graag het nieuws.", languageLevel: "A1" },
  { dutchWord: "oefenen", translation: "to practice", partOfSpeech: "ww.", exampleSentence: "Oefen elke dag 15 minuten.", languageLevel: "A2" },
  { dutchWord: "verbeteren", translation: "to improve / correct", partOfSpeech: "ww.", exampleSentence: "De AI verbetert mijn zinnen.", languageLevel: "A2" },
  { dutchWord: "inzetten", translation: "to commit / deploy", partOfSpeech: "ww.", exampleSentence: "Zij zet zich in voor de les.", languageLevel: "A2" },

  // Thema 3: Winkel / Boodschappen / Getallen (20 woorden, A2)
  { dutchWord: "winkel", translation: "shop / store", partOfSpeech: "znw. de", exampleSentence: "Gaan we naar de winkel?", languageLevel: "A1" },
  { dutchWord: "supermarkt", translation: "supermarket", partOfSpeech: "znw. de/het (de)", exampleSentence: "De supermarkt is open tot 20 uur.", languageLevel: "A1" },
  { dutchWord: "klant", translation: "customer", partOfSpeech: "znw. de/het (de)", exampleSentence: "De klant wil afrekenen.", languageLevel: "A2" },
  { dutchWord: "kassa", translation: "cash register", partOfSpeech: "znw. de", exampleSentence: "Bij de kassa staat een rij.", languageLevel: "A2" },
  { dutchWord: "prijs", translation: "price", partOfSpeech: "znw. de", exampleSentence: "De prijs van brood is hoog.", languageLevel: "A2" },
  { dutchWord: "geld", translation: "money", partOfSpeech: "znw. het", exampleSentence: "Heb jij vandaag genoeg geld bij je?", languageLevel: "A1" },
  { dutchWord: "pinnen", translation: "to pay by card", partOfSpeech: "ww. (informeel)", exampleSentence: "Wij pinnen bijna altijd.", languageLevel: "A2" },
  { dutchWord: "contant", translation: "cash", partOfSpeech: "bijv.", exampleSentence: "Wilt u contant of met de pin?", languageLevel: "A2" },
  { dutchWord: "afrekenen", translation: "to check out", partOfSpeech: "ww.", exampleSentence: "We gaan afrekenen bij de kassa.", languageLevel: "A2" },
  { dutchWord: "tas", translation: "bag", partOfSpeech: "znw. de", exampleSentence: "Heeft u een plastic tas nodig?", languageLevel: "A2" },
  { dutchWord: "appel", translation: "apple", partOfSpeech: "znw. de", exampleSentence: "Ik eet elke dag een appel.", languageLevel: "A1" },
  { dutchWord: "brood", translation: "bread", partOfSpeech: "znw. het", exampleSentence: "Vers brood van de bakker.", languageLevel: "A1" },
  { dutchWord: "melk", translation: "milk", partOfSpeech: "znw. de/het (de)", exampleSentence: "Een pak halfvolle melk, graag.", languageLevel: "A1" },
  { dutchWord: "kaas", translation: "cheese", partOfSpeech: "znw. de", exampleSentence: "Nederlandse kaas is beroemd.", languageLevel: "A1" },
  { dutchWord: "vlees", translation: "meat", partOfSpeech: "znw. het", exampleSentence: "Ik eet geen vlees.", languageLevel: "A2" },
  { dutchWord: "fles", translation: "bottle", partOfSpeech: "znw. de", exampleSentence: "Een fles water, alstublieft.", languageLevel: "A2" },
  { dutchWord: "kilo", translation: "kilo / kilogram", partOfSpeech: "znw. de/het (de kilo)", exampleSentence: "Mag ik een kilo appels?", languageLevel: "A2" },
  { dutchWord: "boodschap", translation: "errand / grocery item", partOfSpeech: "znw. de (meerv. boodschappen)", exampleSentence: "Ik doe vandaag de grote boodschappen.", languageLevel: "A2" },
  { dutchWord: "alstublieft", translation: "please / here you go", partOfSpeech: "tussenvw.", exampleSentence: "Twee broden, alstublieft.", languageLevel: "A1" },
  { dutchWord: "bedankt", translation: "thanks / thanked", partOfSpeech: "tussenvw. of ww. (bedanken)", exampleSentence: "Bedankt en tot ziens!", languageLevel: "A1" },
];

async function main() {
  console.log("Seeding NT2 AI Taalcoach data...");

  for (const lesson of lessons) {
    const dbLesson = await prisma.lesson.upsert({
      where: { id: `seed-lesson-${lesson.slug}` },
      update: {
        title: lesson.title,
        description: lesson.description,
        languageLevel: lesson.languageLevel,
        topic: lesson.topic,
        order: lesson.order,
        published: lesson.published,
      },
      create: {
        id: `seed-lesson-${lesson.slug}`,
        title: lesson.title,
        description: lesson.description,
        languageLevel: lesson.languageLevel,
        topic: lesson.topic,
        order: lesson.order,
        published: lesson.published,
      },
    });
    console.log(`[Lesson] ${dbLesson.title}`);

    for (const ex of lesson.exercises) {
      const dbEx = await prisma.exercise.upsert({
        where: { id: `seed-ex-${ex.slug}` },
        update: {
          lessonId: dbLesson.id,
          type: ex.type,
          title: ex.title,
          description: ex.description ?? null,
          difficulty: ex.difficulty,
          content: ex.content as never,
          xpReward: ex.xpReward,
        },
        create: {
          id: `seed-ex-${ex.slug}`,
          lessonId: dbLesson.id,
          type: ex.type,
          title: ex.title,
          description: ex.description ?? null,
          difficulty: ex.difficulty,
          content: ex.content as never,
          xpReward: ex.xpReward,
        },
      });
      console.log(`   [Exercise] ${dbEx.type} - ${dbEx.title}`);
    }
  }

  for (const v of vocabulary) {
    const slug = v.dutchWord.toLowerCase().replace(/[^a-z]/g, "");
    const id = `seed-vocab-${slug}-${v.languageLevel}`;
    await prisma.vocabularyWord.upsert({
      where: { id },
      update: {
        dutchWord: v.dutchWord,
        translation: v.translation,
        pronunciation: v.pronunciation ?? null,
        partOfSpeech: v.partOfSpeech ?? null,
        exampleSentence: v.exampleSentence ?? null,
        languageLevel: v.languageLevel,
      },
      create: {
        id,
        dutchWord: v.dutchWord,
        translation: v.translation,
        pronunciation: v.pronunciation ?? null,
        partOfSpeech: v.partOfSpeech ?? null,
        exampleSentence: v.exampleSentence ?? null,
        languageLevel: v.languageLevel,
      },
    });
  }
  console.log(`[Vocabulary] ${vocabulary.length} woorden ge-upsert.`);

  const counts = {
    lessons: await prisma.lesson.count(),
    exercises: await prisma.exercise.count(),
    words: await prisma.vocabularyWord.count(),
  };
  console.log(`\n✅ Seed klaar: ${counts.lessons} lessen, ${counts.exercises} oefeningen, ${counts.words} woorden.`);
}

main()
  .catch((e) => {
    console.error("Seed mislukt:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
