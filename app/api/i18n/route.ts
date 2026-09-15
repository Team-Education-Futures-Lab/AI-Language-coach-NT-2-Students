import { NextResponse, type NextRequest } from "next/server";
import { batchTranslate, getCode } from "google-translate-api-x";
import { dictionaries, PRIMARY_LOCALES_WITH_FULL_DICT } from "@/lib/i18n/dictionaries";
import { LANGUAGES } from "@/lib/i18n/types";

const cache = new Map<string, unknown>();
const stringCache = new Map<string, string>();
const OLLAMA_URL = "http://127.0.0.1:11434";
const CACHE_VERSION = "i18n-v5";
const GOOGLE_LOCALE_ALIASES: Record<string, string> = {
  fil: "tl",
  nb: "no",
  nn: "no",
  jv: "jw",
  zh: "zh-CN",
  mo: "ro",
  sh: "sr",
};
const MYMEMORY_LOCALE_ALIASES: Record<string, string[]> = {
  zh: ["zh-CN"],
  he: ["he-IL", "iw", "iw-IL"],
  iw: ["iw-IL", "he", "he-IL"],
  fil: ["fil-PH", "tl-PH", "tl"],
  tl: ["tl-PH", "fil-PH", "fil"],
  pt: ["pt-PT"],
  nb: ["nb-NO", "no", "no-NO"],
  nn: ["nn-NO", "no", "no-NO"],
  no: ["no-NO", "nb-NO", "nn-NO"],
  ku: ["ku-IQ"],
  ug: ["ug-CN"],
  jv: ["jv-ID"],
  jw: ["jv-ID", "jv"],
  mo: ["ro-MD", "ro", "ro-RO"],
  sh: ["sr-RS", "sr", "hr", "bs"],
};

function getEnglishTemplates() {
  return {
    common: dictionaries.en.common,
    nav: {
      ...dictionaries.en.nav,
      streakDays: "{d} Day Streak",
      xpLabel: "{xp} XP",
      searchNoResults: "No results for “{query}”",
    },
    footer: dictionaries.en.footer,
    dashboard: {
      ...dictionaries.en.dashboard,
      welcome: "Welcome back, {name}!",
      statLevel: "Level {lv}",
      statLevelProgress: "Level {current} — {xpToNext} XP to {next}",
    },
    lessons: {
      ...dictionaries.en.lessons,
      tabAll: "All lessons ({n})",
      tabMine: "My lessons ({n})",
      tabFavs: "Favorites ({n})",
      tabDrafts: "Drafts ({n})",
    },
    lessonBuilder: dictionaries.en.lessonBuilder,
    practice: {
      ...dictionaries.en.practice,
      questionNr: "Question {q} of {total}",
      rewardXp: "+{xp} XP",
    },
  };
}

function pathKey(path: string[]) {
  return path.join("\u0001");
}

function normalizeGoogleLocale(locale: string) {
  const normalized = locale.trim();
  const aliased = GOOGLE_LOCALE_ALIASES[normalized] ?? normalized;
  try {
    return getCode(aliased) ?? aliased;
  } catch {
    return aliased;
  }
}

function collectStringLeaves(
  input: unknown,
  path: string[] = [],
  out: Array<{ path: string[]; text: string }> = [],
) {
  if (typeof input === "string") {
    out.push({ path, text: input });
    return out;
  }

  if (Array.isArray(input)) {
    input.forEach((value, index) =>
      collectStringLeaves(value, [...path, String(index)], out),
    );
    return out;
  }

  if (input && typeof input === "object") {
    for (const [key, value] of Object.entries(input)) {
      collectStringLeaves(value, [...path, key], out);
    }
  }

  return out;
}

function rebuildTranslatedPayload(
  source: unknown,
  translatedMap: Map<string, string>,
  path: string[] = [],
): any {
  if (typeof source === "string") {
    return translatedMap.get(pathKey(path)) ?? source;
  }

  if (Array.isArray(source)) {
    return source.map((value, index) =>
      rebuildTranslatedPayload(value, translatedMap, [...path, String(index)]),
    );
  }

  if (source && typeof source === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(source)) {
      out[key] = rebuildTranslatedPayload(value, translatedMap, [...path, key]);
    }
    return out;
  }

  return source;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasStringProp(obj: Record<string, unknown>, key: string) {
  return typeof obj[key] === "string" && obj[key].trim().length > 0;
}

function isValidTranslatedTemplateShape(value: unknown) {
  if (!isPlainObject(value)) return false;

  const common = isPlainObject(value.common) ? value.common : null;
  const nav = isPlainObject(value.nav) ? value.nav : null;
  const dashboard = isPlainObject(value.dashboard) ? value.dashboard : null;
  const lessons = isPlainObject(value.lessons) ? value.lessons : null;
  const lessonBuilder = isPlainObject(value.lessonBuilder)
    ? value.lessonBuilder
    : null;
  const practice = isPlainObject(value.practice) ? value.practice : null;

  if (!common || !nav || !dashboard || !lessons || !lessonBuilder || !practice) {
    return false;
  }

  return (
    hasStringProp(common, "loading") &&
    hasStringProp(common, "save") &&
    hasStringProp(nav, "dashboard") &&
    hasStringProp(nav, "lessons") &&
    hasStringProp(dashboard, "welcomeBack") &&
    hasStringProp(lessons, "title") &&
    hasStringProp(lessonBuilder, "step1Title") &&
    hasStringProp(practice, "ctaNext")
  );
}

function protectPlaceholders(input: string) {
  const vars: string[] = [];
  const text = input.replace(/\{[a-zA-Z0-9_]+\}/g, (m) => {
    const idx = vars.length;
    vars.push(m);
    return `__TCVAR_${idx}__`;
  });
  return { text, vars };
}

function restorePlaceholders(input: string, vars: string[]) {
  let out = input;
  for (let i = 0; i < vars.length; i++) {
    out = out.replace(new RegExp(`__\\s*TCVAR_${i}\\s*__`, "g"), vars[i]);
  }
  return out;
}

function normalizeForCompare(input: string) {
  return input
    .replace(/\{[a-zA-Z0-9_]+\}/g, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .toLowerCase();
}

function isInvalidTargetMessage(input: string) {
  return /invalid target language/i.test(input);
}

function isLeakedKeyPlaceholder(input: string) {
  return /^\{[a-zA-Z][a-zA-Z0-9_.-]*\}$/.test(input.trim());
}

function isUsableTranslation(source: string, translated: string) {
  const cleanTranslated = translated.trim();
  if (!cleanTranslated || isInvalidTargetMessage(cleanTranslated)) return false;

  const sourceComparable = normalizeForCompare(source);
  const translatedComparable = normalizeForCompare(cleanTranslated);

  if (!translatedComparable) return false;
  if (sourceComparable.length >= 6 && sourceComparable === translatedComparable) {
    return false;
  }

  return true;
}

function sanitizeTranslatedTemplates(source: any, translated: any): any {
  if (typeof source === "string") {
    if (typeof translated !== "string") return source;
    const clean = translated.trim();
    if (!clean) return source;
    if (isInvalidTargetMessage(clean) || isLeakedKeyPlaceholder(clean)) {
      return source;
    }
    return restorePlaceholders(clean, []);
  }

  if (Array.isArray(source)) {
    if (!Array.isArray(translated)) return source;
    return source.map((item, index) =>
      sanitizeTranslatedTemplates(item, translated[index]),
    );
  }

  if (!source || typeof source !== "object") {
    return source;
  }

  const out: Record<string, any> = {};
  const translatedObj =
    translated && typeof translated === "object" && !Array.isArray(translated)
      ? translated
      : {};

  for (const [key, value] of Object.entries(source)) {
    out[key] = sanitizeTranslatedTemplates(value, translatedObj[key]);
  }

  return out;
}

async function translatePayloadGoogle(
  payload: unknown,
  locale: string,
  from = "auto",
) {
  const leaves = collectStringLeaves(payload);
  if (!leaves.length) return payload;

  const targetLocale = normalizeGoogleLocale(locale);
  const translatedMap = new Map<string, string>();

  let batch: Array<{
    key: string;
    original: string;
    protectedText: string;
    vars: string[];
  }> = [];
  let batchChars = 0;

  async function flushBatch() {
    if (!batch.length) return;
    const reqObj: Record<string, string> = {};
    for (const item of batch) {
      reqObj[item.key] = item.protectedText;
    }

    const result = (await batchTranslate(reqObj, {
      from,
      to: targetLocale,
      client: "gtx",
    } as any)) as Record<string, { text?: string }>;

    for (const item of batch) {
      const translatedRaw =
        typeof result?.[item.key]?.text === "string"
          ? result[item.key].text
          : "";
      const restored = translatedRaw
        ? restorePlaceholders(translatedRaw, item.vars)
        : item.original;

      translatedMap.set(
        item.key,
        isUsableTranslation(item.original, restored) ? restored : item.original,
      );
    }

    batch = [];
    batchChars = 0;
  }

  for (const leaf of leaves) {
    if (!leaf.text.trim()) {
      translatedMap.set(pathKey(leaf.path), leaf.text);
      continue;
    }

    const { text: protectedText, vars } = protectPlaceholders(leaf.text);
    const key = pathKey(leaf.path);
    const nextSize = batchChars + protectedText.length;

    if (batch.length >= 40 || nextSize > 3500) {
      await flushBatch();
    }

    batch.push({ key, original: leaf.text, protectedText, vars });
    batchChars += protectedText.length;
  }

  await flushBatch();

  return sanitizeTranslatedTemplates(
    payload,
    rebuildTranslatedPayload(payload, translatedMap),
  );
}

function getRegionalizedLocale(locale: string) {
  const entry = LANGUAGES.find((item) => item.code === locale && item.region);
  if (!entry?.region) return null;
  return `${locale}-${entry.region}`;
}

function getMyMemoryLocaleCandidates(locale: string) {
  const normalized = locale.trim().toLowerCase();
  const regionalized = getRegionalizedLocale(normalized);
  return Array.from(
    new Set(
      [
        regionalized,
        normalized,
        ...(MYMEMORY_LOCALE_ALIASES[normalized] ?? []),
      ].filter((value): value is string => Boolean(value)),
    ),
  );
}

async function translateStringMyMemory(text: string, locale: string) {
  if (!text.trim()) return text;

  const key = `${CACHE_VERSION}:${locale}\n${text}`;
  const hit = stringCache.get(key);
  if (hit) return hit;

  const { text: protectedText, vars } = protectPlaceholders(text);
  const candidates = getMyMemoryLocaleCandidates(locale);

  for (const targetLocale of candidates) {
    const url = new URL("https://api.mymemory.translated.net/get");
    url.searchParams.set("q", protectedText);
    url.searchParams.set("langpair", `en|${targetLocale}`);

    try {
      const res = await fetch(url.toString(), {
        method: "GET",
        headers: { "User-Agent": "taalcoach-ai" },
        cache: "no-store",
      });
      if (!res.ok) continue;

      const json = (await res.json()) as any;
      const translatedRaw =
        typeof json?.responseData?.translatedText === "string"
          ? json.responseData.translatedText
          : null;
      const translated = translatedRaw
        ? restorePlaceholders(translatedRaw, vars)
        : "";

      if (!isUsableTranslation(text, translated)) continue;

      stringCache.set(key, translated);
      return translated;
    } catch {
      continue;
    }
  }

  return text;
}

async function translateTemplatesMyMemory(obj: any, locale: string): Promise<any> {
  if (typeof obj === "string") {
    return translateStringMyMemory(obj, locale);
  }
  if (Array.isArray(obj)) {
    return Promise.all(obj.map((v) => translateTemplatesMyMemory(v, locale)));
  }
  if (!obj || typeof obj !== "object") return obj;

  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = await translateTemplatesMyMemory(v, locale);
  }
  return out;
}

async function getAvailableOllamaModel() {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      models?: Array<{ name?: string }>;
    };
    const preferred = process.env.OLLAMA_MODEL?.trim();
    if (preferred) {
      const found = json.models?.find((m) => m.name === preferred)?.name;
      if (found) return found;
    }
    return json.models?.[0]?.name ?? null;
  } catch {
    return null;
  }
}

async function translateTemplatesOllama(
  englishTemplates: ReturnType<typeof getEnglishTemplates>,
  locale: string,
  languageName: string,
) {
  const model = await getAvailableOllamaModel();
  if (!model) return null;

  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      model,
      stream: false,
      format: "json",
      prompt: [
        "Translate this UI JSON from English into the target language.",
        "Keep placeholders exactly unchanged:",
        "{d},{xp},{query},{name},{lv},{current},{xpToNext},{next},{n},{q},{total}.",
        "Return only valid JSON with the same shape.",
        `Target language: ${languageName} (${locale})`,
        `JSON: ${JSON.stringify(englishTemplates)}`,
      ].join("\n"),
    }),
  });

  if (!res.ok) return null;
  const json = (await res.json()) as { response?: string };
  if (!json.response) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(json.response) as unknown;
  } catch {
    return null;
  }
  const sanitized = sanitizeTranslatedTemplates(englishTemplates, parsed);
  if (!isValidTranslatedTemplateShape(sanitized)) return null;
  return { model, parsed: sanitized };
}

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get("locale")?.trim().toLowerCase();
  if (!locale || locale.length < 2 || locale.length > 10) {
    return NextResponse.json({ ok: false, error: "Invalid locale" }, { status: 400 });
  }

  if (PRIMARY_LOCALES_WITH_FULL_DICT.has(locale)) {
    return NextResponse.json({ ok: true, templates: dictionaries[locale as keyof typeof dictionaries] });
  }

  const cacheKey = `${CACHE_VERSION}:${locale}`;
  const cached = cache.get(cacheKey);
  if (cached && isValidTranslatedTemplateShape(cached)) {
    return NextResponse.json({ ok: true, templates: cached });
  }
  if (cached) {
    cache.delete(cacheKey);
  }

  const englishTemplates = getEnglishTemplates();

  let languageName = locale;
  try {
    const dn = new Intl.DisplayNames(["en"], { type: "language" });
    languageName = dn.of(locale) ?? locale;
  } catch {}

  try {
    try {
      const googleResult = await translatePayloadGoogle(
        englishTemplates,
        locale,
        "en",
      );
      if (isValidTranslatedTemplateShape(googleResult)) {
        cache.set(cacheKey, googleResult);
        return NextResponse.json({
          ok: true,
          templates: googleResult,
          meta: { translated: true, provider: "google_translate" },
        });
      }
    } catch {}

    const ollamaResult = await translateTemplatesOllama(
      englishTemplates,
      locale,
      languageName,
    );
    if (ollamaResult) {
      cache.set(cacheKey, ollamaResult.parsed);
      return NextResponse.json({
        ok: true,
        templates: ollamaResult.parsed,
        meta: {
          translated: true,
          provider: "ollama",
          model: ollamaResult.model,
        },
      });
    }

    const reason = "ollama_unavailable_or_no_models";
    try {
      const translatedRaw = await translateTemplatesMyMemory(englishTemplates, locale);
      const translated = sanitizeTranslatedTemplates(
        englishTemplates,
        translatedRaw,
      );
      cache.set(cacheKey, translated);
      return NextResponse.json({
        ok: true,
        templates: translated,
        meta: { translated: true, provider: "mymemory", reason },
      });
    } catch {
      return NextResponse.json({
        ok: true,
        templates: englishTemplates,
        meta: { translated: false, provider: "none", reason },
      });
    }
  } catch {
    return NextResponse.json({
      ok: true,
      templates: englishTemplates,
      meta: { translated: false, provider: "none", reason: "translation_failed" },
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      locale?: string;
      payload?: unknown;
      source?: string;
    };

    const locale = body?.locale?.trim().toLowerCase();
    if (!locale || locale.length < 2 || locale.length > 10) {
      return NextResponse.json({ ok: false, error: "Invalid locale" }, { status: 400 });
    }

    if (!("payload" in (body ?? {}))) {
      return NextResponse.json({ ok: false, error: "Missing payload" }, { status: 400 });
    }

    if (locale === "nl") {
      return NextResponse.json({
        ok: true,
        payload: body.payload,
        meta: { translated: false, provider: "none", reason: "source_locale" },
      });
    }

    const translated = await translatePayloadGoogle(
      body.payload,
      locale,
      body.source?.trim() || "auto",
    );

    return NextResponse.json({
      ok: true,
      payload: translated,
      meta: { translated: true, provider: "google_translate" },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Translation request failed" },
      { status: 500 },
    );
  }
}
