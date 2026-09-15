import type { Locale } from "./types";

// PRIMARY talen: hebben complete vertalingen (NL/EN/TR/AR/PL/ES/DE)
// ALLE ANDERE talen (Frans, Italiaans, Chinees, Japans, Hindi, Russisch, etc.) vallen AUTOMATISCH
// terug op ENGELS via `getDictionary()`. Dit houdt de bundle klein en ondersteunt
// toch ELKE ISO 639-1 taal ter wereld. De taalnaam en vlag worden WEL in het eigen schrift getoond.

export type Dict = DictionaryEntry;

type DictionaryEntry = {
  common: {
    loading: string; save: string; cancel: string; confirm: string; next: string;
    back: string; retry: string; close: string; more: string; search: string;
    viewAll: string; newItem: string; edit: string; deleteItem: string; duplicate: string;
    continue: string; previous: string; submit: string; filter: string; show: string;
    reset: string; xpLabel: string; minutesShort: string; exercisesShort: string;
  };
  nav: {
    dashboard: string; lessons: string; lessonBuilder: string; practice: string; profile: string;
    teacherBadge: string; appName: string; appSubtitle: string; mbobadge: string;
    streakDays: (d: number) => string; xpLabel: (xp: string) => string; erkLabel: string;
    language: string; sector: string;
    sectorChooseTitle: string;
    searchNoResults: (query: string) => string;
    menu: {
      viewProfile: string; logOut: string;
    };
  };
  footer: {
    copyright: string; glossary: string; help: string;
  };
  dashboard: {
    welcome: (name: string) => string; welcomeBack: string;
    heroCta1: string; heroCta2: string;
    stat7day: string; statXp: string; statLevel: (lv: number) => string;
    statLevelProgress: (current: number, xpToNext: number, next: number) => string;
    recommendedLessons: string; stageSimulation: string; stageSimulationCta: string;
    stageSimulationSubtitle: string;
    recentActivity: string; viewAllActivity: string;
    wordOfDay: string; wordOfDayTitle: string; wordOfDayExample: string; wordOfDayCta: string;
    weeklyGoals: string; needHelp: string; needHelpTitle: string; needHelpSubtitle: string; needHelpCta: string;
    sectorHeaderTagline: string;
    sectorHeaderTitlePrefix: string;
    sectorHeaderTitleSuffix: string;
    sectorHeaderSubtitle: string;
  };
  lessons: {
    title: string; subtitle: string; newLessonCta: string;
    filterErk: string; filterSector: string; filterSkill: string;
    tabAll: (n: number) => string; tabMine: (n: number) => string; tabFavs: (n: number) => string; tabDrafts: (n: number) => string;
    conceptBadge: string; conceptCardTitle: string; conceptCardSubtitle: string; conceptCardCta: string;
    recommendedPath: string; recommendedPathTitle: string; recommendedPathSubtitle: string; recommendedPathCta: string;
    loadMore: string; sortBy: string;
  };
  lessonBuilder: {
    topBar: { preview: string; saveDraft: string; publish: string };
    step1Title: string; step2Title: string; step3Title: string;
    step1Subtitle: string; step2Subtitle: string; step3Subtitle: string;
    fieldLessonTitle: string; fieldEducation: string; fieldErk: string; fieldKeywords: string; fieldDescription: string;
    placeholderLessonTitle: string; placeholderDescription: string; placeholderKeywords: string;
    goalAddLabel: string; goalAddPlaceholder: string; goalChipExample: string;
    coverTitle: string; coverSubtitle: string; coverCta: string;
    exercisesTitle: string; exercisesSubtitle: string; exercisesAddCta: string; exercisesOpenAiCta: string;
    aiPanelTitle: string; aiPanelPrompt: string; aiPanelCount: string; aiPanelTypes: string; aiPanelContext: string; aiPanelGenerate: string;
  };
  practice: {
    questionNr: (q: number, total: number) => string;
    ctaNext: string; ctaTip: string; speed: string;
    feedbackExcellent: string; feedbackGood: string; feedbackRetry: string;
    rewardXp: (xp: number) => string; newTerm: string;
    glossaryCard: string;
  };
};

// ---------- DICTIONARIES ----------

const nlCommon: DictionaryEntry["common"] = {
  loading: "Laden…", save: "Opslaan", cancel: "Annuleren", confirm: "Bevestigen",
  next: "Volgende", back: "Terug", retry: "Opnieuw proberen", close: "Sluiten",
  more: "Meer", search: "Zoeken", viewAll: "Alles bekijken", newItem: "Nieuw",
  edit: "Bewerken", deleteItem: "Verwijderen", duplicate: "Dupliceren",
  continue: "Doorgaan", previous: "Vorige", submit: "Versturen", filter: "Filteren",
  show: "Toon", reset: "Resetten", xpLabel: "XP", minutesShort: "min", exercisesShort: "oef",
};

export const dictionaries = {
  // ============== NEDERLANDS (DEFAULT) ==============
  nl: {
    common: nlCommon,
    nav: {
      dashboard: "Dashboard", lessons: "Lessen", lessonBuilder: "Lesbouwer", practice: "Oefenen", profile: "Profiel",
      teacherBadge: "Docent", appName: "TaalCozy", appSubtitle: "MBO NT2 Portaal", mbobadge: "MBO NT2",
      streakDays: (d) => `${d} Dagen Streak`, xpLabel: (xp) => `${xp} XP`, erkLabel: "ERK",
      language: "Taal", sector: "Vakgebied",
      sectorChooseTitle: "Kies je vakgebied",
      searchNoResults: (q) => `Geen resultaten voor “${q}”`,
      menu: { viewProfile: "Profiel bekijken", logOut: "Uitloggen" },
    },
    footer: {
      copyright: "TaalCozy • Nederlands leren voor MBO vakopleidingen • Ondersteund door ERK taalniveaus",
      glossary: "Woordenlijst", help: "Hulp & Toegankelijkheid",
    },
    dashboard: {
      welcome: (n) => `Welkom terug, ${n}!`, welcomeBack: "Klaar voor vandaag? Je bent goed op weg!",
      heroCta1: "Ga naar je les van vandaag", heroCta2: "Start oefening",
      stat7day: "7 Dagen Streak", statXp: "XP Totaal", statLevel: (lv) => `Level ${lv}`,
      recommendedLessons: "Aanbevolen voor jou",
      stageSimulation: "Stagegesprek Praktijksimulatie",
      stageSimulationCta: "Start gesprek (12 min)",
      stageSimulationSubtitle: "Oefen een echt werkoverleg met je stagebegeleider. Spreek, luister en krijg direct feedback.",
      recentActivity: "Recente activiteit", viewAllActivity: "Bekijk alles",
      wordOfDay: "Woord van de dag", wordOfDayTitle: "De overdracht",
      wordOfDayExample: "Voor de dienst begint, maak je altijd de overdracht met je collega.",
      wordOfDayCta: "+ Voeg toe aan woordenlijst",
      weeklyGoals: "Weekdoelen",
      needHelp: "Hulp nodig?", needHelpTitle: "Chat met Sandra", needHelpSubtitle: "Onze taalcoach beantwoordt je vraag binnen 2 minuten",
      needHelpCta: "Start een bericht",
      sectorHeaderTagline: "Vakspecifiek Nederlands leren",
      sectorHeaderTitlePrefix: "Je kiest nu: ",
      sectorHeaderTitleSuffix: "",
      sectorHeaderSubtitle: "Aanbevolen lessen, woorden en voorbeelden zijn afgestemd op jouw vakgebied.",
      statLevelProgress: (current, xpToNext, next) => `Niveau ${current} — in ${xpToNext} XP naar ${next}`,
    },
    lessons: {
      title: "Lessen & Modules", subtitle: "Alles op jouw niveau en vakgebied, van A1 tot B2.",
      newLessonCta: "Nieuwe les ontwerpen",
      filterErk: "ERK niveau", filterSector: "Vakgebied", filterSkill: "Vaardigheid",
      tabAll: (n) => `Alle lessen (${n})`, tabMine: (n) => `Mijn lessen (${n})`,
      tabFavs: (n) => `Favorieten (${n})`, tabDrafts: (n) => `Concepten (${n})`,
      conceptBadge: "Concept", conceptCardTitle: "Jouw Conceptles",
      conceptCardSubtitle: "Voeg oefeningen toe en publiceer als je les klaar is.", conceptCardCta: "Open concept",
      recommendedPath: "Aanbevolen leerpad", recommendedPathTitle: "Bouw je Vakspecialisme op",
      recommendedPathSubtitle: "Een logische reeks van 12 lessen die jou naar ERK B1 tilt, precies afgestemd op jouw opleiding.",
      recommendedPathCta: "Start het leerpad",
      loadMore: "Toon meer lessen", sortBy: "Sorteren op",
    },
    lessonBuilder: {
      topBar: { preview: "Voorvertoning", saveDraft: "Concept opslaan", publish: "Publiceren" },
      step1Title: "1. Basisgegevens", step2Title: "2. Leerdoelen", step3Title: "3. Omslagafbeelding",
      step1Subtitle: "Waar gaat deze les over en voor wie is hij bedoeld?",
      step2Subtitle: "Wat moet de leerling kennen of kunnen na deze les?",
      step3Subtitle: "Kies een afbeelding die past bij de sector of het thema.",
      fieldLessonTitle: "Titel van de les", fieldEducation: "MBO opleiding / vakgebied", fieldErk: "ERK taalniveau",
      fieldKeywords: "Trefwoorden", fieldDescription: "Korte beschrijving",
      placeholderLessonTitle: "Bijv. Een werkoverleg leiden", placeholderDescription: "Bijv. In deze les oefen je met het geven en vragen van instructies…",
      placeholderKeywords: "Druk op Enter om toe te voegen",
      goalAddLabel: "Voeg een leerdoel toe", goalAddPlaceholder: "Bijv. Ik kan 3 vaktermen correct gebruiken",
      goalChipExample: "voorbeeld",
      coverTitle: "Sleep een afbeelding hierheen", coverSubtitle: "PNG of JPG, max 5MB. Wordt automatisch geoptimaliseerd.",
      coverCta: "Selecteer bestand",
      exercisesTitle: "Oefeningen in deze les", exercisesSubtitle: "Sleep om de volgorde te wijzigen. Voeg handmatig toe of laat AI genereren.",
      exercisesAddCta: "Handmatig toevoegen", exercisesOpenAiCta: "Open AI Assistent",
      aiPanelTitle: "AI Assistent", aiPanelPrompt: "Waar moet de AI rekening mee houden?",
      aiPanelCount: "Aantal oefeningen", aiPanelTypes: "Oefenvormen", aiPanelContext: "Vakcontext",
      aiPanelGenerate: "Genereer met AI",
    },
    practice: {
      questionNr: (q, t) => `Vraag ${q} / ${t}`,
      ctaNext: "Volgende vraag", ctaTip: "Stage tip", speed: "Snelheid",
      feedbackExcellent: "Uitstekend gedaan!", feedbackGood: "Goed gedaan!", feedbackRetry: "Probeer het nog eens",
      rewardXp: (xp) => `+${xp} XP`, newTerm: "Nieuwe vakterm",
      glossaryCard: "Woordenlijst • Vaktermen bij deze les",
    },
  },

  // ============== ENGLISH ==============
  en: {
    common: { ...nlCommon, loading: "Loading…", save: "Save", cancel: "Cancel", confirm: "Confirm",
      next: "Next", back: "Back", retry: "Retry", close: "Close", more: "More", search: "Search",
      viewAll: "View all", newItem: "New", edit: "Edit", deleteItem: "Delete", duplicate: "Duplicate",
      continue: "Continue", previous: "Previous", submit: "Submit", filter: "Filter",
      show: "Show", reset: "Reset", minutesShort: "min", exercisesShort: "ex" },
    nav: {
      dashboard: "Dashboard", lessons: "Lessons", lessonBuilder: "Lesson Builder", practice: "Practice", profile: "Profile",
      teacherBadge: "Teacher", appName: "TaalCozy", appSubtitle: "MBO NT2 Portal", mbobadge: "MBO NT2",
      streakDays: (d) => `${d} Day Streak`, xpLabel: (xp) => `${xp} XP`, erkLabel: "CEFR",
      language: "Language", sector: "Sector",
      sectorChooseTitle: "Choose your field",
      searchNoResults: (q) => `No results for “${q}”`,
      menu: { viewProfile: "View profile", logOut: "Log out" },
    },
    footer: {
      copyright: "TaalCozy • Learn Dutch for MBO vocational education • Supported by CEFR levels",
      glossary: "Glossary", help: "Help & Accessibility",
    },
    dashboard: {
      welcome: (n) => `Welcome back, ${n}!`, welcomeBack: "Ready for today? You're doing great!",
      heroCta1: "Go to today's lesson", heroCta2: "Start exercise",
      stat7day: "7 Day Streak", statXp: "Total XP", statLevel: (lv) => `Level ${lv}`,
      recommendedLessons: "Recommended for you",
      stageSimulation: "Internship Meeting Simulation",
      stageSimulationCta: "Start conversation (12 min)",
      stageSimulationSubtitle: "Practice a real work meeting with your internship supervisor. Speak, listen and get instant feedback.",
      recentActivity: "Recent activity", viewAllActivity: "View all",
      wordOfDay: "Word of the day", wordOfDayTitle: "The handover",
      wordOfDayExample: "Before the shift starts, you always do the handover with your colleague.",
      wordOfDayCta: "+ Add to glossary",
      weeklyGoals: "Weekly goals",
      needHelp: "Need help?", needHelpTitle: "Chat with Sandra", needHelpSubtitle: "Our language coach answers your question within 2 minutes.",
      needHelpCta: "Send a message",
      sectorHeaderTagline: "Sector-specific Dutch learning",
      sectorHeaderTitlePrefix: "You selected: ",
      sectorHeaderTitleSuffix: "",
      sectorHeaderSubtitle: "Recommended lessons, words and examples are tailored to your field of study.",
      statLevelProgress: (current, xpToNext, next) => `Level ${current} — ${xpToNext} XP to ${next}`,
    },
    lessons: {
      title: "Lessons & Modules", subtitle: "Everything at your level and sector, from A1 to B2.",
      newLessonCta: "Design new lesson",
      filterErk: "CEFR level", filterSector: "Sector", filterSkill: "Skill",
      tabAll: (n) => `All lessons (${n})`, tabMine: (n) => `My lessons (${n})`,
      tabFavs: (n) => `Favorites (${n})`, tabDrafts: (n) => `Drafts (${n})`,
      conceptBadge: "Draft", conceptCardTitle: "Your Draft Lesson",
      conceptCardSubtitle: "Add exercises and publish when your lesson is ready.", conceptCardCta: "Open draft",
      recommendedPath: "Recommended learning path", recommendedPathTitle: "Build up your vocational expertise",
      recommendedPathSubtitle: "A logical sequence of 12 lessons that gets you to CEFR B1, tailored exactly to your education.",
      recommendedPathCta: "Start the learning path",
      loadMore: "Show more lessons", sortBy: "Sort by",
    },
    lessonBuilder: {
      topBar: { preview: "Preview", saveDraft: "Save draft", publish: "Publish" },
      step1Title: "1. Basic info", step2Title: "2. Learning goals", step3Title: "3. Cover image",
      step1Subtitle: "What is this lesson about and who is it for?",
      step2Subtitle: "What should the student know or be able to do after this lesson?",
      step3Subtitle: "Pick an image that matches the sector or theme.",
      fieldLessonTitle: "Lesson title", fieldEducation: "MBO program / sector", fieldErk: "CEFR level",
      fieldKeywords: "Keywords", fieldDescription: "Short description",
      placeholderLessonTitle: "E.g. Leading a work meeting", placeholderDescription: "E.g. In this lesson you practice giving and asking for instructions…",
      placeholderKeywords: "Press Enter to add",
      goalAddLabel: "Add a learning goal", goalAddPlaceholder: "E.g. I can use 3 vocational terms correctly",
      goalChipExample: "example",
      coverTitle: "Drag an image here", coverSubtitle: "PNG or JPG, max 5MB. Automatically optimized.",
      coverCta: "Select file",
      exercisesTitle: "Exercises in this lesson", exercisesSubtitle: "Drag to reorder. Add manually or let AI generate.",
      exercisesAddCta: "Add manually", exercisesOpenAiCta: "Open AI Assistant",
      aiPanelTitle: "AI Assistant", aiPanelPrompt: "What should the AI keep in mind?",
      aiPanelCount: "Number of exercises", aiPanelTypes: "Exercise types", aiPanelContext: "Sector context",
      aiPanelGenerate: "Generate with AI",
    },
    practice: {
      questionNr: (q, t) => `Question ${q} / ${t}`,
      ctaNext: "Next question", ctaTip: "Internship tip", speed: "Speed",
      feedbackExcellent: "Excellent job!", feedbackGood: "Well done!", feedbackRetry: "Try again",
      rewardXp: (xp) => `+${xp} XP`, newTerm: "New vocational term",
      glossaryCard: "Glossary • Vocational terms in this lesson",
    },
  },

  // ============== TÜRKÇE ==============
  tr: {
    common: { ...nlCommon, loading: "Yükleniyor…", save: "Kaydet", cancel: "İptal", confirm: "Onayla",
      next: "İleri", back: "Geri", retry: "Tekrar dene", close: "Kapat", more: "Daha fazla", search: "Ara",
      viewAll: "Tümünü gör", newItem: "Yeni", edit: "Düzenle", deleteItem: "Sil", duplicate: "Çoğalt",
      continue: "Devam et", previous: "Önceki", submit: "Gönder", filter: "Filtrele",
      show: "Göster", reset: "Sıfırla", minutesShort: "dk", exercisesShort: "egz" },
    nav: {
      dashboard: "Panel", lessons: "Dersler", lessonBuilder: "Ders Oluşturucu", practice: "Pratik", profile: "Profil",
      teacherBadge: "Öğretmen", appName: "TaalCozy", appSubtitle: "MBO NT2 Portalı", mbobadge: "MBO NT2",
      streakDays: (d) => `${d} Gün Serisi`, xpLabel: (xp) => `${xp} XP`, erkLabel: "CEFR",
      language: "Dil", sector: "Sektör",
      sectorChooseTitle: "Meslek alanını seç",
      searchNoResults: (q) => `“${q}” için sonuç yok`,
      menu: { viewProfile: "Profili gör", logOut: "Oturumu kapat" },
    },
    footer: {
      copyright: "TaalCozy • MBO mesleki eğitim için Hollandaca öğren • CEFR seviyeleri destekler",
      glossary: "Sözlük", help: "Yardım & Erişilebilirlik",
    },
    dashboard: {
      welcome: (n) => `Tekrar hoş geldin, ${n}!`, welcomeBack: "Bugüne hazır mısın? Harika gidiyorsun!",
      heroCta1: "Bugünkü derse git", heroCta2: "Alıştırmayı başlat",
      stat7day: "7 Gün Serisi", statXp: "Toplam XP", statLevel: (lv) => `Seviye ${lv}`,
      recommendedLessons: "Senin için önerilen",
      stageSimulation: "Staj Mülakatı Simülasyonu",
      stageSimulationCta: "Konuşmayı başlat (12 dk)",
      stageSimulationSubtitle: "Staj danışmanınla gerçek bir iş görüşmesi pratiği yap. Konuş, dinle ve anında geri bildirim al.",
      recentActivity: "Son aktivite", viewAllActivity: "Tümünü gör",
      wordOfDay: "Günün kelimesi", wordOfDayTitle: "De overdracht / Devir teslim",
      wordOfDayExample: "Vardiya başlamadan önce, meslektaşınla her zaman devir teslim yaparsın.",
      wordOfDayCta: "+ Sözlüğe ekle",
      weeklyGoals: "Haftalık hedefler",
      needHelp: "Yardıma mı ihtiyacın var?", needHelpTitle: "Sandra'yla sohbet et",
      needHelpSubtitle: "Dil koçumuz sorunu 2 dakika içinde yanıtlar.", needHelpCta: "Mesaj gönder",
      sectorHeaderTagline: "Sektöre özel Hollandaca öğrenimi",
      sectorHeaderTitlePrefix: "Şunu seçtin: ",
      sectorHeaderTitleSuffix: "",
      sectorHeaderSubtitle: "Önerilen dersler, kelimeler ve örnekler mesleki alanına göre hazırlanmıştır.",
      statLevelProgress: (current, xpToNext, next) => `Seviye ${current} — ${next} için ${xpToNext} XP gerekli`,
    },
    lessons: {
      title: "Dersler & Modüller", subtitle: "Seviyene ve sektörüne göre her şey, A1'den B2'ye kadar.",
      newLessonCta: "Yeni ders tasarla",
      filterErk: "CEFR seviyesi", filterSector: "Sektör", filterSkill: "Beceri",
      tabAll: (n) => `Tüm dersler (${n})`, tabMine: (n) => `Derslerim (${n})`,
      tabFavs: (n) => `Favoriler (${n})`, tabDrafts: (n) => `Taslaklar (${n})`,
      conceptBadge: "Taslak", conceptCardTitle: "Taslak dersin",
      conceptCardSubtitle: "Alıştırmalar ekle ve hazır olunca yayınla.", conceptCardCta: "Taslağı aç",
      recommendedPath: "Önerilen öğrenme yolu", recommendedPathTitle: "Mesleki uzmanlığını geliştir",
      recommendedPathSubtitle: "Tam olarak eğitimine göre hazırlanmış, seni CEFR B1 seviyesine taşıyan 12 ders.",
      recommendedPathCta: "Öğrenme yolunu başlat",
      loadMore: "Daha fazla ders göster", sortBy: "Sırala",
    },
    lessonBuilder: {
      topBar: { preview: "Önizleme", saveDraft: "Taslak kaydet", publish: "Yayınla" },
      step1Title: "1. Temel bilgiler", step2Title: "2. Öğrenme hedefleri", step3Title: "3. Kapak görseli",
      step1Subtitle: "Bu ders ne hakkında ve kim için?",
      step2Subtitle: "Öğrenci bu dersten sonra ne bilmeli veya yapabilmeli?",
      step3Subtitle: "Sektör veya temaya uygun bir görsel seç.",
      fieldLessonTitle: "Ders başlığı", fieldEducation: "MBO bölümü / sektör", fieldErk: "CEFR seviyesi",
      fieldKeywords: "Anahtar kelimeler", fieldDescription: "Kısa açıklama",
      placeholderLessonTitle: "Örn. İş toplantısı yönetmek", placeholderDescription: "Örn. Bu derste talimat verme ve isteme pratiği yapıyorsun…",
      placeholderKeywords: "Eklemek için Enter'a bas",
      goalAddLabel: "Öğrenme hedefi ekle", goalAddPlaceholder: "Örn. 3 mesleki terimi doğru kullanabilirim",
      goalChipExample: "örnek",
      coverTitle: "Görseli buraya sürükle", coverSubtitle: "PNG veya JPG, max 5MB. Otomatik optimize edilir.",
      coverCta: "Dosya seç",
      exercisesTitle: "Bu dersteki alıştırmalar", exercisesSubtitle: "Sırayı değiştirmek için sürükle. Elle ekle veya AI üretmesini sağla.",
      exercisesAddCta: "Elle ekle", exercisesOpenAiCta: "AI Asistan'ı aç",
      aiPanelTitle: "AI Asistan", aiPanelPrompt: "AI neye dikkat etsin?",
      aiPanelCount: "Alıştırma sayısı", aiPanelTypes: "Alıştırma türleri", aiPanelContext: "Sektör bağlamı",
      aiPanelGenerate: "AI ile üret",
    },
    practice: {
      questionNr: (q, t) => `Soru ${q} / ${t}`,
      ctaNext: "Sonraki soru", ctaTip: "Staj ipucu", speed: "Hız",
      feedbackExcellent: "Harika iş!", feedbackGood: "Aferin!", feedbackRetry: "Tekrar dene",
      rewardXp: (xp) => `+${xp} XP`, newTerm: "Yeni mesleki terim",
      glossaryCard: "Sözlük • Bu dersteki mesleki terimler",
    },
  },

  // ============== العربية ==============
  ar: {
    common: { ...nlCommon, loading: "جارٍ التحميل…", save: "حفظ", cancel: "إلغاء", confirm: "تأكيد",
      next: "التالي", back: "رجوع", retry: "إعادة المحاولة", close: "إغلاق", more: "المزيد", search: "بحث",
      viewAll: "عرض الكل", newItem: "جديد", edit: "تعديل", deleteItem: "حذف", duplicate: "تكرار",
      continue: "متابعة", previous: "السابق", submit: "إرسال", filter: "تصفية",
      show: "عرض", reset: "إعادة ضبط", minutesShort: "د", exercisesShort: "تمر" },
    nav: {
      dashboard: "لوحة التحكم", lessons: "الدروس", lessonBuilder: "صانع الدروس", practice: "تمارين", profile: "الملف الشخصي",
      teacherBadge: "معلم", appName: "TaalCozy", appSubtitle: "بوابة MBO NT2", mbobadge: "MBO NT2",
      streakDays: (d) => `${d} أيام متتالية`, xpLabel: (xp) => `${xp} XP`, erkLabel: "CEFR",
      language: "اللغة", sector: "المجال",
      sectorChooseTitle: "اختر مجالك المهني",
      searchNoResults: (q) => `لا توجد نتائج لـ “${q}”`,
      menu: { viewProfile: "عرض الملف الشخصي", logOut: "تسجيل الخروج" },
    },
    footer: {
      copyright: "TaalCozy • تعلم الهولندية للتعليم المهني MBO • مدعوم بمستويات CEFR",
      glossary: "قاموس", help: "المساعدة وإمكانية الوصول",
    },
    dashboard: {
      welcome: (n) => `أهلاً بعودتك، ${n}!`, welcomeBack: "جاهز لليوم؟ أنت تسير بخطى رائعة!",
      heroCta1: "اذهب لدرس اليوم", heroCta2: "ابدأ التمرين",
      stat7day: "7 أيام متتالية", statXp: "إجمالي XP", statLevel: (lv) => `المستوى ${lv}`,
      recommendedLessons: "موصى به لك",
      stageSimulation: "محاكاة مقابلة التدريب",
      stageSimulationCta: "ابدأ المحادثة (12 د)",
      stageSimulationSubtitle: "تدرب على اجتماع عمل حقيقي مع مشرف التدريب. تحدث واستمع واحصل على تغذية راجعة فورية.",
      recentActivity: "النشاط الأخير", viewAllActivity: "عرض الكل",
      wordOfDay: "كلمة اليوم", wordOfDayTitle: "De overdracht / التسليم",
      wordOfDayExample: "قبل بدء الوردية، دائماً تقوم بالتسليم مع زميلك.",
      wordOfDayCta: "+ أضف إلى القاموس",
      weeklyGoals: "أهداف الأسبوع",
      needHelp: "تحتاج مساعدة؟", needHelpTitle: "دردش مع ساندرا",
      needHelpSubtitle: "مدرب اللغة يجيب على سؤالك خلال دقيقتين.", needHelpCta: "أرسل رسالة",
      sectorHeaderTagline: "تعلم الهولندية المتخصص بالمجال",
      sectorHeaderTitlePrefix: "اخترت الآن: ",
      sectorHeaderTitleSuffix: "",
      sectorHeaderSubtitle: "الدروس والكلمات والأمثلة الموصى بها مخصصة لمجالك المهني.",
      statLevelProgress: (current, xpToNext, next) => `المستوى ${current} — ${xpToNext} XP للوصول إلى ${next}`,
    },
    lessons: {
      title: "الدروس والوحدات", subtitle: "كل شيء بمستواك ومجالك، من A1 إلى B2.",
      newLessonCta: "تصميم درس جديد",
      filterErk: "مستوى CEFR", filterSector: "المجال المهني", filterSkill: "المهارة",
      tabAll: (n) => `جميع الدروس (${n})`, tabMine: (n) => `دروسي (${n})`,
      tabFavs: (n) => `المفضلة (${n})`, tabDrafts: (n) => `المسودات (${n})`,
      conceptBadge: "مسودة", conceptCardTitle: "درسك المسودة",
      conceptCardSubtitle: "أضف تمارين وانشر عندما يكون درسك جاهزاً.", conceptCardCta: "فتح المسودة",
      recommendedPath: "مسار التعليم الموصى به", recommendedPathTitle: "بناء خبرتك المهنية",
      recommendedPathSubtitle: "سلسلة منطقية من 12 درساً تصلك إلى CEFR B1، مصممة خصيصاً لتعليمك.",
      recommendedPathCta: "ابدأ مسار التعليم",
      loadMore: "عرض المزيد من الدروس", sortBy: "ترتيب حسب",
    },
    lessonBuilder: {
      topBar: { preview: "معاينة", saveDraft: "حفظ مسودة", publish: "نشر" },
      step1Title: "١. المعلومات الأساسية", step2Title: "٢. أهداف التعلم", step3Title: "٣. صورة الغلاف",
      step1Subtitle: "ما هو موضوع هذا الدرس ولمن هو مخصص؟",
      step2Subtitle: "ماذا يجب أن يعرف الطالب أو يستطيع فعله بعد هذا الدرس؟",
      step3Subtitle: "اختر صورة تناسب المجال أو الموضوع.",
      fieldLessonTitle: "عنوان الدرس", fieldEducation: "برنامج MBO / المجال", fieldErk: "مستوى CEFR",
      fieldKeywords: "الكلمات المفتاحية", fieldDescription: "وصف مختصر",
      placeholderLessonTitle: "مثلاً: قيادة اجتماع عمل", placeholderDescription: "مثلاً: في هذا الدرس تتدرب على إعطاء وطلب التعليمات…",
      placeholderKeywords: "اضغط Enter للإضافة",
      goalAddLabel: "أضف هدف تعليمي", goalAddPlaceholder: "مثلاً: يمكنني استخدام 3 مصطلحات مهنية بشكل صحيح",
      goalChipExample: "مثال",
      coverTitle: "اسحب الصورة هنا", coverSubtitle: "PNG أو JPG، الحد الأقصى 5MB. يتم التحسين تلقائياً.",
      coverCta: "اختر ملفاً",
      exercisesTitle: "التمارين في هذا الدرس", exercisesSubtitle: "اسحب لإعادة الترتيب. أضف يدوياً أو اترك الذكاء الاصطناعي ينتج.",
      exercisesAddCta: "إضافة يدوية", exercisesOpenAiCta: "فتح مساعد الذكاء الاصطناعي",
      aiPanelTitle: "مساعد الذكاء الاصطناعي", aiPanelPrompt: "ما الذي يجب على الذكاء الاصطناعي مراعاته؟",
      aiPanelCount: "عدد التمارين", aiPanelTypes: "أنواع التمارين", aiPanelContext: "سياق المجال",
      aiPanelGenerate: "إنتاج بالذكاء الاصطناعي",
    },
    practice: {
      questionNr: (q, t) => `سؤال ${q} / ${t}`,
      ctaNext: "السؤال التالي", ctaTip: "نصيحة التدريب", speed: "السرعة",
      feedbackExcellent: "عمل ممتاز!", feedbackGood: "أحسنت!", feedbackRetry: "حاول مرة أخرى",
      rewardXp: (xp) => `+${xp} XP`, newTerm: "مصطلح مهني جديد",
      glossaryCard: "القاموس • المصطلحات المهنية في هذا الدرس",
    },
  },

  // ============== POLSKI ==============
  pl: {
    common: { ...nlCommon, loading: "Ładowanie…", save: "Zapisz", cancel: "Anuluj", confirm: "Potwierdź",
      next: "Dalej", back: "Wstecz", retry: "Spróbuj ponownie", close: "Zamknij", more: "Więcej", search: "Szukaj",
      viewAll: "Zobacz wszystkie", newItem: "Nowy", edit: "Edytuj", deleteItem: "Usuń", duplicate: "Duplikuj",
      continue: "Kontynuuj", previous: "Poprzedni", submit: "Wyślij", filter: "Filtruj",
      show: "Pokaż", reset: "Resetuj", minutesShort: "min", exercisesShort: "ćw" },
    nav: {
      dashboard: "Panel", lessons: "Lekcje", lessonBuilder: "Twórca lekcji", practice: "Ćwiczenia", profile: "Profil",
      teacherBadge: "Nauczyciel", appName: "TaalCozy", appSubtitle: "Portal MBO NT2", mbobadge: "MBO NT2",
      streakDays: (d) => `${d}-dniowa seria`, xpLabel: (xp) => `${xp} XP`, erkLabel: "CEFR",
      language: "Język", sector: "Branża",
      sectorChooseTitle: "Wybierz swoją branżę",
      searchNoResults: (q) => `Brak wyników dla “${q}”`,
      menu: { viewProfile: "Zobacz profil", logOut: "Wyloguj się" },
    },
    footer: {
      copyright: "TaalCozy • Nauka niderlandzkiego dla edukacji MBO • Obsługiwane przez poziomy CEFR",
      glossary: "Słownik", help: "Pomoc i dostępność",
    },
    dashboard: {
      welcome: (n) => `Witaj z powrotem, ${n}!`, welcomeBack: "Gotowy na dzisiaj? Świetnie Ci idzie!",
      heroCta1: "Przejdź do dzisiejszej lekcji", heroCta2: "Rozpocznij ćwiczenie",
      stat7day: "7-dniowa seria", statXp: "Łączne XP", statLevel: (lv) => `Poziom ${lv}`,
      recommendedLessons: "Polecane dla Ciebie",
      stageSimulation: "Symulacja rozmowy na stażu",
      stageSimulationCta: "Rozpocznij rozmowę (12 min)",
      stageSimulationSubtitle: "Ćwicz prawdziwe spotkanie służbowe z opiekunem stażu. Mów, słuchaj i dostawaj natychmiastową informację zwrotną.",
      recentActivity: "Ostatnia aktywność", viewAllActivity: "Zobacz wszystko",
      wordOfDay: "Słowo dnia", wordOfDayTitle: "De overdracht / Przekazanie",
      wordOfDayExample: "Przed rozpoczęciem zmiany zawsze dokonujesz przekazania z kolegą.",
      wordOfDayCta: "+ Dodaj do słownika",
      weeklyGoals: "Cele tygodniowe",
      needHelp: "Potrzebujesz pomocy?", needHelpTitle: "Porozmawiaj z Sandrą",
      needHelpSubtitle: "Nasz trener językowy odpisze w ciągu 2 minut.", needHelpCta: "Wyślij wiadomość",
      sectorHeaderTagline: "Nauka niderlandzkiego dla branży",
      sectorHeaderTitlePrefix: "Wybrałeś/aś: ",
      sectorHeaderTitleSuffix: "",
      sectorHeaderSubtitle: "Polecane lekcje, słowa i przykłady są dopasowane do Twojej branży.",
      statLevelProgress: (current, xpToNext, next) => `Poziom ${current} — ${xpToNext} XP do ${next}`,
    },
    lessons: {
      title: "Lekcje i moduły", subtitle: "Wszystko na Twoim poziomie i branży, od A1 do B2.",
      newLessonCta: "Zaprojektuj nową lekcję",
      filterErk: "Poziom CEFR", filterSector: "Branża", filterSkill: "Umiejętność",
      tabAll: (n) => `Wszystkie lekcje (${n})`, tabMine: (n) => `Moje lekcje (${n})`,
      tabFavs: (n) => `Ulubione (${n})`, tabDrafts: (n) => `Wersje robocze (${n})`,
      conceptBadge: "Wersja robocza", conceptCardTitle: "Twoja wersja robocza",
      conceptCardSubtitle: "Dodaj ćwiczenia i opublikuj, gdy lekcja będzie gotowa.", conceptCardCta: "Otwórz wersję roboczą",
      recommendedPath: "Polecana ścieżka", recommendedPathTitle: "Rozwijaj kompetencje branżowe",
      recommendedPathSubtitle: "Logiczna sekwencja 12 lekcji, która doprowadzi Cię do CEFR B1, dopasowana do Twojego kierunku.",
      recommendedPathCta: "Rozpocznij ścieżkę",
      loadMore: "Pokaż więcej lekcji", sortBy: "Sortuj według",
    },
    lessonBuilder: {
      topBar: { preview: "Podgląd", saveDraft: "Zapisz wersję roboczą", publish: "Opublikuj" },
      step1Title: "1. Podstawowe informacje", step2Title: "2. Cele nauczania", step3Title: "3. Zdjęcie na okładkę",
      step1Subtitle: "O czym jest ta lekcja i dla kogo jest przeznaczona?",
      step2Subtitle: "Co uczeń powinien wiedzieć lub umieć po tej lekcji?",
      step3Subtitle: "Wybierz zdjęcie pasujące do branży lub tematu.",
      fieldLessonTitle: "Tytuł lekcji", fieldEducation: "Kierunek MBO / branża", fieldErk: "Poziom CEFR",
      fieldKeywords: "Słowa kluczowe", fieldDescription: "Krótki opis",
      placeholderLessonTitle: "Np. Prowadzenie spotkania służbowego", placeholderDescription: "Np. W tej lekcji ćwiczysz udzielanie i proszenie o instrukcje…",
      placeholderKeywords: "Naciśnij Enter, aby dodać",
      goalAddLabel: "Dodaj cel nauczania", goalAddPlaceholder: "Np. Umiem poprawnie użyć 3 terminów branżowych",
      goalChipExample: "przykład",
      coverTitle: "Przeciągnij zdjęcie tutaj", coverSubtitle: "PNG lub JPG, max 5MB. Automatycznie optymalizowane.",
      coverCta: "Wybierz plik",
      exercisesTitle: "Ćwiczenia w tej lekcji", exercisesSubtitle: "Przeciągnij, aby zmienić kolejność. Dodawaj ręcznie lub generuj za pomocą AI.",
      exercisesAddCta: "Dodaj ręcznie", exercisesOpenAiCta: "Otwórz asystenta AI",
      aiPanelTitle: "Asystent AI", aiPanelPrompt: "Na co ma zwrócić uwagę AI?",
      aiPanelCount: "Liczba ćwiczeń", aiPanelTypes: "Rodzaje ćwiczeń", aiPanelContext: "Kontekst branżowy",
      aiPanelGenerate: "Wygeneruj z AI",
    },
    practice: {
      questionNr: (q, t) => `Pytanie ${q} / ${t}`,
      ctaNext: "Następne pytanie", ctaTip: "Wskazówka na stażu", speed: "Prędkość",
      feedbackExcellent: "Świetna robota!", feedbackGood: "Dobra robota!", feedbackRetry: "Spróbuj ponownie",
      rewardXp: (xp) => `+${xp} XP`, newTerm: "Nowy termin branżowy",
      glossaryCard: "Słownik • Terminy branżowe z tej lekcji",
    },
  },

  // ============== ESPAÑOL ==============
  es: {
    common: { ...nlCommon, loading: "Cargando…", save: "Guardar", cancel: "Cancelar", confirm: "Confirmar",
      next: "Siguiente", back: "Volver", retry: "Reintentar", close: "Cerrar", more: "Más", search: "Buscar",
      viewAll: "Ver todo", newItem: "Nuevo", edit: "Editar", deleteItem: "Eliminar", duplicate: "Duplicar",
      continue: "Continuar", previous: "Anterior", submit: "Enviar", filter: "Filtrar",
      show: "Mostrar", reset: "Restablecer", minutesShort: "min", exercisesShort: "ej" },
    nav: {
      dashboard: "Panel", lessons: "Lecciones", lessonBuilder: "Creador de lecciones", practice: "Práctica", profile: "Perfil",
      teacherBadge: "Profesor", appName: "TaalCozy", appSubtitle: "Portal MBO NT2", mbobadge: "MBO NT2",
      streakDays: (d) => `Racha de ${d} días`, xpLabel: (xp) => `${xp} XP`, erkLabel: "CEFR",
      language: "Idioma", sector: "Sector",
      sectorChooseTitle: "Elige tu sector",
      searchNoResults: (q) => `Sin resultados para “${q}”`,
      menu: { viewProfile: "Ver perfil", logOut: "Cerrar sesión" },
    },
    footer: {
      copyright: "TaalCozy • Aprende neerlandés para FP MBO • Soportado por niveles CEFR",
      glossary: "Glosario", help: "Ayuda y accesibilidad",
    },
    dashboard: {
      welcome: (n) => `¡Bienvenido de nuevo, ${n}!`, welcomeBack: "¿Listo para hoy? ¡Vas por buen camino!",
      heroCta1: "Ir a la lección de hoy", heroCta2: "Iniciar ejercicio",
      stat7day: "Racha de 7 días", statXp: "XP total", statLevel: (lv) => `Nivel ${lv}`,
      recommendedLessons: "Recomendado para ti",
      stageSimulation: "Simulación de entrevista de prácticas",
      stageSimulationCta: "Iniciar conversación (12 min)",
      stageSimulationSubtitle: "Practica una reunión de trabajo real con tu tutor de prácticas. Habla, escucha y recibe feedback al instante.",
      recentActivity: "Actividad reciente", viewAllActivity: "Ver todo",
      wordOfDay: "Palabra del día", wordOfDayTitle: "De overdracht / El relevo",
      wordOfDayExample: "Antes de empezar el turno, siempre haces el relevo con tu compañero.",
      wordOfDayCta: "+ Añadir al glosario",
      weeklyGoals: "Objetivos semanales",
      needHelp: "¿Necesitas ayuda?", needHelpTitle: "Chatea con Sandra",
      needHelpSubtitle: "Nuestra coach de idiomas responde en 2 minutos.", needHelpCta: "Enviar mensaje",
      sectorHeaderTagline: "Aprendizaje de neerlandés por sector",
      sectorHeaderTitlePrefix: "Has seleccionado: ",
      sectorHeaderTitleSuffix: "",
      sectorHeaderSubtitle: "Las lecciones, palabras y ejemplos recomendados se adaptan a tu sector profesional.",
      statLevelProgress: (current, xpToNext, next) => `Nivel ${current} — ${xpToNext} XP para ${next}`,
    },
    lessons: {
      title: "Lecciones y módulos", subtitle: "Todo según tu nivel y sector, de A1 a B2.",
      newLessonCta: "Diseñar nueva lección",
      filterErk: "Nivel CEFR", filterSector: "Sector profesional", filterSkill: "Destreza",
      tabAll: (n) => `Todas las lecciones (${n})`, tabMine: (n) => `Mis lecciones (${n})`,
      tabFavs: (n) => `Favoritas (${n})`, tabDrafts: (n) => `Borradores (${n})`,
      conceptBadge: "Borrador", conceptCardTitle: "Tu lección en borrador",
      conceptCardSubtitle: "Añade ejercicios y publica cuando la lección esté lista.", conceptCardCta: "Abrir borrador",
      recommendedPath: "Ruta recomendada", recommendedPathTitle: "Construye tu especialización",
      recommendedPathSubtitle: "Una secuencia lógica de 12 lecciones que te lleva hasta CEFR B1, adaptada a tu formación.",
      recommendedPathCta: "Comenzar ruta",
      loadMore: "Mostrar más lecciones", sortBy: "Ordenar por",
    },
    lessonBuilder: {
      topBar: { preview: "Vista previa", saveDraft: "Guardar borrador", publish: "Publicar" },
      step1Title: "1. Datos básicos", step2Title: "2. Objetivos de aprendizaje", step3Title: "3. Imagen de portada",
      step1Subtitle: "¿De qué trata esta lección y a quién va dirigida?",
      step2Subtitle: "¿Qué debe saber o poder hacer el alumno tras esta lección?",
      step3Subtitle: "Elige una imagen que encaje con el sector o el tema.",
      fieldLessonTitle: "Título de la lección", fieldEducation: "Ciclo formativo / sector", fieldErk: "Nivel CEFR",
      fieldKeywords: "Palabras clave", fieldDescription: "Breve descripción",
      placeholderLessonTitle: "Ej. Dirigir una reunión de trabajo", placeholderDescription: "Ej. En esta lección practicas dar y pedir instrucciones…",
      placeholderKeywords: "Pulsa Enter para añadir",
      goalAddLabel: "Añade un objetivo de aprendizaje", goalAddPlaceholder: "Ej. Puedo usar 3 términos profesionales correctamente",
      goalChipExample: "ejemplo",
      coverTitle: "Arrastra una imagen aquí", coverSubtitle: "PNG o JPG, max 5MB. Se optimiza automáticamente.",
      coverCta: "Seleccionar archivo",
      exercisesTitle: "Ejercicios en esta lección", exercisesSubtitle: "Arrastra para reordenar. Añade manualmente o deja que la IA genere.",
      exercisesAddCta: "Añadir manualmente", exercisesOpenAiCta: "Abrir asistente IA",
      aiPanelTitle: "Asistente IA", aiPanelPrompt: "¿En qué debe fijarse la IA?",
      aiPanelCount: "Número de ejercicios", aiPanelTypes: "Tipos de ejercicio", aiPanelContext: "Contexto sectorial",
      aiPanelGenerate: "Generar con IA",
    },
    practice: {
      questionNr: (q, t) => `Pregunta ${q} / ${t}`,
      ctaNext: "Siguiente pregunta", ctaTip: "Consejo prácticas", speed: "Velocidad",
      feedbackExcellent: "¡Excelente trabajo!", feedbackGood: "¡Bien hecho!", feedbackRetry: "Inténtalo de nuevo",
      rewardXp: (xp) => `+${xp} XP`, newTerm: "Nuevo término profesional",
      glossaryCard: "Glosario • Términos profesionales de esta lección",
    },
  },

  // ============== DEUTSCH ==============
  de: {
    common: { ...nlCommon, loading: "Laden…", save: "Speichern", cancel: "Abbrechen", confirm: "Bestätigen",
      next: "Weiter", back: "Zurück", retry: "Erneut versuchen", close: "Schließen", more: "Mehr", search: "Suchen",
      viewAll: "Alle anzeigen", newItem: "Neu", edit: "Bearbeiten", deleteItem: "Löschen", duplicate: "Duplizieren",
      continue: "Fortfahren", previous: "Zurück", submit: "Senden", filter: "Filtern",
      show: "Anzeigen", reset: "Zurücksetzen", minutesShort: "Min", exercisesShort: "Üb" },
    nav: {
      dashboard: "Dashboard", lessons: "Lektionen", lessonBuilder: "Lernbaustein-Editor", practice: "Üben", profile: "Profil",
      teacherBadge: "Dozent", appName: "TaalCozy", appSubtitle: "MBO NT2 Portal", mbobadge: "MBO NT2",
      streakDays: (d) => `${d}-Tage-Serie`, xpLabel: (xp) => `${xp} XP`, erkLabel: "GER",
      language: "Sprache", sector: "Branche",
      sectorChooseTitle: "Wähle deine Branche",
      searchNoResults: (q) => `Keine Ergebnisse für “${q}”`,
      menu: { viewProfile: "Profil ansehen", logOut: "Abmelden" },
    },
    footer: {
      copyright: "TaalCozy • Niederländisch lernen für MBO-Berufsausbildung • Unterstützt durch GER-Niveaus",
      glossary: "Glossar", help: "Hilfe & Barrierefreiheit",
    },
    dashboard: {
      welcome: (n) => `Willkommen zurück, ${n}!`, welcomeBack: "Bereit für heute? Du machst das super!",
      heroCta1: "Zur heutigen Lektion", heroCta2: "Übung starten",
      stat7day: "7-Tage-Serie", statXp: "Gesamt-XP", statLevel: (lv) => `Level ${lv}`,
      recommendedLessons: "Für dich empfohlen",
      stageSimulation: "Praxissimulation Ausbildungsgespräch",
      stageSimulationCta: "Gespräch starten (12 Min)",
      stageSimulationSubtitle: "Übe ein echtes Arbeitsgespräch mit deinem Praxismelder. Rede, höre zu und erhalte sofortiges Feedback.",
      recentActivity: "Letzte Aktivitäten", viewAllActivity: "Alle ansehen",
      wordOfDay: "Wort des Tages", wordOfDayTitle: "De overdracht / Die Übergabe",
      wordOfDayExample: "Vor Schichtbeginn machst du immer die Übergabe mit deinem Kollegen.",
      wordOfDayCta: "+ Zum Glossar hinzufügen",
      weeklyGoals: "Wochenziele",
      needHelp: "Brauchst du Hilfe?", needHelpTitle: "Chatte mit Sandra",
      needHelpSubtitle: "Unsere Sprachcoachin antwortet innerhalb von 2 Minuten.", needHelpCta: "Nachricht senden",
      sectorHeaderTagline: "Brashenspezifisches Niederländischlernen",
      sectorHeaderTitlePrefix: "Du hast gewählt: ",
      sectorHeaderTitleSuffix: "",
      sectorHeaderSubtitle: "Empfohlene Lektionen, Wörter und Beispiele sind auf deine Branche zugeschnitten.",
      statLevelProgress: (current, xpToNext, next) => `Level ${current} — ${xpToNext} XP bis ${next}`,
    },
    lessons: {
      title: "Lektionen & Module", subtitle: "Alles auf deinem Niveau und in deiner Branche, von A1 bis B2.",
      newLessonCta: "Neue Lektion entwerfen",
      filterErk: "GER-Niveau", filterSector: "Branche", filterSkill: "Fertigkeit",
      tabAll: (n) => `Alle Lektionen (${n})`, tabMine: (n) => `Meine Lektionen (${n})`,
      tabFavs: (n) => `Favoriten (${n})`, tabDrafts: (n) => `Entwürfe (${n})`,
      conceptBadge: "Entwurf", conceptCardTitle: "Dein Lektionsentwurf",
      conceptCardSubtitle: "Füge Übungen hinzu und veröffentliche, wenn die Lektion fertig ist.", conceptCardCta: "Entwurf öffnen",
      recommendedPath: "Empfohlener Lernpfad", recommendedPathTitle: "Baue deine Fachkompetenz auf",
      recommendedPathSubtitle: "Eine logische Reihenfolge von 12 Lektionen, die dich zu GER B1 bringt, genau auf deine Ausbildung zugeschnitten.",
      recommendedPathCta: "Lernpfad starten",
      loadMore: "Mehr Lektionen anzeigen", sortBy: "Sortieren nach",
    },
    lessonBuilder: {
      topBar: { preview: "Vorschau", saveDraft: "Entwurf speichern", publish: "Veröffentlichen" },
      step1Title: "1. Grunddaten", step2Title: "2. Lernziele", step3Title: "3. Titelbild",
      step1Subtitle: "Worum geht es in dieser Lektion und für wen ist sie gedacht?",
      step2Subtitle: "Was soll der Lernende nach dieser Lektion wissen oder können?",
      step3Subtitle: "Wähle ein Bild, das zur Branche oder zum Thema passt.",
      fieldLessonTitle: "Lektionstitel", fieldEducation: "MBO-Ausbildung / Branche", fieldErk: "GER-Niveau",
      fieldKeywords: "Schlüsselwörter", fieldDescription: "Kurzbeschreibung",
      placeholderLessonTitle: "Z. B. Ein Arbeitsgespräch leiten", placeholderDescription: "Z. B. In dieser Lektion übst du das Geben und Fragen von Anweisungen…",
      placeholderKeywords: "Drücke Enter zum Hinzufügen",
      goalAddLabel: "Lernziel hinzufügen", goalAddPlaceholder: "Z. B. Ich kann 3 Fachbegriffe korrekt verwenden",
      goalChipExample: "Beispiel",
      coverTitle: "Ziehe ein Bild hierher", coverSubtitle: "PNG oder JPG, max 5MB. Wird automatisch optimiert.",
      coverCta: "Datei wählen",
      exercisesTitle: "Übungen in dieser Lektion", exercisesSubtitle: "Ziehen zum Umsortieren. Manuell hinzufügen oder von KI generieren lassen.",
      exercisesAddCta: "Manuell hinzufügen", exercisesOpenAiCta: "KI-Assistent öffnen",
      aiPanelTitle: "KI-Assistent", aiPanelPrompt: "Worauf soll die KI achten?",
      aiPanelCount: "Anzahl Übungen", aiPanelTypes: "Übungsformen", aiPanelContext: "Fachkontext",
      aiPanelGenerate: "Mit KI generieren",
    },
    practice: {
      questionNr: (q, t) => `Frage ${q} / ${t}`,
      ctaNext: "Nächste Frage", ctaTip: "Praxistipp", speed: "Geschwindigkeit",
      feedbackExcellent: "Sehr gut gemacht!", feedbackGood: "Gut gemacht!", feedbackRetry: "Versuche es erneut",
      rewardXp: (xp) => `+${xp} XP`, newTerm: "Neuer Fachbegriff",
      glossaryCard: "Glossar • Fachbegriffe dieser Lektion",
    },
  },
} satisfies Record<string, DictionaryEntry>;

export type DictionaryKey = keyof typeof dictionaries.nl;

// ---------- FALLBACK: ALLE ANDERE TALEN TER WERELD ----------
// Als de taal niet in de primary talen (7 talen met complete vertaling) zit,
// dan gebruiken we Engels als basis (de wereldtaal voor NT2-lerenden).
// De taal-switcher toont echter nog steeds de taal-naam in het EIGEN SCHRIFT
// (Chinees, Thai, Hindi, ...) via Intl.DisplayNames, dus de gebruiker herkent hem.

// ---------- SECTOR LABELS ----------
// 10 MBO-opleidings-sectoren met vertalingen per primary taal.
// Voor niet-primary talen valt dit terug op de NL naam (sectoren zijn context-gebonden).

export type SectorLabels = {
  algemeen: string; zorg: string; sport: string; ict: string;
  horeca: string; bouw: string; handel: string; onderwijs: string;
  techniek: string; uiterlijkeVerzorging: string;
};

export const SECTOR_LABELS: Record<string, SectorLabels> = {
  nl: {
    algemeen: "Algemeen NT2", zorg: "Zorg & Welzijn", sport: "Sport & Bewegen",
    ict: "ICT & Digitalisering", horeca: "Horeca & Keuken", bouw: "Bouw & Infra",
    handel: "Handel & Logistiek", onderwijs: "Onderwijs & Kinderopvang",
    techniek: "Techniek & Engineering", uiterlijkeVerzorging: "Uiterlijke verzorging",
  },
  en: {
    algemeen: "General NT2", zorg: "Care & Welfare", sport: "Sports & Movement",
    ict: "ICT & Digitalization", horeca: "Hospitality & Kitchen", bouw: "Construction & Infra",
    handel: "Trade & Logistics", onderwijs: "Education & Childcare",
    techniek: "Technology & Engineering", uiterlijkeVerzorging: "Personal Care",
  },
  tr: {
    algemeen: "Genel NT2", zorg: "Bakım & Refah", sport: "Spor & Hareket",
    ict: "Bilişim & Dijitalleşme", horeca: "Otelcilik & Mutfak", bouw: "İnşaat & Altyapı",
    handel: "Ticaret & Lojistik", onderwijs: "Eğitim & Çocuk Bakımı",
    techniek: "Teknik & Mühendislik", uiterlijkeVerzorging: "Kişisel Bakım",
  },
  ar: {
    algemeen: "هولندية عامة", zorg: "الرعاية والرفاهية", sport: "الرياضة والحركة",
    ict: "تكنولوجيا المعلومات", horeca: "الضيافة والمطبخ", bouw: "البناء والبنية التحتية",
    handel: "التجارة واللوجستيات", onderwijs: "التعليم ورعاية الأطفال",
    techniek: "التكنولوجيا والهندسة", uiterlijkeVerzorging: "العناية الشخصية",
  },
  pl: {
    algemeen: "Ogólny NT2", zorg: "Opieka i dobrostan", sport: "Sport i ruch",
    ict: "ICT i cyfryzacja", horeca: "Hotel i kuchnia", bouw: "Budownictwo i infrastruktura",
    handel: "Handel i logistyka", onderwijs: "Edukacja i opieka nad dziećmi",
    techniek: "Technika i inżynieria", uiterlijkeVerzorging: "Pielęgnacja urody",
  },
  es: {
    algemeen: "NT2 General", zorg: "Cuidados y bienestar", sport: "Deporte y movimiento",
    ict: "TIC y digitalización", horeca: "Hostelería y cocina", bouw: "Construcción e infraestructura",
    handel: "Comercio y logística", onderwijs: "Educación y cuidado infantil",
    techniek: "Tecnología e ingeniería", uiterlijkeVerzorging: "Cuidado personal",
  },
  de: {
    algemeen: "Allgemein NT2", zorg: "Pflege & Wohlfahrt", sport: "Sport & Bewegung",
    ict: "IT & Digitalisierung", horeca: "Gastronomie & Küche", bouw: "Bau & Infrastruktur",
    handel: "Handel & Logistik", onderwijs: "Bildung & Kinderbetreuung",
    techniek: "Technik & Engineering", uiterlijkeVerzorging: "Körperpflege",
  },
};

/**
 * Geeft de sector-naam in de gekozen taal terug.
 * Voor niet-primary talen valt dit terug op de Engelse naam (en uiteindelijk op NL).
 */
export function getSectorLabel(
  locale: Locale,
  dictKey: keyof SectorLabels,
): string {
  return (
    SECTOR_LABELS[locale]?.[dictKey] ??
    SECTOR_LABELS.en?.[dictKey] ??
    SECTOR_LABELS.nl[dictKey]
  );
}

export function getDictionary(locale: Locale): DictionaryEntry {
  const primary = (dictionaries as Record<string, DictionaryEntry | undefined>)[locale];
  if (primary) return primary;
  // Fallback: Engels. Je kunt later per taal een "partial dict" toevoegen (alleen
  // de keys die afwijken van Engels) en die mergen via: { ...dictionaries.en, ...partial }.
  return dictionaries.en;
}

// Handige hulp: is dit een "primary" taal met complete vertaling?
export const PRIMARY_LOCALES_WITH_FULL_DICT = new Set<string>([
  "nl", "en", "tr", "ar", "pl", "es", "de",
]);
